import { ChangeDetectorRef, Component, inject, Signal } from '@angular/core';
import { TypePollution } from '../models/type-pollution';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { Button} from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Pollution } from '../models/pollution';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/message';
import { PollutionService } from '../services/pollution-service';
import { Image } from "primeng/image";
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinner } from "primeng/progressspinner";
import { Auth } from '../../shared/models/auth';
import { Store } from '@ngxs/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthState } from '../../shared/states/auth-state';

@Component({
  selector: 'app-formulaire-pollution',
  imports: [Card, Toast, FormsModule, ReactiveFormsModule, InputText, Select, Message, 
    Textarea, DatePicker, InputNumber, Button, Image, ProgressSpinner],
  templateUrl: './formulaire-pollution.html',
  styleUrl: './formulaire-pollution.css',
  standalone: true
})
export class FormulairePollution {
  
  constructor(private messageService: MessageService, private pollutionService: PollutionService, 
    private activatedRoute: ActivatedRoute, private cdRef: ChangeDetectorRef, private router: Router) {}

  private store = inject(Store);
  utilisateurConnecte: Signal<Auth | undefined> = toSignal(this.store.select(AuthState.getConnectedUser), {
    initialValue: undefined,
  });

  pollutionIdExistante?: string;

  isFormulaireValide:boolean = false;
  isSubmitted: boolean = false;
  isLoading: boolean = false;
  isLoadingValidation: boolean = false;
  typesPollution?:any;
  pollutionData?:Pollution;
  isModeCreation: boolean = true;
  photoUrlPreview?: string;

  formPollution = new FormGroup({
      titre: new FormControl('', [ Validators.required ]),
      description: new FormControl('', [ Validators.required ]),
      typePollution: new FormControl<TypePollution | null>(null, [ Validators.required ]),
      date: new FormControl<Date | null>(null, [ Validators.required ]),
      lieu: new FormControl('', [ Validators.required ]),
      latitude: new FormControl<number | null>(null, [ Validators.required, Validators.max(90), Validators.min(-90)]),
      longitude: new FormControl<number | null>(null, [ Validators.required, Validators.max(90), Validators.min(-90)]),
      photoUrl: new FormControl(''),
  });

  get titre() {
    return this.formPollution.get('titre');
  }

  get typePollution() {
    return this.formPollution.get('typePollution');
  }

  get description() {
    return this.formPollution.get('description');
  }

  get date() {
    return this.formPollution.get('date');
  }

  get lieu() {
    return this.formPollution.get('lieu');
  }

  get latitude() {
    return this.formPollution.get('latitude');
  }

  get longitude() {
    return this.formPollution.get('longitude');
  }

  get photoUrl() {
    return this.formPollution.get('photoUrl');
  }

  ngOnInit() {
    this.typesPollution = Object.entries(TypePollution).map(([key, value]) => ({
      label: value,
      value: key,
    }));

    this.activatedRoute.params.subscribe((params) => {  
      const pollutionId = params['id'];    
      if(pollutionId){
        this.isModeCreation = false;
        this.isLoading = true; 
        this.pollutionIdExistante = pollutionId;
        this.pollutionService.getById(pollutionId).subscribe({
          next: (pollution) => this.remplirFormulaire(pollution),
          error: (err) => console.error('Erreur :', err)
        });
      }
    });
  }

  remplirFormulaire(pollution: Pollution): void {
    this.formPollution.patchValue({
      titre: pollution.titre,
      description: pollution.description,
      typePollution: pollution.typePollution,
      date: new Date(pollution.dateObservation),
      lieu: pollution.lieu,
      latitude: pollution.latitude,
      longitude: pollution.longitude,
      photoUrl: pollution.photoUrl
    });
    this.photoUrlPreview = pollution.photoUrl;
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  onSubmit() {

    this.isSubmitted = true;
    if (this.formPollution.valid) {

      this.isFormulaireValide = true;
      this.isLoadingValidation = true

      this.pollutionData = new Pollution(
        this.formPollution.value.titre!,
        this.formPollution.value.typePollution!,
        this.formPollution.value.description!,
        this.formPollution.value.date!,
        this.formPollution.value.lieu!,
        this.formPollution.value.latitude!,
        this.formPollution.value.longitude!,
        this.isModeCreation ? this.utilisateurConnecte()!.id : '', //La vrai vérification sera fait dans le back
        this.formPollution.value.photoUrl!);

      if(!this.isModeCreation) {
        this.pollutionData.id = this.pollutionIdExistante!;
      }
        
      if(this.isModeCreation) {
        this.pollutionService.create(this.pollutionData!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', detail: 'Pollution crée' });
            this.router.navigate(['/']);
          }, 
          error: (err) => {
            this.isLoadingValidation = false;
            console.error("Erreur lors de l'enregistrement :", err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `L'enregistrement a échoué\nCause : ${err.error.message}` });
          }
        });
      } else {
        this.pollutionService.update(this.pollutionData!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', detail: 'Pollution mise à jour' });
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.isLoadingValidation = false;
            console.error("Erreur lors de la modification :", err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `La mise à jour a échoué\nCause : ${err.error.message}` });
          }
        });
      }
    }
  }
}

