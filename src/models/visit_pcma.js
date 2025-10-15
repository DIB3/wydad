const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Visit = require('./visit');
const Attachment = require('./attachment');

const VisitPCMA = sequelize.define('VisitPCMA', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  visit_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  height_cm: DataTypes.DECIMAL(8,2),
  weight_kg: DataTypes.DECIMAL(8,2),
  bmi: DataTypes.DECIMAL(8,2),
  bp_sys: DataTypes.INTEGER,
  bp_dia: DataTypes.INTEGER,
  hr_bpm: DataTypes.INTEGER,
  spo2: DataTypes.DECIMAL(8,2),
  temperature_c: DataTypes.DECIMAL(6,1),
  ecg_date: DataTypes.DATEONLY,
  ecg_conclusion: DataTypes.TEXT,
  fevg_percent: DataTypes.DECIMAL(8,2),
  vtd_vg_ml: DataTypes.DECIMAL(8,2),
  vts_vg_ml: DataTypes.DECIMAL(8,2),
  lv_dd_mm: DataTypes.DECIMAL(8,2),
  lv_sd_mm: DataTypes.DECIMAL(8,2),
  lv_mass_g: DataTypes.DECIMAL(10,2),
  lavi_ml_m2: DataTypes.DECIMAL(8,2),
  ravi_ml_m2: DataTypes.DECIMAL(8,2),
  tapse_mm: DataTypes.DECIMAL(8,2),
  s_prime_cms: DataTypes.DECIMAL(8,2),
  paps_mmhg: DataTypes.DECIMAL(8,2),
  aorta_sinus_mm: DataTypes.DECIMAL(8,2),
  aorta_asc_mm: DataTypes.DECIMAL(8,2),
  valve_status: DataTypes.TEXT,
  pericardial_effusion: DataTypes.TEXT,
  echo_conclusion: DataTypes.TEXT,
  vems: DataTypes.DECIMAL(8,2),
  cvf: DataTypes.DECIMAL(8,2),
  ratio_vems_cvf: DataTypes.DECIMAL(8,2),
  resp_conclusion: DataTypes.TEXT,
  hb_g_dl: DataTypes.DECIMAL(8,2),
  ht_percent: DataTypes.DECIMAL(8,2),
  wbc_g_l: DataTypes.DECIMAL(8,2),
  platelets_g_l: DataTypes.DECIMAL(8,2),
  ferritin_ng_ml: DataTypes.DECIMAL(8,2),
  crp_mg_l: DataTypes.DECIMAL(8,2),
  glucose_mg_dl: DataTypes.DECIMAL(8,2),
  hba1c_percent: DataTypes.DECIMAL(6,2),
  tsh_mui_l: DataTypes.DECIMAL(8,2),
  ldl_mg_dl: DataTypes.DECIMAL(8,2),
  hdl_mg_dl: DataTypes.DECIMAL(8,2),
  tg_mg_dl: DataTypes.DECIMAL(8,2),
  creat_mg_dl: DataTypes.DECIMAL(8,2),
  egfr_ml_min: DataTypes.DECIMAL(8,2),
  spine: DataTypes.TEXT,
  shoulders: DataTypes.TEXT,
  hips: DataTypes.TEXT,
  knees: DataTypes.TEXT,
  ankles_feet: DataTypes.TEXT,
  proprioception: DataTypes.TEXT,
  functional_tests: DataTypes.TEXT,
  msk_conclusion: DataTypes.TEXT,
  aptitude: {
    type: DataTypes.ENUM('APTE','APTE_RESTRICTIONS','TEMP_INAPTE','INAPTE'),
  },
  restrictions: DataTypes.TEXT,
  recommendations: DataTypes.TEXT,
  physician_name: DataTypes.TEXT,
  signature_attachment_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'visit_pcma',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// VisitPCMA.belongsTo(Visit, { foreignKey: 'visit_id', constraints: false });
// VisitPCMA.belongsTo(Attachment, { foreignKey: 'signature_attachment_id', constraints: false });

module.exports = VisitPCMA;
