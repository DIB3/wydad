const PlayerStatusHistory = require('../models/player_status_history');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');

exports.create = async (req, res) => {
  try {
    const status = await PlayerStatusHistory.create(req.body);
    emitModuleCreated('player_status_history', status); // temps réel
    res.status(201).json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const statuses = await PlayerStatusHistory.findAll();
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const status = await PlayerStatusHistory.findByPk(req.params.id);
    if (!status) return res.status(404).json({ error: 'Historique non trouvé' });
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const status = await PlayerStatusHistory.findByPk(req.params.id);
    if (!status) return res.status(404).json({ error: 'Historique non trouvé' });
    await status.destroy();
    emitModuleDeleted('player_status_history', req.params.id); // temps réel
    res.json({ message: 'Historique supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
