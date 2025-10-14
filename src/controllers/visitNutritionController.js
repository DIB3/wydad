const VisitNutrition = require('../models/visit_nutrition');
const Visit = require('../models/visit');
const { emitModuleCreated, emitModuleUpdated, emitModuleDeleted } = require('../socket');
const MealType = require('../models/meal_type');

exports.create = async (req, res) => {
  try {
    const nutrition = await VisitNutrition.create(req.body);
    
    // Récupérer la visite associée pour avoir le player_id
    const visit = await Visit.findByPk(nutrition.visit_id);
    const nutritionWithVisit = { ...nutrition.toJSON(), visit: visit?.toJSON(), player_id: visit?.player_id };
    
    emitModuleCreated('visit_nutrition', nutritionWithVisit); // temps réel avec player_id
    res.status(201).json(nutrition);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getByVisitId = async (req, res) => {
  try {
    const nutrition = await VisitNutrition.findOne({ where: { visit_id: req.params.visitId } });
    if (!nutrition) return res.status(404).json({ error: 'Nutrition non trouvée' });
    res.json(nutrition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const nutrition = await VisitNutrition.findOne({ where: { visit_id: req.params.visitId } });
    if (!nutrition) return res.status(404).json({ error: 'Nutrition non trouvée' });
    await nutrition.update(req.body);
    
    // Récupérer la visite associée pour avoir le player_id
    const visit = await Visit.findByPk(nutrition.visit_id);
    const nutritionWithVisit = { ...nutrition.toJSON(), visit: visit?.toJSON(), player_id: visit?.player_id };
    
    emitModuleUpdated('visit_nutrition', nutritionWithVisit); // temps réel avec player_id
    res.json({ message: 'Nutrition mise à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const nutrition = await VisitNutrition.findOne({ where: { visit_id: req.params.visitId } });
    if (!nutrition) return res.status(404).json({ error: 'Nutrition non trouvée' });
    await nutrition.destroy();
    emitModuleDeleted('visit_nutrition', req.params.visitId); // temps réel
    res.json({ message: 'Nutrition supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Liste tous les items nutritionnels d'un certain type
exports.getAllByType = async (req, res) => {
  try {
    const nutritions = await VisitNutrition.findAll({
      where: { meal_type_id: req.params.mealTypeId },
      // include désactivé car associations désactivées
      // include: [{ model: MealType, attributes: ['name'] }],
    });
    res.json(nutritions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
