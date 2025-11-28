import { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getAllRecords, updateRecord, type Record } from '../services/api';
import '../styles/WorkflowView.css';
import { Handle, Position } from '@xyflow/react';

// Composant personnalisé pour les nodes
const WorkflowNode = ({ data }: { data: any }) => {
  const record = data.record as Record;
  const numPrevious = record.previousIds?.length || 0;
  const hasMultipleDeps = numPrevious > 1;
  
  return (
    <>
      {/* Handle d'entrée (gauche) - pour recevoir des connexions */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#4299e1',
          width: 12,
          height: 12,
          border: '2px solid white',
        }}
      />
      
      <div className={`workflow-node-custom ${hasMultipleDeps ? 'multiple-deps' : ''}`}>
        <div className="node-header-custom">
          <span className="node-id-custom">Poste {data.poste}</span>
          {hasMultipleDeps && (
            <span className="deps-badge" title={`Dépend de ${numPrevious} postes`}>
              ⚡{numPrevious}
            </span>
          )}
        </div>
        <div className="node-body-custom">
          <p className="node-name-custom">{data.nom || 'Sans nom'}</p>
          <div className="node-meta-custom">
            {data.tempsPrévu && (
              <span className="meta-item-custom">⏱️ {data.tempsPrévu}</span>
            )}
            {data.nombrePieces && (
              <span className="meta-item-custom">🔧 {data.nombrePieces} pcs</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Handle de sortie (droite) - pour créer des connexions */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#805ad5',
          width: 12,
          height: 12,
          border: '2px solid white',
        }}
      />
    </>
  );
};

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const WorkflowView = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState<number | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      updateNodesAndEdges();
    }
  }, [records]);

  const loadRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllRecords();
      const sorted = data.sort((a, b) => a.Poste - b.Poste);
      setRecords(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('Error loading records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer le layout en couches (layered layout) pour visualiser les dépendances
  const calculateLayout = (): Map<number, { x: number; y: number }> => {
    const positions = new Map<number, { x: number; y: number }>();
    
    // 1. Calculer la profondeur (layer) de chaque nœud
    const depths = new Map<number, number>();
    const visited = new Set<number>();
    
    const calculateDepth = (poste: number): number => {
      if (depths.has(poste)) return depths.get(poste)!;
      if (visited.has(poste)) return 0; // Cycle détecté
      
      const record = records.find(r => r.Poste === poste);
      if (!record) return 0;
      
      if (!record.previousIds || record.previousIds.length === 0) {
        depths.set(poste, 0);
        return 0;
      }
      
      visited.add(poste);
      const maxPrevDepth = Math.max(
        ...record.previousIds.map(prevId => calculateDepth(prevId))
      );
      visited.delete(poste);
      
      const depth = maxPrevDepth + 1;
      depths.set(poste, depth);
      return depth;
    };
    
    // Calculer la profondeur pour tous les nœuds
    records.forEach(r => calculateDepth(r.Poste));
    
    // 2. Grouper les nœuds par profondeur
    const layers = new Map<number, number[]>();
    depths.forEach((depth, poste) => {
      if (!layers.has(depth)) {
        layers.set(depth, []);
      }
      layers.get(depth)!.push(poste);
    });
    
    // 3. Positionner les nœuds
    const horizontalSpacing = 350;
    const verticalSpacing = 180;
    const startX = 50;
    const startY = 50;
    
    layers.forEach((postes, depth) => {
      // Trier les postes dans chaque couche pour un meilleur rendu
      postes.sort((a, b) => {
        const recordA = records.find(r => r.Poste === a);
        const recordB = records.find(r => r.Poste === b);
        
        // Essayer de minimiser les croisements en utilisant les dépendances
        const avgPrevDepthA = recordA?.previousIds?.length 
          ? recordA.previousIds.reduce((sum, id) => sum + (depths.get(id) || 0), 0) / recordA.previousIds.length
          : 0;
        const avgPrevDepthB = recordB?.previousIds?.length
          ? recordB.previousIds.reduce((sum, id) => sum + (depths.get(id) || 0), 0) / recordB.previousIds.length
          : 0;
        
        return avgPrevDepthA - avgPrevDepthB;
      });
      
      const layerHeight = (postes.length - 1) * verticalSpacing;
      const layerStartY = startY - layerHeight / 2;
      
      postes.forEach((poste, index) => {
        positions.set(poste, {
          x: startX + depth * horizontalSpacing,
          y: layerStartY + index * verticalSpacing,
        });
      });
    });
    
    return positions;
  };

  const updateNodesAndEdges = () => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Calculer le layout optimisé
    const positions = calculateLayout();

    // Créer tous les nœuds avec leurs positions calculées
    records.forEach((record) => {
      const position = positions.get(record.Poste) || { x: 50, y: 50 };

      newNodes.push({
        id: `node-${record.Poste}`,
        type: 'workflowNode',
        position,
        data: {
          poste: record.Poste,
          nom: record.Nom,
          tempsPrévu: record['Temps Prévu'],
          nombrePieces: record['Nombre pièces'],
          record: record,
        },
      });
    });

    // Créer TOUTES les connexions basées sur previousIds
    records.forEach((record) => {
      if (record.previousIds && record.previousIds.length > 0) {
        const numDependencies = record.previousIds.length;
        
        // Couleurs différentes selon le nombre de dépendances
        let edgeColor = '#4299e1'; // Bleu par défaut
        if (numDependencies > 1) {
          edgeColor = '#f59e0b'; // Orange pour dépendances multiples
        }
        if (numDependencies > 3) {
          edgeColor = '#ef4444'; // Rouge pour beaucoup de dépendances
        }
        
        record.previousIds.forEach((previousId, index) => {
          const sourceId = `node-${previousId}`;
          const targetId = `node-${record.Poste}`;

          newEdges.push({
            id: `edge-${previousId}-${record.Poste}`,
            source: sourceId,
            target: targetId,
            type: 'smoothstep',
            animated: numDependencies > 1, // Animer si dépendances multiples
            style: { 
              stroke: edgeColor, 
              strokeWidth: 2.5,
              opacity: 0.8,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: edgeColor,
            },
            label: numDependencies > 1 ? `${index + 1}/${numDependencies}` : undefined,
            labelStyle: {
              fill: edgeColor,
              fontWeight: 600,
              fontSize: 11,
            },
            labelBgStyle: {
              fill: 'white',
              fillOpacity: 0.9,
            },
          });
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const record = node.data?.record as Record | undefined;
      const poste = record?.Poste;
      if (poste) {
        setSelectedPoste(poste === selectedPoste ? null : poste);
      }
    },
    [selectedPoste]
  );

  const onConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      if (!editMode || !connection.source || !connection.target) return;

      // Extraire les numéros de poste depuis les IDs
      const sourcePoste = parseInt(connection.source.replace('node-', ''));
      const targetPoste = parseInt(connection.target.replace('node-', ''));

      try {
        // Mettre à jour le record cible en ajoutant le sourcePoste dans previousIds
        const targetRecord = records.find((r) => r.Poste === targetPoste);
        if (targetRecord) {
          const currentPreviousIds = targetRecord.previousIds || [];
          // Vérifier si la connexion n'existe pas déjà
          if (!currentPreviousIds.includes(sourcePoste)) {
            const updatedPreviousIds = [...currentPreviousIds, sourcePoste];
            await updateRecord(targetPoste, { ...targetRecord, previousIds: updatedPreviousIds });
            // Recharger les records pour mettre à jour l'affichage
            await loadRecords();
          }
        }
        
        // Ajouter visuellement l'edge
        setEdges((eds) => addEdge({ 
          ...connection, 
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#4299e1', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#4299e1',
          },
        }, eds));
      } catch (err) {
        console.error('Error connecting nodes:', err);
        setError('Erreur lors de la connexion des postes');
      }
    },
    [editMode, records, loadRecords, setEdges]
  );

  const selectedRecord = selectedPoste ? records.find((r) => r.Poste === selectedPoste) : null;

  return (
    <div className="workflow-view">
      <div className="workflow-header">
        <div>
          <h1>🔀 Workflow de Production</h1>
          <p className="subtitle">
            {records.length} postes · {edges.length} connexion{edges.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="workflow-actions">
          <button onClick={loadRecords} className="btn-refresh" disabled={isLoading}>
            🔄 Actualiser
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`btn-edit ${editMode ? 'active' : ''}`}
          >
            {editMode ? '✓ Terminer' : '✏️ Modifier'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {editMode && (
        <div className="connection-hint">
          <p><strong>💡 Mode édition activé</strong></p>
          <p>• Glissez depuis le bord d'un node vers un autre pour créer une connexion</p>
          <p>• Les nodes peuvent être déplacés en les faisant glisser</p>
        </div>
      )}

      {!editMode && edges.length > 0 && (
        <div className="workflow-legend">
          <p><strong>📊 Légende des connexions</strong></p>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-line blue"></span>
              <span>Dépendance simple (1 poste précédent)</span>
            </div>
            <div className="legend-item">
              <span className="legend-line orange"></span>
              <span>Dépendances multiples (2-3 postes)</span>
            </div>
            <div className="legend-item">
              <span className="legend-line red"></span>
              <span>Dépendances complexes (4+ postes)</span>
            </div>
          </div>
        </div>
      )}

      <div className="workflow-content">
        {isLoading ? (
          <div className="loading">Chargement du workflow...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun poste disponible</h3>
            <p>Importez des données pour visualiser le workflow</p>
          </div>
        ) : (
          <>
            <div className="workflow-canvas">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                nodesDraggable={editMode}
                nodesConnectable={editMode}
                elementsSelectable={true}
                fitView
                minZoom={0.1}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls />
              </ReactFlow>
            </div>

            {selectedRecord && (
              <div className="workflow-details">
                <div className="details-header">
                  <h3>Poste {selectedRecord.Poste}</h3>
                  <button onClick={() => setSelectedPoste(null)} className="btn-close">
                    ✕
                  </button>
                </div>
                <div className="details-body">
                  <h4>{selectedRecord.Nom}</h4>
                  <div className="details-grid">
                    {selectedRecord['Temps Prévu'] && (
                      <div className="detail-item">
                        <span className="label">Temps prévu:</span>
                        <span className="value">{selectedRecord['Temps Prévu']}</span>
                      </div>
                    )}
                    {selectedRecord['Temps Réel'] && (
                      <div className="detail-item">
                        <span className="label">Temps réel:</span>
                        <span className="value">{selectedRecord['Temps Réel']}</span>
                      </div>
                    )}
                    {selectedRecord['Nombre pièces'] && (
                      <div className="detail-item">
                        <span className="label">Nombre de pièces:</span>
                        <span className="value">{selectedRecord['Nombre pièces']}</span>
                      </div>
                    )}
                    {selectedRecord['Aléas Industriels'] && (
                      <div className="detail-item full">
                        <span className="label">Aléas industriels:</span>
                        <span className="value">{selectedRecord['Aléas Industriels']}</span>
                      </div>
                    )}
                    {selectedRecord.previousIds && selectedRecord.previousIds.length > 0 && (
                      <div className="detail-item">
                        <span className="label">Postes précédents:</span>
                        <span className="value">
                          {selectedRecord.previousIds.map(id => `Poste ${id}`).join(', ')}
                        </span>
                      </div>
                    )}
                    {(() => {
                      // Trouver les postes suivants (ceux qui ont le poste actuel dans leurs previousIds)
                      const nextPostes = records.filter(r => 
                        r.previousIds && r.previousIds.includes(selectedRecord.Poste)
                      );
                      return nextPostes.length > 0 ? (
                        <div className="detail-item">
                          <span className="label">Postes suivants:</span>
                          <span className="value">
                            {nextPostes.map(r => `Poste ${r.Poste}`).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <div className="detail-item">
                          <span className="label">Postes suivants:</span>
                          <span className="value">Fin de chaîne</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkflowView;
