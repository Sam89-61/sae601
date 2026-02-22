const { withClient, withTransaction } = require('../utils/controllerWrapper');
const SessionSport = require('../models/Session_sport');
const Record = require('../models/Record');
const HistoriquePoids = require('../models/Historique_poids');
const Profil = require('../models/Profil');

class EvolutionController {
    /**
     * Récupère les statistiques globales d'évolution de l'utilisateur
     */
    getStats = withClient(async (req, res, client) => {
        const userId = req.user.id;

        // 1. Compter les sessions (Personnalisées vs Libres)
        const sessionsStats = await SessionSport.countByType(userId, client);
        
        // 2. Récupérer l'historique du poids
        const poidsHistory = await HistoriquePoids.findByUserId(userId, client);

        // 3. Récupérer les records avec noms d'exercices
        const records = await Record.getWithExercisesByUserId(userId, client);

        res.status(200).json({
            sessions: {
                personnalisees: parseInt(sessionsStats.count_perso || 0),
                libres: parseInt(sessionsStats.count_libre || 0)
            },
            poidsHistory,
            records: records
        });
    });

  
    addPoids = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const { poids } = req.body;

        if (!poids) {
            return res.status(400).json({ message: "Le poids est requis." });
        }

        const newPoids = await HistoriquePoids.create({ poids, id_utilisateur: userId }, client);

        // Mise à jour du poids dans le profil
        await Profil.updateWeight(userId, poids, client);

        res.status(201).json({
            message: "Poids enregistré avec succès.",
            data: newPoids
        });
    });


    addRecord = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const { id_exo, score, type_record } = req.body;

        if (!id_exo || !score || !type_record) {
            return res.status(400).json({ message: "id_exo, score et type_record sont requis." });
        }

        
        const newRecord = await Record.create({ 
            type_record, 
            score, 
            id_utilisateur: userId, 
            id_exo 
        }, client);

        res.status(201).json({
            message: "Record enregistré avec succès.",
            data: newRecord
        });
    });

    /**
     * Récupère le calendrier d'activité (style GitHub) sur les 365 derniers jours
     */
    getActivityCalendar = withClient(async (req, res, client) => {
        const userId = req.user.id;

        // Sessions terminées des 365 derniers jours groupées par date
        const activity = await SessionSport.getActivityCalendar(userId, client);

        // Total jours actifs
        const totalActiveDays = await SessionSport.getTotalActiveDays(userId, client);

        // Calcul du streak côté JS (plus lisible qu'un CTE récursif)
        const activeDates = new Set(activity.map(r => r.date.toISOString().split('T')[0]));
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let checkDate = new Date(today);
        // Si pas d'activité aujourd'hui, commencer par hier
        if (!activeDates.has(checkDate.toISOString().split('T')[0])) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (activeDates.has(checkDate.toISOString().split('T')[0])) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        res.status(200).json({
            activity: activity.map(r => ({
                date: r.date.toISOString().split('T')[0],
                count: parseInt(r.count)
            })),
            currentStreak,
            totalActiveDays: parseInt(totalActiveDays)
        });
    });

    /**
     * Supprime un record
     */
    deleteRecord = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const id_record = req.params.id;

        // On vérifie que le record appartient bien à l'utilisateur
        const record = await Record.findById(id_record, client);
        if (!record || record.id_utilisateur !== userId) {
            return res.status(404).json({ message: "Record introuvable ou accès refusé." });
        }

        await Record.delete(id_record, client);

        res.status(200).json({ message: "Record supprimé avec succès." });
    });

    /**
     * Récupère l'évolution spécifique d'un record pour un exercice donné
     */
    getRecordProgression = withClient(async (req, res, client) => {
        const userId = req.user.id;
        const id_exo = req.params.idExo;

        const progression = await Record.getProgression(userId, id_exo, client);

        res.status(200).json(progression);
    });
}

module.exports = EvolutionController;
