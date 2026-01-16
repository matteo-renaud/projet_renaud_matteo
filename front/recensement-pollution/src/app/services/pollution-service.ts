import { Injectable } from '@angular/core';
import { Pollution } from '../models/pollution';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { FiltrePollution } from '../models/filtre-pollution';

const apiUrl = environment.backendClient + "/api/pollution";

@Injectable({
  providedIn: 'root'
})
export class PollutionService {
  
  constructor(private http:HttpClient) { }

  public getAll(filtres?: FiltrePollution): Observable<Pollution[]> {
    let params = new HttpParams();

    if (filtres) {
      if (filtres.titre) 
        params = params.set('titre', filtres.titre);
      if (filtres.typePollution) 
        params = params.set('typePollution', filtres.typePollution);
      if (filtres.lieu) 
        params = params.set('lieu', filtres.lieu);
    }

    return this.http.get<Pollution[]>(apiUrl, { params });
  }

  public create(pollution: Pollution) {
    return this.http.post<Pollution>(apiUrl, pollution);
  }

  public getById(id: String) : Observable<Pollution> {
    return this.http.get<Pollution>(`${apiUrl}/${id}`);
  }
  
  public update(pollution: Pollution) : Observable<Pollution> {
    return this.http.put<Pollution>(`${apiUrl}/${pollution.id}`, pollution);
  }

  public deleteById(id: String) : Observable<void> {
    return this.http.delete<void>(`${apiUrl}/${id}`);
  }
}
