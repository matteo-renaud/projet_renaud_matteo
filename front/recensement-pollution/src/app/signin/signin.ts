import { Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { Card } from "primeng/card";
import { InputText } from 'primeng/inputtext';
import { Message } from "primeng/message";
import { UtilisateurService } from '../services/utilisateur-service';
import { Store } from '@ngxs/store';
import { AuthState } from '../../shared/states/auth-state';
import { AuthConnexion } from '../../shared/actions/auth-action';
import { Auth } from '../../shared/models/auth';

@Component({
  selector: 'app-signin',
  imports: [Button, Card, RouterModule, Message, ReactiveFormsModule, InputText],
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin {

  private store = inject(Store);
  connexion: Signal<Boolean> = toSignal(this.store.select(AuthState.isConnected), {
    initialValue: false,
  });

  isLoading:boolean = false;

  constructor(private messageService:MessageService, private utilisateurService: UtilisateurService,
    private router: Router) { }

  submitted: boolean = false; 
  formSignin = new FormGroup({
    login: new FormControl('', [ Validators.required ]),
    password: new FormControl('', [ Validators.required ]),
  });

  signin() {
    
    this.submitted = true;
    if (this.formSignin.invalid) {
      return;
    }
    
    this.isLoading = true;
    const formData = this.formSignin.value;

    this.utilisateurService.login(formData.login!, formData.password!).subscribe({
      next: (response) => {
        this.isLoading = false;
        const auth = new Auth(response.body!.id!, response.body!.nom!, response.body!.prenom!, response.body!.login!, response.body!.email!);
        this.store.dispatch(new AuthConnexion(auth));
        window.location.href = "/";
      }, 
      error: (err) => {
        console.error("Erreur lors de la connexion :", err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Login ou mot de passe incorrect" });
        this.isLoading = false;
      }
    });
  }
}
