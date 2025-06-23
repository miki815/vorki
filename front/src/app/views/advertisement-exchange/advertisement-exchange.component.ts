import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { JobService } from "src/app/services/job.service";
import { NotificationService } from "src/app/services/notification.service";
import { UserService } from "src/app/services/user.service";

@Component({
    selector: 'app-advertisement-exchange',
    templateUrl: './advertisement-exchange.component.html',
    styleUrls: ['./advertisement-exchange.component.css']
})
export class AdvertisementExchangeComponent implements OnInit {
    title: string = null;
    description: string = null;
    cities = [];
    shops = ["Farbara", "Stovarište", "Elektroradnja"];
    selectedCity: string = "";
    selectedShop: string = "";
    professions = [];
    selectedProfession: string = "";
    poruka: string = null;
    bgcolor: string = "rgb(239, 114, 114)";
    imagePreviews: string[] = [];
    searchQuery = '';
    searchQueryProf = '';
    filteredCities: any;
    filteredProfessions: string[] = [];
    filteredShops: string[] = ["Farbara", "Stovarište", "Elektroradnja"];
    jobType: number;
    jobAddress: string = null;
    isDelivery: string = '0';
    exchangeItem: string = '';
    items: string[] = [];
    // uri = 'http://127.0.0.1:4000'
    uri = 'https://vorki.rs';
    // uri = environment.uri;

    constructor(private jobService: JobService, private router: Router, private userService: UserService, private http: HttpClient, private cookieService: CookieService, private notificationService: NotificationService) {

    }

    ngOnInit(): void {
        fetch('assets/city.json')
            .then(response => response.json())
            .then(cities => {
                this.cities = cities;
                this.cities.sort((a, b) => a.city.localeCompare(b.city));
                this.filteredCities = this.cities;
            })
            .catch(error => {
            });

        fetch('assets/craftsmen.json')
            .then(response => response.json())
            .then(professions => {
                this.professions = [...professions.craftsmen, ...professions.services, ...professions.transport];
                this.professions.sort((a, b) => a.localeCompare(b));
                this.filteredProfessions = this.professions;
            })
            .catch(error => {
            });
    }

    addItem() {
        console.log(this.exchangeItem);
        if (this.exchangeItem.trim()) {
            this.items.push(this.exchangeItem.trim());
            this.exchangeItem = '';
        }
    }

    removeItem(index: number) {
        this.items.splice(index, 1);
    }


    insertExchangeJob() {
        // Provera
        if (!this.selectedShop || this.items.length === 0 || (this.isDelivery== '1' && (!this.jobAddress || !this.selectedCity))) {
            this.poruka = "Niste uneli sve podatke.";
            this.bgcolor = "rgb(239, 114, 114)";
            return;
        }
        const data = {
            description: this.items.join(", "),
            title: "Berza",
            city: this.selectedCity || "L",
            profession: this.selectedShop,
            type: "2",
            address: this.jobAddress || "L",
        }
        //Slanje
        this.jobService.insertJob(data).subscribe((message: any) => {
            if (message['message'] == 0) {
                const job_id = message['job_id'];
                console.log("Job inserted with ID: " + job_id);
                // this.notificationService.newJobNotification({ user_id: this.cookieService.get('userId'), job_id: message['job_id'], job_title: this.title, job_location: this.selectedCity, job_profession: this.selectedShop }).subscribe((message: any) => {
                //     this.router.navigate(['/oglasi/' + job_id]);
                // });
            }
        })

    }

    onImageChange(event: any) {
        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        const MAX_IMAGES = 4;
        const files = event.target.files;
        if (files) {
            this.imagePreviews = [];
            const selectedFiles = Array.from(files).slice(0, MAX_IMAGES);

            selectedFiles.forEach((file: File) => {
                if (file.size > MAX_SIZE) {
                    alert(`Slika ${file.name} je prevelika! Maksimalna dozvoljena veličina je 2MB.`);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.imagePreviews.push(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        }
    }

   

    filterCities() {
        this.filteredCities = this.cities.filter(city =>
            this.normalizeString(city.city).includes(this.normalizeString(this.searchQuery))
        );
    }

    filterProfessions() {
        this.filteredProfessions = this.professions.filter((profession) =>
            this.normalizeString(profession).includes(this.normalizeString(this.searchQueryProf))
        );
    }

    normalizeString(input: string): string {
        return input
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    test() {
        var rezultati = [];
        var provera = [0, -1, -1]
        fetch('assets/login_test.json')
            .then(response => response.json())
            .then(testovi1 => {
                testovi1.forEach((test) => {
                    if (!this.description || !this.title) {
                        rezultati.push(-1);
                    }
                    else { rezultati.push(0); }
                });

                if (rezultati.length !== provera.length) {
                    alert("Prijava - test: FAILED")
                    return;
                }
                if (rezultati.every((element, index) => element === provera[index])) {
                    alert("Prijava - test: FAILED")
                    return;
                }
                alert("Prijava - test: PASS");
            })
            .catch(error => {

            });
    }
}
