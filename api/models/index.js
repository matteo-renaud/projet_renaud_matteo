const { Sequelize } = require ("sequelize");
const { BDD }  = require ('../config');
const sequelize = new Sequelize(`postgres://${BDD.user}:${BDD.password}@${BDD.host}/${BDD.bdname}`
,{
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: true,
      native:true
    },
    define:  {
    	timestamps:false
    }
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Pollutions = require("./pollutions.model.js")(sequelize, Sequelize);
db.Utilisateurs = require("./utilisateurs.model.js")(sequelize, Sequelize);

db.Pollutions.belongsTo(db.Utilisateurs, {
  foreignKey: 'idDecouvreur',
  as: 'decouvreur',
  onDelete: 'SET NULL'// Si utilisateur supprimé, ne supprime pas la pollution
});

module.exports = db;
