const Programme = require('../models/Programme');
const ProgrammeSportif = require('../models/Programme_sportif');
const ProgrammeAlimentaire = require('../models/Programme_alimentaire');
const ProgrammeGeneratorSport = require('../services/programmesGeneratorSport');
const ProgrammeGeneratorAlimentaire = require('../services/programmesGeneratorAlimentaire');
const Profil = require('../models/Profil');
const Objectif = require('../models/Objectif');
const SessionSport = require('../models/Session_sport');
const SessionRepas = require('../models/Session_repas');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class ProgrammeController {
    getMyProgramme = withClient(async (req, res, client) => {
        const userId = req.user.id;
        const profils = await Profil.findByUserId(userId, client);

        if (!profils || profils.length === 0) {
            return res.status(404).json({ message: 'Aucun profil trouvé pour cet utilisateur.' });
        }
        const profil = profils[0];

        const programme = await Programme.findByProfilId(profil.id_profil, client);
        if (!programme) {
            return res.status(404).json({ message: 'Aucun programme généré pour ce profil.' });
        }

        const programmeSportif = await ProgrammeSportif.findByProgrammeId(programme.id_programme, client);
        let sessions = [];
        if (programmeSportif) {
            sessions = await SessionSport.findByProgrammeSportifId(programmeSportif.id_programme_sportif, client);
        }

        const programmeAlimentaire = await ProgrammeAlimentaire.findById(programme.id_programme, client);
        let sessionRepas = [];
        if (programmeAlimentaire) {
            sessionRepas = await SessionRepas.findByProgrammeAlimentaireId(programmeAlimentaire.id_programme_a, client);
        }

        res.status(200).json({
            programme,
            programmeSportif,
            sessions,
            programmeAlimentaire,
            sessionRepas
        });
    });

    createProgramme = withTransaction(async (req, res, client) => {
        const { nom, description, date_debut, date_fin, id_profil } = req.body;

        const isOwner = await Profil.isOwnedByUser(id_profil, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce profil ne vous appartient pas.' });
        }

        const newProgramme = await Programme.create({ nom, description, date_debut, date_fin, id_profil }, client);
        res.status(201).json({
            message: 'Programme créé avec succès',
            programme: newProgramme
        });
    });

    deleteProgramme = withTransaction(async (req, res, client) => {
        const id_programme = req.params.id;

        const isOwner = await Programme.isOwnedByUser(id_programme, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme ne vous appartient pas.' });
        }

        const deletedProgramme = await Programme.delete(id_programme, client);
        res.status(200).json({
            message: 'Programme supprimé avec succès',
            programme: deletedProgramme
        });
    });

    updateProgramme = withTransaction(async (req, res, client) => {
        const id_programme = req.params.id;

        const isOwner = await Programme.isOwnedByUser(id_programme, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme ne vous appartient pas.' });
        }

        const { nom, description, date_debut, date_fin, id_profil } = req.body;
        const updatedProgramme = await Programme.update(id_programme, { nom, description, date_debut, date_fin, id_profil }, client);
        res.status(200).json({
            message: 'Programme mis à jour avec succès',
            programme: updatedProgramme
        });
    });

    getProgrammeById = withClient(async (req, res, client) => {
        const id_programme = req.params.id;

        const isOwner = await Programme.isOwnedByUser(id_programme, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme ne vous appartient pas.' });
        }

        const programme = await Programme.findById(id_programme, client);
        if (!programme) {
            return res.status(404).json({ message: 'Programme non trouvé' });
        }
        res.status(200).json({ programme });
    });

    createProgrammeAlimentaire = withTransaction(async (req, res, client) => {
        const { nom, description, id_programme } = req.body;

        const isOwner = await Programme.isOwnedByUser(id_programme, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme ne vous appartient pas.' });
        }

        const newProgrammeAlimentaire = await ProgrammeAlimentaire.create({ nom, description, id_programme }, client);
        res.status(201).json({
            message: 'Programme alimentaire créé avec succès',
            programmeAlimentaire: newProgrammeAlimentaire
        });
    });

    updateProgrammeAlimentaire = withTransaction(async (req, res, client) => {
        const id_programme_a = req.params.id;

        const isOwner = await ProgrammeAlimentaire.isOwnedByUser(id_programme_a, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme alimentaire ne vous appartient pas.' });
        }

        const { nom, description, id_programme } = req.body;
        const updatedProgrammeAllimentaire = await ProgrammeAlimentaire.update(id_programme_a, { nom, description, id_programme }, client);
        res.status(200).json({
            message: 'Programme alimentaire mis à jour avec succès',
            programmeAllimentaire: updatedProgrammeAllimentaire
        });
    });

    deleteProgrammeAlimentaire = withTransaction(async (req, res, client) => {
        const id_programme_a = req.params.id;

        const isOwner = await ProgrammeAlimentaire.isOwnedByUser(id_programme_a, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme alimentaire ne vous appartient pas.' });
        }

        const deletedProgrammeAllimentaire = await ProgrammeAlimentaire.delete(id_programme_a, client);
        res.status(200).json({
            message: 'Programme alimentaire supprimé avec succès',
            programmeAllimentaire: deletedProgrammeAllimentaire
        });
    });

    getProgrammeAlimentaireById = withClient(async (req, res, client) => {
        const id_programme = req.params.id;

        const isOwner = await Programme.isOwnedByUser(id_programme, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme ne vous appartient pas.' });
        }

        const programmeAlimentaire = await ProgrammeAlimentaire.findById(id_programme, client);
        if (!programmeAlimentaire) {
            return res.status(404).json({ message: 'Programme alimentaire non trouvé' });
        }
        res.status(200).json({ programmeAlimentaire });
    });

    createProgrammeSportif = withTransaction(async (req, res, client) => {
        const { nom, description, id_programme } = req.body;

        const isOwner = await Programme.isOwnedByUser(id_programme, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme ne vous appartient pas.' });
        }

        const newProgrammeSportif = await ProgrammeSportif.create({ nom, description, id_programme }, client);
        res.status(201).json({
            message: 'Programme sportif créé avec succès',
            programmeSportif: newProgrammeSportif
        });
    });

    updateProgrammeSportif = withTransaction(async (req, res, client) => {
        const id_programme_sportif = req.params.id;

        const isOwner = await ProgrammeSportif.isOwnedByUser(id_programme_sportif, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme sportif ne vous appartient pas.' });
        }

        const { nom, description, id_programme } = req.body;
        const updatedProgrammeSportif = await ProgrammeSportif.update(id_programme_sportif, { nom, description, id_programme }, client);
        res.status(200).json({
            message: 'Programme sportif mis à jour avec succès',
            programmeSportif: updatedProgrammeSportif
        });
    });

    deleteProgrammeSportif = withTransaction(async (req, res, client) => {
        const id_programme_sportif = req.params.id;

        const isOwner = await ProgrammeSportif.isOwnedByUser(id_programme_sportif, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme sportif ne vous appartient pas.' });
        }

        const deletedProgrammeSportif = await ProgrammeSportif.delete(id_programme_sportif, client);
        res.status(200).json({
            message: 'Programme sportif supprimé avec succès',
            programmeSportif: deletedProgrammeSportif
        });
    });

    getProgrammeSportifById = withClient(async (req, res, client) => {
        const id_programme = req.params.id;

        const isOwner = await Programme.isOwnedByUser(id_programme, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce programme ne vous appartient pas.' });
        }

        const programmeSportif = await ProgrammeSportif.findById(id_programme, client);
        if (!programmeSportif) {
            return res.status(404).json({ message: 'Programme sportif non trouvé' });
        }
        res.status(200).json({ programmeSportif });
    });

    generateAuto = withTransaction(async (req, res, client) => {
        const id_profil = req.params.id_profil;

        const isOwner = await Profil.isOwnedByUser(id_profil, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce profil ne vous appartient pas.' });
        }

        const profil = await Profil.findById(id_profil, client);
        if (!profil) {
            return res.status(404).json({ message: 'Profil non trouvé' });
        }

        const objectif = await Objectif.findByProfilId(profil.id_profil, client);
        if (!objectif) {
            return res.status(404).json({ message: 'Objectif non trouvé pour ce profil' });
        }

        const createdProgramme = await Programme.create({
            nom: 'Programme Complet ' + objectif.categorie_obj,
            description: `Programme généré automatiquement pour ${objectif.categorie_obj} (${profil.objectif_poids || 'Santé'})`,
            date_debut: objectif.date_debut,
            date_fin: objectif.date_fin,
            id_profil: id_profil
        }, client);

        const programme_id = createdProgramme.id_programme;

        const programmeSportif = await ProgrammeGeneratorSport.generateProgrammeSports(profil, objectif, programme_id, client);
        await ProgrammeGeneratorSport.generateSessionSports(programmeSportif.id_programme_sportif, profil, objectif, client);

        const programmeAlimentaire = await ProgrammeGeneratorAlimentaire.generateProgrammeAlimentaire(profil, objectif, programme_id, client);
        await ProgrammeGeneratorAlimentaire.generateSessionsRepas(programmeAlimentaire, profil, objectif, client);

        res.status(201).json({
            message: 'Programme complet (Sport + Alimentation) généré avec succès !',
            programme: createdProgramme,
            sport: programmeSportif,
            alimentation: programmeAlimentaire
        });
    });

    adaptProgramme = withTransaction(async (req, res, client) => {
        const id_profil = req.params.id_profil;

        const isOwner = await Profil.isOwnedByUser(id_profil, req.user.id, client);
        if (!isOwner) {
            return res.status(403).json({ message: 'Accès refusé. Ce profil ne vous appartient pas.' });
        }

        const profil = await Profil.findById(id_profil, client);
        if (!profil) return res.status(404).json({ message: 'Profil non trouvé' });

        const objectif = await Objectif.findByProfilId(profil.id_profil, client);
        if (!objectif) return res.status(404).json({ message: 'Objectif non trouvé' });

        const programme = await Programme.findByProfilId(id_profil, client);
        if (!programme) return res.status(404).json({ message: 'Aucun programme actif trouvé.' });

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const programmeSportif = await ProgrammeSportif.findByProgrammeId(programme.id_programme, client);
        if (programmeSportif) {
            await SessionSport.deleteFutureSessions(programmeSportif.id_programme_sportif, tomorrow, client);
            await ProgrammeGeneratorSport.generateSessionSports(programmeSportif.id_programme_sportif, profil, objectif, client, tomorrow);
        }

        const programmeAlimentaire = await ProgrammeAlimentaire.findById(programme.id_programme, client);
        if (programmeAlimentaire) {
            await SessionRepas.deleteFutureSessions(programmeAlimentaire.id_programme_a, tomorrow, client);
            const newData = await ProgrammeGeneratorAlimentaire.generateProgrammeAlimentaire(profil, objectif, programme.id_programme, client);
            await ProgrammeGeneratorAlimentaire.generateSessionsRepas(newData, profil, objectif, client, tomorrow);
        }

        res.status(200).json({ message: 'Programme réadapté avec succès à partir de demain !' });
    });
}

module.exports = ProgrammeController;
