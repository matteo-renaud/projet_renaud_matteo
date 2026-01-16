const { checkJwt } = require("./jwtMiddleware.js");

module.exports = app => {
    const pollution = require("../controllers/pollution.controllers.js");
  
    var router = require("express").Router();
  
    router.get("/", pollution.findAll);
    router.post("/", checkJwt, pollution.create);
    router.get("/:id", pollution.findById);
    router.put("/:id", checkJwt, pollution.update);
    router.delete("/:id", checkJwt, pollution.delete);
  
    app.use('/api/pollution', router);
  };
