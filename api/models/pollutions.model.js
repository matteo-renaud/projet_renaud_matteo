module.exports = (sequelize, Sequelize) => {

  const { DataTypes } = Sequelize;

  const Pollutions = sequelize.define("pollutions", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    titre: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lieu: {
      type: Sequelize.STRING,
      allowNull: false
    },
    dateObservation: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    typePollution: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    latitude: {
      type: Sequelize.DECIMAL(9,6),
      allowNull: false
    },
    longitude: {
      type: Sequelize.DECIMAL(9,6),
      allowNull: false
    },
    photoUrl: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    idDecouvreur: {
      type: DataTypes.UUID,
      allowNull: true,
    }
  });

  return Pollutions;
};
