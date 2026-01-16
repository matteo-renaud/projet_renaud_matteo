const { Op } = require("sequelize");
const db = require("../models");
const Pollutions = db.Pollutions;

//Utilisation :
//GET /api/pollutions
//GET /api/pollutions?titre=deversement
//GET /api/pollutions?lieu=Marseille
//GET /api/pollutions?typePollution=DEPOT_SAUVAGE
//GET /api/pollutions?titre=dechet&typePollution=DEPOT_SAUVAGE&lieu=Paris
exports.findAll = async (req, res) => {

  const { lieu, typePollution, titre } = req.query;

  const where = {};

  if (lieu) {
    where.lieu = { [Op.iLike]: `%${lieu}%` };
  }

  if (typePollution) {
    where.typePollution = { [Op.iLike]: `%${typePollution}%` };
  }

  if (titre) {
    where.titre = { [Op.iLike]: `%${titre}%` };
  }

  try {
    const pollutions = await Pollutions.findAll({
      where,
      include: [
        {
          model: db.Utilisateurs,
          as: 'decouvreur',
          attributes: ['nom', 'prenom'],
          required: false
        }
      ],
      order: [['titre', 'ASC']]
    });

    const result = pollutions.map(p => {
      const pollution = p.toJSON();

      // Renommer et gérer utilisateur supprimé
      pollution.nomDecouvreur = pollution.decouvreur?.nom || 'Utilisateur supprimé';
      pollution.prenomDecouvreur = pollution.decouvreur?.prenom || '';
      delete pollution.decouvreur; // on supprime l'objet original

      return pollution;
    });

    res.send(result);

  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.findById = async (req, res) => {
  const id = req.params.id;

  try {
    const pollution = await Pollutions.findByPk(id, {
      include: [
        {
          model: db.Utilisateurs,
          as: 'decouvreur',
          attributes: ['nom', 'prenom'],
          required: false
        }
      ]
    });

    if (!pollution) {
      return res.status(404).send({
        message: `Pollution avec l'ID ${id} non trouvée`
      });
    }

    const result = pollution.toJSON();

    // Renommer et gérer utilisateur supprimé
    result.nomDecouvreur = result.decouvreur?.nom || 'Utilisateur supprimé';
    result.prenomDecouvreur = result.decouvreur?.prenom || '';
    delete result.decouvreur;

    res.send(result);

  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};


exports.create = async (req, res) => {

  const pollution = {
    titre,
    typePollution,
    description,
    lieu,
    dateObservation,
    latitude,
    longitude,
    photoUrl,
    idDecouvreur
  } = req.body;

  if (!titre) {
    return res.status(400).json({ message: "Le champ 'titre' est obligatoire." });
  }
  if (!typePollution) {
    return res.status(400).json({ message: "Le champ 'type_pollution' est obligatoire." });
  }
  if (!description) {
    return res.status(400).json({ message: "Le champ 'description' est obligatoire." });
  }
  if (!lieu) {
    return res.status(400).json({ message: "Le champ 'lieu' est obligatoire." });
  }
  if (!dateObservation) {
    return res.status(400).json({ message: "Le champ 'date_observation' est obligatoire." });
  }
  if (!latitude) {
    return res.status(400).json({ message: "Le champ 'latitude' est obligatoire." });
  }
  if (!longitude) {
    return res.status(400).json({ message: "Le champ 'longitude' est obligatoire." });
  }
  if (!idDecouvreur) {
    return res.status(400).json({ message: "Le champ 'idDecouvreur' est obligatoire." });
  }

  Pollutions.create(pollution)
  .then(data => {
    res.status(201).send({
      message: "Pollution créée avec succès.",
      pollution: data
    });
  })
  .catch(err => {
    console.error("Erreur lors de la création d'une pollution : ", err);
    res.status(500).send({ message: err.message });
  });
};

//Une pollution ne peut être mise à jour/supprimée que par son créateur
exports.update = async (req, res) => {
  const pollutionId = req.params.id;
  const userId = req.user.id;

  if (!Object.keys(req.body).length) {
    return res.status(400).send({
      message: "Le corps de la requête est vide. Aucun champ à mettre à jour."
    });
  }

  const newPollutionData = {
    titre: req.body.titre,
    typePollution: req.body.typePollution,
    description: req.body.description,
    lieu: req.body.lieu,
    dateObservation: req.body.dateObservation,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    photoUrl: req.body.photoUrl,
  };

  const pollution = await Pollutions.findByPk(pollutionId);

  if (!pollution) {
    return res.status(404).json({ message: 'Pollution introuvable' });
  }

  if (pollution.idDecouvreur !== userId) {
    return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette pollution" });
  }

  Pollutions.update(newPollutionData, {
    where: { id: pollutionId }
  })
  .then(data => {
    res.status(201).send({
      message: "Pollution mis à jour avec succès.",
      pollution: data
    });
  })
  .catch(err => {
    console.error(`Erreur lors de la mise à jour de la pollution avec l'ID ${pollutionId} : `, err);
    res.status(500).send({ message: err.message });
  });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  const pollution = await Pollutions.findByPk(id);

  if (!pollution) {
    return res.status(404).json({ message: 'Pollution introuvable' });
  }

  if (pollution.idDecouvreur !== userId) {
    return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette pollution" });
  }

  Pollutions.destroy({
    where: { id: id }
  })
  .then(data => {
    res.status(201).send({
      message: "Pollution supprimé"
    });
  })
  .catch(err => {
    console.error(`Erreur lors de la suppression de la pollution avec l'ID ${id} : `, err);
    res.status(500).send({ message: err.message });
  });
};

