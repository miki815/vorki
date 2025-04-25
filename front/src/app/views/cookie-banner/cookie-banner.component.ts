import { Component } from '@angular/core';
import { CookieService } from 'src/app/services/cookie.service';

@Component({
  selector: 'app-cookie-banner',
  imports: [],
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.css'
})
export class CookieBannerComponent {
  isVisible = false;

  constructor(private cookieService: CookieService) {
    this.isVisible = !this.cookieService.hasConsent();
  }

  acceptCookies(): void {
    this.cookieService.setConsent('all');
    this.isVisible = false;
    // #TODO Dodati inicijalizaciju svih tracking servisa (Google Analytics, Facebook Pixel itd.)
    console.log('Svi kolačići prihvaćeni');
  }

  acceptNecessaryCookies(): void {
    this.cookieService.setConsent('necessary');
    this.isVisible = false;
    // #TODO Onemogućiti sve nepotrebne tracking servise
    console.log('Samo neophodni kolačići prihvaćeni');
  }

  // Odbij sve kolačiće osim nužnih
  rejectCookies(): void {
    this.cookieService.setConsent('none');
    this.isVisible = false;
    // #TODO Obrisati sve nepotrebne kolačiće
    console.log('Kolačići odbijeni (osim nužnih)');
  }
}
