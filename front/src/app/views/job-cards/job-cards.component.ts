import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { JobService } from 'src/app/services/job.service';

@Component({
  selector: 'app-job-cards',
  templateUrl: './job-cards.component.html',
  styleUrl: './job-cards.component.css'
})
export class JobCardsComponent {
  categories = [];
  categoriesCount: { [categories: string]: number } = {};
  idK: string | null = null;
  allCategories = [];
  login: number = 1;

  constructor(private route: ActivatedRoute, private router: Router, private cookieService: CookieService, private jobService: JobService) { }

  ngOnInit(): void {
    console.log("JobCards - ngOnInit: START")
    this.login = this.cookieService.get('userId') ? 1 : 0;
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
        this.initializeCategoriesCount();
        this.getMastersCount(this.categories);
      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje zanata):', error);
      });

    console.log("JobListing - getCraftmen: END")
  }

  categoryChoice(category) {
    sessionStorage.setItem('category', category);
    this.router.navigate(['/oglasi']);
    // this.router.navigate(['/oglasi'], { state: { category: category } });
  }

  onSearchInput(query: string): void {
    console.log(query);
    this.categories = this.allCategories.filter(category => category.toLowerCase().includes(query.toLowerCase()));
  }

  getMastersCount(categories) {
    const data = {
      jobsArray: categories
    }
    this.jobService.getMastersCount(data).subscribe((data: any) => {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        this.categoriesCount[data[i].profession] = data[i].count
      }
      console.log(this.categoriesCount);
    });
  }

  initializeCategoriesCount(): void {
    this.categoriesCount = this.categories.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as { [profession: string]: number });
  }

}
