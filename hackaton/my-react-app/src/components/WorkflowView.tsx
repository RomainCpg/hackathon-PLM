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

// Composant personnalisé pour les nodes
const WorkflowNode = ({ data }: { data: any }) => {
  return (
    <div className="workflow-node-custom">
      <div className="node-header-custom">
        <span className="node-id-custom">Poste {data.poste}</span>
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
  );
};

const nodeTypes = {
  workflowNode: WorkflowNode,
};

interface WorkflowChain {
  id: number;
  records: Record[];
  expanded: boolean;
}

const WorkflowView = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [chains, setChains] = useState<WorkflowChain[]>([]);
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
      const workflowChains = buildWorkflowChains();
      setChains(workflowChains);
      updateNodesAndEdges(workflowChains);
    }
  }, [records]);

  useEffect(() => {
    updateNodesAndEdges(chains);
  }, [chains]);

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

  const findStartNodes = (): Record[] => {
    const referencedIds = new Set(records.map((r) => r.nextId).filter(Boolean));
    return records.filter((r) => !referencedIds.has(r.Poste));
  };

  const buildWorkflowChains = (): WorkflowChain[] => {
    const startNodes = findStartNodes();
    const workflowChains: WorkflowChain[] = [];

    startNodes.forEach((start, index) => {
      const chain: Record[] = [start];
      let current = start;
      const visited = new Set<number>([start.Poste]);

      while (current.nextId) {
        const next = records.find((r) => r.Poste === current.nextId);
        if (!next || visited.has(next.Poste)) break;
        chain.push(next);
        visited.add(next.Poste);
        current = next;
      }

      workflowChains.push({
        id: index,
        records: chain,
        expanded: true,
      });
    });

    return workflowChains;
  };

  const updateNodesAndEdges = (workflowChains: WorkflowChain[]) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    workflowChains.forEach((chain, chainIndex) => {
      if (!chain.expanded) {
        // Chaîne fermée - afficher seulement un node "collapsed"
        newNodes.push({
          id: `chain-${chain.id}`,
          type: 'default',
          position: { x: 50, y: chainIndex * 150 },
          data: {
            label: `📦 Chaîne ${chainIndex + 1} (${chain.records.length} postes)`,
          },
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '15px 25px',
            fontSize: '16px',
            fontWeight: '600',
            minWidth: '250px',
          },
        });
      } else {
        // Chaîne ouverte - afficher tous les nodes de gauche à droite
        const yPosition = chainIndex * 250;
        const nodeSpacing = 300;

        chain.records.forEach((record, index) => {
          const xPosition = 50 + index * nodeSpacing;

          newNodes.push({
            id: `node-${record.Poste}`,
            type: 'workflowNode',
            position: { x: xPosition, y: yPosition },
            data: {
              poste: record.Poste,
              nom: record.Nom,
              tempsPrévu: record['Temps Prévu'],
              nombrePieces: record['Nombre pièces'],
              record: record,
            },
          });
        });
      }
    });

    // Créer TOUTES les connexions basées sur nextId pour les nodes visibles
    const visibleNodeIds = new Set(newNodes.map(n => n.id));
    records.forEach((record) => {
      if (record.nextId) {
        const sourceId = `node-${record.Poste}`;
        const targetId = `node-${record.nextId}`;
        
        // Vérifier que les deux nodes sont visibles (pas dans une chaîne fermée)
        if (visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId)) {
          newEdges.push({
            id: `edge-${record.Poste}-${record.nextId}`,
            source: sourceId,
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#4299e1', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#4299e1',
            },
          });
        }
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const toggleChain = (chainId: number) => {
    setChains((prev) =>
      prev.map((chain) =>
        chain.id === chainId ? { ...chain, expanded: !chain.expanded } : chain
      )
    );
  };

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('chain-')) {
        const chainId = parseInt(node.id.split('-')[1]);
        toggleChain(chainId);
      } else {
        const record = node.data?.record as Record | undefined;
        const poste = record?.Poste;
        if (poste) {
          setSelectedPoste(poste === selectedPoste ? null : poste);
        }
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
        // Mettre à jour le record source avec le nextId
        const sourceRecord = records.find((r) => r.Poste === sourcePoste);
        if (sourceRecord) {
          await updateRecord(sourcePoste, { ...sourceRecord, nextId: targetPoste });
          // Recharger les records pour mettre à jour l'affichage
          await loadRecords();
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
            {records.length} postes · {chains.length} chaîne{chains.length > 1 ? 's' : ''}
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
              <div className="chain-controls">
                {chains.map((chain, index) => (
                  <button
                    key={chain.id}
                    onClick={() => toggleChain(chain.id)}
                    className={`chain-toggle ${chain.expanded ? 'expanded' : ''}`}
                  >
                    {chain.expanded ? '▼' : '▶'} Chaîne {index + 1} ({chain.records.length}{' '}
                    postes)
                  </button>
                ))}
              </div>
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
                    {selectedRecord.nextId !== undefined && (
                      <div className="detail-item">
                        <span className="label">Prochain poste:</span>
                        <span className="value">
                          {selectedRecord.nextId ? `Poste ${selectedRecord.nextId}` : 'Fin de chaîne'}
                        </span>
                      </div>
                    )}
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
