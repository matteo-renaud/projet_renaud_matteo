const { checkJwt } = require("./jwtMiddleware.js");

module.exports = app => {
    const utilisateur = require("../controllers/utilisateur.controllers.js");
  
    var router = require("express").Router();
  
    router.get("/", checkJwt, utilisateur.findAll);
    router.post("/", utilisateur.create);
    router.post("/login", utilisateur.login);
    router.delete("/:id", checkJwt, utilisateur.delete);

    app.use('/api/utilisateur', router);
  };
