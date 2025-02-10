import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from './services/user.service';


export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(CookieService);
  const router = inject(Router);
  const http = inject(HttpClient);
  const routeId = route.paramMap.get('id');
  const userService = inject(UserService);
  const token = authService.get('token');

  if (!token) {
    router.navigate(['/autentikacija/prijava']);
    return false;
  }

  
  if (route.routeConfig?.path === 'profil/:id') {
    userService.verifyUser({ routeId: routeId, token: token }).subscribe((response: any) => {
      if (response['authorized'] == true) {
        return true;
      } else {
        router.navigate(['/autentikacija/prijava']);
        return false;
      }
    })
    return true;
  }
};
