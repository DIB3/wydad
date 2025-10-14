const InjuryIntervention = require('../models/injury_interventions');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');

exports.create = async (req, res) => {
  try {
    const intervention = await InjuryIntervention.create(req.body);
    emitModuleCreated('injury_interventions', intervention); // temps réel
    res.status(201).json(intervention);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getByInjuryId = async (req, res) => {
  try {
    const intervention = await InjuryIntervention.findOne({ where: { injury_id: req.params.injuryId } });
    if (!intervention) return res.status(404).json({ error: 'Intervention non trouvée' });
    res.json(intervention);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const intervention = await InjuryIntervention.findOne({ where: { injury_id: req.params.injuryId } });
    if (!intervention) return res.status(404).json({ error: 'Intervention non trouvée' });
    await intervention.update(req.body);
    emitModuleUpdated('injury_interventions', intervention); // temps réel
    res.json({ message: 'Intervention mise à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const intervention = await InjuryIntervention.findOne({ where: { injury_id: req.params.injuryId } });
    if (!intervention) return res.status(404).json({ error: 'Intervention non trouvée' });
    await intervention.destroy();
    emitModuleDeleted('injury_interventions', req.params.injuryId); // temps réel
    res.json({ message: 'Intervention supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
