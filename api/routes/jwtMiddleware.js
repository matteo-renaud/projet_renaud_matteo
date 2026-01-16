const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require("../config.js");

module.exports = {
    checkJwt : (req, res, next) => {
    // Get the JWT from the request header.
    const token = req.headers['authorization'];
  
    // Validate the token and retrieve its data.
    try {
        // Verify the payload fields
        let jwtBearer = token.split(' ')[1];
        console.log ("Authorization: " + jwtBearer);
        const jwtPayload = jwt.verify(jwtBearer, ACCESS_TOKEN_SECRET ,
        {
            complete: true,
            algorithms: ['HS256'],
            clockTolerance: 0,
            ignoreExpiration: false,
            ignoreNotBefore: false
        });
        // Add the payload to the request so controllers may access it.
        req.token = jwtPayload;

        //Récupére l'ID de l'utilisateur connecté (sera utilisé pour vérifier que c'est bien le bon
        //user qui modifie/supprime une pollution).
        //Car sinon, je peux mettre l'ID d'un autre utilisateur dans la requête POST pour modifier une
        //pollution qui n'est pas à moi
        req.user = {
            id: jwtPayload.payload.id,
            nom: jwtPayload.payload.nom,
            prenom: jwtPayload.payload.prenom,
            login: jwtPayload.payload.login,
            email: jwtPayload.payload.email
        };
    } catch (error) {
       console.log (error);
        res.status(401)
            .type('json')
            .send(JSON.stringify({ message: 'Missing or invalid token' }));
        return;
    }
  
    // Pass programmatic flow to the next middleware/controller.
    next();
  }
}
