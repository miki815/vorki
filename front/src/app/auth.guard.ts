import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(CookieService);
  const router = inject(Router);

  if (authService.check('token')) {
    // authService.deleteAll(); za testiranje
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};

