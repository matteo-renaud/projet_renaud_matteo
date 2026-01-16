import { Component, EventEmitter, inject, Input, Output, Signal } from '@angular/core';
import { Fieldset } from "primeng/fieldset";
import { AddFavorite, RemoveFavorite } from '../../shared/actions/user-favoris-action';
import { PollutionService } from '../services/pollution-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthState } from '../../shared/states/auth-state';
import { Store } from '@ngxs/store';
import { Pollution } from '../models/pollution';
import { Auth } from '../../shared/models/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Image } from "primeng/image";
import { Button } from "primeng/button";
import { TypePollutionLabelPipe } from "../pipes/type-pollution-label.pipe";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmDialog } from "primeng/confirmdialog";

@Component({
  selector: 'app-liste-pollution-item',
  imports: [Fieldset, Image, Button, TypePollutionLabelPipe, CommonModule, RouterModule, ConfirmDialog],
  templateUrl: './liste-pollution-item.html',
  styleUrl: './liste-pollution-item.css',
  providers: [ConfirmationService]
})
export class ListePollutionItem {

  @Input() pollution!: Pollution;
  @Input() utilisateurConnecteId?: string;
  @Input() isFavoris: boolean = false;
  @Output() onRemoveFromFavoris = new EventEmitter<Pollution>();

  private store = inject(Store);

  utilisateurConnecte: Signal<Auth | undefined> = toSignal(this.store.select(AuthState.getConnectedUser), {
    initialValue: undefined,
  });

  constructor(private pollutionService : PollutionService, private messageService: MessageService, 
    private confirmationService: ConfirmationService) { }

  deletePollution(id: string) {
    this.confirmationService.confirm({
        message: 'Voulez-vous supprimer cette pollution ?',
        header: 'Supprimer une pollution',
        icon: 'pi pi-info-circle',
        acceptIcon: 'pi pi-check',
        rejectIcon: 'pi pi-times',
        rejectButtonProps: { label: 'Annuler', severity: 'secondary' },
        acceptButtonProps: { label: 'Supprimer', severity: 'danger' },
        accept: () => {
          this.pollutionService.deleteById(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'info', detail: 'Pollution supprimée' });
            window.location.href = '/';
          },
          error: (err) => {
            console.error("Erreur lors de la suppression :", err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `Erreur lors de la suppression\nCause : ${err.error.message}` });
          }
        });
      }
    });
  }

  isUtilisateurConnecte() : boolean {
    return this.utilisateurConnecteId !== null;
  }

  addToFavoris(pollutionId: string) {
    this.store.dispatch(new AddFavorite(this.utilisateurConnecte()!.id!, pollutionId));
  }

  removeFromFavoris() {
    if (this.isFavoris) {
      this.onRemoveFromFavoris.emit(this.pollution);
    }
  }
}
