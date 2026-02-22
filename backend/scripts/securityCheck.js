#!/usr/bin/env node

/**
 * Script de vérification automatique de la sécurité
 * Vérifie les points critiques identifiés lors de l'audit
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
let warnings = 0;

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function check(description, condition, severity = 'error') {
  totalChecks++;
  const symbol = condition ? '✓' : '✗';
  const color = condition ? 'green' : (severity === 'warning' ? 'yellow' : 'red');
  const status = condition ? 'PASS' : (severity === 'warning' ? 'WARN' : 'FAIL');

  log(`${symbol} [${status}] ${description}`, color);

  if (condition) {
    passedChecks++;
  } else {
    if (severity === 'warning') {
      warnings++;
    } else {
      failedChecks++;
    }
  }

  return condition;
}

function fileContains(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  } catch (err) {
    return false;
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

log('\n================================================', 'cyan');
log('  🔒 BuddyCoach - Security Check Script', 'cyan');
log('================================================\n', 'cyan');

// ============================================
// 1. VÉRIFICATIONS D'AUTHENTIFICATION
// ============================================
log('📋 1. Vérifications d\'authentification JWT\n', 'blue');

const routeFiles = [
  'src/route/exosRoute.js',
  'src/route/chatbotRoute.js',
  'src/route/profilRoute.js',
  'src/route/sessionSportRoute.js',
  'src/route/sessionRepasRoute.js',
  'src/route/programmeRoute.js',
  'src/route/recordRoute.js',
  'src/route/alimentationRoute.js',
  'src/route/evenementRoute.js',
  'src/route/mascotteRoute.js',
  'src/route/objectifRoute.js',
  'src/route/classementRoute.js',
  'src/route/equipementRoute.js',
  'src/route/socialRoute.js',
  'src/route/messageRoute.js',
  'src/route/adminRoute.js',
  'src/route/evolutionRoute.js',
  'src/route/modeleSeanceRoute.js',
  'src/route/sessionRoute.js'
];

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const fileName = path.basename(file);

  if (fileName === 'authRoute.js') {
    // authRoute est un cas spécial (routes publiques + protégées)
    check(
      `${fileName} - Authentification sélective OK`,
      fileContains(filePath, 'authenticateToken'),
      'warning'
    );
  } else {
    // Toutes les autres routes doivent avoir router.use(authenticateToken)
    check(
      `${fileName} - Protection JWT globale`,
      fileContains(filePath, 'router.use(authenticateToken)') ||
      fileContains(filePath, 'router.use(authenticateToken, requireAdmin)')
    );
  }
});

// ============================================
// 2. VÉRIFICATIONS DE VALIDATION
// ============================================
log('\n📋 2. Vérifications de validation des entrées\n', 'blue');

check(
  'socialRoute.js - Validators présents',
  fileContains('src/route/socialRoute.js', 'socialValidators')
);

check(
  'messageRoute.js - Validators présents',
  fileContains('src/route/messageRoute.js', 'messageValidators')
);

check(
  'validators.js - Validation mot de passe stricte (8 chars)',
  fileContains('src/middleware/validators.js', 'isLength({ min: 8 })')
);

// ============================================
// 3. VÉRIFICATIONS DE SÉCURITÉ DES DONNÉES
// ============================================
log('\n📋 3. Vérifications de sécurité des données\n', 'blue');

check(
  '.env - Fichier ignoré par git',
  fileContains('.gitignore', '.env')
);

check(
  'authController.js - Cookies sécurisés (httpOnly)',
  fileContains('src/controllers/authController.js', 'httpOnly: true')
);

check(
  'authController.js - Cookies sécurisés (secure)',
  fileContains('src/controllers/authController.js', 'secure: true')
);

check(
  'authController.js - Protection CSRF (sameSite: strict)',
  fileContains('src/controllers/authController.js', "sameSite: 'strict'")
);

check(
  'User.js - Hashage bcrypt des mots de passe',
  fileContains('src/models/User.js', 'bcrypt.hash')
);

// ============================================
// 4. VÉRIFICATIONS DE PROTECTION HTTP
// ============================================
log('\n📋 4. Vérifications de protection HTTP\n', 'blue');

check(
  'server.js - Helmet.js activé',
  fileContains('server.js', 'app.use(helmet()')
);

check(
  'server.js - CORS configuré',
  fileContains('server.js', 'app.use(cors(')
);

check(
  'server.js - Rate limiting sur login',
  fileContains('server.js', '/api/auth/login') && fileContains('server.js', 'strictAuthLimiter')
);

check(
  'server.js - Rate limiting sur chatbot',
  fileContains('server.js', '/api/chatbot') && fileContains('server.js', 'chatbotLimiter')
);

// ============================================
// 5. VÉRIFICATIONS DE GESTION D'ERREURS
// ============================================
log('\n📋 5. Vérifications de gestion d\'erreurs\n', 'blue');

check(
  'errorHandler.js - Stack traces masquées',
  !fileContains('src/middleware/errorHandler.js', 'stack: err.stack') ||
  fileContains('src/middleware/errorHandler.js', 'errorId')
);

check(
  'errorHandler.js - ErrorId pour traçabilité',
  fileContains('src/middleware/errorHandler.js', 'errorId')
);

// ============================================
// 6. VÉRIFICATIONS WEBSOCKET
// ============================================
log('\n📋 6. Vérifications WebSocket\n', 'blue');

check(
  'server.js - WebSocket avec authentification JWT',
  fileContains('server.js', 'io.use') && fileContains('server.js', 'jwt.verify')
);

// ============================================
// 7. VÉRIFICATIONS DES REQUÊTES SQL
// ============================================
log('\n📋 7. Vérifications anti-injection SQL\n', 'blue');

const modelFiles = fs.readdirSync(path.join(__dirname, '..', 'src/models'))
  .filter(f => f.endsWith('.js'));

let sqlInjectionRisk = false;
modelFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', 'src/models', file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Rechercher des concaténations SQL dangereuses
  const dangerousPatterns = [
    /query\s*=\s*['"`].*\+.*['"`]/,  // "SELECT * FROM " + variable
    /query\s*\+=.*['"`]/,             // query += "..."
  ];

  const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(content));

  if (hasDangerousPattern && !content.includes('$1')) {
    sqlInjectionRisk = true;
    log(`  ⚠️  ${file} - Possible concaténation SQL détectée`, 'yellow');
  }
});

check(
  'Modèles - Utilisation de requêtes paramétrées',
  !sqlInjectionRisk
);

// ============================================
// 8. VÉRIFICATIONS DES DÉPENDANCES
// ============================================
log('\n📋 8. Vérifications des fichiers de sécurité\n', 'blue');

check(
  'package.json - Scripts de sécurité configurés',
  fileContains('package.json', 'security:audit')
);

check(
  '.env.example - Présence recommandée',
  fileExists('.env.example'),
  'warning'
);

// ============================================
// RÉSUMÉ
// ============================================
log('\n================================================', 'cyan');
log('  📊 RÉSUMÉ DES VÉRIFICATIONS', 'cyan');
log('================================================\n', 'cyan');

const successRate = Math.round((passedChecks / totalChecks) * 100);
const scoreColor = successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red';

log(`Total de vérifications : ${totalChecks}`, 'blue');
log(`✓ Réussies : ${passedChecks}`, 'green');
log(`✗ Échouées : ${failedChecks}`, 'red');
log(`⚠ Avertissements : ${warnings}`, 'yellow');
log(`\nScore de sécurité : ${successRate}%`, scoreColor);

if (successRate >= 90) {
  log('\n🎉 Excellent ! Votre application est bien sécurisée.', 'green');
} else if (successRate >= 70) {
  log('\n⚠️  Bon niveau de sécurité, mais des améliorations sont possibles.', 'yellow');
} else {
  log('\n🚨 ATTENTION ! Des vulnérabilités critiques ont été détectées.', 'red');
}

log('\n================================================\n', 'cyan');

// Retourner un code d'erreur si des checks critiques ont échoué
process.exit(failedChecks > 0 ? 1 : 0);
