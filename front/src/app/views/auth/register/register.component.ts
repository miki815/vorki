import { Component, OnInit, ElementRef, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "src/app/services/user.service";
// import * as bcrypt from 'bcryptjs';
import { NotificationService } from "src/app/services/notification.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  constructor(private userService: UserService, private router: Router, private elementRef: ElementRef, private notificationService: NotificationService) { }

  username: string = null;
  name: string = null;
  surname: string = null;
  birthday: Date = null;
  telephone: string = null;
  location: string = null;
  type: string = null;
  password: string = null;
  password1: string = null;
  policy: boolean = null;
  notification: boolean = null;
  email: string = null;
  message: string = null;
  cities: any;
  professions: string[] = [];
  filteredProfessions: string[] = [];
  selectedProfessions: string[] = [];
  searchTerm: string = '';
  isDropdownVisible: boolean = false
  idUser: string = null;
  filteredCities: any;
  searchQuery = '';

  ngOnInit(): void {
    console.log('Register - ngOnInit: START')

    this.getCities();
    this.getCraftmen();

    console.log('Register - ngOnInit: END')
  }

  getCities() {
    console.log('Register - getCities: START')

    fetch('assets/city.json')
      .then(response => response.json())
      .then(cities => {
        this.cities = cities.sort((a, b) => a.city.localeCompare(b.city));
        this.filteredCities = this.cities;
        this.location = this.cities[0].city;
      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje gradiva):', error);
      });

    console.log('Register - getCities: END')
  }


  async hashPassword(plainPassword: string): Promise<string> {
    // const salt = await bcrypt.genSalt(10);
    // return await bcrypt.hash(plainPassword, salt);
    return "hashedPasswordTODO";
  }

  submit() {
    console.log('Register - submit: START')

    if (!this.verifyRequest()) return;

    // SEND
    fetch('assets/backPhoto.txt')
      .then(response => response.text())
      .then(backPhoto => {
        this.hashPassword(this.password).then(hashedPassword => {
          const data = {
            username: this.username,
            password: this.password,
            location: this.location,
            type: this.type,
            email: this.email.toLowerCase(),
            backPhoto: backPhoto,
            selectedProfessions: this.selectedProfessions
          }

          this.userService.register(data).subscribe((response: any) => {
            if (response['error'] == "0") {
              if (this.notification) {
                this.idUser = response['idUser'];
                this.notificationService.subscribeToNotifications(this.idUser);
              }
              this.router.navigate(["/autentikacija/prijava"]);
            } else {
              this.message = response['message'];
            }
            console.log('Register - submit: END')
          })
        });
      })
  }

  verifyRequest() {
    if (!this.username ||  !this.policy || !this.location || (!this.type) || !this.password || !this.password1 || !this.email) {
      this.message = "Niste uneli sve podatke."; false;
    }
    if (this.username.length < 3) { this.message = "Korisničko ime je prekratko, mora imati najmanje 3 karaktera."; return false; }
    if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.email)) { this.message = "Email nije u dobrom formatu."; return false; }
    // if (this.name.length < 2) { this.message = "Ime je prekratko, mora imati najmanje 2 karaktera."; return false; }
    // if (this.surname.length < 2) { this.message = "Prezime je prekratko, mora imati najmanje 2 karaktera."; return false; }
    // if (new Date(this.birthday).getFullYear() < 1930) { this.message = "Unesite ispravno godinu rođenja."; return false; }
    // if (new Date(this.birthday) > new Date((new Date()).getFullYear() - 18, (new Date()).getMonth(), (new Date()).getDate())) { this.message = "Morate biti punoletni."; return false; }
    // if (!/^381\d{8,9}$/.test(this.telephone.slice(1)) || this.telephone[0] != "+") { this.message = "Mobilni telefon nije u dobrom formatu. Format: +381XXXXXXXXX"; return false; }
    // if (! /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{6,}$/.test(this.password)) {
    //   this.message = "Lozinka mora imati barem \
    //   jedno malo slovo, jedno veliko slovo, jedan broj i jedan specijalni (@#$%^&*()\-_=+{};:,<.>) karakter. Lozinka mora\
    //   imati najmanje 6 karaktera."; return false;
    // }
    if (this.password.length < 8) {
      this.message = "Lozinka mora imati najmanje 8 karaktera.";
      return false;
    }
    if (this.password != this.password1) { this.message = "Lozinke nisu iste."; return false; }
    return true;
  }

  filterProfessions() {
    console.log('Register - filterProfessions: START')
    console.log('Search term:', this.searchTerm)
    // this.filteredProfessions = this.professions.filter((profession) =>
    //   profession.toLowerCase().includes(this.searchTerm.toLowerCase())
    // );
    this.filteredProfessions = this.professions.filter((profession) =>
      this.normalizeString(profession).includes(this.normalizeString(this.searchTerm))
    );
  }

  filterCities() {
    console.log('Register - filterCities: START')
    // this.filteredCities = this.cities.filter(city =>
    //   city.city.toLowerCase().includes(this.searchQuery.toLowerCase())
    // );
    this.filteredCities = this.cities.filter(city =>
      this.normalizeString(city.city).includes(this.normalizeString(this.searchQuery))
    );
  }

  toggleSelection(profession: string) {
    if (this.selectedProfessions.includes(profession)) {
      this.selectedProfessions = this.selectedProfessions.filter(
        (p) => p !== profession
      );
    } else {
      this.selectedProfessions.push(profession);
    }
    // this.registrationForm.get('selectedProfessions')?.setValue(this.selectedProfessions);
  }

  getCraftmen() {
    console.log("JobListing - getCraftmen: START")

    fetch('assets/craftsmen.json')
      .then(response => response.json())
      .then(professions => {
        this.professions = this.professions = [...professions.craftsmen, ...professions.services, ...professions.transport];
        ;
        this.professions.sort((a, b) => a.localeCompare(b));
        // this.filteredProfessions = this.professions;
      })
      .catch(error => {
        console.error('Došlo je do greške prilikom učitavanja JSON fajla (učitavanje zanata):', error);
      });

    console.log("JobListing - getCraftmen: END")
  }

  showProfessions() {
    this.isDropdownVisible = true;
    this.filteredProfessions = this.professions;
  }

  hideProfessions() {
    this.isDropdownVisible = false;
    this.filteredProfessions = [];
  }

  normalizeString(input: string): string {
    return input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }
}
