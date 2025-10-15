const VisitGPS = require('../models/visit_gps');
const Visit = require('../models/visit');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');

exports.create = async (req, res) => {
  try {
    
    const gps = await VisitGPS.create(req.body);
    
    
    // Récupérer la visite associée pour avoir le player_id
    const visit = await Visit.findByPk(gps.visit_id);
    const gpsWithVisit = { ...gps.toJSON(), visit: visit?.toJSON(), player_id: visit?.player_id };
    
    emitModuleCreated('visit_gps', gpsWithVisit); // temps réel avec player_id
    res.status(201).json(gps);
  } catch (err) {
    console.error('❌ [GPS Controller] Erreur création:', err.message);
    console.error('❌ [GPS Controller] Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

exports.getByVisitId = async (req, res) => {
  try {
    const gps = await VisitGPS.findOne({ where: { visit_id: req.params.visitId } });
    if (!gps) return res.status(404).json({ error: 'GPS non trouvé' });
    res.json(gps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const gps = await VisitGPS.findOne({ where: { visit_id: req.params.visitId } });
    if (!gps) return res.status(404).json({ error: 'GPS non trouvé' });
    await gps.update(req.body);
    
    // Récupérer la visite associée pour avoir le player_id
    const visit = await Visit.findByPk(gps.visit_id);
    const gpsWithVisit = { ...gps.toJSON(), visit: visit?.toJSON(), player_id: visit?.player_id };
    
    emitModuleUpdated('visit_gps', gpsWithVisit); // temps réel avec player_id
    res.json({ message: 'GPS mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const gps = await VisitGPS.findOne({ where: { visit_id: req.params.visitId } });
    if (!gps) return res.status(404).json({ error: 'GPS non trouvé' });
    await gps.destroy();
    emitModuleDeleted('visit_gps', req.params.visitId); // temps réel
    res.json({ message: 'GPS supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
