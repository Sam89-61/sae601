const { withClient, withTransaction } = require('../utils/controllerWrapper');
const User = require('../models/User');
const ClassementUser = require('../models/ClassementUser');

class AdminController {

    // 1. GESTION DES UTILISATEURS
    
    // Lister tous les utilisateurs (simplifié pour l'admin)
    getAllUsers = withClient(async (req, res, client) => {
        const users = await User.findAllAdmin(client);
        res.status(200).json(users);
    });

    // Supprimer un utilisateur (Ban)
    deleteUser = withTransaction(async (req, res, client) => {
        const { id } = req.params;
        
        // On supprime d'abord les données liées
        await User.deleteAllRelatedData(id, client);
        
        // Suppression de l'utilisateur
        const deletedUser = await User.delete(id, client);
        
        if (!deletedUser) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.status(200).json({ message: `Utilisateur ${deletedUser.pseudo} supprimé avec succès.` });
    });

    // 2. MODÉRATION / GAMIFICATION

    // Récupérer les soumissions en attente
    getPendingSubmissions = withClient(async (req, res, client) => {
        const submissions = await ClassementUser.getPendingSubmissions(client);
        res.status(200).json(submissions);
    });

    // Valider ou Rejeter une soumission
    updateSubmissionStatus = withTransaction(async (req, res, client) => {
        const { id } = req.params; // id_classement_user
        const { statut, commentaire } = req.body; // 'VALIDE' ou 'REFUSE'

        if (!['VALIDE', 'REFUSE'].includes(statut)) {
            return res.status(400).json({ message: "Statut invalide (VALIDE ou REFUSE attendu)" });
        }

        const validateur_id = req.user.id; // L'admin qui valide

        const updatedSubmission = await ClassementUser.updateStatus(id, statut, commentaire, validateur_id, client);

        if (!updatedSubmission) {
            return res.status(404).json({ message: "Soumission introuvable" });
        }

        res.status(200).json({ 
            message: `Soumission ${statut === 'VALIDE' ? 'validée' : 'refusée'} avec succès.`,
            submission: updatedSubmission 
        });
    });
}

module.exports = new AdminController();
