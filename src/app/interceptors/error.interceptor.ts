import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { APIError } from '../types/Misc';
import { LayoutService } from '../services/layout.service';



@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private layoutService: LayoutService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(catchError((err: APIError) => {
            window.alert(`${err.status} - ${err.message}`);
            if (err.status === 401) {
                this.authService.removeUser();
                this.layoutService.toggleLogin();
            }
            return throwError(() => new Error(err.message));
        }))
    }
}