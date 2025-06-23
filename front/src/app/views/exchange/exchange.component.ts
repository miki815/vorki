import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { UserService } from "src/app/services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { JobService } from "src/app/services/job.service";
import { end } from "@popperjs/core";
import { NotificationService } from "src/app/services/notification.service";
import { Gallery, GalleryItem, GalleryRef, GalleryState, ImageItem } from "ng-gallery";

@Component({
    selector: 'app-exchange',
    templateUrl: './exchange.component.html',
    styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit {
    constructor(private cookieService: CookieService, private router: Router, private userService: UserService, private route: ActivatedRoute, private jobService: JobService, private notificationService: NotificationService, private gallery: Gallery) { }

    email: string = null;
    username: string = null;
    firstname: string = null;
    lastname: string = null;
    birthday: Date = null;
    phone: string = null;
    location: string = null;
    type: string = null;
    photo: string = null;
    rating: number = 0;
    userRate: number = 0;
    userRateLen: number = 0;
    cookie: string = "";
    idUser: string = "";
    jobs: Array<any>;
    jobNumber: number = 0;
    allJobs: Array<any>;
    jobOffers: Array<any>;
    sendJobOffers: Array<any>;
    receivedJobOffers: Array<any>;
    myJobRequests: Array<any>;
    finishedJobs: number = 0;
    professions: Array<any>;
    professionsString: string = "";
    userInfo: string = "";
    isRequest: boolean = true;
    requestMsg: string = "Želim uslugu";
    showModal = false;
    modalDisabled = false;
    currRequest: any = null;
    isMasterOpen: boolean = false;
    phoneClicks: number = 0;
    profileClicks: number = 0;
    stars = [1, 2, 3, 4, 5];
    selectedRating = 0;
    showOffer: boolean = false;
    activeTab: 'berza' | 'mojePonude' | 'primljenePonude' = 'berza';

    // uri = 'http://127.0.0.1:4000'
    uri = 'https://vorki.rs';
    // uri = environment.uri;


    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.getToken();
        this.getUser();
        this.getJobs();
        this.getJobOffers();
        this.jobService.getJobsCountByStatus({ idUser: this.idUser, status: 'finished' }).subscribe((response: any) => {
            this.finishedJobs = response["count"];
        });
    }

    getToken() {
        this.route.paramMap.subscribe(params => {
            this.cookie = this.cookieService.get("userId");
            this.idUser = this.cookie;
        });
    }

    getUser() {
        const data = { id: this.idUser }
        this.userService.getUserById(data).subscribe((response: any) => {
            if (response['error'] == "0") {
                this.email = response['message'].email;
                this.username = response['message'].username;
                this.firstname = response['message'].firstname;
                this.lastname = response['message'].lastname;
                this.birthday = response['message'].birthday;
                this.phone = response['message'].phone;
                this.location = response['message'].location;
                this.type = response['message'].type;
                this.photo = response['message'].photo;
                this.userInfo = response['message'].info;
                this.userRate = response['message'].rate;
                this.phoneClicks = response['message'].phone_clicks;
                this.profileClicks = response['message'].profile_clicks;
                return;
            }
        })
    }

    getJobs() {
        this.jobService.get_exchange_and_user_info().subscribe((response: any) => {
            this.jobs = response
            this.jobNumber = this.jobs.length
        })
    }


    showDetails(request) {
        this.currRequest = request
        this.currRequest.pickupMethod = request.address == "L" ? "Lično preuzimanje" : "Dostava: " + this.currRequest.address;
        this.showModal = true
        this.modalDisabled = true
    }

    showOfferDetails(request) {
        this.currRequest = request
        this.currRequest.description = request.additionalInfo
        this.currRequest.phone = request.contact
        this.currRequest.pickupMethod = request.location == "L" ? "Lično preuzimanje" : "Dostava: " + this.currRequest.location;
        this.showModal = true
        this.modalDisabled = true
    }

    showOfferInfo(request) {
        this.currRequest = request
        this.showOffer = true
        this.modalDisabled = true
    }

    sendOffer() {
        console.log("Sending offer with details: " + JSON.stringify(this.currRequest));
        const data = { idJob: this.currRequest.id, idMaster: this.currRequest.idUser, additionalInfo: this.currRequest.description, address: this.currRequest.address, phone: this.currRequest.phone, price: this.currRequest.price };
        this.jobService.sendExchangeOffer(data).subscribe((message: any) => {
            this.isRequest = false;
            this.requestMsg = "Ponuda poslata!";
            this.showModal = false;
            this.showOffer = false;
            // this.notificationService.informMasterOfJob({ user_id: this.cookie, master_id: this.idUser, job_title: "Novi posao", type: this.type }).subscribe((message: any) => {
            // });
        })
    }

    getJobOffers() {
        this.jobService.getJobRequestsForUser(this.idUser).subscribe((response: any) => {
            this.sendJobOffers = response.filter((offer: any) => offer.currentStatus?.startsWith('ex'))
            this.jobService.getJobRequests(this.idUser).subscribe((response: any) => {
                this.receivedJobOffers = response.filter((offer: any) => offer.currentStatus?.startsWith('ex'))
                // console.log("OFFERS" + JSON.stringify(this.receivedJobOffers))
            })
        })
    }

    acceptRequest(request) { // prihvati
        this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'exaccepted' }).subscribe(() => {
            const job_status = 'Čestitamo! Korisnik je prihvatio vašu ponudu za materijal.';
            this.notificationService.inform_user_of_master_accept_their_job({
                job_title: 'Prihvacena ponuda za materijal!',
                user_id: request.idUser, job_status: job_status
            }).subscribe(() => {
                request.currentStatus = 'exaccepted';
                this.isRequest = false;
                this.showModal = false;
            });
        });
    }

    declineRequest(request) { // odbij
        this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'exdeclined' }).subscribe(() => {
            this.notificationService.inform_user_of_master_accept_their_job({
                job_title: 'Odbijena ponuda za materijal', user_id: request.idUser,
                job_status: 'Korisnik trenutno nije zainteresovan za vašu ponudu.'
            }).subscribe(() => {
                request.currentStatus = 'exdeclined';
                this.showModal = false;
            });
        });
    }
}
