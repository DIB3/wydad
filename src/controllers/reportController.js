const { Op } = require('sequelize');
const Visit = require('../models/visit');
const Player = require('../models/player');
const MedicalCertificate = require('../models/medical_certificates');
const VisitPCMA = require('../models/visit_pcma');
const VisitGPS = require('../models/visit_gps');
const VisitImpedance = require('../models/visit_impedance');
const VisitInjuries = require('../models/visit_injuries');
const VisitNutrition = require('../models/visit_nutrition');
const VisitCare = require('../models/visit_care');
const sequelize = require('../config/db');

// Récupérer les statistiques globales ou par joueur
exports.getStats = async (req, res) => {
  try {
    const { player_id, start_date, end_date } = req.query;
    
    console.log('📊 getStats called with:', { player_id, start_date, end_date });
    
    const whereClause = {};
    if (player_id) whereClause.player_id = player_id;
    if (start_date && end_date) {
      whereClause.visit_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Compter les joueurs actifs
    const activePlayers = await Player.count();
    
    // Compter les visites par mois
    const visitsThisMonth = await Visit.count({
      where: {
        ...whereClause,
        visit_date: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    const visitsLastMonth = await Visit.count({
      where: {
        ...whereClause,
        visit_date: {
          [Op.between]: [
            new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            new Date(new Date().getFullYear(), new Date().getMonth(), 0)
          ]
        }
      }
    });

    // Certificats à renouveler (30 jours)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const certWhereClause = {
      expiration_date: {
        [Op.between]: [new Date(), thirtyDaysFromNow]
      },
      status: 'APTE'
    };
    if (player_id) certWhereClause.player_id = player_id;

    const certificatesToRenew = await MedicalCertificate.count({
      where: certWhereClause
    }).catch(err => {
      console.error('Erreur certificats:', err.message);
      return 0;
    });

    // Taux d'aptitude
    const apteCerts = await MedicalCertificate.count({
      where: {
        ...(player_id ? { player_id } : {}),
        status: 'APTE'
      }
    }).catch(err => {
      console.error('Erreur apteCerts:', err.message);
      return 0;
    });

    const totalCerts = await MedicalCertificate.count({
      where: player_id ? { player_id } : {}
    }).catch(err => {
      console.error('Erreur totalCerts:', err.message);
      return 0;
    });

    const fitnessRate = totalCerts > 0 ? Math.round((apteCerts / totalCerts) * 100) : 0;

    res.json({
      activePlayers,
      visitsThisMonth,
      visitsLastMonth,
      certificatesToRenew,
      fitnessRate
    });
  } catch (err) {
    console.error('Erreur getStats:', err);
    res.status(500).json({ error: err.message });
  }
};

// Évolution des visites (graphique)
exports.getVisitsEvolution = async (req, res) => {
  try {
    const { player_id, months = 6 } = req.query;
    
    console.log('📊 getVisitsEvolution called with:', { player_id, months });
    
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    const whereClause = {
      visit_date: {
        [Op.gte]: monthsAgo
      }
    };
    if (player_id) whereClause.player_id = player_id;

    const visits = await Visit.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('visit_date'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('visit_date'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('visit_date'), '%Y-%m'), 'ASC']],
      raw: true
    });

    console.log(`Found ${visits.length} monthly data points`);

    // Formater les résultats
    const result = visits.map(v => ({
      month: new Date(v.month + '-01').toLocaleDateString('fr-FR', { month: 'short' }),
      visits: parseInt(v.count)
    }));

    res.json(result);
  } catch (err) {
    console.error('Erreur getVisitsEvolution:', err);
    res.status(500).json({ error: err.message });
  }
};

// Distribution des visites par module
exports.getVisitsByModule = async (req, res) => {
  try {
    const { player_id, start_date, end_date } = req.query;
    
    console.log('📊 getVisitsByModule called with:', { player_id, start_date, end_date });
    
    const whereClause = {};
    if (player_id) whereClause.player_id = player_id;
    if (start_date && end_date) {
      whereClause.visit_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const visits = await Visit.findAll({
      where: whereClause,
      attributes: [
        'module',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['module'],
      raw: true
    });

    console.log(`Found ${visits.length} module groups`);

    const result = visits.map(v => ({
      module: v.module,
      count: parseInt(v.count),
      percentage: 0 // calculé après
    }));

    const total = result.reduce((sum, item) => sum + item.count, 0);
    result.forEach(item => {
      item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
    });

    res.json(result);
  } catch (err) {
    console.error('Erreur getVisitsByModule:', err);
    res.status(500).json({ error: err.message });
  }
};

// Distribution des statuts (certificats)
exports.getStatusDistribution = async (req, res) => {
  try {
    const { player_id } = req.query;
    
    console.log('📊 getStatusDistribution called with:', { player_id });
    
    const whereClause = {};
    if (player_id) whereClause.player_id = player_id;

    const statuses = await MedicalCertificate.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    }).catch(err => {
      console.error('Erreur requête certificats:', err.message);
      return [];
    });

    console.log(`Found ${statuses.length} status groups`);

    const result = statuses.map(s => ({
      status: s.status,
      count: parseInt(s.count)
    }));

    res.json(result);
  } catch (err) {
    console.error('Erreur getStatusDistribution:', err);
    res.status(500).json({ error: err.message });
  }
};

// Évolution des blessures
exports.getInjuriesEvolution = async (req, res) => {
  try {
    const { player_id, months = 6 } = req.query;
    
    console.log('📊 getInjuriesEvolution called with:', { player_id, months });
    
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    // Récupérer les visites de blessures (sans include pour éviter les erreurs d'association)
    const visits = await Visit.findAll({
      where: {
        module: 'Blessures',
        visit_date: {
          [Op.gte]: monthsAgo
        },
        ...(player_id ? { player_id } : {})
      },
      order: [['visit_date', 'ASC']]
    });

    console.log(`Found ${visits.length} injury visits`);

    // Grouper par mois
    const monthlyData = {};
    visits.forEach(visit => {
      const month = new Date(visit.visit_date).toLocaleDateString('fr-FR', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, injuries: 0 };
      }
      monthlyData[month].injuries++;
    });

    const result = Object.values(monthlyData);

    res.json(result);
  } catch (err) {
    console.error('Erreur getInjuriesEvolution:', err);
    res.status(500).json({ error: err.message });
  }
};

// Données d'impédance (évolution composition corporelle)
exports.getImpedanceData = async (req, res) => {
  try {
    const { player_id, months = 6 } = req.query;
    
    console.log('📊 getImpedanceData called with:', { player_id, months });
    
    // Si pas de player_id, calculer la moyenne de tous les joueurs
    if (!player_id) {
      return exports.getImpedanceAverageAllPlayers(req, res);
    }

    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    // Récupérer les visites d'impédance
    const visits = await Visit.findAll({
      where: {
        player_id,
        module: 'Impédancemétrie',
        visit_date: {
          [Op.gte]: monthsAgo
        }
      },
      order: [['visit_date', 'ASC']]
    });

    // Récupérer les données d'impédance pour chaque visite
    const result = [];
    for (const visit of visits) {
      try {
        const impedanceData = await VisitImpedance.findOne({
          where: { visit_id: visit.id }
        });
        
        if (impedanceData) {
          result.push({
            date: new Date(visit.visit_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            masse_grasse: impedanceData.fat_mass_kg || 0,
            masse_maigre: impedanceData.lean_mass_kg || 0,
            eau: impedanceData.body_water_l || 0
          });
        }
      } catch (err) {
        console.error('Erreur pour visite', visit.id, ':', err.message);
      }
    }

    res.json(result);
  } catch (err) {
    console.error('Erreur getImpedanceData:', err);
    res.status(500).json({ error: err.message });
  }
};

// Données GPS (charge de travail)
exports.getGPSData = async (req, res) => {
  try {
    const { player_id, weeks = 8 } = req.query;
    
    console.log('📊 getGPSData called with:', { player_id, weeks });
    
    // Si pas de player_id, calculer la moyenne de tous les joueurs
    if (!player_id) {
      return exports.getGPSAverageAllPlayers(req, res);
    }

    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - (parseInt(weeks) * 7));

    // Récupérer les visites GPS
    const visits = await Visit.findAll({
      where: {
        player_id,
        module: 'GPS',
        visit_date: {
          [Op.gte]: weeksAgo
        }
      },
      order: [['visit_date', 'ASC']]
    });

    // Récupérer les données GPS pour chaque visite
    const result = [];
    for (const visit of visits) {
      try {
        const gpsData = await VisitGPS.findOne({
          where: { visit_id: visit.id }
        });
        
        if (gpsData) {
          result.push({
            date: new Date(visit.visit_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            distance: gpsData.total_distance_m || 0,
            vitesse_max: gpsData.max_speed_kmh || 0,
            charge: gpsData.training_load || 0
          });
        }
      } catch (err) {
        console.error('Erreur pour visite', visit.id, ':', err.message);
      }
    }

    res.json(result);
  } catch (err) {
    console.error('Erreur getGPSData:', err);
    res.status(500).json({ error: err.message });
  }
};

// Rapport complet
exports.getCompleteReport = async (req, res) => {
  try {
    const { player_id, start_date, end_date } = req.query;

    // Récupérer toutes les données en parallèle
    const [stats, visitsEvolution, visitsByModule, statusDistribution, injuriesEvolution] = await Promise.all([
      this.getStatsData(player_id, start_date, end_date),
      this.getVisitsEvolutionData(player_id),
      this.getVisitsByModuleData(player_id, start_date, end_date),
      this.getStatusDistributionData(player_id),
      this.getInjuriesEvolutionData(player_id)
    ]);

    res.json({
      stats,
      visitsEvolution,
      visitsByModule,
      statusDistribution,
      injuriesEvolution,
      generatedAt: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fonctions helpers (utilisées par getCompleteReport)
exports.getStatsData = async (player_id, start_date, end_date) => {
  const whereClause = {};
  if (player_id) whereClause.player_id = player_id;
  if (start_date && end_date) {
    whereClause.visit_date = {
      [Op.between]: [start_date, end_date]
    };
  }

  const activePlayers = await Player.count();
  const visitsThisMonth = await Visit.count({
    where: {
      ...whereClause,
      visit_date: {
        [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    }
  });

  return { activePlayers, visitsThisMonth };
};

exports.getVisitsEvolutionData = async (player_id, months = 6) => {
  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - months);

  const whereClause = {
    visit_date: { [Op.gte]: monthsAgo }
  };
  if (player_id) whereClause.player_id = player_id;

  const visits = await Visit.findAll({
    where: whereClause,
    attributes: [
      [sequelize.fn('DATE_FORMAT', sequelize.col('visit_date'), '%Y-%m'), 'month'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: [sequelize.fn('DATE_FORMAT', sequelize.col('visit_date'), '%Y-%m')],
    order: [[sequelize.fn('DATE_FORMAT', sequelize.col('visit_date'), '%Y-%m'), 'ASC']],
    raw: true
  });

  return visits.map(v => ({
    month: new Date(v.month + '-01').toLocaleDateString('fr-FR', { month: 'short' }),
    visits: parseInt(v.count)
  }));
};

exports.getVisitsByModuleData = async (player_id, start_date, end_date) => {
  const whereClause = {};
  if (player_id) whereClause.player_id = player_id;
  if (start_date && end_date) {
    whereClause.visit_date = { [Op.between]: [start_date, end_date] };
  }

  const visits = await Visit.findAll({
    where: whereClause,
    attributes: [
      'module',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['module'],
    raw: true
  });

  return visits.map(v => ({
    module: v.module,
    count: parseInt(v.count)
  }));
};

exports.getStatusDistributionData = async (player_id) => {
  const whereClause = {};
  if (player_id) whereClause.player_id = player_id;

  const statuses = await MedicalCertificate.findAll({
    where: whereClause,
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });

  return statuses.map(s => ({
    status: s.status,
    count: parseInt(s.count)
  }));
};

exports.getInjuriesEvolutionData = async (player_id, months = 6) => {
  try {
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - months);

    const visits = await Visit.findAll({
      where: {
        module: 'Blessures',
        visit_date: { [Op.gte]: monthsAgo },
        ...(player_id ? { player_id } : {})
      }
    });

    const monthlyData = {};
    visits.forEach(visit => {
      const month = new Date(visit.visit_date).toLocaleDateString('fr-FR', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, injuries: 0 };
      }
      monthlyData[month].injuries++;
    });

    return Object.values(monthlyData);
  } catch (err) {
    console.error('Erreur getInjuriesEvolutionData:', err);
    return [];
  }
};

// Évolution de l'IMC moyen
exports.getAverageIMC = async (req, res) => {
  try {
    const { player_id, months = 6 } = req.query;
    
    console.log('📊 getAverageIMC called with:', { player_id, months });
    
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    // Récupérer les visites PCMA avec données anthropométriques
    const visits = await Visit.findAll({
      where: {
        module: 'PCMA',
        visit_date: {
          [Op.gte]: monthsAgo
        },
        ...(player_id ? { player_id } : {})
      },
      order: [['visit_date', 'ASC']]
    });

    // Récupérer les données PCMA pour chaque visite
    const monthlyIMC = {};
    
    for (const visit of visits) {
      try {
        const pcmaData = await VisitPCMA.findOne({
          where: { visit_id: visit.id }
        });
        
        if (pcmaData && pcmaData.weight_kg && pcmaData.height_cm) {
          const heightM = pcmaData.height_cm / 100;
          const imc = pcmaData.weight_kg / (heightM * heightM);
          
          const month = new Date(visit.visit_date).toLocaleDateString('fr-FR', { month: 'short' });
          
          if (!monthlyIMC[month]) {
            monthlyIMC[month] = { month, values: [] };
          }
          monthlyIMC[month].values.push(imc);
        }
      } catch (err) {
        console.error('Erreur PCMA pour visite', visit.id, ':', err.message);
      }
    }

    // Calculer moyenne, min, max pour chaque mois
    const result = Object.values(monthlyIMC).map(monthData => ({
      mois: monthData.month,
      moyenne: monthData.values.length > 0 
        ? Math.round((monthData.values.reduce((a, b) => a + b, 0) / monthData.values.length) * 10) / 10
        : 0,
      min: monthData.values.length > 0 ? Math.min(...monthData.values).toFixed(1) : 0,
      max: monthData.values.length > 0 ? Math.max(...monthData.values).toFixed(1) : 0
    }));

    res.json(result);
  } catch (err) {
    console.error('Erreur getAverageIMC:', err);
    res.status(500).json({ error: err.message });
  }
};

// Performance radar (données agrégées de santé)
exports.getPerformanceRadar = async (req, res) => {
  try {
    const { player_id } = req.query;
    
    console.log('📊 getPerformanceRadar called with:', { player_id });
    
    // Récupérer les dernières données de chaque module
    const whereClause = player_id ? { player_id } : {};
    
    // Condition physique (basée sur GPS)
    const gpsVisits = await Visit.count({
      where: {
        ...whereClause,
        module: 'GPS',
        visit_date: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    });
    
    // Santé cardio (basée sur PCMA)
    const pcmaVisits = await Visit.count({
      where: {
        ...whereClause,
        module: 'PCMA',
        visit_date: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 3))
        }
      }
    });
    
    // Composition corporelle (basée sur Impédance)
    const impedanceVisits = await Visit.count({
      where: {
        ...whereClause,
        module: 'Impédancemétrie',
        visit_date: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    });
    
    // Nutrition
    const nutritionVisits = await Visit.count({
      where: {
        ...whereClause,
        module: 'Nutrition',
        visit_date: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    });
    
    // Disponibilité (basée sur certificats APTE)
    const apteCerts = await MedicalCertificate.count({
      where: {
        ...whereClause,
        status: 'APTE'
      }
    }).catch(() => 0);
    
    const totalCerts = await MedicalCertificate.count({
      where: whereClause
    }).catch(() => 1);
    
    const disponibilite = Math.round((apteCerts / totalCerts) * 100);

    const result = [
      { metric: 'Condition physique', value: Math.min(gpsVisits * 10, 100) },
      { metric: 'Santé cardio', value: Math.min(pcmaVisits * 20, 100) },
      { metric: 'Composition corp.', value: Math.min(impedanceVisits * 15, 100) },
      { metric: 'Nutrition', value: Math.min(nutritionVisits * 12, 100) },
      { metric: 'Disponibilité', value: disponibilite || 0 }
    ];

    res.json(result);
  } catch (err) {
    console.error('Erreur getPerformanceRadar:', err);
    res.status(500).json({ error: err.message });
  }
};

// Certificats expirants par période
exports.getCertificatesExpiry = async (req, res) => {
  try {
    const { player_id } = req.query;
    
    console.log('📊 getCertificatesExpiry called with:', { player_id });
    
    const now = new Date();
    const whereClause = player_id ? { player_id } : {};

    // Ce mois (0-30 jours)
    const thisMonth = await MedicalCertificate.count({
      where: {
        ...whereClause,
        expiration_date: {
          [Op.between]: [now, new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)]
        },
        status: 'APTE'
      }
    }).catch(() => 0);

    // 1-3 mois (30-90 jours)
    const oneToThreeMonths = await MedicalCertificate.count({
      where: {
        ...whereClause,
        expiration_date: {
          [Op.between]: [
            new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
          ]
        },
        status: 'APTE'
      }
    }).catch(() => 0);

    // 3-6 mois (90-180 jours)
    const threeToSixMonths = await MedicalCertificate.count({
      where: {
        ...whereClause,
        expiration_date: {
          [Op.between]: [
            new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
            new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
          ]
        },
        status: 'APTE'
      }
    }).catch(() => 0);

    // Déjà expirés
    const expired = await MedicalCertificate.count({
      where: {
        ...whereClause,
        expiration_date: {
          [Op.lt]: now
        },
        status: 'APTE'
      }
    }).catch(() => 0);

    const result = [
      { periode: 'Ce mois', expirent: thisMonth, expires: expired },
      { periode: '1-3 mois', expirent: oneToThreeMonths, expires: 0 },
      { periode: '3-6 mois', expirent: threeToSixMonths, expires: 0 }
    ];

    res.json(result);
  } catch (err) {
    console.error('Erreur getCertificatesExpiry:', err);
    res.status(500).json({ error: err.message });
  }
};

// Moyenne GPS de tous les joueurs
exports.getGPSAverageAllPlayers = async (req, res) => {
  try {
    const { weeks = 8 } = req.query;
    
    console.log('📊 getGPSAverageAllPlayers called with:', { weeks });
    
    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - (parseInt(weeks) * 7));

    // Récupérer toutes les visites GPS
    const visits = await Visit.findAll({
      where: {
        module: 'GPS',
        visit_date: {
          [Op.gte]: weeksAgo
        }
      },
      order: [['visit_date', 'ASC']]
    });

    // Grouper par semaine et calculer moyennes
    const weeklyData = {};
    
    for (const visit of visits) {
      try {
        const gpsData = await VisitGPS.findOne({
          where: { visit_id: visit.id }
        });
        
        if (gpsData) {
          // Obtenir le numéro de semaine
          const weekKey = new Date(visit.visit_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
          
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { 
              date: weekKey, 
              distances: [], 
              vitesses: [], 
              charges: [] 
            };
          }
          
          weeklyData[weekKey].distances.push(gpsData.total_distance_m || 0);
          weeklyData[weekKey].vitesses.push(gpsData.max_speed_kmh || 0);
          weeklyData[weekKey].charges.push(gpsData.training_load || 0);
        }
      } catch (err) {
        console.error('Erreur GPS pour visite', visit.id, ':', err.message);
      }
    }

    // Calculer les moyennes
    const result = Object.values(weeklyData).map(week => ({
      date: week.date,
      distance: week.distances.length > 0 
        ? Math.round(week.distances.reduce((a, b) => a + b, 0) / week.distances.length)
        : 0,
      vitesse_max: week.vitesses.length > 0 
        ? Math.round((week.vitesses.reduce((a, b) => a + b, 0) / week.vitesses.length) * 10) / 10
        : 0,
      charge: week.charges.length > 0 
        ? Math.round(week.charges.reduce((a, b) => a + b, 0) / week.charges.length)
        : 0
    }));

    res.json(result);
  } catch (err) {
    console.error('Erreur getGPSAverageAllPlayers:', err);
    res.status(500).json({ error: err.message });
  }
};

// Moyenne Impédance de tous les joueurs
exports.getImpedanceAverageAllPlayers = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    console.log('📊 getImpedanceAverageAllPlayers called with:', { months });
    
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    // Récupérer toutes les visites d'impédance
    const visits = await Visit.findAll({
      where: {
        module: 'Impédancemétrie',
        visit_date: {
          [Op.gte]: monthsAgo
        }
      },
      order: [['visit_date', 'ASC']]
    });

    // Grouper par mois et calculer moyennes
    const monthlyData = {};
    
    for (const visit of visits) {
      try {
        const impedanceData = await VisitImpedance.findOne({
          where: { visit_id: visit.id }
        });
        
        if (impedanceData) {
          const monthKey = new Date(visit.visit_date).toLocaleDateString('fr-FR', { month: 'short' });
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { 
              month: monthKey, 
              masses_grasses: [], 
              masses_maigres: [], 
              eaux: [] 
            };
          }
          
          monthlyData[monthKey].masses_grasses.push(impedanceData.fat_mass_kg || 0);
          monthlyData[monthKey].masses_maigres.push(impedanceData.lean_mass_kg || 0);
          monthlyData[monthKey].eaux.push(impedanceData.body_water_l || 0);
        }
      } catch (err) {
        console.error('Erreur Impédance pour visite', visit.id, ':', err.message);
      }
    }

    // Calculer les moyennes
    const result = Object.values(monthlyData).map(month => ({
      date: month.month,
      masse_grasse: month.masses_grasses.length > 0 
        ? Math.round((month.masses_grasses.reduce((a, b) => a + b, 0) / month.masses_grasses.length) * 10) / 10
        : 0,
      masse_maigre: month.masses_maigres.length > 0 
        ? Math.round((month.masses_maigres.reduce((a, b) => a + b, 0) / month.masses_maigres.length) * 10) / 10
        : 0,
      eau: month.eaux.length > 0 
        ? Math.round((month.eaux.reduce((a, b) => a + b, 0) / month.eaux.length) * 10) / 10
        : 0
    }));

    res.json(result);
  } catch (err) {
    console.error('Erreur getImpedanceAverageAllPlayers:', err);
    res.status(500).json({ error: err.message });
  }
};

// Visites récentes
exports.getRecentVisits = async (req, res) => {
  try {
    const { player_id, limit = 5 } = req.query;
    
    console.log('📊 getRecentVisits called with:', { player_id, limit });
    
    const whereClause = player_id ? { player_id } : {};

    const visits = await Visit.findAll({
      where: whereClause,
      include: [{
        model: Player,
        attributes: ['first_name', 'last_name', 'position'],
        required: false
      }],
      order: [['visit_date', 'DESC']],
      limit: parseInt(limit)
    }).catch(async () => {
      // Si l'include échoue, faire sans
      return await Visit.findAll({
        where: whereClause,
        order: [['visit_date', 'DESC']],
        limit: parseInt(limit)
      });
    });

    const result = await Promise.all(visits.map(async (visit) => {
      let player = visit.Player;
      
      // Si pas de Player via include, le récupérer séparément
      if (!player && visit.player_id) {
        player = await Player.findByPk(visit.player_id, {
          attributes: ['first_name', 'last_name', 'position']
        }).catch(() => null);
      }

      return {
        id: visit.id,
        module: visit.module,
        visit_date: visit.visit_date,
        status: visit.status,
        player: player ? {
          first_name: player.first_name,
          last_name: player.last_name,
          position: player.position
        } : null
      };
    }));

    res.json(result);
  } catch (err) {
    console.error('Erreur getRecentVisits:', err);
    res.status(500).json({ error: err.message });
  }
};

