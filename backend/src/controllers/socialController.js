const Amis = require('../models/Amis');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Message = require('../models/Message');
const Mascotte = require('../models/Mascotte');
const GamificationService = require('../services/gamificationService');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class SocialController {
    /**
     * Rechercher des utilisateurs par pseudo
     */
    searchUsers = withClient(async (req, res, client) => {
        const { query } = req.query;
        const userId = req.user.id;

        if (!query || query.length < 2) {
            return res.status(400).json({ message: "La recherche doit contenir au moins 2 caractères." });
        }

        const users = await User.searchByPseudo(query, userId, client);
        
        // Pour chaque utilisateur trouvé, on vérifie le statut de la relation
        const usersWithStatus = await Promise.all(users.map(async (u) => {
            const relation = await Amis.getRelationStatus(userId, u.id, client);
            return {
                ...u,
                relationStatus: relation ? relation.statut : 'aucun',
                isSender: relation ? relation.id_demandeur === userId : false
            };
        }));

        res.status(200).json(usersWithStatus);
    });

    /**
     * Envoyer une demande d'ami
     */
    sendFriendRequest = withTransaction(async (req, res, client) => {
        const id_demandeur = req.user.id;
        const { id_receveur } = req.body;

        if (id_demandeur == id_receveur) {
            return res.status(400).json({ message: "Vous ne pouvez pas vous ajouter vous-même." });
        }

        const existing = await Amis.getRelationStatus(id_demandeur, id_receveur, client);
        if (existing) {
            return res.status(400).json({ message: "Une relation existe déjà." });
        }

        const request = await Amis.sendRequest(id_demandeur, id_receveur, client);
        
        // Créer une notification pour le receveur
        const sender = await User.findById(id_demandeur, client);
        await Notification.create({
            id_destinataire: id_receveur,
            id_emetteur: id_demandeur,
            type: 'demande_ami',
            contenu: `${sender.pseudo} vous a envoyé une demande d'ami.`
        }, client);

        res.status(201).json(request);
    });

    /**
     * Accepter une demande d'ami
     */
    acceptFriendRequest = withTransaction(async (req, res, client) => {
        const id_receveur = req.user.id;
        const { id_demandeur } = req.body;

        const relation = await Amis.getRelationStatus(id_demandeur, id_receveur, client);
        if (!relation || relation.id_receveur !== id_receveur || relation.statut !== 'en_attente') {
            return res.status(404).json({ message: "Demande introuvable." });
        }

        const updated = await Amis.acceptRequest(id_demandeur, id_receveur, client);

        // Notifier le demandeur que sa demande a été acceptée
        const receiver = await User.findById(id_receveur, client);
        await Notification.create({
            id_destinataire: id_demandeur,
            id_emetteur: id_receveur,
            type: 'acceptation_ami',
            contenu: `${receiver.pseudo} a accepté votre demande d'ami.`
        }, client);

        res.status(200).json(updated);
    });

    /**
     * Récupérer la liste des amis et les demandes en attente
     */
    getSocialData = withClient(async (req, res, client) => {
        const userId = req.user.id;
        
        const friends = await Amis.getFriends(userId, client);
        const pending = await Amis.getPendingRequests(userId, client);
        const notifications = await Notification.getByUserId(userId, client);

        // Ajouter le compteur de messages non lus pour chaque ami
        const friendsWithUnread = await Promise.all(friends.map(async (friend) => {
            const unreadCount = await Message.getUnreadCount(userId, friend.id, client);
            return { ...friend, unreadCount };
        }));

        res.status(200).json({
            friends: friendsWithUnread,
            pending,
            notifications
        });
    });

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    markNotificationsAsRead = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        await Notification.markAllAsReadByUserId(userId, client);
        res.status(200).json({ message: "Notifications marquées comme lues." });
    });

    /**
     * Récupérer le profil public d'un utilisateur
     */
    getPublicProfile = withClient(async (req, res, client) => {
        const targetUserId = req.params.userId;
        const currentUserId = req.user.id;

        const user = await User.findById(targetUserId, client);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        if (user.profil_public === false) {
            return res.status(403).json({ message: "Ce profil est privé.", isPrivate: true });
        }

        const mascottes = await Mascotte.findByUserId(targetUserId, client);
        const mascotte = mascottes && mascottes.length > 0 ? mascottes[0] : null;

        const badges = await GamificationService.getUserBadges(targetUserId, client);

        const friendsCountResult = await client.query(
            `SELECT COUNT(*) as count FROM amis WHERE (id_demandeur = $1 OR id_receveur = $1) AND statut = 'accepte'`,
            [targetUserId]
        );
        const friendsCount = parseInt(friendsCountResult.rows[0].count, 10);

        const sessionsCountResult = await client.query(
            `SELECT COUNT(*) as count FROM session_sport WHERE id_utilisateur = $1 AND finish = true`,
            [targetUserId]
        );
        const sessionsCount = parseInt(sessionsCountResult.rows[0].count, 10);

        const relation = await Amis.getRelationStatus(currentUserId, targetUserId, client);

        res.status(200).json({
            user: {
                id: user.id,
                pseudo: user.pseudo,
                date_inscription: user.date_inscription,
            },
            mascotte: mascotte ? {
                niveau: mascotte.niveau,
                experience: mascotte.experience,
            } : null,
            badges,
            friendsCount,
            sessionsCount,
            relationStatus: relation ? relation.statut : 'aucun',
            isSender: relation ? relation.id_demandeur === parseInt(currentUserId) : false,
        });
    });

    /**
     * Supprimer un ami ou annuler une demande
     */
    removeFriend = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const friendId = req.params.id;

        await Amis.removeRelation(userId, friendId, client);
        res.status(200).json({ message: "Relation supprimée." });
    });
}

module.exports = SocialController;
