import { Component, signal, inject, Signal } from '@angular/core';
import { PollutionService } from './services/pollution-service';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from "@angular/router";
import { Button } from "primeng/button";
import { MenubarModule } from 'primeng/menubar';
import { UtilisateurService } from './services/utilisateur-service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ConfirmDialog } from "primeng/confirmdialog";
import { Toast } from "primeng/toast";
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { AuthState } from '../shared/states/auth-state';
import { Auth } from '../shared/models/auth';
import { AuthDeconnexion } from '../shared/actions/auth-action';
import { UserFavorisState } from '../shared/states/user-favoris-state';
import { map } from 'rxjs';
import { ClearFavorites } from '../shared/actions/user-favoris-action';
import { DeleteAccessToken } from '../shared/actions/acces-tocken-action';

@Component({
  selector: 'app-root',
  imports: [HttpClientModule, RouterModule, Button, MenubarModule, SplitButtonModule, ConfirmDialog, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [PollutionService, MessageService, ConfirmationService]
})
export class App {
  protected readonly title = signal('recensement-pollution');

  private store = inject(Store);
  isUtilisateurConnect: Signal<Boolean> = toSignal(this.store.select(AuthState.isConnected), {
    initialValue: false,
  });
  utilisateurConnecte: Signal<Auth | undefined> = toSignal(this.store.select(AuthState.getConnectedUser), {
    initialValue: undefined,
  });
  nbFavoris = toSignal(this.store.select(UserFavorisState.getNbFavoris).pipe(
      map(fn => fn(this.utilisateurConnecte()?.id))),
    { initialValue: 0 }
  );
 
  constructor(private utilisateurService: UtilisateurService, private messageService: MessageService,
    private confirmationService: ConfirmationService, private router: Router) {
    this.items = [
      {
        label: 'Supprimer compte',
        icon: 'pi pi-trash',
        command: () =>  this.supprimerCompte(),
      }
    ];
  }

  items: MenuItem[];

  logout() {
    this.store.dispatch(new AuthDeconnexion());
    this.store.dispatch(new DeleteAccessToken());
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Déconnexion' });
    this.router.navigate(['/']);
  }

  supprimerCompte() {
    this.confirmationService.confirm({
        message: 'Voulez-vous supprimer votre compte ?',
        header: 'Supprimer votre compte',
        icon: 'pi pi-info-circle',
        rejectButtonProps: { label: 'Annuler', severity: 'secondary'},
        acceptButtonProps: { label: 'Supprimer', severity: 'danger' },
        accept: () => {
          this.utilisateurService.delete(this.utilisateurConnecte()!.id).subscribe({
          next: () => {
            this.store.dispatch(new ClearFavorites(this.utilisateurConnecte()!.id!));
            this.store.dispatch(new AuthDeconnexion());
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Compte supprimé' });
          },
          error: (err) => {
            console.error("Erreur lors de la suppression :", err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de la suppression" });
          }
        });
      }
    });
  }

  goToFavoris() {
    this.router.navigate(['/pollution/favoris']);
  }
}
