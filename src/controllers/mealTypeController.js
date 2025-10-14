const MealType = require('../models/meal_type');

exports.create = async (req, res) => {
  try {
    const mealType = await MealType.create(req.body);
    res.status(201).json(mealType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const mealTypes = await MealType.findAll({
      order: [['name', 'ASC']],
    });
    res.json(mealTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const mealType = await MealType.findByPk(req.params.id);
    if (!mealType) {
      return res.status(404).json({ error: 'Type de repas non trouvé' });
    }
    res.json(mealType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const mealType = await MealType.findByPk(req.params.id);
    if (!mealType) {
      return res.status(404).json({ error: 'Type de repas non trouvé' });
    }
    await mealType.update(req.body);
    res.json(mealType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const mealType = await MealType.findByPk(req.params.id);
    if (!mealType) {
      return res.status(404).json({ error: 'Type de repas non trouvé' });
    }
    await mealType.destroy();
    res.json({ message: 'Type de repas supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

