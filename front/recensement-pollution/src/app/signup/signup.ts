import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Card } from "primeng/card";
import { Message } from "primeng/message";
import { Button } from "primeng/button";
import { Router, RouterModule } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { UtilisateurService } from '../services/utilisateur-service';
import { Utilisateur } from '../models/utilisateur';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, Card, Message, Button, RouterModule, InputText],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  constructor(private messageService: MessageService, private utilisateurService: UtilisateurService,
    private router: Router) { }

  submitted: boolean = false; 
  isLoading: boolean = false;
  formSignup = new FormGroup({
    nom: new FormControl('', [ Validators.required ]),
    prenom: new FormControl('', [ Validators.required ]),
    login: new FormControl('', [ Validators.required ]),
    email: new FormControl('', [ Validators.required, Validators.email ]),
    password: new FormControl('', [ Validators.required ]),
    confirmPassword: new FormControl('', [ Validators.required ]),
  }, { validators: Signup.passwordsMatchValidator });

  static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  signup() {
    this.submitted = true;
    if (this.formSignup.invalid) {
      return;
    }
    this.isLoading = true;

    const formData = this.formSignup.value;

    const utilisateur = new Utilisateur(formData.nom!, formData.prenom!, formData.login!, 
      formData.email!, formData.password!, formData.confirmPassword!);

    this.utilisateurService.create(utilisateur).subscribe({
      next: () =>  {
        this.messageService.add({ severity: 'info', detail: 'Compte crée avec succès' });
        this.isLoading = false;
        this.router.navigate(['/signin']);
      }, 
      error: (err) => {
        this.isLoading = false;
        console.error("Erreur lors de la création de votre compte :", err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de la création de votre compte" });
      }
    });
  }
}
