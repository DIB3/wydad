const Player = require('../models/player');
const { emitPlayerCreated, emitPlayerUpdated, emitPlayerDeleted } = require('../socket');

exports.createPlayer = async (req, res) => {
  try {
    const player = await Player.create(req.body);
    emitPlayerCreated(player); // temps réel
    res.status(201).json(player);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPlayers = async (req, res) => {
  try {
    const players = await Player.findAll();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) return res.status(404).json({ error: 'Joueur non trouvé' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePlayer = async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) return res.status(404).json({ error: 'Joueur non trouvé' });
    await player.update(req.body);
    emitPlayerUpdated(player); // temps réel
    res.json({ message: 'Joueur mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) return res.status(404).json({ error: 'Joueur non trouvé' });
    await player.destroy();
    emitPlayerDeleted(req.params.id); // temps réel
    res.json({ message: 'Joueur supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
