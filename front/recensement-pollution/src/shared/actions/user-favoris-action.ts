export class AddFavorite {
    static readonly type = '[UserFavoris] add';

    constructor(public userId: string, public pollutionId: string) {}
}

export class RemoveFavorite {
    static readonly type = '[UserFavoris] remove';

    constructor(public userId: string, public pollutionId: string) {}
}

export class ClearFavorites {
    static readonly type = '[UserFavoris] clear';

    constructor(public userId: string) {}
}
