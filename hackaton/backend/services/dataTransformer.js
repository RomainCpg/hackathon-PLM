import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Transforme les données du merged_json.json en structure Project/Task
 * @param {Array} postesData - Tableau de postes depuis merged_json.json
 * @returns {Object} Projet avec toutes les tâches
 */
export function transformPostesToProject(postesData) {
    const project = {
        id: 'airplus-manufacturing',
        name: 'Production Airplus - Assemblage Avion',
        description: 'Processus complet d\'assemblage aéronautique',
        status: 'active',
        createdAt: new Date().toISOString(),
        tasks: []
    };

    postesData.forEach((poste) => {
        // Déterminer le département selon le type de poste
        let department = 'assembly';
        const posteName = poste.Nom.toLowerCase();

        if (posteName.includes('assemblage') || posteName.includes('montage')) {
            department = 'assembly';
        } else if (posteName.includes('fixation') || posteName.includes('passage')) {
            department = 'integration';
        } else if (posteName.includes('stickers')) {
            department = 'finishing';
        }

        // Déterminer le statut selon les heures
        let status = 'todo';
        const currentDate = new Date();
        const posteDate = new Date(poste.Date);

        if (posteDate < currentDate) {
            status = 'done';
        } else if (posteDate.toDateString() === currentDate.toDateString()) {
            const currentTime = currentDate.getHours() * 3600 + currentDate.getMinutes() * 60;
            const [startH, startM] = poste["Heure Début"].split(':').map(Number);
            const [endH, endM] = poste["Heure Fin"].split(':').map(Number);
            const startTime = startH * 3600 + startM * 60;
            const endTime = endH * 3600 + endM * 60;

            if (currentTime >= startTime && currentTime < endTime) {
                status = 'in-progress';
            } else if (currentTime >= endTime) {
                status = 'done';
            }
        }

        // Créer la description enrichie
        const description = `
**Poste ${poste.Poste}** - ${poste.Nom}

**⏱️ Timing:**
- Temps prévu: ${poste["Temps Prévu"]}
- Temps réel: ${poste["Temps Réel"]}
- Début: ${poste["Heure Début"]} | Fin: ${poste["Heure Fin"]}

**🔧 Pièces:** ${poste["Nombre pièces"]} pièces
${poste.Référence ? `Références: ${poste.Référence}` : ''}

**👥 Personnel:** ${poste.Personnes ? poste.Personnes.length : 0} personnes

**⚠️ Aléas:**
${poste["Aléas Industriels"]}
_Cause: ${poste["Cause Potentielle"]}_
        `.trim();

        const task = {
            id: `poste-${poste.Poste}`,
            title: `${poste.Nom}`,
            description: description,
            status: status,
            department: department,
            assignedTo: poste.Personnes && poste.Personnes.length > 0
                ? `${poste.Personnes[0].Prénom} ${poste.Personnes[0].Nom}`
                : undefined,
            dueDate: new Date(poste.Date).toISOString(),
            createdAt: new Date().toISOString(),
            order: poste.Poste,
            // Données spécifiques manufacturing
            posteNumber: poste.Poste,
            tempsPrevu: poste["Temps Prévu"],
            tempsReel: poste["Temps Réel"],
            aleasIndustriels: poste["Aléas Industriels"],
            causePotentielle: poste["Cause Potentielle"],
            personnes: poste.Personnes || [],
            pieces: poste.Pièces || [],
            nombrePieces: poste["Nombre pièces"]
        };

        project.tasks.push(task);
    });

    return project;
}

/**
 * Charge et transforme les données depuis merged_json.json
 * @returns {Object} Projet transformé
 */
export function loadManufacturingData() {
    try {
        const jsonPath = path.join(__dirname, '../../merged_json.json');
        console.log('📂 Chargement des données depuis:', jsonPath);

        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const postesData = JSON.parse(rawData);

        console.log(`✅ ${postesData.length} postes chargés`);

        const project = transformPostesToProject(postesData);
        console.log(`✅ Projet créé avec ${project.tasks.length} tâches`);

        return project;
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        throw error;
    }
}

/**
 * Obtient des statistiques sur les données manufacturing
 * @param {Object} project - Projet avec les tâches
 * @returns {Object} Statistiques
 */
export function getManufacturingStats(project) {
    const tasks = project.tasks || [];

    // Calculer le temps total prévu et réel
    const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return hours * 3600 + minutes * 60 + (seconds || 0);
    };

    const totalPrevu = tasks.reduce((sum, task) => sum + parseTime(task.tempsPrevu), 0);
    const totalReel = tasks.reduce((sum, task) => sum + parseTime(task.tempsReel), 0);

    // Grouper par département
    const byDepartment = tasks.reduce((acc, task) => {
        acc[task.department] = (acc[task.department] || 0) + 1;
        return acc;
    }, {});

    // Compter les pièces et le personnel
    const totalPieces = tasks.reduce((sum, task) => sum + (task.nombrePieces || 0), 0);
    const totalPersonnel = tasks.reduce((sum, task) => sum + (task.personnes?.length || 0), 0);

    // Identifier les postes avec retards
    const postesEnRetard = tasks.filter(task => {
        const prevu = parseTime(task.tempsPrevu);
        const reel = parseTime(task.tempsReel);
        return reel > prevu;
    });

    return {
        totalPostes: tasks.length,
        totalPieces,
        totalPersonnel,
        tempsPrevu: formatDuration(totalPrevu),
        tempsReel: formatDuration(totalReel),
        ecartTemps: formatDuration(Math.abs(totalReel - totalPrevu)),
        tauxRetard: tasks.length > 0 ? ((postesEnRetard.length / tasks.length) * 100).toFixed(1) : 0,
        byDepartment,
        postesEnRetard: postesEnRetard.length,
        byStatus: {
            todo: tasks.filter(t => t.status === 'todo').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            review: tasks.filter(t => t.status === 'review').length,
            done: tasks.filter(t => t.status === 'done').length,
        }
    };
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
