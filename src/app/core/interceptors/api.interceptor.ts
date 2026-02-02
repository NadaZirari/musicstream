import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // We could add common headers or prefix URL if needed
  // For now, let's just handle errors globally
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur inconnue est survenue';
      
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur : ${error.error.message}`;
      } else {
        // Erreur côté serveur
        errorMessage = `Code d'erreur : ${error.status}\nMessage : ${error.message}`;
      }
      
      console.error(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
