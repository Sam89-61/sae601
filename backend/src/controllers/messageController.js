const Message = require('../models/Message');
const Amis = require('../models/Amis');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class MessageController {
    /**
     * Envoyer un message
     */
    sendMessage = withTransaction(async (req, res, client) => {
        const id_emetteur = req.user.id;
        const { id_receveur, contenu } = req.body;

        // Vérifier s'ils sont amis
        const relation = await Amis.getRelationStatus(id_emetteur, id_receveur, client);
        if (!relation || relation.statut !== 'accepte') {
            return res.status(403).json({ message: "Vous devez être amis pour envoyer un message." });
        }

        const message = await Message.create({ id_emetteur, id_receveur, contenu }, client);
        
        // Créer une notification pour le destinataire
        const sender = await User.findById(id_emetteur, client);
        await Notification.create({
            id_destinataire: id_receveur,
            id_emetteur: id_emetteur,
            type: 'nouveau_message',
            contenu: `${sender.pseudo} vous a envoyé un message.`
        }, client);
        
        res.status(201).json(message);
    });

    /**
     * Récupérer la conversation avec un ami
     */
    getConversation = withClient(async (req, res, client) => {
        const userId = req.user.id;
        const friendId = req.params.id;

        // Marquer les messages reçus comme lus
        await Message.markAsRead(userId, friendId, client);

        const conversation = await Message.getConversation(userId, friendId, client);
        res.status(200).json(conversation);
    });
}

module.exports = MessageController;
