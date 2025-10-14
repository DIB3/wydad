const VisitExamenMedical = require('../models/visit_examen_medical');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');

exports.create = async (req, res) => {
  try {
    const examen = await VisitExamenMedical.create(req.body);
    emitModuleCreated('visit_examen_medical', examen);
    res.status(201).json(examen);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getByVisitId = async (req, res) => {
  try {
    const examen = await VisitExamenMedical.findOne({ where: { visit_id: req.params.visitId } });
    if (!examen) return res.status(404).json({ error: 'Examen médical non trouvé' });
    res.json(examen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const examens = await VisitExamenMedical.findAll({
      order: [['date_consultation', 'DESC']]
    });
    res.json(examens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const examen = await VisitExamenMedical.findOne({ where: { visit_id: req.params.visitId } });
    if (!examen) return res.status(404).json({ error: 'Examen médical non trouvé' });
    await examen.update(req.body);
    emitModuleUpdated('visit_examen_medical', examen);
    res.json({ message: 'Examen médical mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const examen = await VisitExamenMedical.findOne({ where: { visit_id: req.params.visitId } });
    if (!examen) return res.status(404).json({ error: 'Examen médical non trouvé' });
    await examen.destroy();
    emitModuleDeleted('visit_examen_medical', { id: examen.id });
    res.json({ message: 'Examen médical supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByPlayerId = async (req, res) => {
  try {
    const examens = await VisitExamenMedical.findAll({
      where: { player_id: req.params.playerId },
      order: [['date_consultation', 'DESC']]
    });
    res.json(examens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

