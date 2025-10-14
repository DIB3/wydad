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
  height_cm: DataTypes.DECIMAL(5,2),
  weight_kg: DataTypes.DECIMAL(5,2),
  bmi: DataTypes.DECIMAL(5,2),
  bp_sys: DataTypes.INTEGER,
  bp_dia: DataTypes.INTEGER,
  hr_bpm: DataTypes.INTEGER,
  spo2: DataTypes.DECIMAL(5,2),
  temperature_c: DataTypes.DECIMAL(4,1),
  ecg_date: DataTypes.DATEONLY,
  ecg_conclusion: DataTypes.TEXT,
  fevg_percent: DataTypes.DECIMAL(5,2),
  vtd_vg_ml: DataTypes.DECIMAL(6,2),
  vts_vg_ml: DataTypes.DECIMAL(6,2),
  lv_dd_mm: DataTypes.DECIMAL(5,2),
  lv_sd_mm: DataTypes.DECIMAL(5,2),
  lv_mass_g: DataTypes.DECIMAL(7,2),
  lavi_ml_m2: DataTypes.DECIMAL(6,2),
  ravi_ml_m2: DataTypes.DECIMAL(6,2),
  tapse_mm: DataTypes.DECIMAL(5,2),
  s_prime_cms: DataTypes.DECIMAL(5,2),
  paps_mmhg: DataTypes.DECIMAL(5,2),
  aorta_sinus_mm: DataTypes.DECIMAL(6,2),
  aorta_asc_mm: DataTypes.DECIMAL(6,2),
  valve_status: DataTypes.TEXT,
  pericardial_effusion: DataTypes.TEXT,
  echo_conclusion: DataTypes.TEXT,
  vems: DataTypes.DECIMAL(6,2),
  cvf: DataTypes.DECIMAL(6,2),
  ratio_vems_cvf: DataTypes.DECIMAL(5,2),
  resp_conclusion: DataTypes.TEXT,
  hb_g_dl: DataTypes.DECIMAL(5,2),
  ht_percent: DataTypes.DECIMAL(5,2),
  wbc_g_l: DataTypes.DECIMAL(5,2),
  platelets_g_l: DataTypes.DECIMAL(5,2),
  ferritin_ng_ml: DataTypes.DECIMAL(6,2),
  crp_mg_l: DataTypes.DECIMAL(6,2),
  glucose_mg_dl: DataTypes.DECIMAL(6,2),
  hba1c_percent: DataTypes.DECIMAL(4,2),
  tsh_mui_l: DataTypes.DECIMAL(6,2),
  ldl_mg_dl: DataTypes.DECIMAL(6,2),
  hdl_mg_dl: DataTypes.DECIMAL(6,2),
  tg_mg_dl: DataTypes.DECIMAL(6,2),
  creat_mg_dl: DataTypes.DECIMAL(5,2),
  egfr_ml_min: DataTypes.DECIMAL(6,2),
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
