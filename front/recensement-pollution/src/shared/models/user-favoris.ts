export class UserFavoris {
    userId:string;
    pollutionFavorisId:string[] = [];

    constructor(userId:string) {
        this.userId = userId;
    }
}

