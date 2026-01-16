const { genSaltSync, hashSync, compare } = require('bcryptjs');

const db = require("../models");
const Utilisateurs = db.Utilisateurs;

const { ACCESS_TOKEN_SECRET }  = require ("../config.js");

const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '1800s' });
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.findAll = (req, res) => {

    Utilisateurs.findAll()
    .then(data => {res.send(data);})
    .catch(err => {
      res.status(400).send({ message: err.message });
    });
};

exports.create = (req, res) => {

  const utilisateur = {
    nom: req.body.nom,
    prenom: req.body.prenom,
    login: req.body.login,
    email: req.body.email,
    password: req.body.password
  };
  const confirmPassword = req.body.confirmPassword;

  if (!utilisateur.nom) {
    return res.status(400).send({ message: "Le champ 'nom' est obligatoire." });
  }
  if (!utilisateur.prenom) {
    return res.status(400).send({ message: "Le champ 'prenom' est obligatoire." });
  }
  if (!utilisateur.login) {
    return res.status(400).send({ message: "Le champ 'login' est obligatoire." });
  }
  if (!utilisateur.email) {
    return res.status(400).send({ message: "Le champ 'email' est obligatoire." });
  }
  if (!emailPattern.test(utilisateur.email)) {
    return res.status(400).send({ message: "L'adresse email fournie n'est pas valide." });
  }
  if (!utilisateur.password) {
    return res.status(400).send({ message: "Le champ 'password' est obligatoire." });
  }
  if (utilisateur.password !== confirmPassword) {
    return res.status(400).send({ message: "Les mots de passe doivent être identique." });
  }

  const salt = genSaltSync(10);
  utilisateur.password = hashSync(req.body.password, salt);

  Utilisateurs.create(utilisateur)
    .then(data => {
      res.status(201).send({
        message: "Utilisateur créé avec succès.",
        utilisateur: {
          id: data.id,
          nom: data.nom,
          prenom: data.prenom,
          login: data.login,
          email: data.email
        }
      });
    })
    .catch(err => {
      console.error("Erreur lors de la création :", err);
      res.status(500).send({ message: err.message });
    });
};

exports.login = (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).send({ message: "Le login et le mot de passe sont requis." });
  }

  Utilisateurs.findOne({ where: { login } })
    .then(async user => {
      if (!user) {
        return res.status(404).send({ message: "Utilisateur non trouvé." });
      }

      if (!await compare(req.body.password, user.password)) {
        return res.status(401).send({ message: "Email ou mot de passe incorrect" });
      }

      const utilisateur = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        login: user.login  
      };

      let accessToken = generateAccessToken(utilisateur);
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.status(200).send(utilisateur);
    })
    .catch(err => {
      console.error("Erreur lors de la connexion :", err);
      res.status(500).send({ message : "Une erreur est survenue lors de la tentative de connexion." });
    });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  const utilisateur = await Utilisateurs.findByPk(id);

  if (!utilisateur) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  if (utilisateur.id !== userId) {
    return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette utilisateur" });
  }

  Utilisateurs.destroy({
    where: { id: id }
  })
  .then(data => {
    console.log(`Utilisateur avec l'ID ${id} supprimé`);
    res.status(201).send({ message: "Utilisateur supprimé" });
  })
  .catch(err => {
    console.error("Erreur lors de la suppression :", err);
    res.status(500).send({ message: err.message });
  });
};
