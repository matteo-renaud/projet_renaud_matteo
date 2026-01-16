export class Utilisateur {
    id?:string;
    nom:string;
    prenom:string;
    login:string;
    email:string;
    password:string;
    confirmPassword:string;

    constructor(nom:string, prenom:string, login:string, email:string, password:string, confirmPassword:string, id?:string) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.login = login;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }
}
