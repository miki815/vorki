import { Injectable } from '@angular/core';
import { CookieService as NgxCookieService } from 'ngx-cookie-service';

declare let fbq: Function;


@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly COOKIE_CONSENT_NAME = 'cookie_consent';
  private pixelInitialized = false;


  constructor(private ngxCookieService: NgxCookieService) { }


  hasConsent(): boolean {
    return this.ngxCookieService.check(this.COOKIE_CONSENT_NAME);
  }

  getConsentType(): string {
    return this.ngxCookieService.get(this.COOKIE_CONSENT_NAME) || 'none';
  }

  setConsent(type: 'all' | 'necessary' | 'none'): void {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    this.ngxCookieService.set(this.COOKIE_CONSENT_NAME, type, expiryDate, '/', undefined, false, 'Lax');

    if (type === 'none') {
      // this.removeNonEssentialCookies();
    }
    else if (type === 'all') {
      // this.initializePixel();
    } else if (type === 'necessary') {
      // this.initializePixel();
    }
  }

  private removeNonEssentialCookies(): void {
    // Implementacija za uklanjanje specifičnih kolačića
    // Primer: this.ngxCookieService.delete('_ga');
    // Primer: this.ngxCookieService.delete('_gid');
  }

  private initializePixel(): void {
    if (this.pixelInitialized) return;

    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', '1732735934318838');
    fbq('track', 'PageView');

    this.pixelInitialized = true;
  }

}