// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { socketUrl } from '../utils/api';
import Peer from 'simple-peer';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Phone } from 'lucide-react';
import './style/VideoEvent.css';
import { useAuthStore } from '../stores/authStore';

const VideoEvent = () => {
    const { id: roomId } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user) || { pseudo: 'Anonyme', id_utilisateur: null };
    const logoutStore = useAuthStore((state) => state.logout);
    const [peers, setPeers] = useState([]);
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const userStream = useRef();

    useEffect(() => {
        // Connexion Socket.io : URL relative (proxy Vite) en dev, URL absolue en mobile
        const isMobile = !!import.meta.env.VITE_SOCKET_URL;
        const socketOptions = {
            path: '/socket.io',
            withCredentials: !isMobile,
            ...(isMobile && {
                auth: { token: localStorage.getItem('token') }
            })
        };
        socketRef.current = io(socketUrl() || '/', socketOptions);

        // Gestion des erreurs d'authentification WebSocket
        socketRef.current.on('connect_error', (error) => {
            console.error('Erreur de connexion WebSocket:', error.message);

            if (error.message.includes('Authentication error')) {
                alert('Session expirée. Veuillez vous reconnecter.');
                // Nettoyer et rediriger vers login
                logoutStore();
                navigate('/connexion');
            }
        });

        const startSession = (stream) => {
            setLoading(false);
            userStream.current = stream;
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

            // Le userId est maintenant extrait du token JWT côté serveur
            // Plus besoin de l'envoyer depuis le client
            socketRef.current.emit('join-room', roomId);

            // On reçoit la liste des utilisateurs déjà présents
            socketRef.current.on('all-users', users => {
                const newPeers = [];
                users.forEach(socketId => {
                    const peer = createPeer(socketId, socketRef.current.id, stream);
                    const peerObj = { peerID: socketId, peer };
                    peersRef.current.push(peerObj);
                    newPeers.push(peerObj);
                });
                setPeers(newPeers);
            });

            // Quand quelqu'un d'autre nous envoie son signal
            socketRef.current.on('user-joined', payload => {
                // Éviter les doublons
                setPeers(prev => {
                    if (prev.find(p => p.peerID === payload.callerID)) return prev;
                    
                    const peer = addPeer(payload.signal, payload.callerID, stream);
                    const peerObj = { peerID: payload.callerID, peer };
                    peersRef.current.push(peerObj);
                    return [...prev, peerObj];
                });
            });

            // Réception de la réponse finale pour établir le P2P
            socketRef.current.on('receiving-returned-signal', payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                if (item) {
                    item.peer.signal(payload.signal);
                }
            });

            socketRef.current.on('user-disconnected', socketId => {
                // Nettoyage de l'objet Peer
                const peerObj = peersRef.current.find(p => p.peerID === socketId);
                if (peerObj) {
                    try { peerObj.peer.destroy(); } catch(e) {}
                }
                
                // Mise à jour de la liste
                peersRef.current = peersRef.current.filter(p => p.peerID !== socketId);
                setPeers(prev => prev.filter(p => p.peerID !== socketId));
            });
        };

        // Remplacement du MODE TEST par l'accès caméra réel
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                startSession(stream);
            } catch (err) {
                console.error("Erreur accès caméra:", err);
                alert("Impossible d'accéder à la caméra ou au micro. Vérifiez les autorisations.");
                // Optionnel: fallback sur mockStream si l'utilisateur le souhaite vraiment, 
                // mais ici on suit l'instruction de désactiver le mode test.
                setLoading(false);
            }
        };

        initCamera();

        return () => {
            if (userStream.current) {
                userStream.current.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [roomId]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            if (socketRef.current) {
                socketRef.current.emit('sending-signal', { userToSignal, callerID, signal });
            }
        });

        peer.on('error', err => {
            console.warn('Erreur Peer (Create):', err.message);
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            if (socketRef.current) {
                socketRef.current.emit('returning-signal', { signal, callerID });
            }
        });

        peer.on('error', err => {
            console.warn('Erreur Peer (Add):', err.message);
        });

        peer.signal(incomingSignal);

        return peer;
    }

    const toggleAudio = () => {
        if (!userStream.current || !userStream.current.getAudioTracks()[0]) return;
        const enabled = userStream.current.getAudioTracks()[0].enabled;
        userStream.current.getAudioTracks()[0].enabled = !enabled;
        setAudioMuted(!enabled === false);
    };

    const toggleVideo = () => {
        if (!userStream.current || !userStream.current.getVideoTracks()[0]) return;
        const enabled = userStream.current.getVideoTracks()[0].enabled;
        userStream.current.getVideoTracks()[0].enabled = !enabled;
        setVideoMuted(!enabled === false);
    };

    const leaveRoom = () => {
        navigate('/');
    };

    return (
        <div className="video-room-container">
            {loading && (
                <div className="loading-overlay">
                    <h2>Configuration de la caméra...</h2>
                </div>
            )}
            
            <div className="video-header">
                <h2>Événement Direct #{roomId}</h2>
                <div>Participants: {peers.length + 1}</div>
            </div>

            <div className="video-grid">
                <div className="video-container">
                    <video muted ref={userVideo} autoPlay playsInline />
                    <div className="user-label">Moi {videoMuted && '(Caméra Off)'} {audioMuted && '(Mute)'}</div>
                </div>

                {peers.map((peerObj, index) => (
                    <Video key={index} peer={peerObj.peer} />
                ))}
            </div>

            <div className="video-controls">
                <button 
                    className={`control-btn mute ${audioMuted ? 'active' : ''}`} 
                    onClick={toggleAudio}
                    title={audioMuted ? "Activer micro" : "Couper micro"}
                >
                    {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <button 
                    className={`control-btn mute ${videoMuted ? 'active' : ''}`} 
                    onClick={toggleVideo}
                    title={videoMuted ? "Activer caméra" : "Couper caméra"}
                >
                    {videoMuted ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
                </button>

                <button 
                    className="control-btn leave" 
                    onClick={leaveRoom}
                    title="Quitter l'événement"
                >
                    <Phone className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        });
    }, [props.peer]);

    return (
        <div className="video-container">
            <video playsInline autoPlay ref={ref} />
            <div className="user-label">Participant</div>
        </div>
    );
};

export default VideoEvent;
