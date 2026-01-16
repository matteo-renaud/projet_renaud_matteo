import { ChangeDetectorRef, Component, inject, OnInit, Signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Pollution } from '../models/pollution';
import { Store } from '@ngxs/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserFavorisState } from '../../shared/states/user-favoris-state';
import { AuthState } from '../../shared/states/auth-state';
import { Auth } from '../../shared/models/auth';
import { PollutionService } from '../services/pollution-service';
import { Card } from "primeng/card";
import { Button } from "primeng/button";
import { ProgressSpinner } from "primeng/progressspinner";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClearFavorites, RemoveFavorite } from '../../shared/actions/user-favoris-action';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ListePollutionItem } from "../liste-pollution-item/liste-pollution-item";

@Component({
  selector: 'app-liste-favoris',
  imports: [Card, Button, ProgressSpinner, RouterModule, CommonModule, ListePollutionItem],
  templateUrl: './liste-favoris.html',
  styleUrl: './liste-favoris.css'
})
export class ListeFavoris implements OnInit {

  listePollution$?: Observable<Pollution[]>;
  filtreTitre: string = '';
  filtreType: string = '';
  filtreLieu: string = '';
  listePollutionFavoris: Pollution[] = [];
  isLoading:boolean = true;
  
  private store = inject(Store);

  utilisateurConnecte: Signal<Auth | undefined> = toSignal(this.store.select(AuthState.getConnectedUser), {
    initialValue: undefined,
  });

  favoris = toSignal(this.store.select(UserFavorisState.getFavoritesByUserId).pipe(map(fn => fn(this.utilisateurConnecte()?.id))),
    { initialValue: [] as string[] }
  );

  constructor(private pollutionService : PollutionService, private cdr: ChangeDetectorRef,
    private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.loadFavoris();
  }

  loadFavoris() {
    this.pollutionService.getAll().subscribe(pollutions => {

      const favorisIds = this.favoris();

      this.listePollutionFavoris = pollutions
        .filter(p => favorisIds.includes(p.id))
        .sort((a, b) => a.titre.localeCompare(b.titre));

      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  onRemovePollutionFromFavoris($event: Pollution) {
    const pollutionId = $event.id;
    this.store.dispatch(new RemoveFavorite(this.utilisateurConnecte()!.id!, pollutionId));
    this.loadFavoris();
  }

  clearAllFavoris() {
    this.confirmationService.confirm({
        message: 'Voulez-vous supprimer tous vos favoris ?',
        header: 'Supprimer tous vos favoris',
        icon: 'pi pi-info-circle',
        acceptIcon: 'pi pi-check',
        rejectIcon: 'pi pi-times',
        rejectButtonProps: { label: 'Annuler', severity: 'secondary' },
        acceptButtonProps: { label: 'Supprimer', severity: 'danger' },
        accept: () => {
          this.store.dispatch(new ClearFavorites(this.utilisateurConnecte()!.id!));
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Tous vos favoris ont été supprimés" });
          this.listePollutionFavoris = [];
      }
    });
  }
}