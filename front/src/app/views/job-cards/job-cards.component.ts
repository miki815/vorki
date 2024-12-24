import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-job-cards',
  templateUrl: './job-cards.component.html',
  styleUrl: './job-cards.component.css'
})
export class JobCardsComponent {
  categories = [];
  idK: string | null = null;
  allCategories = [];
  login: number = 1;

  constructor(private route: ActivatedRoute, private router: Router, private cookieService: CookieService) { }

  ngOnInit(): void {
    console.log("JobCards - ngOnInit: START")
    this.login = this.cookieService.get('token') ? 1 : 0;
    this.route.paramMap.subscribe(params => {
      this.idK = params.get('idK');
      this.getCraftmen(this.idK);
    });
    console.log("JobCards - ngOnInit: END")
  }

  getCraftmen(idK) {
    console.log("JobListing - getCraftmen: START")

    fetch('assets/craftsmen.json')
      .then(response => response.json())
      .then(professions => {
        if (idK == '1') this.categories = professions.craftsmen;
        else if (idK == '2') this.categories = professions.services;
        else if (idK == '3') this.categories = professions.transport;
        this.categories.sort((a, b) => a.localeCompare(b));
        this.allCategories = this.categories;
      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje zanata):', error);
      });

    console.log("JobListing - getCraftmen: END")
  }

  categoryChoice(category) {
    if (this.login == 1) {
      sessionStorage.setItem('category', category);
      this.router.navigate(['/oglasi']);
    } else{
      this.router.navigate(['/autentikacija/prijava']);
    }
    // this.router.navigate(['/oglasi'], { state: { category: category } });
  }

  onSearchInput(query: string): void {
    console.log(query);
    this.categories = this.allCategories.filter(category => category.toLowerCase().includes(query.toLowerCase()));
  }

}
