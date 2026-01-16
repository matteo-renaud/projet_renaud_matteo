import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { UserFavorisStateModel } from '../models/user-favoris-model';
import { UserFavoris } from '../models/user-favoris';
import { AddFavorite, ClearFavorites, RemoveFavorite } from '../actions/user-favoris-action';

@State<UserFavorisStateModel>({
  name: 'usersFavoris',
  defaults: {
    usersFavoris: [],
  },
})
@Injectable()
export class UserFavorisState {

    @Selector()
    static getFavoritesByUserId(state: UserFavorisStateModel) {
        const usersFavoris = state.usersFavoris;
        return (userId: string | undefined) => {
            if (!userId) 
                return [];
            const user = usersFavoris.find(u => u.userId === userId);
            return user?.pollutionFavorisId ?? [];
        };
    }

    @Selector()
    static getNbFavoris(state: UserFavorisStateModel) {
        return (userId: string | undefined): number => {
            if (!userId) 
                return 0;
            const user = state.usersFavoris.find(u => u.userId === userId);
            return user?.pollutionFavorisId.length ?? 0;
        };
    }

    @Action(AddFavorite)
    addFavorite(
        { getState, patchState }: StateContext<UserFavorisStateModel>,
        { userId, pollutionId }: AddFavorite
    ){     
        const state = getState();
        const usersFavoris = [...state.usersFavoris];

        // Chercher l'utilisateur
        let user = usersFavoris.find(u => u.userId === userId);

        // Si user n'existe pas, on le crée
        if (!user) {
            user = new UserFavoris(userId);
            user.pollutionFavorisId = [pollutionId];
            usersFavoris.push(user);
        } else {
            // Ajouter le favoris seulement s'il n'existe pas déjà
            if (!user.pollutionFavorisId.includes(pollutionId)) {
                user.pollutionFavorisId = [...user.pollutionFavorisId, pollutionId];
            }
        }

        patchState({ usersFavoris });
    }

    @Action(RemoveFavorite)
    removeFavorite(
        { getState, patchState }: StateContext<UserFavorisStateModel>,
        { userId, pollutionId }: RemoveFavorite
    ) {
        const state = getState();
        const usersFavoris = [...state.usersFavoris];

        // Chercher l'utilisateur
        const user = usersFavoris.find(u => u.userId === userId);

        // Rien à supprimer si le user n'existe pas
        if (!user) 
            return;

        // Retirer l'id du tableau
        user.pollutionFavorisId = user.pollutionFavorisId.filter(id => id !== pollutionId);

        // Optionnel : supprimer l'utilisateur si plus aucun favori
        if (user.pollutionFavorisId.length === 0) {
            const index = usersFavoris.findIndex(u => u.userId === userId);
            if (index !== -1) usersFavoris.splice(index, 1);
        }

        patchState({ usersFavoris });
    }

    @Action(ClearFavorites)
    clearFavorites(
        { getState, patchState }: StateContext<UserFavorisStateModel>,
        { userId }: ClearFavorites
    ) {
        const state = getState();
        const usersFavoris = [...state.usersFavoris];

        // Chercher l'utilisateur
        const userIndex = usersFavoris.findIndex(u => u.userId === userId);

        // Rien à faire si l'utilisateur n'existe pas
        if (userIndex === -1) 
            return;

        // Supprimer tous ses favoris
        usersFavoris.splice(userIndex, 1);

        patchState({ usersFavoris });
    }
}
