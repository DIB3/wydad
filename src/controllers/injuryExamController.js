const InjuryExam = require('../models/injury_exams');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');

exports.create = async (req, res) => {
  try {
    const exam = await InjuryExam.create(req.body);
    emitModuleCreated('injury_exams', exam); // temps réel
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getByInjuryId = async (req, res) => {
  try {
    const exam = await InjuryExam.findOne({ where: { injury_id: req.params.injuryId } });
    if (!exam) return res.status(404).json({ error: 'Examen non trouvé' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const exam = await InjuryExam.findOne({ where: { injury_id: req.params.injuryId } });
    if (!exam) return res.status(404).json({ error: 'Examen non trouvé' });
    await exam.update(req.body);
    emitModuleUpdated('injury_exams', exam); // temps réel
    res.json({ message: 'Examen mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const exam = await InjuryExam.findOne({ where: { injury_id: req.params.injuryId } });
    if (!exam) return res.status(404).json({ error: 'Examen non trouvé' });
    await exam.destroy();
    emitModuleDeleted('injury_exams', req.params.injuryId); // temps réel
    res.json({ message: 'Examen supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
