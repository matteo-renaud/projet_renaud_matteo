import { Component, Input } from '@angular/core';
import { PollutionService } from '../services/pollution-service';
import { Observable } from 'rxjs';
import { Pollution } from '../models/pollution';
import { CommonModule } from '@angular/common';
import { Image } from "primeng/image";
import { Card } from "primeng/card";
import { Fieldset } from "primeng/fieldset";
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinner } from "primeng/progressspinner";
import { TypePollutionLabelPipe } from "../pipes/type-pollution-label.pipe";

@Component({
  selector: 'app-details-pollution',
  imports: [CommonModule, Image, Card, Fieldset, ProgressSpinner, TypePollutionLabelPipe],
  templateUrl: './details-pollution.html',
  styleUrl: './details-pollution.css'
})
export class DetailsPollution {
  
  pollution$?: Observable<Pollution>;

  constructor(private activatedRoute: ActivatedRoute, private pollutionService : PollutionService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {     
      const pollutionId = params['id'];    
      this.pollution$ = this.pollutionService.getById(pollutionId);
    });
  }
}
