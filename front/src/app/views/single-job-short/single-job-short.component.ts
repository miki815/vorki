import { Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-single-job-short',
    templateUrl: './single-job-short.component.html',
})
export class SingleJobShortComponent implements OnInit {
    @Input() job: any;
    @Input() currentPage: number;
    imageSrc: string;
    shortDescription: string = "";

    constructor(private router: Router, private userService: UserService, private cookieService: CookieService) { }

    ngOnInit(): void {
        this.imageSrc = this.job.photo;
        if (this.job.description) this.shortDescription = this.job.description.substring(0, 100) + '...';
    }

    locateToJob() {
        console.log("Navigating to job with ID:", this.job.id);
        sessionStorage.setItem('currentPage', this.currentPage.toString());
        const scrollPosition = window.scrollY || window.pageYOffset;
        sessionStorage.setItem('scrollPosition', scrollPosition.toString());
        const navigationExtras: NavigationExtras = {
            state: {
                job: this.job
            }
        };
        // this.router.navigate(['/oglasi/', this.job.id], navigationExtras);
        if (this.job.type == '1') this.router.navigate(['/oglasi/', this.job.id], navigationExtras);
        else {
            // next logic to track profile click
            if (this.job.idUser != this.cookieService.get("userId")) {
                this.userService.trackProfileClick({ userId: this.job.idUser }).subscribe({
                    next: (response) => {
                        this.router.navigate(['/profil/', this.job.idUser]);
                    },
                    error: (error) => {
                        console.error("Error tracking profile click:", error);
                    }
                });
            }
            else this.router.navigate(['/profil/', this.job.idUser]);
        }
    }

}
