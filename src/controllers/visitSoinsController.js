const VisitSoins = require('../models/visit_soins');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');

exports.create = async (req, res) => {
  try {
    const soin = await VisitSoins.create(req.body);
    emitModuleCreated('visit_soins', soin);
    res.status(201).json(soin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getByVisitId = async (req, res) => {
  try {
    const soin = await VisitSoins.findOne({ where: { visit_id: req.params.visitId } });
    if (!soin) return res.status(404).json({ error: 'Soin non trouvé' });
    res.json(soin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const soins = await VisitSoins.findAll({
      order: [['date_soin', 'DESC']]
    });
    res.json(soins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const soin = await VisitSoins.findOne({ where: { visit_id: req.params.visitId } });
    if (!soin) return res.status(404).json({ error: 'Soin non trouvé' });
    await soin.update(req.body);
    emitModuleUpdated('visit_soins', soin);
    res.json({ message: 'Soin mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const soin = await VisitSoins.findOne({ where: { visit_id: req.params.visitId } });
    if (!soin) return res.status(404).json({ error: 'Soin non trouvé' });
    await soin.destroy();
    emitModuleDeleted('visit_soins', { id: soin.id });
    res.json({ message: 'Soin supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByPlayerId = async (req, res) => {
  try {
    const soins = await VisitSoins.findAll({
      where: { player_id: req.params.playerId },
      order: [['date_soin', 'DESC']]
    });
    res.json(soins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByBlessureId = async (req, res) => {
  try {
    const soins = await VisitSoins.findAll({
      where: { lien_blessure_id: req.params.blessureId },
      order: [['date_soin', 'DESC']]
    });
    res.json(soins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

