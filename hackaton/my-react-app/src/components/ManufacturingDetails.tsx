import React, { useState } from 'react';
import type { Task, Personne, Piece } from '../types';
import '../styles/ManufacturingDetails.css';

interface ManufacturingDetailsProps {
    task: Task;
    onClose: () => void;
}

const ManufacturingDetails: React.FC<ManufacturingDetailsProps> = ({ task, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'personnel' | 'pieces'>('overview');

    const formatTime = (timeStr?: string) => {
        if (!timeStr) return 'N/A';
        return timeStr;
    };

    const calculateDelay = () => {
        if (!task.tempsPrevu || !task.tempsReel) return null;

        const parseTime = (time: string) => {
            const [h, m, s] = time.split(':').map(Number);
            return h * 3600 + m * 60 + (s || 0);
        };

        const prevuSec = parseTime(task.tempsPrevu);
        const reelSec = parseTime(task.tempsReel);
        const delaySec = reelSec - prevuSec;

        if (delaySec === 0) return { value: 0, text: 'À l\'heure', status: 'ontime' };

        const absDelay = Math.abs(delaySec);
        const hours = Math.floor(absDelay / 3600);
        const minutes = Math.floor((absDelay % 3600) / 60);
        const seconds = absDelay % 60;

        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (delaySec > 0) {
            return { value: delaySec, text: `+${timeStr}`, status: 'delayed' };
        } else {
            return { value: delaySec, text: `-${timeStr}`, status: 'advance' };
        }
    };

    const delay = calculateDelay();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="manufacturing-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>{task.title}</h2>
                        {task.posteNumber && (
                            <span className="poste-badge-large">Poste {task.posteNumber}</span>
                        )}
                    </div>
                    <button onClick={onClose} className="close-button">✕</button>
                </div>

                <div className="modal-tabs">
                    <button
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Vue d'ensemble
                    </button>
                    <button
                        className={activeTab === 'personnel' ? 'active' : ''}
                        onClick={() => setActiveTab('personnel')}
                    >
                        👥 Personnel ({task.personnes?.length || 0})
                    </button>
                    <button
                        className={activeTab === 'pieces' ? 'active' : ''}
                        onClick={() => setActiveTab('pieces')}
                    >
                        🔧 Pièces ({task.pieces?.length || 0})
                    </button>
                </div>

                <div className="modal-content">
                    {activeTab === 'overview' && (
                        <div className="overview-tab">
                            <div className="info-grid">
                                <div className="info-card">
                                    <h3>⏱️ Timing</h3>
                                    <div className="timing-details">
                                        <div className="timing-row">
                                            <span className="label">Temps prévu:</span>
                                            <span className="value">{formatTime(task.tempsPrevu)}</span>
                                        </div>
                                        <div className="timing-row">
                                            <span className="label">Temps réel:</span>
                                            <span className="value">{formatTime(task.tempsReel)}</span>
                                        </div>
                                        {delay && (
                                            <div className={`timing-row delay-row ${delay.status}`}>
                                                <span className="label">Écart:</span>
                                                <span className="value">{delay.text}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h3>📦 Ressources</h3>
                                    <div className="resources-details">
                                        <div className="resource-item">
                                            <span className="icon">🔧</span>
                                            <span className="count">{task.nombrePieces || 0}</span>
                                            <span className="label">pièces</span>
                                        </div>
                                        <div className="resource-item">
                                            <span className="icon">👥</span>
                                            <span className="count">{task.personnes?.length || 0}</span>
                                            <span className="label">personnes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {task.aleasIndustriels && (
                                <div className="info-card alert-card">
                                    <h3>⚠️ Aléas Industriels</h3>
                                    <p className="alert-text">{task.aleasIndustriels}</p>
                                    {task.causePotentielle && (
                                        <>
                                            <h4>Cause potentielle:</h4>
                                            <p className="cause-text">{task.causePotentielle}</p>
                                        </>
                                    )}
                                </div>
                            )}

                            {task.description && (
                                <div className="info-card">
                                    <h3>📝 Description</h3>
                                    <p className="description-text">{task.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'personnel' && (
                        <div className="personnel-tab">
                            {task.personnes && task.personnes.length > 0 ? (
                                <div className="personnel-list">
                                    {task.personnes.map((person, idx) => (
                                        <div key={idx} className="personnel-card">
                                            <div className="personnel-header">
                                                <h4>{person.Prénom} {person.Nom}</h4>
                                                <span className="personnel-age">{person.Âge} ans</span>
                                            </div>
                                            <div className="personnel-details">
                                                <div className="detail-row">
                                                    <span className="label">Poste:</span>
                                                    <span className="value">{person.Poste}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Expérience:</span>
                                                    <span className="value">{person["Niveau d'expérience"]} - {person["Années d'expérience"]} ans</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Spécialité:</span>
                                                    <span className="value">{person.Spécialité}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Formation:</span>
                                                    <span className="value">{person.Formation}</span>
                                                </div>
                                                {person.Certification && (
                                                    <div className="detail-row">
                                                        <span className="label">Certification:</span>
                                                        <span className="value certification">{person.Certification}</span>
                                                    </div>
                                                )}
                                                <div className="detail-row">
                                                    <span className="label">Contact:</span>
                                                    <span className="value">{person.Email}</span>
                                                </div>
                                            </div>
                                            {person["Commentaire de carrière"] && (
                                                <div className="personnel-comment">
                                                    <p>{person["Commentaire de carrière"]}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>Aucun personnel assigné à ce poste</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'pieces' && (
                        <div className="pieces-tab">
                            {task.pieces && task.pieces.length > 0 ? (
                                <div className="pieces-list">
                                    {task.pieces.map((piece, idx) => (
                                        <div key={idx} className="piece-card">
                                            <div className="piece-header">
                                                <h4>{piece.Nom}</h4>
                                                <span className="piece-reference">{piece.Référence}</span>
                                            </div>
                                            <div className="piece-details">
                                                <div className="detail-row">
                                                    <span className="label">Catégorie:</span>
                                                    <span className="value">{piece.Catégorie}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Matériau:</span>
                                                    <span className="value">{piece.Matériau}</span>
                                                </div>
                                                {piece.Poids && (
                                                    <div className="detail-row">
                                                        <span className="label">Poids:</span>
                                                        <span className="value">{piece.Poids} kg</span>
                                                    </div>
                                                )}
                                                <div className="detail-row">
                                                    <span className="label">Fournisseur:</span>
                                                    <span className="value">{piece.Fournisseur}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Temps CAO:</span>
                                                    <span className="value">{piece["Temps CAO (h)"]} heures</span>
                                                </div>
                                                {piece["Prix unitaire"] && (
                                                    <div className="detail-row">
                                                        <span className="label">Prix unitaire:</span>
                                                        <span className="value price">{piece["Prix unitaire"]} €</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>Aucune pièce dans ce poste</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManufacturingDetails;
