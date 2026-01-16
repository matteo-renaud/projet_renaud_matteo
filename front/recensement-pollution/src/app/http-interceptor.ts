import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { SetAccessToken } from '../shared/actions/acces-tocken-action';
import { AccesTokenState } from '../shared/states/acces-token-state';

@Injectable()
export class ApiHttpInterceptor implements HttpInterceptor {
  jwtToken?: String = '';
  constructor(private store: Store) {}
  
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    this.jwtToken = this.store.selectSnapshot(AccesTokenState.getAccessToken);

    if (this.jwtToken && this.jwtToken !== '') {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${this.jwtToken}` },
      });
      console.log('Bearer renvoyé : ' + this.jwtToken);
    }

    return next.handle(req).pipe(
      tap((evt: HttpEvent<any>) => {
        if (evt instanceof HttpResponse) {
          let tab: Array<String>;
          let enteteAuthorization = evt.headers.get('Authorization');
          if (enteteAuthorization != null) {
            tab = enteteAuthorization.split(/Bearer\s+(.*)$/i);
            if (tab.length > 1) {
              this.jwtToken = tab[1];
              console.log('Bearer récupéré : ' + this.jwtToken);
              this.store.dispatch(new SetAccessToken(this.jwtToken));
            }
          }
        }
      })
    );
  }
}
