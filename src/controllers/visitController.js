const Visit = require('../models/visit');
const Player = require('../models/player');
const User = require('../models/user');
const { emitVisitCreated, emitVisitUpdated, emitVisitDeleted, emitVisitValidated } = require('../socket');

exports.create = async (req, res) => {
  try {
    console.log('📝 Création de visite - Données reçues:', req.body);
    
    const visit = await Visit.create(req.body);
    
    console.log('✅ Visite créée avec succès:', visit.id);
    
    emitVisitCreated(visit); // temps réel
    res.status(201).json(visit);
  } catch (err) {
    console.error('❌ Erreur lors de la création de visite:', err.message);
    console.error('📋 Détails complets:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const visits = await Visit.findAll({
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'first_name', 'last_name', 'position']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'role']
        }
      ],
      order: [['visit_date', 'DESC']]
    });
    res.json(visits);
  } catch (err) {
    console.error('Erreur getAll visits:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id, {
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'first_name', 'last_name', 'position']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'role']
        }
      ]
    });
    if (!visit) return res.status(404).json({ error: 'Visite non trouvée' });
    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Visite non trouvée' });
    await visit.update(req.body);
    emitVisitUpdated(visit); // temps réel
    res.json({ message: 'Visite mise à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Visite non trouvée' });
    await visit.destroy();
    emitVisitDeleted(req.params.id); // temps réel
    res.json({ message: 'Visite supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.validate = async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Visite non trouvée' });
    await visit.update({ status: 'validated' });
    emitVisitValidated(visit.player_id, visit.id); // temps réel
    res.json({ message: 'Visite validée' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
