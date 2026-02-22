const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const jwt = require('jsonwebtoken'); // Supprimé car inutilisé ici
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { checkApiKey } = require('./src/middleware/auth');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const profilRoutes = require('./src/route/profilRoute');
const authRoutes = require('./src/route/authRoute');
const classementRoutes = require('./src/route/classementRoute');
const recordRoutes = require('./src/route/recordRoute');
const alimentationRoutes = require('./src/route/alimentationRoute');
const evenementRoutes = require('./src/route/evenementRoute');
const exosRoutes = require('./src/route/exosRoute');
const mascotteRoutes = require('./src/route/mascotteRoute');
const objectifRoutes = require('./src/route/objectifRoute');
const programmeRoutes = require('./src/route/programmeRoute');
const sessionSportRoutes = require('./src/route/sessionSportRoute');
const sessionRepasRoutes = require('./src/route/sessionRepasRoute');
const equipementRoute = require('./src/route/equipementRoute');
const modeleSeanceRoutes = require('./src/route/modeleSeanceRoute');
const adminRoutes = require('./src/route/adminRoute');
const evolutionRoutes = require('./src/route/evolutionRoute');
const socialRoutes = require('./src/route/socialRoute');
const messageRoutes = require('./src/route/messageRoute');
const sessionRoutes = require('./src/route/sessionRoute');
const errorHandler = require('./src/middleware/errorHandler');

const chatbotRoutes = require('./src/route/chatbotRoute');
const app = express();

// Sécurité : En-têtes HTTP
app.use(helmet());

// Configuration CORS avec credentials pour cookies
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || 'https://buddycoach.com']
  : [
      'http://localhost:5173', 'http://127.0.0.1:5173',
      'http://localhost:5174', 'http://127.0.0.1:5174',
      'capacitor://localhost', // App Capacitor Android (ancien schéma)
      'http://localhost',      // App Capacitor Android (schéma http)
      'https://localhost',     // App Capacitor Android 6+ (schéma https par défaut)
    ];

app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('[CORS] Origine rejetée:', origin);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true // Nécessaire pour les cookies
}));

app.use(cookieParser());
app.use(express.json());

// Sécurité : Limitation de débit pour l'authentification (Brute force protection)
// Rate limiter strict pour login/register (anti brute-force)
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de tentatives de connexion depuis cette IP, veuillez réessayer plus tard.'
});

// Rate limiter permissif pour vérifications d'auth (/me, /verify)
const verifyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requêtes par minute (suffisant pour navigation normale)
  message: 'Trop de vérifications d\'authentification, veuillez patienter.'
});

// Rate limiter pour le chatbot (limite l'utilisation de l'API Groq)
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 messages par minute par utilisateur
  message: 'Trop de messages envoyés au chatbot, veuillez patienter.'
});

// Rate limiter dédié pour forgot/reset password (anti brute-force)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.'
});

// Rate limiter global pour toutes les routes /api (protection générale)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalApiLimiter);

// Appliquer les rate limiters de manière sélective (plus stricts que le global)
app.use('/api/auth/login', strictAuthLimiter);
app.use('/api/auth/register', strictAuthLimiter);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);
app.use('/api/auth/reset-password', forgotPasswordLimiter);
app.use('/api/auth/me', verifyLimiter);
app.use('/api/auth/verify', verifyLimiter);
app.use('/api/chatbot', chatbotLimiter);

// Middleware de sécurité API Key (sauf pour Swagger, Chatbot, Auth et routes Frontend protégées par JWT)
app.use((req, res, next) => {
  // On rend ces routes publiques au niveau API Key (la sécurité JWT prend le relais ensuite)
  const isPublicRoute = 
    req.path.startsWith('/api-docs') || 
    req.path.startsWith('/api/chatbot') || 
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/profil') ||   // Protégé par JWT
    req.path.startsWith('/api/programme') || // Protégé par JWT
    req.path.startsWith('/api/sessionSport') || // Protégé par JWT
    req.path.startsWith('/api/sessionRepas') || // Protégé par JWT
    req.path.startsWith('/api/modeleSeance') || // Protégé par JWT
    req.path.startsWith('/api/classement') ||   // Protégé par JWT
    req.path.startsWith('/api/evenement') ||    // Protégé par JWT (sauf getAll potentiellement)
    req.path.startsWith('/api/evolution') ||    // Protégé par JWT
    req.path.startsWith('/api/exos') ||         // Protégé par JWT (couvre /getAll)
    req.path.startsWith('/api/mascotte') ||     // Protégé par JWT
    req.path.startsWith('/api/record') ||       // Protégé par JWT
    req.path.startsWith('/api/objectif') ||     // Protégé par JWT
    req.path.startsWith('/api/social') ||       // Protégé par JWT
    req.path.startsWith('/api/messages') ||     // Protégé par JWT
    req.path.startsWith('/api/sessions') ||     // Protégé par JWT
    req.path.startsWith('/api/equipement') ||   // Protégé par JWT
    req.path.startsWith('/api/alimentation') || // Protégé par JWT
    req.path.startsWith('/api/admin') ||        // Protégé par JWT + Role Admin
    req.path === '/api/test';

  if (isPublicRoute) {
    return next();
  }
  
  // Pour toutes les autres routes purement back-office, on vérifie la clé
  checkApiKey(req, res, next);
}); 

// Routes
app.use('/api/profil', profilRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/classement', classementRoutes);
app.use('/api/record', recordRoutes);
app.use('/api/alimentation', alimentationRoutes);
app.use('/api/evenement', evenementRoutes);
app.use('/api/programme', programmeRoutes);
app.use('/api/exos', exosRoutes);
app.use('/api/mascotte', mascotteRoutes);
app.use('/api/objectif', objectifRoutes);
app.use('/api/sessionSport', sessionSportRoutes);
app.use('/api/sessionRepas', sessionRepasRoutes);
app.use('/api/equipement', equipementRoute);
app.use('/api/modeleSeance', modeleSeanceRoutes);
app.use('/api/evolution', evolutionRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionne!' });
});

// Gestionnaire d'erreurs global (doit être après toutes les routes)
app.use(errorHandler);

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware d'authentification Socket.io
io.use((socket, next) => {
  try {
    // Le token peut venir de auth.token ou du cookie
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.match(/token=([^;]+)/)?.[1];

    if (!token) {
      return next(new Error('Authentication error: Token manquant'));
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Stocker les infos utilisateur dans le socket
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    socket.userRole = decoded.role;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Socket authentifié: ${socket.userEmail} (ID: ${socket.userId})`);
    }
    next();
  } catch (err) {
    console.error('WebSocket auth error:', err.message);
    return next(new Error('Authentication error: Token invalide'));
  }
});

// LOGIQUE SIGNALING WEBRTC
io.on('connection', (socket) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Socket connecté et authentifié: ${socket.userEmail} (${socket.id})`);
  }

  socket.on('join-room', (roomId) => {
    // Utiliser l'userId authentifié depuis le socket (pas celui envoyé par le client)
    const userId = socket.userId;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Utilisateur ${userId} (${socket.userEmail}) rejoint la salle ${roomId}`);
    }
    socket.join(roomId);
    
    // Récupérer tous les autres utilisateurs déjà dans la salle
    const clients = io.sockets.adapter.rooms.get(roomId);
    const otherUsers = clients ? Array.from(clients).filter(id => id !== socket.id) : [];
    
    // Envoyer au nouvel arrivant la liste des gens déjà là
    socket.emit('all-users', otherUsers);
  });

  // Relais des offres/réponses WebRTC
  socket.on('sending-signal', payload => {
    io.to(payload.userToSignal).emit('user-joined', { signal: payload.signal, callerID: payload.callerID });
  });

  socket.on('returning-signal', payload => {
    io.to(payload.callerID).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id });
  });

  socket.on('disconnecting', () => {
    // Notifier toutes les salles que ce socket quitte
    socket.rooms.forEach(roomId => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('user-disconnected', socket.id);
      }
    });
  });

  socket.on('disconnect', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Socket déconnecté:', socket.id);
    }
  });
});

// '0.0.0.0' permet d'accepter les connexions depuis le réseau local (téléphone Android)
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT} (HTTP + Socket.io) - accessible sur le réseau local`);
});



// SWAGGER DOCS
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BuddyCoach API',
      version: '1.0.0',
      description: 'Documentation de l\'API BuddyCoach',
      contact: {
        name: 'Support Technique',
        email: 'support@buddycoach.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        }
      },
    },
    security: [
      {
        bearerAuth: [],
        apiKeyAuth: [],
      },
    ],
  },
  apis: ['./src/route/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
