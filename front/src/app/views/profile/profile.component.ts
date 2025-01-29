import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { UserService } from "src/app/services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { JobService } from "src/app/services/job.service";
import { end } from "@popperjs/core";


@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrl: './profile.component.css'

})

export class ProfileComponent implements OnInit {
  constructor(private cookieService: CookieService, private router: Router, private userService: UserService, private route: ActivatedRoute, private jobService: JobService) { }

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
  jobRequests: Array<any>;

  ngOnInit(): void {
    console.log("Profile - ngOnInit: START")

    this.getToken();
    this.getRate();
    this.getUser();
    this.getJobs();


    console.log("Profile - ngOnInit: END")
  }

  getToken() {
    console.log("Profile - getToken: START")
    this.route.paramMap.subscribe(params => {
      this.cookie = this.cookieService.get("token");
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
        this.getJobRequests();
        console.log("Profile - getUser: END")
        return;
      }
    })
  }

  getJobs() { // TODO: Dodati servis samo za dohvatanje broja poslova
    console.log("Profile - getJobs: START")

    this.jobService.getJobsWithUserInfo2().subscribe((response: any) => {
      this.jobs = response.filter(job => job.idUser === parseInt(this.idUser));
      this.jobNumber = this.jobs.length;
    });

    console.log("Profile - getJobs: END")
  }

  // rate(){
  //   console.log("Profile - rate: START")

  //   const data = {
  //     idUser:  this.idUser,
  //     idRater:  this.cookie,
  //     rate: this.rating
  //   }

  //   this.userService.rate(data).subscribe(() => {
  //     this.getRate();
  //     console.log("Profile - rate: END")
  //   });

  // }

  // setRating(rating) {this.rating = rating;}


  // Pages
  calendar() { this.router.navigate(["/kalendar"]); }
  settings() { this.router.navigate(["/podesavanje_profila"]); }
  jobs1() { this.router.navigate(['/oglasi'], { queryParams: { idU: this.idUser } }); } // TODO: Razmisliti sta treba ovde
  instagram1() { window.location.href = this.instagram; }
  facebook1() { window.location.href = this.facebook; }

  acceptRequest(request) {
    console.log("Profile - acceptRequest: START");
    let [hours, minutes] = request.endTime.split(':').map(Number);
    let [day, month, year] = request.startTime.split('.').map(Number);
    const startDate = new Date(request.startTime);
    startDate.setFullYear(year, month - 1, day);
    startDate.setHours(hours, minutes);
    this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'accepted', startTime: this.convertToMySQLDate(startDate) }).subscribe(() => {
      // TODO: Dodati notifikaciju
    });

    console.log("Profile - acceptRequest: END");
  }

  declineRequest(request) {
    console.log("Profile - declineRequest: START");
    this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'declined', startTime: null }).subscribe(() => {
      // TODO: Dodati notifikaciju
    });
    console.log("Profile - declineRequest: END");
  }

  cancelRequest(request) {
    console.log("Profile - cancelRequest: START");
    const now = new Date();
    const startTime = new Date(request.startTime);
    if (startTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      alert("Nije moguće otkazati posao koji počinje za manje od 24h.");
      return;
    }
    this.jobService.updateAgreement({ idAgreements: request.idAgreements, status: 'canceled', startTime: null }).subscribe(() => {
      // TODO: Dodati notifikaciju
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
    if (this.type == '0') {
      console.log("Master type");
      this.jobService.getJobRequests(this.idUser).subscribe((response: any) => {
        console.log(response);
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
        this.jobRequests = response;
        for (let i = 0; i < this.jobRequests.length; i++) {
          console.log(this.jobRequests[i].startTime);
        }
      });
    }
    else {
      this.jobService.getJobRequestsForUser(this.idUser).subscribe((response: any) => {
        console.log(response);
        // for (let i = 0; i < response.length; i++) {
        //   const date = new Date(response[i].startTime);
          // if (response[i].currentStatus === 'pending') {
            // response[i].startTime = date.toLocaleDateString('sr-RS', {
            //   day: '2-digit',
            //   month: '2-digit',
            //   year: 'numeric'
            // });
          // }
          // else {
          //   response[i].startTime = date.getHours() + ':' + date.getMinutes();
          // }
        // }
        this.jobRequests = response;
        for (let i = 0; i < this.jobRequests.length; i++) {
          console.log(this.jobRequests[i].startTime);
        }
      });
    }
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


   this.userService.getGalleryById({idUser: this.idUser}).subscribe((message: any) => {
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
