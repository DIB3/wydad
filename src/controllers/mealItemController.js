const MealItem = require('../models/meal_item');

exports.create = async (req, res) => {
  try {
    const mealItem = await MealItem.create(req.body);
    res.status(201).json(mealItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const mealItems = await MealItem.findAll({
      order: [['name', 'ASC']],
    });
    res.json(mealItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const mealItem = await MealItem.findByPk(req.params.id);
    if (!mealItem) {
      return res.status(404).json({ error: 'Repas non trouvé' });
    }
    res.json(mealItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const mealItem = await MealItem.findByPk(req.params.id);
    if (!mealItem) {
      return res.status(404).json({ error: 'Repas non trouvé' });
    }
    await mealItem.update(req.body);
    res.json(mealItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const mealItem = await MealItem.findByPk(req.params.id);
    if (!mealItem) {
      return res.status(404).json({ error: 'Repas non trouvé' });
    }
    await mealItem.destroy();
    res.json({ message: 'Repas supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

