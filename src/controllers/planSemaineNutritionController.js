const PlanSemaineNutrition = require('../models/plan_semaine_nutrition');
const PlanSemaineRepas = require('../models/plan_semaine_repas');
const MealType = require('../models/meal_type');

exports.createPlan = async (req, res) => {
  try {
    const plan = await PlanSemaineNutrition.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addRepas = async (req, res) => {
  try {
    const repas = await PlanSemaineRepas.create(req.body);
    res.status(201).json(repas);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPlansByPlayer = async (req, res) => {
  try {
    const plans = await PlanSemaineNutrition.findAll({
      where: { player_id: req.params.playerId },
    });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlanDetails = async (req, res) => {
  try {
    const repas = await PlanSemaineRepas.findAll({
      where: { plan_id: req.params.planId },
      // include désactivé car associations désactivées
      // include: [{ model: MealType, attributes: ['name'] }],
      order: [['jour_semaine','ASC']],
    });
    res.json(repas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    await PlanSemaineNutrition.destroy({ where: { id: req.params.planId } });
    await PlanSemaineRepas.destroy({ where: { plan_id: req.params.planId } });
    res.json({ message: 'Plan supprimé.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
