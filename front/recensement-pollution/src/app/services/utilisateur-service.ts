import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Utilisateur } from '../models/utilisateur';

const apiUrl = environment.backendClient + "/api/utilisateur";

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  constructor(private http:HttpClient) { }

  public getAll() : Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(apiUrl);
  }

  public create(utilisateur: Utilisateur) {
    return this.http.post<Utilisateur>(apiUrl, utilisateur);
  }

  public login(login: string, password: string): Observable<HttpResponse<Utilisateur>> {
    const body = { login, password };

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      observe: 'response' as const
    };

    return this.http.post<Utilisateur>(`${apiUrl}/login`, body, httpOptions);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiUrl}/${id}`);
  }
}
