export class Auth {
    id:string;
    nom:string;
    prenom:string;
    login:string;
    email:string;

    constructor(id:string, nom:string, prenom:string, login:string, email:string) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.login = login;
        this.email = email;
    }
}

