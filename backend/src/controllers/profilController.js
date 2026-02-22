const Profil = require('../models/Profil');
const CategoryEquipement = require('../models/CategoryEquipement');
const InformationSante = require('../models/Information_santé');
const RegimeAlimentaire = require('../models/Regime_Alimentaire');
const Objectif = require('../models/Objectif');
const Mascotte = require('../models/Mascotte');
const HistoriquePoids = require('../models/Historique_poids');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class ProfilController {
    createProfil = withTransaction(async (req, res, client) => {
        const {
            age,
            taille,
            poids,
            niveau,
            frequence,
            categorie_objectif,
            date_fin,
            sexe,
            jour_disponible,
            heure_disponible,
            equipement,
            conditions_medicales,
            condition_physique,
            regime_alimentaire,
            restrictions_alimentaires
        } = req.body;

        // Toujours utiliser l'ID du token JWT, jamais celui du body (anti mass assignment)
        const id_utilisateur = req.user.id;

        const resultEquipement = await CategoryEquipement.create(equipement, client);
        const resultInfoSante = await InformationSante.create({ conditions_medicales, condition_physique }, client);
        const resultRegime = await RegimeAlimentaire.create({ regime_alimentaire, restrictions_alimentaires }, client);
        const resultObjectif = await Objectif.create({ categorie_objectif, date_fin }, client);

        const profilData = {
            age,
            taille,
            poids,
            niveau,
            frequence,
            sexe,
            jour_disponible: JSON.stringify(jour_disponible), // Conversion explicite en JSON string
            heure_disponible,
            id_equipement: resultEquipement.id_categorie_equipement,
            id_utilisateur,
            objectif_id: resultObjectif.id_objectif,
            id_information_sante: resultInfoSante.id_information_sante,
            regime_id: resultRegime.id_regime
        };

        const profil = await Profil.create(profilData, client);

        // Enregistrement du poids initial dans l'historique
        await HistoriquePoids.create({ poids, id_utilisateur }, client);

        // Création automatique de la mascotte pour l'utilisateur
        try {
            await Mascotte.create({
                experience: 0,
                niveau: 1,
                apparence: { couleur: 'bleu', accessoires: [] },
                id_utilisateur
            }, client);
        } catch (mascotteErr) {
            console.error('Erreur création mascotte:', mascotteErr.message);
            // On ne fait pas échouer la création du profil si la mascotte échoue
        }

        res.status(201).json({
            message: 'Profil créé avec succès',
            data: profil
        });
    });

    updateProfil = withTransaction(async (req, res, client) => {
        const profilId = req.params.id_profil;
        const {
            age,
            taille,
            poids,
            niveau,
            frequence,
            categorie_objectif,
            date_fin,
            sexe,
            jour_disponible,
            heure_disponible,
            equipement,
            conditions_medicales,
            condition_physique,
            regime_alimentaire,
            restrictions_alimentaires
        } = req.body;

        const ancienProfil = await Profil.findById(profilId, client);
        if (!ancienProfil) {
            return res.status(404).json({ message: 'Profil non trouvé' });
        }
        if (ancienProfil.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé. Ce profil ne vous appartient pas.' });
        }
        const equipementId = await Profil.findEquipementId(profilId, client);
        const infoSanteId = await Profil.findInfoSanteId(profilId, client);
        const regimeId = await Profil.findRegimeId(profilId, client);
        const objectifId = await Profil.findObjectifId(profilId, client);

        const resultEquipement = await CategoryEquipement.update(equipementId.id_equipement, equipement, client);
        const resultInfoSante = await InformationSante.update(infoSanteId.id_information_sante, { conditions_medicales, condition_physique }, client);
        const resultRegime = await RegimeAlimentaire.update(regimeId.regime_id, { regime_alimentaire, restrictions_alimentaires }, client);
        const resultObjectif = await Objectif.update(objectifId.objectif_id, { categorie_objectif, date_fin }, client);

        const profilData = {
            age,
            taille,
            poids,
            niveau,
            sexe,
            frequence,
            jour_disponible: JSON.stringify(jour_disponible),
            heure_disponible,
            id_equipement: resultEquipement.id_categorie_equipement,
            objectif_id: resultObjectif.id_objectif,
            id_information_sante: resultInfoSante.id_information_sante,
            regime_id: resultRegime.id_regime
        };
        const profil = await Profil.update(profilId, profilData, client);

        // Si le poids a changé, on l'enregistre dans l'historique
        if (poids && parseFloat(poids) !== parseFloat(ancienProfil.poids)) {
            await HistoriquePoids.create({ poids, id_utilisateur: profil.id_utilisateur }, client);
        }

        res.status(200).json({
            message: 'Profil mis à jour avec succès',
            data: profil
        });
    });

    deleteProfil = withTransaction(async (req, res, client) => {
        const profilId = req.params.id_profil;
        const profil = await Profil.findById(profilId, client);
        if (!profil) {
            return res.status(404).json({ message: 'Profil non trouvé' });
        }
        if (profil.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé. Ce profil ne vous appartient pas.' });
        }
        const deletedProfil = await Profil.delete(profilId, client);
        await CategoryEquipement.delete(deletedProfil.id_equipement, client);
        await InformationSante.delete(deletedProfil.id_information_sante, client);
        await RegimeAlimentaire.delete(deletedProfil.regime_id, client);
        await Objectif.delete(deletedProfil.objectif_id, client);

        res.status(200).json({
            message: 'Profil supprimé avec succès',
            data: deletedProfil
        });
    });

    getProfilById = withClient(async (req, res, client) => {
        const profilId = req.params.id;
        const profil = await Profil.findById(profilId, client);
        if (!profil) {
            return res.status(404).json({ message: 'Profil non trouvé' });
        }
        if (profil.id_utilisateur !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé.' });
        }
        res.status(200).json({
            message: 'Profil récupéré avec succès',
            data: profil
        });
    });

    getProfilByUserId = withClient(async (req, res, client) => {
        const userId = req.params.id;

        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé.' });
        }

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ 
                message: 'ID utilisateur invalide',
                data: [] 
            });
        }

        try {
            const profil = await Profil.findByUserId(userId, client);
            
            res.status(200).json({
                message: profil && profil.length > 0 
                    ? 'Profil récupéré avec succès' 
                    : 'Aucun profil trouvé',
                data: profil || []
            });
        } catch (error) {
            console.error(`[getProfilByUserId] Erreur pour userId ${userId}:`, error);
            throw error; // Le withClient va gérer et passer au middleware
        }
    });

    getFullProfilByUser = withClient(async (req, res, client) => {
        const userId = req.params.id;

        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé.' });
        }

        const profils = await Profil.findByUserId(userId, client);
        
        if (!profils || profils.length === 0) {
            return res.status(404).json({ message: 'Profil non trouvé' });
        }
        const profil = profils[0];

        const equipement = await CategoryEquipement.findById(profil.id_equipement, client);
        const infoSante = await InformationSante.findById(profil.id_information_sante, client);
        const regime = await RegimeAlimentaire.findById(profil.regime_id, client);
        const objectif = await Objectif.findById(profil.objectif_id, client);

        res.status(200).json({
            message: 'Profil complet récupéré avec succès',
            data: {
                ...profil,
                equipement: equipement.list_equipement,
                conditions_medicales: infoSante.conditions_medicales,
                condition_physique: infoSante.condition_physique,
                regime_alimentaire: regime.alimentation,
                restrictions_alimentaires: regime.restrictions_alimentaires,
                categorie_objectif: objectif.categorie_obj,
                date_fin: 90 
            }
        });
    });
}

module.exports = ProfilController;