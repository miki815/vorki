import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { UserService } from "src/app/services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { JobService } from "src/app/services/job.service";
import { end } from "@popperjs/core";
import { NotificationService } from "src/app/services/notification.service";
import { Gallery, GalleryItem, GalleryRef, GalleryState, ImageItem } from "ng-gallery";


@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrl: './profile.component.css'

})

export class ProfileComponent implements OnInit {
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
    backPhoto: string = "";
    instagram: string = "";
    facebook: string = "";
    jobOffers: Array<any>;
    myJobRequests: Array<any>;
    imagesLoaded: boolean = false;
    images: GalleryItem[] = [];
    imgIndex: number = 0;
    numberOfPhotos: number = 0;
    galleryId = 'mixed';
    galleryRef: GalleryRef = this.gallery.ref(this.galleryId);
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
    requestDetails = {
        time: '',
        additionalInfo: '',
        address: '',
        phone: ''
    };
    stars = [1, 2, 3, 4, 5];
    selectedRating = 0;

    // uri = 'http://127.0.0.1:4000'
    uri = 'https://vorki.rs';
    // uri = environment.uri;


    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';

        this.getToken();
        // this.getRate();
        this.getUser();
        this.getJobs();
        this.jobService.getJobsCountByStatus({ idUser: this.idUser, status: 'finished' }).subscribe((response: any) => {
            this.finishedJobs = response["count"];
        });
        this.jobService.getGalleryByIdUser(this.idUser).subscribe((imgs: any) => {
            imgs.forEach(element => {
                this.images.push(new ImageItem({ src: `${this.uri}${element.urlPhoto}`, thumb: `${this.uri}${element.urlPhoto}` }))
                this.galleryRef.add(new ImageItem({ src: `${this.uri}${element.urlPhoto}`, thumb: `${this.uri}${element.urlPhoto}` }))
                this.numberOfPhotos += 1;
            });
            if (this.numberOfPhotos > 0) this.imagesLoaded = true;
        });
        this.userService.getUserProfessionsById({ id: this.idUser }).subscribe((response: any) => {
            this.professions = response["message"];
            this.professionsString = this.professions.map((profession: any) => profession.profession).join(", ");
        });



    }

    getToken() {
        this.route.paramMap.subscribe(params => {
            this.cookie = this.cookieService.get("userId");
            this.idUser = params.get('id');
            console.log("ID User: " + this.idUser);
            if (this.cookie != this.idUser) {
                this.jobService.getRelationIfExists({ idUser: this.cookie, idMaster: this.idUser }).subscribe((response: any) => {
                    let status = response['result'][0].currentStatus;
                    if (!status) return;
                    if (status == "pending") {
                        this.isRequest = false;
                        this.requestMsg = "Čekam odgovor majstora";
                    } else if (status == "accepted") {
                        this.isRequest = false;
                        this.requestMsg = "Majstor je prihvatio ponudu!";
                    } else if (status == "declined") {
                        this.isRequest = true;
                        this.requestMsg = "Želim uslugu";
                    } else if (status == "canceled") {
                        this.isRequest = true;
                        this.requestMsg = "Želim uslugu";
                    } else if (status == "offer") {
                        this.isRequest = false;
                        this.requestMsg = "Zahtev poslat!";
                    }
                });
            }
        });
    }

    getRate() {

        this.userService.getRateByIdUser({ idUser: this.idUser }).subscribe((response: any) => {
            this.userRate = 0;
            response["message"].forEach(element => {
                this.userRate += parseInt(element.rate);
            });
            this.userRateLen = response["message"].length;
            if (this.userRateLen) {
                this.userRate = this.userRate / this.userRateLen;
            }
            this.userService.getRateByIdUserAndRater({ idUser: this.idUser, idRater: this.cookie }).subscribe((response: any) => {
                this.rating = parseInt(response["message"]);
            })
        })
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
                this.backPhoto = response['message'].backPhoto;
                this.instagram = response['message'].instagram;
                this.facebook = response['message'].facebook;
                this.userInfo = response['message'].info;
                this.userRate = response['message'].rate;
                this.phoneClicks = response['message'].phone_clicks;
                this.profileClicks = response['message'].profile_clicks;
                this.getJobRequests();
                return;
            }
        })
    }

    getJobs() {
        this.jobService.getJobsWithUserInfo2().subscribe((response: any) => {
            this.jobs = response.filter(job => job.idUser === parseInt(this.idUser));
            this.jobNumber = this.jobs.length;
        });
    }


    // Pages
    calendar() { this.router.navigate(["/kalendar"]); }
    settings() { this.router.navigate(["/podesavanje_profila"]); }
    jobs1() { this.router.navigate(['/oglasi']); } // TODO: Razmisliti sta treba ovde
    instagram1() { window.location.href = this.instagram; }
    facebook1() { window.location.href = this.facebook; }

    acceptRequest() { // prihvati
        const request = this.currRequest;
        this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'accepted' }).subscribe(() => {
            let job_status;
            if (this.type == '1') job_status = 'Čestitamo! Korisnik je izabrao vas da obavite njegov posao.';
            else job_status = 'Čestitamo! Stručnjak je prihvatio da obavi posao koji tražite.';
            this.notificationService.inform_user_of_master_accept_their_job({ job_title: 'Prihvacen zahtev za posao!', user_id: request.idUser, job_status: job_status }).subscribe(() => {
                request.currentStatus = 'accepted';
                this.isRequest = false;
                this.showModal = false;
            });
        });
    }

    declineRequest() { // odbij
        const request = this.currRequest;
        this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'declined' }).subscribe(() => {
            this.notificationService.inform_user_of_master_accept_their_job({ job_title: 'Odbijen zahtev za posao', user_id: request.idUser, job_status: 'Korisnik trenutno nije zainteresovan za vašu ponudu.' }).subscribe(() => {
                request.currentStatus = 'declined';
                this.showModal = false;
            });
        });
    }

    cancelRequest() { // otkazi
        // const now = new Date();
        // const startTime = new Date(request.startTime);
        // if (startTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
        //   alert("Nije moguće otkazati posao koji počinje za manje od 24h.");
        //   return;
        // }
        const request = this.currRequest;
        this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'canceled' }).subscribe(() => {
            this.notificationService.inform_user_of_master_accept_their_job({ job_title: 'Posao otkazan.', user_id: request.idUser, job_status: 'Nazalost, korisnik je otkazao dogovor sa vama.' }).subscribe(() => {
                request.currentStatus = 'canceled';
                this.showModal = false;
            });
        });
    }

    finishRequest() { // zavrsi
        const request = this.currRequest;
        this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'finished' }).subscribe(() => {
            request.currentStatus = 'finished';
            this.showModal = false;
        });
        this.userService.rate({ idUser: this.idUser == this.currRequest.idMaster ? this.currRequest.idUser : this.currRequest.idMaster, idRater: this.idUser, rate: this.selectedRating }).subscribe((response: any) => {
            request.rate = this.selectedRating;
            this.selectedRating = 0;
        });
    }


    convertToMySQLDate(isoDate) {
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Meseci su 0-indeksirani
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }


    getJobRequests() {
        this.jobService.getJobRequestsForUser(this.idUser).subscribe((response: any) => {
            this.myJobRequests = response;
        });
        this.jobService.getJobRequests(this.idUser).subscribe((response: any) => {
            // this.jobOffers = response.filter(job => job.currentStatus === 'offer');
            this.jobOffers = response;
        });
    }

    extractHoursAndMinutes(startTime: string): string {
        return new Date(startTime).getHours() + ':' + new Date(startTime).getMinutes();
    }

    extractDate(startTime: string): string {
        return new Date(startTime).toLocaleDateString('sr-RS', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    onIndexChange(event: GalleryState) {
        this.imgIndex = event.currIndex
    }

    sendOffer() {
        const data = { idJob: -1, idMaster: this.idUser, additionalInfo: this.requestDetails.additionalInfo, address: this.requestDetails.address, phone: this.requestDetails.phone, time: this.requestDetails.time };
        this.jobService.sendOffer(data).subscribe((message: any) => {
            this.isRequest = false;
            this.requestMsg = "Ponuda poslata!";
            this.showModal = false;
            this.notificationService.informMasterOfJob({ user_id: this.cookie, master_id: this.idUser, job_title: "Novi posao", type: this.type }).subscribe((message: any) => {
            });
        })
    }


    showDetails(request, isMasterOpen) {
        if (isMasterOpen) this.isMasterOpen = true;
        else this.isMasterOpen = false;
        this.currRequest = request;
        const local = new Date(request.startTime);
        this.requestDetails.time = local.toISOString().slice(0, 16);
        this.showModal = true;
        this.modalDisabled = true;
        // this.requestDetails.time = this.extractDate(request.startTime) + " " + this.extractHoursAndMinutes(request.startTime);
        this.requestDetails.address = request.location;
        this.requestDetails.phone = request.contact;
        this.requestDetails.additionalInfo = request.additionalInfo;
    }

    setRating(rating: number) {
        this.selectedRating = rating;
        console.log('Ocena:', this.selectedRating);
    }

    trackPhoneClick() {
        if(this.idUser === this.cookie) return; // Prevent tracking clicks on own profile
        this.userService.trackPhoneClick({ userId: this.idUser }).subscribe((response: any) => {
            if (response['error'] === '0') {
                console.log('Phone click tracked successfully');
            } else {
                console.error('Error tracking phone click:', response['message']);
            }
        });
    }


    /*addComment(){
      if(this.comment=="") return;
      if (/^\s*$/.test( this.comment)) return;
      const data = {idCommentator:  this.cookie, comment: this.comment, idUser:this.idUser, dateC: new Date() }
      this.userService.addComment(data).subscribe((message: any) => {
        this.userService.getUserById({ id: data.idCommentator }).subscribe((message: any) => {
          const data1 =  {
            comment : data.comment,
            idCommentator: data.idCommentator,
            dateC: data.dateC,
            photo:  message['message'].photo,
            username:  message['message'].username
          }
          this.comments.unshift(data1);
          this.comment = ""
          this.visibleComments += 1;
        });
      })
    }
  
    deleteComment(id){
  
      this.userService.deleteCommentById({id: id}).subscribe((message: any) => {
  
        const index = this.comments.findIndex(obj => obj.id === id);
        if (index !== -1) {
          this.comments.splice(index, 1);
        }
  
      })
  
  
    }
  
    more() {
      this.visibleComments += 3;
      if(this.visibleComments > this.comments.length) this.visibleComments = this.comments.length;
    }
  
    less(){
      this.visibleComments -= 3;
      if(this.visibleComments< 1) this.visibleComments = 1;
    }
  
  
     this.userService.getJobGallery(this.job.id).subscribe((message: any) => {
        var imgs =  message['message'];
        imgs.forEach(element => {
          this.images.push(new ImageItem({ src: element.urlPhoto, thumb: element.urlPhoto }));
          this.imagesLoaded = true;
        });
      })
     
      const data1 = {idUser: this.idUser}
  
      this.userService.getCommentById(data1).subscribe((message: any) => {
        var comments  = message["message"];
        comments.forEach(comm => {
          this.userService.getUserById({ id: comm.idCommentator }).subscribe((message: any) => {
            const data =  {
              id: comm.id,
              comment : comm.comment,
              idCommentator: comm.idCommentator,
              dateC: comm.dateC,
              photo:  message['message'].photo,
              username:  message['message'].username
            }
            this.comments.unshift(data)
          
          })
        
        });
      });
      
      */

}
