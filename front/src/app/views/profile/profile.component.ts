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
  // uri = 'http://127.0.0.1:4000'
  uri = 'https://vorki.rs';
  // uri = environment.uri;


  ngOnInit(): void {
    console.log("Profile - ngOnInit: START")
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';

    this.getToken();
    this.getRate();
    this.getUser();
    this.getJobs();
    this.jobService.getJobsCountByStatus({ idUser: this.idUser, status: 'finished' }).subscribe((response: any) => {
      this.finishedJobs = response["count"];
    });
    this.jobService.getGalleryByIdUser(this.idUser).subscribe((imgs: any) => {
      console.log(imgs);
      imgs.forEach(element => {
        console.log(element.urlPhoto)
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



    console.log("Profile - ngOnInit: END")
  }

  getToken() {
    console.log("Profile - getToken: START")
    this.route.paramMap.subscribe(params => {
      this.cookie = this.cookieService.get("userId");
      this.idUser = params.get('id');
    });
    console.log("Profile - getToken: END")
  }

  getRate() {
    console.log("Profile - getRate: START")

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
      console.log("Profile - getRate: END")
    })
  }

  getUser() {
    console.log("Profile - getUser: START")

    const data = { id: this.idUser }
    this.userService.getUserById(data).subscribe((response: any) => {
      if (response['error'] == "0") {
        console.log(response['message'])
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
        this.getJobRequests();
        console.log("Profile - getUser: END")
        return;
      }
    })
  }

  getJobs() {
    console.log("Profile - getJobs: START")

    this.jobService.getJobsWithUserInfo2().subscribe((response: any) => {
      this.jobs = response.filter(job => job.idUser === parseInt(this.idUser));
      this.jobNumber = this.jobs.length;
    });

    console.log("Profile - getJobs: END")
  }


  // Pages
  calendar() { this.router.navigate(["/kalendar"]); }
  settings() { this.router.navigate(["/podesavanje_profila"]); }
  jobs1() { this.router.navigate(['/oglasi']); } // TODO: Razmisliti sta treba ovde
  instagram1() { window.location.href = this.instagram; }
  facebook1() { window.location.href = this.facebook; }

  acceptRequest(request) {
    console.log("Profile - acceptRequest: START");
    this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'accepted' }).subscribe(() => {
      this.notificationService.inform_user_of_master_accept_their_job({ job_title: 'Prihvacen zahtev za posao!', user_id: request.idUser, job_status: 'Čestitamo! Korisnik je izabrao vas da obavite njegov posao.' }).subscribe(() => {
        console.log("Notification sent");
        request.currentStatus = 'accepted';
      });
    });

    console.log("Profile - acceptRequest: END");
  }

  declineRequest(request) { // odbij
    console.log("Profile - declineRequest: START");
    this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'declined' }).subscribe(() => {
      this.notificationService.inform_user_of_master_accept_their_job({ job_title: 'Odbijen zahtev za posao', user_id: request.idUser, job_status: 'Majstor trenutno ne moze da odradi vas posao.' }).subscribe(() => {
        console.log("Notification sent");
        request.currentStatus = 'declined';
      });
    });
    console.log("Profile - declineRequest: END");
  }

  cancelRequest(request) { // otkazi
    console.log("Profile - cancelRequest: START");
    const now = new Date();
    const startTime = new Date(request.startTime);
    if (startTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      alert("Nije moguće otkazati posao koji počinje za manje od 24h.");
      return;
    }
    this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'canceled' }).subscribe(() => {
      this.notificationService.inform_user_of_master_accept_their_job({ job_title: 'Posao otkazan.', user_id: request.idUser, job_status: 'Nazalost, majstor je otkazao dogovor sa vama.' }).subscribe(() => {
        console.log("Notification sent");
        request.currentStatus = 'canceled';
      });
    });
    console.log("Profile - cancelRequest: END");
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
    console.log("Type " + this.type);
    this.jobService.getJobRequestsForUser(this.idUser).subscribe((response: any) => {
      for (let i = 0; i < response.length; i++) {
        const date = new Date(response[i].startTime);
        if (response[i].currentStatus === 'pending') {
          response[i].startTime = date.toLocaleDateString('sr-RS', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
        else {
          response[i].startTime = date.getHours() + ':' + date.getMinutes();
        }
      }
      this.myJobRequests = response;
    });
    this.jobService.getJobRequests(this.idUser).subscribe((response: any) => {
      this.jobOffers = response.filter(job => job.currentStatus === 'offer');
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

  /*addComment(){
    console.log("Profile - addComment: START")
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
      console.log("Profile - addComment: END")
    })
  }

  deleteComment(id){
    console.log("Profile - deleteComment: START")

    this.userService.deleteCommentById({id: id}).subscribe((message: any) => {

      const index = this.comments.findIndex(obj => obj.id === id);
      if (index !== -1) {
        this.comments.splice(index, 1);
      }

    })

    console.log("Profile - deleteComment: END")

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
