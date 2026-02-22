const Evenement = require('../models/Evenement');
const Participation = require('../models/Participation');
const GamificationService = require('../services/gamificationService');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class EvenementController {

    createEvenement = withTransaction(async (req, res, client) => {
        const { nom, description, date, lieu, heure, duree, categorie } = req.body;
        // On récupère l'ID de l'utilisateur connecté via le token (req.user ajouté par le middleware auth)
        const userId = req.user.id;
        const newEvenement = await Evenement.create({ nom, description, date, lieu, heure, duree, categorie }, userId, client);

        // Ajouter automatiquement le créateur comme participant
        await Participation.create({
            id_utilisateur: userId,
            id_evenement: newEvenement.id_evenement,
            statut: 'confirme'
        }, client);

        res.status(201).json({
            message: 'Événement créé avec succès',
            evenement: newEvenement
        });
    });

    updateEvenement = withTransaction(async (req, res, client) => {
        const id_evenement = req.params.id;
        const evenement = await Evenement.findById(id_evenement, client);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        if (evenement.organisateur_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé. Seul l\'organisateur peut modifier cet événement.' });
        }
        const { nom, description, date, lieu, heure, duree, categorie } = req.body;
        const updatedEvenement = await Evenement.update(id_evenement, { nom, description, date, lieu, heure, duree, categorie }, client);
        res.status(200).json({
            message: 'Événement mis à jour avec succès',
            evenement: updatedEvenement
        });
    });

    deleteEvenement = withTransaction(async (req, res, client) => {
        const id_evenement = req.params.id;
        const evenement = await Evenement.findById(id_evenement, client);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        if (evenement.organisateur_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé. Seul l\'organisateur peut supprimer cet événement.' });
        }
        const deletedEvenement = await Evenement.delete(id_evenement, client);
        res.status(200).json({
            message: 'Événement supprimé avec succès',
            evenement: deletedEvenement
        });
    });

    getAllEvenements = withClient(async (req, res, client) => {
        const evenements = await Evenement.findAll(client);
        res.status(200).json({
            message: 'Événements récupérés avec succès',
            evenements
        });
    });

    getMyEvents = withClient(async (req, res, client) => {
        const userId = req.user.id;

        // Événements créés par l'utilisateur
        const createdEvents = await Evenement.findCreatedByUser(userId, client);

        // Événements auxquels l'utilisateur participe (mais qu'il n'a pas créés)
        const joinedEvents = await Evenement.findJoinedByUser(userId, client);

        res.status(200).json({
            created: createdEvents,
            joined: joinedEvents
        });
    });

    addParticipation = withTransaction(async (req, res, client) => {
        const { id_evenement, statut } = req.body;
        const id_utilisateur = req.user.id;

        const participationData = {
             id_utilisateur,
             id_evenement,
             statut: statut || req.body.status
        };

        const newParticipation = await Participation.create(participationData, client);

        // Gamification: Check for badges
        const awardedBadges = await GamificationService.checkAndAwardBadges(id_utilisateur, {
            type: 'participation',
            id_evenement: id_evenement
        }, client);

        res.status(201).json({
            message: 'Participation enregistrée avec succès',
            participation: newParticipation,
            badges_debloques: awardedBadges
        });
    });

    updateParticipation = withTransaction(async (req, res, client) => {
        const { id_evenement, statut } = req.body;
        const id_utilisateur = req.user.id;
        
        // La méthode update attend: id_evenement, id_utilisateur, participationData
        const updatedParticipation = await Participation.update(id_evenement, id_utilisateur, { statut }, client);
        
        if (!updatedParticipation) {
             return res.status(404).json({ message: 'Participation non trouvée' });
        }

        res.status(200).json({
            message: 'Participation mise à jour avec succès',
            participation: updatedParticipation
        });
    });

    deleteParticipation = withTransaction(async (req, res, client) => {
        const id_evenement = req.body.id_evenement || req.query.id_evenement;
        const id_utilisateur = req.user.id;

        if (!id_evenement) {
            return res.status(400).json({ message: 'Identifiant manquant (id_evenement)' });
        }

        const deletedParticipation = await Participation.delete(id_evenement, id_utilisateur, client);
        
        if (!deletedParticipation) {
             return res.status(404).json({ message: 'Participation non trouvée' });
        }

        res.status(200).json({
            message: 'Participation supprimée avec succès',
            participation: deletedParticipation
        });
    });

    checkParticipation = withClient(async (req, res, client) => {
        const { id_evenement, id_utilisateur } = req.params;
        if (parseInt(id_utilisateur) !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé.' });
        }
        const participation = await Participation.findById(id_evenement, id_utilisateur, client);
        res.status(200).json({
            message: 'Statut participation récupéré',
            isRegistered: !!participation,
            participation
        });
    });

    getAllParticipationsByUserId = withClient(async (req, res, client) => {
        const id_utilisateur = req.params.id_utilisateur;
        if (parseInt(id_utilisateur) !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé.' });
        }
        const participations = await Participation.findAllByUserId(id_utilisateur, client);
        res.status(200).json({
            message: 'Participations récupérées avec succès',
            participations
        });
    });
}
module.exports = EvenementController;