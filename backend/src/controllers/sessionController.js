const SessionSport = require('../models/Session_sport');
const SessionRepas = require('../models/Session_repas');
const SessionSportExo = require('../models/Session_sport_exo');
const SessionRepasPlat = require('../models/Session_repas_plat');
const SessionSportLike = require('../models/SessionSportLike');
const SessionRepasLike = require('../models/SessionRepasLike');
const Notification = require('../models/Notification');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class SessionController {
    // ============================================
    // SÉANCES SPORTIVES CUSTOM
    // ============================================

    createCustomSportif = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const { nom, description, duree_minutes, is_public, exercices } = req.body;

        // Validation
        if (!nom || !exercices || exercices.length === 0) {
            return res.status(400).json({ message: 'Nom et au moins un exercice sont requis' });
        }

        // Créer la séance sportive
        const session = await SessionSport.create({
            nom,
            description: description || '',
            date_session: null, // Pas de date pour les séances template
            heure_session: null,
            duree_minutes: duree_minutes || 60,
            id_programme_sportif: null,
            id_utilisateur: userId,
            type_session: 'libre',
            created_by_user_id: userId,
            is_generated: false,
            is_public: is_public || false
        }, client);

        // Créer les exercices de la séance
        for (let i = 0; i < exercices.length; i++) {
            const exo = exercices[i];
            await SessionSportExo.create({
                id_session_sport: session.id_session_sport,
                id_exo: exo.id_exo,
                ordre: i + 1,
                repetitions: exo.repetitions || 10,
                series: exo.series || 3,
                temps_repos_secondes: exo.repos || 60,
                notes: exo.notes || ''
            }, client);
        }

        res.status(201).json({
            message: 'Séance sportive créée avec succès',
            session
        });
    });

    createCustomAlimentaire = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const { nom, type_repas, is_public, id_entree, id_plat, id_dessert, notes } = req.body;

        // Validation
        if (!nom || !type_repas) {
            return res.status(400).json({ message: 'Nom et type de repas sont requis' });
        }

        // Créer la séance repas
        const session = await SessionRepas.create({
            nom,
            type_repas,
            date_repas: new Date(), // Date par défaut
            heure_repas: null,
            id_programme_a: null,
            notes: notes || '',
            created_by_user_id: userId,
            is_generated: false,
            is_public: is_public || false
        }, client);

        // Créer les plats de la session
        await SessionRepasPlat.create({
            id_session_repas: session.id_session_repas,
            id_entree: id_entree || null,
            id_plat: id_plat || null,
            id_dessert: id_dessert || null,
            ordre: 1,
            quantite: 1,
            notes: notes || ''
        }, client);

        res.status(201).json({
            message: 'Séance repas créée avec succès',
            session
        });
    });

    // ============================================
    // RÉCUPÉRATION DES SÉANCES COMMUNAUTAIRES
    // ============================================

    getCommunitySessions = withClient(async (req, res, client) => {
        const userId = req.user.id;
        const { type, search, limit = 20, offset = 0 } = req.query;

        const filters = { search };
        let sessions = [];

        if (type === 'sport' || !type) {
            const sportSessions = await SessionSport.getCommunitySessions(
                filters,
                parseInt(limit),
                parseInt(offset),
                client
            );

            for (let session of sportSessions) {
                session.type = 'sport';
                session.user_has_liked = await SessionSportLike.exists(
                    session.id_session_sport,
                    userId,
                    client
                );
                // Mapper les champs pour le frontend
                session.likes = parseInt(session.like_count) || 0;
                session.copies = parseInt(session.nb_utilisations) || 0;
                session.createur_pseudo = session.creator_pseudo;
            }
            sessions = [...sessions, ...sportSessions];
        }

        if (type === 'repas' || !type) {
            const repasSessions = await SessionRepas.getCommunitySessions(
                filters,
                parseInt(limit),
                parseInt(offset),
                client
            );

            for (let session of repasSessions) {
                session.type = 'repas';
                session.user_has_liked = await SessionRepasLike.exists(
                    session.id_session_repas,
                    userId,
                    client
                );
                // Mapper les champs pour le frontend
                session.likes = parseInt(session.like_count) || 0;
                session.copies = parseInt(session.nb_utilisations) || 0;
                session.createur_pseudo = session.creator_pseudo;
            }
            sessions = [...sessions, ...repasSessions];
        }

        // Trier par date de création
        sessions.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));

        res.status(200).json({ sessions });
    });

    getMySessions = withClient(async (req, res, client) => {
        const userId = req.user.id;
        const { type } = req.query;

        let sessions = [];

        if (type === 'sport' || !type) {
            const sportSessions = await SessionSport.getUserSessions(userId, client);
            sessions = [...sessions, ...sportSessions];
        }

        if (type === 'repas' || !type) {
            const repasSessions = await SessionRepas.getUserSessions(userId, client);
            sessions = [...sessions, ...repasSessions];
        }

        // Trier par date de création
        sessions.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));

        res.status(200).json({ sessions });
    });

    // ============================================
    // COPIE D'UNE SÉANCE
    // ============================================

    copySession = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const { id, type } = req.params;

        if (type === 'sport') {
            // Copier séance sportive
            const sourceSession = await SessionSport.findById(parseInt(id), client);
            if (!sourceSession) {
                return res.status(404).json({ message: 'Séance non trouvée' });
            }

            // Vérifier visibilité
            const isOwner = await SessionSport.isOwnedByUser(parseInt(id), userId, client);
            if (!sourceSession.is_public && !isOwner) {
                return res.status(403).json({ message: 'Cette séance est privée' });
            }

            // Créer la copie
            const newSession = await SessionSport.create({
                nom: `Copie - ${sourceSession.nom}`,
                description: sourceSession.description,
                date_session: null,
                heure_session: sourceSession.heure_session,
                duree_minutes: sourceSession.duree_minutes,
                id_programme_sportif: null,
                id_utilisateur: userId,
                type_session: 'libre',
                created_by_user_id: userId,
                is_generated: false,
                is_public: false,
                source_session_id: parseInt(id)
            }, client);

            // Copier les exercices
            const exercices = await SessionSportExo.getExosBySessionSportId(parseInt(id), client);
            for (const exo of exercices) {
                await SessionSportExo.create({
                    id_session_sport: newSession.id_session_sport,
                    id_exo: exo.id_exo,
                    ordre: exo.ordre,
                    repetitions: exo.repetitions,
                    series: exo.series,
                    temps_repos_secondes: exo.temps_repos_secondes,
                    notes: exo.notes
                }, client);
            }

            // Incrémenter compteur
            await SessionSport.incrementUsageCount(parseInt(id), client);

            // Notification
            if (!isOwner && sourceSession.created_by_user_id) {
                await Notification.create({
                    id_destinataire: sourceSession.created_by_user_id,
                    id_emetteur: userId,
                    type: 'session_copied',
                    contenu: `a copié votre séance "${sourceSession.nom}"`
                }, client);
            }

            res.status(201).json({
                message: 'Séance copiée avec succès',
                session: newSession
            });
        } else if (type === 'repas') {
            // Copier séance repas
            const sourceSession = await SessionRepas.findById(parseInt(id), client);
            if (!sourceSession) {
                return res.status(404).json({ message: 'Séance non trouvée' });
            }

            // Vérifier visibilité
            const isOwner = await SessionRepas.isOwnedByUser(parseInt(id), userId, client);
            if (!sourceSession.is_public && !isOwner) {
                return res.status(403).json({ message: 'Cette séance est privée' });
            }

            // Créer la copie
            const newSession = await SessionRepas.create({
                nom: `Copie - ${sourceSession.nom}`,
                type_repas: sourceSession.type_repas,
                date_repas: new Date(),
                heure_repas: sourceSession.heure_repas,
                id_programme_a: null,
                notes: sourceSession.notes,
                created_by_user_id: userId,
                is_generated: false,
                is_public: false,
                source_session_id: parseInt(id)
            }, client);

            // Copier les plats
            const plats = await SessionRepasPlat.getPlatsBySessionRepasId(parseInt(id), client);
            for (const plat of plats) {
                await SessionRepasPlat.create({
                    id_session_repas: newSession.id_session_repas,
                    id_entree: plat.id_entree,
                    id_plat: plat.id_plat,
                    id_dessert: plat.id_dessert,
                    ordre: plat.ordre,
                    quantite: plat.quantite,
                    notes: plat.notes
                }, client);
            }

            // Incrémenter compteur
            await SessionRepas.incrementUsageCount(parseInt(id), client);

            // Notification
            if (!isOwner && sourceSession.created_by_user_id) {
                await Notification.create({
                    id_destinataire: sourceSession.created_by_user_id,
                    id_emetteur: userId,
                    type: 'session_copied',
                    contenu: `a copié votre séance repas "${sourceSession.nom}"`
                }, client);
            }

            res.status(201).json({
                message: 'Séance copiée avec succès',
                session: newSession
            });
        } else {
            res.status(400).json({ message: 'Type invalide' });
        }
    });

    // ============================================
    // LIKES
    // ============================================

    toggleLike = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const { id, type } = req.params;

        if (type === 'sport') {
            const session = await SessionSport.findById(parseInt(id), client);
            if (!session) {
                return res.status(404).json({ message: 'Séance non trouvée' });
            }

            const exists = await SessionSportLike.exists(parseInt(id), userId, client);

            if (exists) {
                await SessionSportLike.delete(parseInt(id), userId, client);
                await SessionSport.updateLikeCount(parseInt(id), -1, client);

                res.status(200).json({
                    message: 'Like retiré',
                    liked: false,
                    like_count: session.nb_likes - 1
                });
            } else {
                await SessionSportLike.create(parseInt(id), userId, client);
                await SessionSport.updateLikeCount(parseInt(id), 1, client);

                if (session.created_by_user_id && session.created_by_user_id !== userId) {
                    await Notification.create({
                        id_destinataire: session.created_by_user_id,
                        id_emetteur: userId,
                        type: 'session_liked',
                        contenu: `a aimé votre séance "${session.nom}"`
                    }, client);
                }

                res.status(200).json({
                    message: 'Like ajouté',
                    liked: true,
                    like_count: session.nb_likes + 1
                });
            }
        } else if (type === 'repas') {
            const session = await SessionRepas.findById(parseInt(id), client);
            if (!session) {
                return res.status(404).json({ message: 'Séance non trouvée' });
            }

            const exists = await SessionRepasLike.exists(parseInt(id), userId, client);

            if (exists) {
                await SessionRepasLike.delete(parseInt(id), userId, client);
                await SessionRepas.updateLikeCount(parseInt(id), -1, client);

                res.status(200).json({
                    message: 'Like retiré',
                    liked: false,
                    like_count: session.nb_likes - 1
                });
            } else {
                await SessionRepasLike.create(parseInt(id), userId, client);
                await SessionRepas.updateLikeCount(parseInt(id), 1, client);

                if (session.created_by_user_id && session.created_by_user_id !== userId) {
                    await Notification.create({
                        id_destinataire: session.created_by_user_id,
                        id_emetteur: userId,
                        type: 'session_liked',
                        contenu: `a aimé votre séance repas "${session.nom}"`
                    }, client);
                }

                res.status(200).json({
                    message: 'Like ajouté',
                    liked: true,
                    like_count: session.nb_likes + 1
                });
            }
        } else {
            res.status(400).json({ message: 'Type invalide' });
        }
    });

    // ============================================
    // SUPPRESSION ET MODIFICATION
    // ============================================

    deleteSession = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const { id, type } = req.params;

        if (type === 'sport') {
            const isOwner = await SessionSport.isOwnedByUser(parseInt(id), userId, client);
            if (!isOwner) {
                return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres séances' });
            }

            await SessionSport.delete(parseInt(id), client);
            res.status(200).json({ message: 'Séance supprimée avec succès' });
        } else if (type === 'repas') {
            const isOwner = await SessionRepas.isOwnedByUser(parseInt(id), userId, client);
            if (!isOwner) {
                return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres séances' });
            }

            await SessionRepas.delete(parseInt(id), client);
            res.status(200).json({ message: 'Séance supprimée avec succès' });
        } else {
            res.status(400).json({ message: 'Type invalide' });
        }
    });

    updateSession = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const { id, type } = req.params;
        const { nom, description, is_public } = req.body;

        if (type === 'sport') {
            const isOwner = await SessionSport.isOwnedByUser(parseInt(id), userId, client);
            if (!isOwner) {
                return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres séances' });
            }

            const updatedSession = await SessionSport.updateBasicInfo(parseInt(id), { nom, description, is_public }, client);

            if (!updatedSession) {
                return res.status(404).json({ message: 'Séance non trouvée' });
            }

            res.status(200).json({
                message: 'Séance mise à jour avec succès',
                session: updatedSession
            });
        } else if (type === 'repas') {
            const isOwner = await SessionRepas.isOwnedByUser(parseInt(id), userId, client);
            if (!isOwner) {
                return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres séances' });
            }

            const updatedSession = await SessionRepas.updateBasicInfo(parseInt(id), { nom, notes: description, is_public }, client);

            if (!updatedSession) {
                return res.status(404).json({ message: 'Séance non trouvée' });
            }

            res.status(200).json({
                message: 'Séance mise à jour avec succès',
                session: updatedSession
            });
        } else {
            res.status(400).json({ message: 'Type invalide' });
        }
    });
}

module.exports = SessionController;
