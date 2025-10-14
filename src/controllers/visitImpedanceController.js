const VisitImpedance = require('../models/visit_impedance');
const Visit = require('../models/visit');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');

exports.create = async (req, res) => {
  try {
    const impedance = await VisitImpedance.create(req.body);
    
    // Récupérer la visite associée pour avoir le player_id
    const visit = await Visit.findByPk(impedance.visit_id);
    const impedanceWithVisit = { ...impedance.toJSON(), visit: visit?.toJSON(), player_id: visit?.player_id };
    
    emitModuleCreated('visit_impedance', impedanceWithVisit); // temps réel avec player_id
    res.status(201).json(impedance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getByVisitId = async (req, res) => {
  try {
    const impedance = await VisitImpedance.findOne({ where: { visit_id: req.params.visitId } });
    if (!impedance) return res.status(404).json({ error: 'Impédancemétrie non trouvée' });
    res.json(impedance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const impedance = await VisitImpedance.findOne({ where: { visit_id: req.params.visitId } });
    if (!impedance) return res.status(404).json({ error: 'Impédancemétrie non trouvée' });
    await impedance.update(req.body);
    
    // Récupérer la visite associée pour avoir le player_id
    const visit = await Visit.findByPk(impedance.visit_id);
    const impedanceWithVisit = { ...impedance.toJSON(), visit: visit?.toJSON(), player_id: visit?.player_id };
    
    emitModuleUpdated('visit_impedance', impedanceWithVisit); // temps réel avec player_id
    res.json({ message: 'Impédancemétrie mise à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const impedance = await VisitImpedance.findOne({ where: { visit_id: req.params.visitId } });
    if (!impedance) return res.status(404).json({ error: 'Impédancemétrie non trouvée' });
    await impedance.destroy();
    emitModuleDeleted('visit_impedance', req.params.visitId); // temps réel
    res.json({ message: 'Impédancemétrie supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
