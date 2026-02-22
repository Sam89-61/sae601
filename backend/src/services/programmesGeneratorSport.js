const Profil = require('../models/Profil');
const Objectif = require('../models/Objectif');
const Programme = require('../models/Programme');
const Programme_sportif = require('../models/Programme_sportif');
const SessionSport = require('../models/Session_sport');
const SessionSportExo = require('../models/Session_sport_exo');
const Exos = require('../models/Exos');
const { pool } = require('../config/database');
const CategoryEquipement = require('../models/CategoryEquipement');
const InformationSante = require('../models/Information_santé');

class DecisionNode {
    constructor(attribute, operator, value, trueNode, falseNode, result = null) {
        this.attribute = attribute;      // Attribut à évaluer (ex: 'frequence', 'niveau', 'equipements')
        this.operator = operator;        // Opérateur de comparaison
        this.value = value;              // Valeur de comparaison
        this.trueNode = trueNode;        // Nœud si condition vraie
        this.falseNode = falseNode;      // Nœud si condition fausse
        this.result = result;            // Résultat final si c'est une feuille
    }

    evaluate(data) {
        if (this.result !== null) {
            return this.result;
        }

        const attrValue = data[this.attribute]; // ex: data['equipements']
        let condition = false;

        switch (this.operator) {
            case '<=': condition = attrValue <= this.value; break;
            case '>=': condition = attrValue >= this.value; break;
            case '==': condition = attrValue == this.value; break;
            case '<': condition = attrValue < this.value; break;
            case '>': condition = attrValue > this.value; break;
            case 'includes':
                if (Array.isArray(attrValue)) {

                    condition = attrValue.includes(this.value)
                } else if (typeof attrValue === 'string') {
                    condition = attrValue.includes(this.value);
                }
                break;

            case 'intersects':
                if (Array.isArray(attrValue) && Array.isArray(this.value)) {
                    condition = this.value.some(item => attrValue.includes(item));
                }
                break;

            default: condition = false;
        }

        return condition ? this.trueNode.evaluate(data) : this.falseNode.evaluate(data);
    }
}

class ProgrammeGeneratorSport {

    // ARBRE 1 : TYPE DE PROGRAMME (Structure)
    static buildProgrammeTypeTree() {
        // --- Feuilles ---
        const calisthenicsLeaf = new DecisionNode(null, null, null, null, null, {
            type: 'CALISTHENICS',
            nom: 'Entrainement Poids du Corps',
            description: 'Programme adapté sans matériel lourd (Calisthenics/Élastiques)'
        });

        const fullBody = new DecisionNode(null, null, null, null, null, {
            type: 'FULL_BODY',
            nom: 'Entrainement Full Body',
            description: 'Programme axé sur le Full Body, tous les muscles à chaque séance'
        });

        const ppl = new DecisionNode(null, null, null, null, null, {
            type: 'PPL',
            nom: 'Entrainement PPL',
            description: 'Programme axé sur le PPL (Push, Pull, Legs)'
        });

        const upperLower = new DecisionNode(null, null, null, null, null, {
            type: 'UPPER_LOWER',
            nom: 'Entrainement Upper/Lower',
            description: 'Programme alternant haut et bas du corps'
        });

        const split5 = new DecisionNode(null, null, null, null, null, {
            type: 'SPLIT_5',
            nom: 'Entrainement Split',
            description: 'Programme avec split par groupe musculaire'
        });

        const pplDouble = new DecisionNode(null, null, null, null, null, {
            type: 'PPL',
            nom: 'Entrainement PPL',
            description: 'Programme PPL avec double rotation par semaine'
        });

        //  Branche : Avec Matériel (Basée sur la fréquence) ---
        const freq4Node = new DecisionNode('frequence', '==', 4, upperLower, split5);
        const freq5Node = new DecisionNode('frequence', '>=', 5, pplDouble, freq4Node);
        const freq3Node = new DecisionNode('frequence', '==', 3, ppl, freq5Node);
        const BranchNode = new DecisionNode('frequence', '<=', 2, fullBody, freq3Node);

        const heavyEquipmentList = ['Barre', 'Haltères', 'Salle de sport'];

        const rootNode = new DecisionNode(
            'equipements',
            'intersects',
            heavyEquipmentList,
            BranchNode,   // OUI -> On regarde la fréquence
            calisthenicsLeaf // NON -> On force le Calisthenics
        );

        return rootNode;
    }
    // ARBRE 2 : AJUSTEMENT TEMPS DE REPOS selon l'âge
    static buildAgeAdjustmentTree() {
        const seniorAdjustment = new DecisionNode(null, null, null, null, null, 40); // +40 secondes
        const adultAdjustment = new DecisionNode(null, null, null, null, null, 20); // +20 secondes
        const youthAdjustment = new DecisionNode(null, null, null, null, null, 0);   // Pas d'ajustement

        const age40Node = new DecisionNode('age', '>=', 40, adultAdjustment, youthAdjustment);
        const rootNode = new DecisionNode('age', '>=', 61, seniorAdjustment, age40Node);

        return rootNode;
    }
    // ARBRE 3 Ajustement IMC (Exercice par séance)
    static buildIMCAdjustmentTree() {
        const obesity = new DecisionNode(null, null, null, null, null, 30);
        const overweight = new DecisionNode(null, null, null, null, null, 15);
        const normalIMCAdjustment = new DecisionNode(null, null, null, null, null, 0);
        const imc25Node = new DecisionNode('imcValue', '>', 25, overweight, normalIMCAdjustment);

        const rootNode = new DecisionNode('imcValue', '>', 30, obesity, imc25Node);
        return rootNode;
    }



    // ARBRE 4 : VOLUME (Séries / Reps)
    static buildVolumeTree() {



        // Masse BW (Bodyweight)
        const massBWMasseDebLeaf = new DecisionNode(null, null, null, null, null, { series: 4, reps: 15, repos: 60 });
        const massBWMasseInterLeaf = new DecisionNode(null, null, null, null, null, { series: 4, reps: 18, repos: 45 });
        const massBWMasseAvLeaf = new DecisionNode(null, null, null, null, null, { series: 5, reps: 20, repos: 45 });

        const massBWInterLevelNode = new DecisionNode('niveau', '==', 'Intermédiaire', massBWMasseInterLeaf, massBWMasseAvLeaf);
        const massBWLevelNode = new DecisionNode('niveau', '==', 'Débutant', massBWMasseDebLeaf, massBWInterLevelNode);
        // Force BW (Difficile à quantifier en reps, on met des reps moyennes mais exos durs)
        //const forceBWLeaf = new DecisionNode(null, null, null, null, null, { series: 5, reps: 10, repos: 120 });
        // Perte Poids BW (Très cardio)
        const perteBWLeaf = new DecisionNode(null, null, null, null, null, { series: 5, reps: 10, repos: 30 });

        // Selecteur Objectif pour BW
        const bwBranchRoot = new DecisionNode('objectif', '==', 'Prise de masse', massBWLevelNode, perteBWLeaf);


        // --- BRANCHE 2 : AVEC MATÉRIEL ( classique) ---
        // (Votre logique précédente réorganisée)

        // Masse 
        const massDebLeaf = new DecisionNode(null, null, null, null, null, { series: 3, reps: 10, repos: 90 });
        const massInterLeaf = new DecisionNode(null, null, null, null, null, { series: 4, reps: 10, repos: 90 });
        const massAvLeaf = new DecisionNode(null, null, null, null, null, { series: 5, reps: 10, repos: 90 });
        const massLevelInterNode = new DecisionNode('niveau', '==', 'Intermédiaire', massInterLeaf, massAvLeaf);
        const massLevelDebrNode = new DecisionNode('niveau', '==', 'Débutant', massDebLeaf, massLevelInterNode);

        // Force 
        // const forceDebLeaf = new DecisionNode(null, null, null, null, null, { series: 3, reps: 5, repos: 180 });
        // const forceAvLeaf = new DecisionNode(null, null, null, null, null, { series: 5, reps: 5, repos: 180 });
        // const forceInterLeaf = new DecisionNode(null, null, null, null, null, { series: 4, reps: 5, repos: 180 });
        // const forceLevelInterNode = new DecisionNode('niveau', '==', 'Intermédiaire', forceInterLeaf, forceAvLeaf);
        // const forceLevelNode = new DecisionNode('niveau', '==', 'Débutant', forceDebLeaf, forceLevelInterNode);


        // Perte Poids 
        const perteDebLeaf = new DecisionNode(null, null, null, null, null, { series: 3, reps: 15, repos: 60 });
        const perteInterLeaf = new DecisionNode(null, null, null, null, null, { series: 4, reps: 15, repos: 45 });
        const perteAvLeaf = new DecisionNode(null, null, null, null, null, { series: 5, reps: 15, repos: 30 });
        const perteLevelInterNode = new DecisionNode('niveau', '==', 'Intermédiaire', perteInterLeaf, perteAvLeaf);
        const perteLevelDebNode = new DecisionNode('niveau', '==', 'Débutant', perteDebLeaf, perteLevelInterNode);

        // Maintien (volume intermédiaire entre masse et perte)
        const maintienDebLeaf = new DecisionNode(null, null, null, null, null, { series: 3, reps: 12, repos: 75 });
        const maintienInterLeaf = new DecisionNode(null, null, null, null, null, { series: 4, reps: 12, repos: 60 });
        const maintienAvLeaf = new DecisionNode(null, null, null, null, null, { series: 4, reps: 12, repos: 60 });
        const maintienLevelInterNode = new DecisionNode('niveau', '==', 'Intermédiaire', maintienInterLeaf, maintienAvLeaf);
        const maintienLevelDebNode = new DecisionNode('niveau', '==', 'Débutant', maintienDebLeaf, maintienLevelInterNode);

        // Selecteur Objectif
        const perteOuMaintienNode = new DecisionNode('objectif', '==', 'Perte de poids', perteLevelDebNode, maintienLevelDebNode);
        const BranchRoot = new DecisionNode('objectif', '==', 'Prise de masse', massLevelDebrNode, perteOuMaintienNode);


        // --- RACINE GLOBALE : Vérification Matériel ---
        const heavyEquipmentList = ['Barre', 'Haltères', 'Salle de sport'];

        const rootNode = new DecisionNode(
            'equipements',
            'intersects',
            heavyEquipmentList,
            BranchRoot, // OUI -> Volume  classique
            bwBranchRoot   // NON -> Volume Poids du corps adapté
        );

        return rootNode;
    }
    // ARBRE 5 : AJUSTEMENT SANTÉ (Modificateurs Intensité)
    static buildHealthAdjustmentTree() {
        // Cardio : Repos ++, Séries/Reps -- (120s = 2 min de repos minimum pour sécurité cardiaque)
        const cardioAdj = new DecisionNode(null, null, null, null, null, { series: -1, reps: -2, repos: 120 });

        // Rien
        const noAdj = new DecisionNode(null, null, null, null, null, { series: 0, reps: 0, repos: 0 });

        const cardioConditions = ['Problèmes cardiaques', 'Asthme', 'Hypertension'];
        return new DecisionNode('conditions_medicales', 'intersects', cardioConditions, cardioAdj, noAdj);
    }

    // ARBRE 6 : GESTION DES EXCLUSIONS (Muscles Interdits)
    static evaluateExclusions(context) {
        let forbiddenMuscles = [];
        console.log('--- Evaluation Exclusions ---');
        console.log('Context Condition Physique:', context.condition_physique);

        // On définit des "Mini-Arbres" pour chaque pathologie. 
        // Chaque règle est un DecisionNode indépendant.

        // Règle 1 : Dos
        const backPainRule = new DecisionNode(
            'condition_physique', 'includes', 'Mal de dos',
            new DecisionNode(null, null, null, null, null, ['Dos', 'Lombaires']),
            new DecisionNode(null, null, null, null, null, [])
        );

        // Règle 2 : Genoux
        const kneePainRule = new DecisionNode(
            'condition_physique', 'includes', 'Douleurs aux jambes',
            new DecisionNode(null, null, null, null, null, ['Quadriceps', 'Ischio-jambiers', 'Mollets']),
            new DecisionNode(null, null, null, null, null, [])
        );

        // Règle 3 : Bras
        const armPainRule = new DecisionNode(
            'condition_physique', 'includes', 'Douleurs aux bras',
            new DecisionNode(null, null, null, null, null, ['Biceps', 'Triceps', 'Avant-bras']),
            new DecisionNode(null, null, null, null, null, [])
        );

        // Règle 4 : Epaules
        const shoulderPainRule = new DecisionNode(
            'condition_physique', 'includes', 'Douleurs aux épaules',
            new DecisionNode(null, null, null, null, null, ['Épaules']),
            new DecisionNode(null, null, null, null, null, [])
        );
        // Règle 5 : Pectoraux
        const chestPainRule = new DecisionNode(
            'condition_physique', 'includes', 'Douleurs pectorales',
            new DecisionNode(null, null, null, null, null, ['Pectoraux']),
            new DecisionNode(null, null, null, null, null, [])
        );
        // --- EXECUTION DE LA FORET ---
        // On évalue chaque arbre et on cumule les résultats
        const rules = [
            { name: 'Dos', rule: backPainRule },
            { name: 'Jambes', rule: kneePainRule },
            { name: 'Bras', rule: armPainRule },
            { name: 'Epaules', rule: shoulderPainRule },
            { name: 'Pectoraux', rule: chestPainRule }
        ];

        rules.forEach(item => {
            const result = item.rule.evaluate(context);
            if (result && result.length > 0) {
                forbiddenMuscles = [...forbiddenMuscles, ...result];
            }
        });

        return forbiddenMuscles;
    }

    // Répartition des muscles par type de programme
    static getSplitsByType(type) {
        const splits = {
            FULL_BODY: [
                ['Pectoraux', 'Épaules', 'Triceps', 'Quadriceps', 'Abdominaux'],
                ['Dos', 'Biceps', 'Avant-bras', 'Ischio-jambiers', 'Fessiers'],
                ['Pectoraux', 'Dos', 'Épaules', 'Quadriceps', 'Mollets'],
                ['Pectoraux', 'Dos', 'Biceps', 'Fessiers', 'Abdominaux'],
                ['Dos', 'Épaules', 'Quadriceps', 'Ischio-jambiers', 'Abdominaux']
            ],
            PPL: [
                ['Pectoraux', 'Épaules', 'Triceps', 'Abdominaux'],
                ['Dos', 'Biceps', 'Avant-bras', 'Abdominaux'],
                ['Quadriceps', 'Ischio-jambiers', 'Mollets', 'Fessiers']
            ],
            UPPER_LOWER: [
                ['Pectoraux', 'Épaules', 'Triceps', 'Abdominaux'],
                ['Dos', 'Épaules', 'Biceps', 'Avant-bras', 'Abdominaux'],
                ['Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets']
            ],
            SPLIT_5: [
                ['Pectoraux'],
                ['Dos'],
                ['Ischio-jambiers', 'Mollets', 'Quadriceps', 'Fessiers'],
                ['Épaules'],
                ['Biceps', 'Triceps', 'Avant-bras']
            ],
            CALISTHENICS: [
                ['Pectoraux', 'Dos', 'Abdominaux', 'Quadriceps'], // Séance A
                ['Épaules', 'Biceps', 'Triceps', 'Ischio-jambiers'], // Séance B
                ['Pectoraux', 'Dos', 'Quadriceps', 'Fessiers']  // Séance C
            ]
        };
        return splits[type] || splits['FULL_BODY']; // Fallback
    }

    // LOGIQUE DE GÉNÉRATION

    static async generateProgramme(profilId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const profil = await Profil.findById(profilId, client);
            if (!profil) throw new Error('Profil non trouvé');

            const objectif = await Objectif.findByProfilId(profil.id_profil, client);
            if (!objectif) throw new Error('Objectif non trouvé pour ce profil');

            const createdProgramme = await Programme.create({
                nom: 'Programme de ' + objectif.categorie_obj,
                description: objectif.description,
                date_debut: objectif.date_debut,
                date_fin: objectif.date_fin,
                id_profil: profilId
            }, client);

            const programme_id = createdProgramme.id_programme;

            const programmeSports = await this.generateProgrammeSports(profil, objectif, programme_id, client);
            await this.generateSessionSports(programmeSports.id_programme_sportif, profil, objectif, client);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la génération du programme :', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async generateProgrammeSports(profil, objectif, programme_id, client) {
        const equipementId = await Profil.findEquipementId(profil.id_profil, client);
        const userEquipement = await CategoryEquipement.findById(equipementId.id_equipement, client);
        const userEquipementList = userEquipement?.list_equipement || [];

        // Si Salle de sport est présent, on considère que l'utilisateur a accès à tout le matériel standard
        if (userEquipementList.includes("Salle de sport")) {
            const materielSalle = ["Barre", "Haltères", "Banc", "Machine", "Poulie", "Elastique", "Presse"];
            materielSalle.forEach(item => {
                if (!userEquipementList.includes(item)) {
                    userEquipementList.push(item);
                }
            });
        }

        // 2. Création du contexte
        const context = {
            frequence: profil.frequence,
            equipements: userEquipementList
        };

        const tree = this.buildProgrammeTypeTree();
        const decision = tree.evaluate(context);

        const nom = `${decision.nom} pour ${profil.niveau}`;
        const description = `${decision.description}. Fréquence: ${profil.frequence} fois par semaine.`;

        const programmeSport = {
            nom,
            description,
            id_programme: programme_id,
        };

        const createdProgrammeSport = await Programme_sportif.create(programmeSport, client);
        // On attache le type à l'objet retourné pour qu'il soit utilisé ensuite
        createdProgrammeSport.type = decision.type;
        return createdProgrammeSport;
    }

    static getMusclesInterdits(conditions) {
        let interdits = [];
        const mapping = {
            'Douleurs aux bras': ['Biceps', 'Triceps', 'Avant-bras'],
            'Douleurs aux épaules': ['Épaules'],
            'Douleurs aux genoux': ['Quadriceps', 'Ischio-jambiers', 'Mollets'],
            'Mal de dos': ['Dos', 'Lombaires'],
            'Douleurs pectorales': ['Pectoraux']
        };

        if (Array.isArray(conditions)) {
            conditions.forEach(cond => {
                if (mapping[cond]) {
                    interdits = [...interdits, ...mapping[cond]];
                }
            });
        }
        return interdits;
    }

    static joursVersNumeros(joursTexte) {
        const jours = {
            'Dimanche': 0, 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3,
            'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6
        };
        return joursTexte.map(jour => jours[jour]);
    }

    static numerosVersJours(numeros) {
        const joursInverse = {
            0: 'Dimanche', 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi',
            4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi'
        };
        return numeros.map(num => joursInverse[num]);
    }

    static selectionnerJoursOptimaux(joursDispo, frequence) {
        if (joursDispo.length <= frequence) return joursDispo;
        return joursDispo.slice(0, frequence);
    }

    static async generateSessionSports(programme_sportif_id, profil, objectif, client, filterStartDate = null) {

        if (!profil.poids || !profil.taille || !profil.age || !profil.sexe || !profil.frequence) {
            throw new Error('Données du profil incomplètes pour la génération');
        }

        const equipementId = await Profil.findEquipementId(profil.id_profil, client);
        const userEquipement = await CategoryEquipement.findById(equipementId.id_equipement, client);
        const userEquipementList = userEquipement?.list_equipement || [];

        if (userEquipementList.includes("Salle de sport")) {
            const materielSalle = ["Barre", "Haltères", "Banc", "Machine", "Poulie", "Elastique", "Presse"];
            materielSalle.forEach(item => {
                if (!userEquipementList.includes(item)) {
                    userEquipementList.push(item);
                }
            });
        }
        const tailleMetre = profil.taille > 3 ? profil.taille / 100 : profil.taille;

        const imcValue = profil.poids / (tailleMetre * tailleMetre);
        const infoSante = { id_information_sante: profil.id_information_sante };
        const conditionPhysique = await InformationSante.getConditionPhysique(infoSante, client);
        const conditionsMedicalesUser = await InformationSante.getConditionsMedicales(infoSante, client);
        const context = {
            frequence: profil.frequence,
            niveau: profil.niveau,
            objectif: objectif.categorie_obj,
            equipements: userEquipementList,
            age: profil.age,
            imcValue: imcValue,
            conditions_medicales: conditionsMedicalesUser,
            condition_physique: conditionPhysique
        };
        // 3. Décision du TYPE (Structure: Full Body, PPL, Calisthenics...)
        const programmeTree = this.buildProgrammeTypeTree();
        const programmeDecision = programmeTree.evaluate(context);
        const planningType = this.getSplitsByType(programmeDecision.type);

        // 4. Décision du VOLUME (Séries, Reps)


        const volumeTree = this.buildVolumeTree();
        const volume = volumeTree.evaluate(context);
        const imcAdjustmentTree = this.buildIMCAdjustmentTree();
        const imcAdjustment = imcAdjustmentTree.evaluate(context);
        const ageAdjustmentTree = this.buildAgeAdjustmentTree();
        const ageAdjustment = ageAdjustmentTree.evaluate(context);
        const healthAdjustmentTree = this.buildHealthAdjustmentTree();
        const healthAdjustment = healthAdjustmentTree.evaluate(context);
        const musclesInterdits = this.evaluateExclusions(context);
        volume.repos += ageAdjustment;
        volume.repos += imcAdjustment;
        volume.repos += healthAdjustment.repos;
        volume.series += healthAdjustment.series;
        volume.reps += healthAdjustment.reps;
        if (!userEquipementList.includes("Aucun")) {
            userEquipementList.push("Aucun");
        }
        // Gestion des jours et dates
        const joursDispoTexte = profil.jour_disponible;
        if (!joursDispoTexte || joursDispoTexte.length === 0) {
            throw new Error('Aucun jour disponible défini');
        }

        const joursDispoNumeros = this.joursVersNumeros(joursDispoTexte);
        const joursTries = joursDispoNumeros.sort((a, b) => a - b);
        const joursUtilisesNumeros = this.selectionnerJoursOptimaux(joursTries, profil.frequence);

        const debut = new Date(objectif.date_debut);
        const fin = new Date(objectif.date_fin);
        const weeksDuration = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24 * 7));
        const jourDebutSemaine = debut.getDay();

        let compteurSeanceGlobal = 0;

        // Boucle de génération des séances
        for (let w = 0; w < weeksDuration; w++) {
            for (let i = 0; i < joursUtilisesNumeros.length; i++) {
                const jourCible = joursUtilisesNumeros[i];
                let joursAAjouter = (w * 7) + (jourCible - jourDebutSemaine);

                // En semaine 0, ignorer les jours antérieurs au début
                // (ils seront naturellement générés en semaine 1)
                if (w === 0 && jourCible < jourDebutSemaine) {
                    continue;
                }

                const dateSession = new Date(debut);
                dateSession.setDate(dateSession.getDate() + joursAAjouter);

                if (dateSession > fin) break;

                // --- FILTRE D'ADAPTATION ---
                // Si on a un filterStartDate (ex: demain), on ne crée pas les sessions antérieures
                // Mais on incrémente compteurSeanceGlobal pour garder la cohérence du cycle (ex: Jour 31 = Pull)
                if (filterStartDate && dateSession < filterStartDate) {
                    compteurSeanceGlobal++;
                    continue;
                }

                const musclesDuJour = planningType[compteurSeanceGlobal % planningType.length];
                let musclesFiltres = musclesDuJour.filter(muscle => !musclesInterdits.includes(muscle));
                let sessionData = {};
                if (musclesFiltres.length === 0) {
                    sessionData = {
                        nom: 'Repos Médical',
                        description: 'Aucune activité physique recommandée. Consultez votre médecin.',
                        date_session: dateSession,
                        heure_session: profil.heure_disponible,
                        duree_minutes: 0,
                        id_programme_sportif: programme_sportif_id,
                        id_utilisateur: profil.id_utilisateur,
                        type_session: 'personnalisee'
                    };
                    await SessionSport.create(sessionData, client);
                }
                else {
                    const numSemaine = Math.floor(compteurSeanceGlobal / joursUtilisesNumeros.length) + 1;
                    const numSeanceDansSemaine = (compteurSeanceGlobal % joursUtilisesNumeros.length) + 1;

                    // D'abord on cherche les exercices pour calculer la durée
                    let ordre = 1;
                    let list_exos = [];
                    let dureeSecondes = 0;
                    const TEMPS_TRANSITION = 30; // 30s de transition entre chaque exercice

                    for (const muscle of musclesFiltres) {
                        const exoTrouve = await Exos.findCompatibleExo(
                            muscle,
                            profil.niveau,
                            userEquipementList,
                            list_exos,
                            client
                        );
                        if (exoTrouve) {
                            list_exos.push(exoTrouve);
                        }
                    }

                    // Calcul de la durée totale de la séance
                    for (const exo of list_exos) {
                        const tempsRep = parseFloat(exo.temps_rep) || 3;
                        // Temps d'exécution + temps de repos (après chaque série)
                        const tempsExo = (tempsRep * volume.reps * volume.series) + (volume.repos * volume.series);
                        dureeSecondes += tempsExo + TEMPS_TRANSITION;
                    }

                    const dureeMinutes = Math.max(10, Math.round(dureeSecondes / 60 / 10) * 10);

                    sessionData = {
                        nom: `Semaine ${numSemaine} - Séance ${numSeanceDansSemaine}`,
                        description: `Focus: ${musclesFiltres.join(', ')}`,
                        date_session: dateSession,
                        heure_session: profil.heure_disponible,
                        duree_minutes: dureeMinutes,
                        id_programme_sportif: programme_sportif_id,
                        id_utilisateur: profil.id_utilisateur,
                        type_session: 'personnalisee'
                    };

                    const newSession = await SessionSport.create(sessionData, client);

                    // Création des exercices de la séance
                    for (const exoTrouve of list_exos) {
                        const exoData = {
                            id_session_sport: newSession.id_session_sport,
                            id_exo: exoTrouve.id,
                            ordre: ordre++,
                            repetitions: volume.reps,
                            series: volume.series,
                            temps_repos_secondes: volume.repos,
                        };
                        await SessionSportExo.create(exoData, client);
                    }
                }
                compteurSeanceGlobal++;
            }
        }
    }
}

module.exports = ProgrammeGeneratorSport;