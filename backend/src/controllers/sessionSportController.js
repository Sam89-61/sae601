const SessionSport = require('../models/Session_sport');
const SessionSportExo = require('../models/Session_sport_exo');
const ModeleSeance = require('../models/ModeleSeance');
const Mascotte = require('../models/Mascotte');
const GamificationService = require('../services/gamificationService');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class SessionSportController {
    createSessionSport = withTransaction(async (req, res, client) => {
        const { nom, description, date_session, heure_session, duree_minutes, id_programme_sportif } = req.body;
        const newSessionSport = await SessionSport.create({ nom, description, date_session, heure_session, duree_minutes, id_programme_sportif, id_utilisateur: req.user.id }, client);
        res.status(201).json({
            message: 'Session sportive créée avec succès',
            sessionSport: newSessionSport
        });
    });

    updateSessionSport = withTransaction(async (req, res, client) => {
        const id_session_sport = req.params.id;
        const session = await SessionSport.findById(id_session_sport, client);
        if (!session) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }
        if (session.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé. Cette session ne vous appartient pas.' });
        }
        const { nom, description, date_session, heure_session, duree_minutes,finish, id_programme_sportif } = req.body;
        const updatedSessionSport = await SessionSport.update(id_session_sport, { nom, description, date_session, heure_session, duree_minutes,finish, id_programme_sportif }, client);
        res.status(200).json({
            message: 'Session sportive mise à jour avec succès',
            sessionSport: updatedSessionSport
        });
    });

    deleteSessionSport = withTransaction(async (req, res, client) => {
        const id_session_sport = req.params.id;
        const session = await SessionSport.findById(id_session_sport, client);
        if (!session) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }
        if (session.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé. Cette session ne vous appartient pas.' });
        }
        const deletedSessionSport = await SessionSport.delete(id_session_sport, client);
        res.status(200).json({
            message: 'Session sportive supprimée avec succès',
            sessionSport: deletedSessionSport
        });
    });

    addExosToSession = withTransaction(async (req, res, client) => {
        const id_session_sport = req.params.id;
        const session = await SessionSport.findById(id_session_sport, client);
        if (!session) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }
        if (session.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé. Cette session ne vous appartient pas.' });
        }
        const { id_exo, ordre, repetitions, series, temps_repos_secondes, notes } = req.body;
        const newSessionSportExo = await SessionSportExo.create({ id_session_sport, id_exo, ordre, repetitions, series, temps_repos_secondes, notes }, client);
        res.status(201).json({
            message: 'Exercice ajouté à la session sportive avec succès',
            sessionSportExo: newSessionSportExo
        });
    });

    updateSessionSportExo = withTransaction(async (req, res, client) => {
        const id_session_sport_exo = req.params.id;
        const { id_exo, id_session_sport, ordre, repetitions, series, temps_repos_secondes, notes } = req.body;
        const exo = await SessionSportExo.findById(id_session_sport_exo, client);
        if (!exo) {
            return res.status(404).json({ message: 'Exercice non trouvé' });
        }
        const session = await SessionSport.findById(exo.id_session_sport, client);
        if (!session || session.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé.' });
        }
        const updatedSessionSportExo = await SessionSportExo.update(id_session_sport_exo, { id_exo, id_session_sport, ordre, repetitions, series, temps_repos_secondes, notes }, client);
        res.status(200).json({
            message: 'Exercice de la session sportive mis à jour avec succès',
            sessionSportExo: updatedSessionSportExo
        });
    });

    deleteSessionSportExo = withTransaction(async (req, res, client) => {
        const id_session_sport_exo = req.params.id;
        const exo = await SessionSportExo.findById(id_session_sport_exo, client);
        if (!exo) {
            return res.status(404).json({ message: 'Exercice non trouvé' });
        }
        const session = await SessionSport.findById(exo.id_session_sport, client);
        if (!session || session.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé.' });
        }
        const deletedSessionSportExo = await SessionSportExo.delete(id_session_sport_exo, client);
        res.status(200).json({
            message: 'Exercice de la session sportive supprimé avec succès',
            sessionSportExo: deletedSessionSportExo
        });
    });

    getExosBySessionSportId = withClient(async (req, res, client) => {
        const id_session_sport = req.params.id;
        const sessionSportExos = await SessionSportExo.getExosBySessionSportId(id_session_sport, client);
        res.status(200).json(sessionSportExos);
    });

    getSessionDetails = withClient(async (req, res, client) => {
        const id_session_sport = req.params.id;
        
        const session = await SessionSport.findDetailsById(id_session_sport, client);

        if (!session) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        // 2. Exercices détaillés
        const exercices = await SessionSportExo.findDetailsBySessionId(id_session_sport, client);

        res.status(200).json({
            session,
            exercices
        });
    });

    completeSession = withTransaction(async (req, res, client) => {
        const id_session_sport = req.params.id;

        const session = await SessionSport.findById(id_session_sport, client);
        if (!session) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }
        if (session.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé. Cette session ne vous appartient pas.' });
        }

        const result = await SessionSport.markAsRealized(id_session_sport, client);

        if (!result) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        // Si la session n'a pas d'id_utilisateur (anciennes sessions ou erreur), 
        // on ne fait pas de gamification mais on retourne quand même un succès
        if (!result.id_utilisateur) {
            return res.status(200).json({
                message: 'Session marquée comme réalisée (sans gamification)',
                session: result,
                mascotte: null,
                badges_debloques: []
            });
        }

        // Gamification: Award XP (50 XP for completing a session) - Only for generated sessions
        let updatedMascotte = null;
        if (result.is_generated) {
            updatedMascotte = await GamificationService.awardXP(result.id_utilisateur, 50, client);
        } else {
            // Just get current mascot state
            const mascotteData = await Mascotte.findByUserId(result.id_utilisateur, client);
            updatedMascotte = mascotteData && mascotteData.length > 0 ? mascotteData[0] : null;
        }

        // Gamification: Check for badges
        const awardedBadges = await GamificationService.checkAndAwardBadges(result.id_utilisateur, {
            type: 'session_completed',
            type_session: result.type_session
        }, client);

        res.status(200).json({
            message: 'Session marquée comme réalisée',
            session: result,
            mascotte: updatedMascotte,
            badges_debloques: awardedBadges
        });
    });

    completeFreeSession = withTransaction(async (req, res, client) => {
        const modeleId = req.params.id;
        const userId = req.user.id;

        // 1. Récupérer les infos du modèle
        const modele = await ModeleSeance.findById(modeleId, client);
        if (!modele) {
            return res.status(404).json({ message: 'Modèle de séance non trouvé' });
        }

        // 2. Créer la session réelle en base
        const sessionData = {
            nom: modele.nom,
            description: modele.description,
            date_session: new Date(),
            heure_session: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }),
            duree_minutes: modele.duree_minutes,
            id_utilisateur: userId,
            type_session: 'libre'
        };

        const newSession = await SessionSport.create(sessionData, client);

        // 3. Marquer comme terminée
        await SessionSport.markAsRealized(newSession.id_session_sport, client);

        // 4. Gamification - Les séances libres ne donnent PAS d'XP, mais peuvent débloquer des badges
        const awardedBadges = await GamificationService.checkAndAwardBadges(userId, {
            type: 'session_completed',
            type_session: 'libre'
        }, client);

        // Récupérer l'état actuel de la mascotte (sans ajout d'XP)
        const mascotteData = await Mascotte.findByUserId(userId, client);
        const currentMascotte = mascotteData && mascotteData.length > 0 ? mascotteData[0] : null;

        res.status(200).json({
            message: 'Séance libre enregistrée avec succès',
            session: newSession,
            mascotte: currentMascotte,
            badges_debloques: awardedBadges
        });
    });

    getLastCompletionForModel = withClient(async (req, res, client) => {
        const modeleId = req.params.id;
        const userId = req.user.id;

        // 1. Récupérer le nom du modèle
        const modele = await ModeleSeance.findById(modeleId, client);
        if (!modele) {
            return res.status(404).json({ lastCompletion: null });
        }

        // 2. Récupérer la dernière séance libre terminée pour ce nom par cet utilisateur
        const lastSession = await SessionSport.getLastCompletion({
            nom: modele.nom,
            id_utilisateur: userId,
            type_session: 'libre'
        }, client);

        res.status(200).json({
            lastCompletion: lastSession ? lastSession.date_realise : null
        });
    });

    completeCommunitySession = withTransaction(async (req, res, client) => {
        const sourceSessionId = req.params.id;
        const userId = req.user.id;

        const sourceSession = await SessionSport.findById(sourceSessionId, client);
        if (!sourceSession) {
            return res.status(404).json({ message: 'Session communautaire non trouvée' });
        }

        const sessionData = {
            nom: sourceSession.nom,
            description: sourceSession.description,
            date_session: new Date(),
            heure_session: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }),
            duree_minutes: sourceSession.duree_minutes,
            id_utilisateur: userId,
            type_session: 'communautaire',
            source_session_id: sourceSessionId
        };

        const newSession = await SessionSport.create(sessionData, client);

        // 3. Copier les exercices
        const sourceExos = await SessionSportExo.findDetailsBySessionId(sourceSessionId, client);
        for (const exo of sourceExos) {
            await SessionSportExo.create({
                id_session_sport: newSession.id_session_sport,
                id_exo: exo.id_exo,
                ordre: exo.ordre,
                series: exo.series,
                repetitions: exo.repetitions,
                poids: exo.poids,
                temps_repos_secondes: exo.temps_repos_secondes,
                notes: exo.notes
            }, client);
        }

        await SessionSport.markAsRealized(newSession.id_session_sport, client);

        // Gamification - Pas d'XP pour les séances communautaires
        // Récupérer l'état actuel de la mascotte
        const mascotteData = await Mascotte.findByUserId(userId, client);
        const currentMascotte = mascotteData && mascotteData.length > 0 ? mascotteData[0] : null;

        const awardedBadges = await GamificationService.checkAndAwardBadges(userId, {
            type: 'session_completed',
            type_session: 'communautaire'
        }, client);

        await SessionSport.incrementUsageCount(sourceSessionId, client);

        res.status(200).json({
            message: 'Séance communautaire enregistrée avec succès',
            session: newSession,
            mascotte: currentMascotte,
            badges_debloques: awardedBadges
        });
    });

    getLastCompletionForCommunitySession = withClient(async (req, res, client) => {
        const sessionId = req.params.id;
        const userId = req.user.id;

        const lastSession = await SessionSport.getLastCompletion({
            source_session_id: sessionId,
            id_utilisateur: userId,
            type_session: 'communautaire'
        }, client);

        res.status(200).json({
            lastCompletion: lastSession ? lastSession.date_realise : null
        });
    });
}

module.exports = SessionSportController;