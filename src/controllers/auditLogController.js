const AuditLog = require('../models/audit_log');

exports.getAll = async (req, res) => {
  try {
    const logs = await AuditLog.findAll();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const log = await AuditLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log non trouvé' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
