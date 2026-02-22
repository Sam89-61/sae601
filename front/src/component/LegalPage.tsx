// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const LegalPage = () => {
    const navigate = useNavigate();
    const setCguAccepted = useAuthStore((state) => state.setCguAccepted);
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/auth/accept-cgu', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setCguAccepted(true);
                navigate('/creation-profil');
            } else {
                console.error("Erreur lors de l'acceptation des CGU");
                alert("Une erreur est survenue. Veuillez réessayer.");
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            alert("Erreur de connexion au serveur.");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-sport/10 overflow-hidden">
                
                <div className="bg-sport px-8 py-6">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Scale className="w-8 h-8" />
                        <span>Mentions Légales, CGU & Confidentialité</span>
                    </h1>
                    <p className="text-sport-secondary mt-2">Dernière mise à jour : 17 Février 2026</p>
                </div>

                <div className="p-8 space-y-10 text-text-main leading-relaxed">
                    
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-sport">
                            1. Éditeur du Service
                        </h2>
                        <div className="space-y-4">
                            <p>
                                L'application <strong>BuddyCoach</strong> est développée dans le cadre de la Situation d'Apprentissage et d'Évaluation "SAE 501" 
                                au sein de l'IUT Grand Ouest Normandie, département MMI.
                            </p>

                            <h3 className="font-semibold text-lg text-sport">1.1 L'équipe de développement (Les Éditeurs)</h3>
                            <ul className="list-disc pl-5 space-y-2 bg-gray-50 p-4 rounded-lg">
                                <li><strong>Matéo Brione</strong> - Conception UX/UI, Développement Front-End</li>
                                <li><strong>Paul Ghomari</strong> - Développement Back-End, Base de données</li>
                                <li><strong>Samuel Aubine-Bourdon</strong> - Développement Back-End, Base de données</li>
                            </ul>

                            <h3 className="font-semibold text-lg text-sport">1.2 Hébergement et Stack Technique</h3>
                            <p>
                                L'architecture technique repose sur une stack Fullstack JavaScript (Node.js & Express). 
                                La base de données est gérée sous PostgreSQL. 
                                L'environnement de développement et de déploiement est orchestré par Docker.
                            </p>

                            <h3 className="font-semibold text-lg text-sport">1.3 Propriété Intellectuelle</h3>
                            <p>
                                L'identité visuelle, incluant le logo "Bouclier" symbolisant la fiabilité et la mascotte (Tigre), 
                                ainsi que l'architecture hybride (React/Capacitor), sont des créations originales de l'équipe.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-nutrition">
                            2. Conditions Générales d'Utilisation (CGU)
                        </h2>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-nutrition">2.1 Objet du service</h3>
                            <p>
                                BuddyCoach a pour mission de <strong>démocratiser l'accès au sport et à la nutrition</strong> via un accompagnement personnalisé. 
                                L'application propose des programmes adaptés et une correction posturale via l'intelligence artificielle.
                            </p>

                            <h3 className="font-semibold text-lg text-nutrition">2.2 Avertissement Santé et Responsabilité</h3>
                            <div className="bg-nutrition/10 border-l-4 border-nutrition p-4 rounded-r space-y-3">
                                <div>
                                    <p className="text-nutrition font-medium flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                        <span><strong>Limites du conseil :</strong> Bien que BuddyCoach utilise des formules scientifiques reconnues, pour le calcul des besoins nutritionnels, l'application ne remplace pas un avis médical professionnel.</span>
                                        
                                        <span>Les recommandations fournies sont basées sur des algorithmes et ne prennent pas en compte les spécificités individuelles complexes (comme les maladies chroniques, les interactions médicamenteuses, etc.).</span>
                                        
                                        <span>Il est fortement recommandé de consulter un professionnel de santé avant de débuter tout programme sportif ou régime alimentaire, surtout en cas de conditions médicales préexistantes.</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-nutrition font-medium flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                        <span><strong>Responsabilité :</strong> L'utilisateur est seul responsable de sa pratique, il doit fournir les informations nécessaires pour que BuddyCoach puisse lui proposer un accompagnement adapté si ce n'est pas le cas BuddyCoach ne pourra être tenu responsable en cas de blessure ou de problème de santé. 
                                        BuddyCoach décline toute responsabilité en cas de blessure , notamment si l'utilisateur pratique des exercices libres / ou des seances de musculation 
                                        sans supervision ou ne respecte pas les consignes de sécurité.</span>
                                    </p>
                                </div>
                            </div>

                            <h3 className="font-semibold text-lg text-nutrition">2.3 Engagements de l'utilisateur</h3>
                            <p>
                                Pour garantir l'efficacité des algorithmes , l'utilisateur s'engage à fournir des données exactes 
                                (poids, âge, niveau sportif, matériel disponible, ) lors de la création de son profil.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-accent">
                            3. Politique de Confidentialité & Engagement RSE
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Cette section détaille notre gestion des données (RGPD) et notre démarche de Responsabilité Sociétale (RSE), 
                            inspirée par les principes d'inclusion et de protection de la personne.
                        </p>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-accent">3.1 Protection des Données et "Privacy by Design"</h3>
                            <p>
                                Conformément au RGPD et à notre éthique de développement, nous appliquons le principe de "Privacy by Design" :
                            </p>
                            <ul className="list-disc pl-5 space-y-2 bg-gray-50 p-4 rounded-lg">
                                <li>
                                    <strong>Traitement local (Edge Computing) :</strong> L'analyse de vos mouvements par caméra pour la correction posturale 
                                    est effectuée via TensorFlow.js et MediaPipe directement dans votre navigateur (Client-Side).
                                </li>
                                <li>
                                    <strong>Confidentialité absolue de l'image :</strong> Contrairement aux solutions classiques reposant sur le cloud, 
                                    aucun flux vidéo de votre caméra n'est envoyé vers nos serveurs, ni stocké, ni analysé par des tiers. 
                                    Vous gardez la maîtrise totale de votre image.
                                </li>
                            </ul>

                            <h3 className="font-semibold text-lg text-accent">3.2 Données collectées</h3>
                            <p>Nous collectons uniquement les données nécessaires à la personnalisation du service :</p>
                            <ul className="list-disc pl-5 space-y-2 bg-gray-50 p-4 rounded-lg">
                                <li>
                                    <strong>Données physiologiques :</strong> Poids, taille, âge, sexe 
                                    (nécessaires aux formules de calcul métabolique).
                                </li>
                                <li>
                                    <strong>Santé et Alimentation :</strong> Blessures existantes, allergies, et régimes spécifiques 
                                    (Végétarien, Vegan, diabète) pour adapter les programmes.
                                </li>
                            </ul>

                            <h3 className="font-semibold text-lg text-accent">3.3 Engagement Social et Inclusion (RSE)</h3>
                            <p>
                                Notre démarche RSE (Responsabilité Sociétale des Entreprises) vise à réduire les inégalités d'accès à la santé :
                            </p>
                            <ul className="list-disc pl-5 space-y-2 bg-success/10 p-4 rounded-lg">
                                <li>
                                    <strong>Accessibilité :</strong> Notre mission est d'accompagner spécifiquement les débutants et les personnes isolées 
                                    qui n'ont pas accès aux salles de sport coûteuses.
                                </li>
                               
                                <li>
                                    <strong>Équité :</strong> Dans le cadre des classements communautaires, nous utilisons un système de validation 
                                    pour garantir une compétition équitable entre tous les utilisateurs.
                                </li>
                            </ul>

                            <h3 className="font-semibold text-lg text-accent">3.4 Vos Droits</h3>
                            <p>
                                Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et de suppression de vos données 
                                personnelles stockées dans notre base de données. Ces droits peuvent être exercés directement depuis les paramètres 
                                de votre compte ou en contactant les éditeurs.
                            </p>
                        </div>
                    </section>

                </div>

                <div className="bg-gray-50 px-8 py-6 border-t-2 border-sport/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button 
                        onClick={handleBack}
                        disabled={loading}
                        className="text-gray-600 hover:text-sport font-medium px-4 py-2 rounded-lg hover:bg-sport/10 transition-colors"
                    >
                        Retour
                    </button>
                    
                    <button 
                        onClick={handleAccept}
                        disabled={loading}
                        className="bg-sport hover:bg-sport-secondary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sport/30 hover:shadow-sport/40"
                    >
                         {loading ? 'Validation...' : (
                            <>
                                <span>Lu et Accepté</span>
                                <CheckCircle className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;