const VisitInjuries = require('../models/visit_injuries');
const Visit = require('../models/visit');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');

exports.create = async (req, res) => {
  try {
    const injury = await VisitInjuries.create(req.body);
    
    // Récupérer la visite associée pour avoir le player_id
    const visit = await Visit.findByPk(injury.visit_id);
    const injuryWithVisit = { ...injury.toJSON(), visit: visit?.toJSON(), player_id: visit?.player_id };
    
    emitModuleCreated('visit_injuries', injuryWithVisit); // temps réel avec player_id
    res.status(201).json(injury);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getByVisitId = async (req, res) => {
  try {
    const injury = await VisitInjuries.findOne({ where: { visit_id: req.params.visitId } });
    if (!injury) return res.status(404).json({ error: 'Blessure non trouvée' });
    res.json(injury);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const injury = await VisitInjuries.findOne({ where: { visit_id: req.params.visitId } });
    if (!injury) return res.status(404).json({ error: 'Blessure non trouvée' });
    await injury.update(req.body);
    
    // Récupérer la visite associée pour avoir le player_id
    const visit = await Visit.findByPk(injury.visit_id);
    const injuryWithVisit = { ...injury.toJSON(), visit: visit?.toJSON(), player_id: visit?.player_id };
    
    emitModuleUpdated('visit_injuries', injuryWithVisit); // temps réel avec player_id
    res.json({ message: 'Blessure mise à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const injury = await VisitInjuries.findOne({ where: { visit_id: req.params.visitId } });
    if (!injury) return res.status(404).json({ error: 'Blessure non trouvée' });
    await injury.destroy();
    emitModuleDeleted('visit_injuries', req.params.visitId); // temps réel
    res.json({ message: 'Blessure supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
