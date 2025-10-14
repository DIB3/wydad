const VisitPCMA = require('../models/visit_pcma');
const Visit = require('../models/visit');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');

exports.create = async (req, res) => {
  try {
    const pcma = await VisitPCMA.create(req.body);
    
    // Récupérer la visite associée pour avoir le player_id
    const visit = await Visit.findByPk(pcma.visit_id);
    const pcmaWithVisit = { ...pcma.toJSON(), visit: visit?.toJSON(), player_id: visit?.player_id };
    
    emitModuleCreated('visit_pcma', pcmaWithVisit); // temps réel avec player_id
    res.status(201).json(pcma);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getByVisitId = async (req, res) => {
  try {
    const pcma = await VisitPCMA.findOne({ where: { visit_id: req.params.visitId } });
    if (!pcma) return res.status(404).json({ error: 'PCMA non trouvé' });
    res.json(pcma);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const pcma = await VisitPCMA.findOne({ where: { visit_id: req.params.visitId } });
    if (!pcma) return res.status(404).json({ error: 'PCMA non trouvé' });
    await pcma.update(req.body);
    
    // Récupérer la visite associée pour avoir le player_id
    const visit = await Visit.findByPk(pcma.visit_id);
    const pcmaWithVisit = { ...pcma.toJSON(), visit: visit?.toJSON(), player_id: visit?.player_id };
    
    emitModuleUpdated('visit_pcma', pcmaWithVisit); // temps réel avec player_id
    res.json({ message: 'PCMA mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pcma = await VisitPCMA.findOne({ where: { visit_id: req.params.visitId } });
    if (!pcma) return res.status(404).json({ error: 'PCMA non trouvé' });
    await pcma.destroy();
    emitModuleDeleted('visit_pcma', req.params.visitId); // temps réel
    res.json({ message: 'PCMA supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
