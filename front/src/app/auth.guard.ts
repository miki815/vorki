import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UserService } from './services/user.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> => {
  const authService = inject(CookieService);
  const router = inject(Router);
  const userService = inject(UserService);
  const token = authService.get('token');

  if (!token) {
    router.navigate(['/autentikacija/prijava']);
    return of(false);
  }

  if (route.routeConfig?.path === 'profil/:id') {
    const routeId = route.paramMap.get('id');
    return userService.verifyUser({ routeId: routeId, token: token }).pipe(
      map((response: any) => {
        if (response['authorized']) {
          return true;
        } else {
          router.navigate(['/autentikacija/prijava']);
          return false;
        }
      }),
      catchError(() => {
        router.navigate(['/autentikacija/prijava']);
        return of(false);
      })
    );
  } else {
    return userService.verifyToken({ token: token }).pipe(
      map((response: any) => {
        if (response['authorized']) {
          return true;
        } else {
          router.navigate(['/autentikacija/prijava']);
          return false;
        }
      }),
      catchError(() => {
        router.navigate(['/autentikacija/prijava']);
        return of(false);
      })
    );
  }
};
