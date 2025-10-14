const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middlewares/auth');

// Toutes les routes nécessitent l'authentification
router.use(auth);

// Statistiques globales ou par joueur
router.get('/stats', reportController.getStats);

// Évolution des visites
router.get('/visits-evolution', reportController.getVisitsEvolution);

// Distribution des visites par module
router.get('/visits-by-module', reportController.getVisitsByModule);

// Distribution des statuts
router.get('/status-distribution', reportController.getStatusDistribution);

// Évolution des blessures
router.get('/injuries-evolution', reportController.getInjuriesEvolution);

// Données d'impédance (nécessite player_id)
router.get('/impedance', reportController.getImpedanceData);

// Données GPS (nécessite player_id)
router.get('/gps', reportController.getGPSData);

// IMC moyen par mois
router.get('/average-imc', reportController.getAverageIMC);

// Performance radar (5 métriques)
router.get('/performance-radar', reportController.getPerformanceRadar);

// Certificats expirants par période
router.get('/certificates-expiry', reportController.getCertificatesExpiry);

// Visites récentes
router.get('/recent-visits', reportController.getRecentVisits);

// Rapport complet
router.get('/complete', reportController.getCompleteReport);

module.exports = router;

