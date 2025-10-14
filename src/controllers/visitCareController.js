const VisitCare = require('../models/visit_care');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');

exports.create = async (req, res) => {
  try {
    const care = await VisitCare.create(req.body);
    emitModuleCreated('visit_care', care);
    res.status(201).json(care);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getByVisitId = async (req, res) => {
  try {
    const care = await VisitCare.findOne({ where: { visit_id: req.params.visitId } });
    if (!care) return res.status(404).json({ error: 'Soins non trouvés' });
    res.json(care);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const cares = await VisitCare.findAll({
      // Association désactivée pour éviter les erreurs
      // include: [{ association: 'visit' }],
      order: [['care_date', 'DESC']]
    });
    res.json(cares);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const care = await VisitCare.findOne({ where: { visit_id: req.params.visitId } });
    if (!care) return res.status(404).json({ error: 'Soins non trouvés' });
    await care.update(req.body);
    emitModuleUpdated('visit_care', care);
    res.json({ message: 'Soins mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const care = await VisitCare.findOne({ where: { visit_id: req.params.visitId } });
    if (!care) return res.status(404).json({ error: 'Soins non trouvés' });
    await care.destroy();
    emitModuleDeleted('visit_care', { id: care.id });
    res.json({ message: 'Soins supprimés' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

