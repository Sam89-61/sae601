const Mascotte = require('../models/Mascotte');
const GamificationService = require('../services/gamificationService');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class MascotteController {
    createMascotte = withTransaction(async (req, res, client) => {
        const { experience, niveau, apparence } = req.body;
        const id_utilisateur = req.user.id;
        const newMascotte = await Mascotte.create({ experience, niveau, apparence, id_utilisateur }, client);
        res.status(201).json({
            message: 'Mascotte créée avec succès',
            mascotte: newMascotte
        });
    });

    updateMascotte = withTransaction(async (req, res, client) => {
        const id_mascotte = req.params.id;
        const { experience, niveau, apparence } = req.body;
        const mascotte = await Mascotte.findById(id_mascotte, client);
        if (!mascotte) {
            return res.status(404).json({ message: 'Mascotte non trouvée' });
        }
        if (mascotte.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé. Cette mascotte ne vous appartient pas.' });
        }
        const updatedMascotte = await Mascotte.update(id_mascotte, { experience, niveau, apparence, id_utilisateur: req.user.id }, client);
        res.status(200).json({
            message: 'Mascotte mise à jour avec succès',
            mascotte: updatedMascotte
        });
    });

    deleteMascotte = withTransaction(async (req, res, client) => {
        const id_mascotte = req.params.id;
        const mascotte = await Mascotte.findById(id_mascotte, client);
        if (!mascotte) {
            return res.status(404).json({ message: 'Mascotte non trouvée' });
        }
        if (mascotte.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé. Cette mascotte ne vous appartient pas.' });
        }
        const deletedMascotte = await Mascotte.delete(id_mascotte, client);
        res.status(200).json({
            message: 'Mascotte supprimée avec succès',
            mascotte: deletedMascotte
        });
    });

    getMascotteByUserId = withClient(async (req, res, client) => {
        const id_utilisateur = req.params.id_utilisateur;
        if (parseInt(id_utilisateur) !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé.' });
        }
        const mascotte = await Mascotte.findByUserId(id_utilisateur, client);
        res.status(200).json({
            message: 'Mascotte récupérée avec succès',
            mascotte: mascotte
        });
    });

    getUserBadges = withClient(async (req, res, client) => {
        const id_utilisateur = req.params.id_utilisateur;
        if (parseInt(id_utilisateur) !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé.' });
        }
        const badges = await GamificationService.getUserBadges(id_utilisateur, client);
        res.status(200).json({
            message: 'Badges récupérés avec succès',
            badges: badges
        });
    });
}

module.exports = MascotteController;