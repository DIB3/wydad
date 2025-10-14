const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  'wydad', // database
  'omnidocdb', // user
  'Regulation@2025', // password
  {
    host: 'dbomni.mysql.database.azure.com',
    dialect: 'mysql',
    port: 3306,
    logging: false,
  }
);
module.exports = sequelize;
