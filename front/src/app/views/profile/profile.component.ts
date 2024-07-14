import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { UserService } from "src/app/services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { JobService } from "src/app/services/job.service";


@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  
})

export class ProfileComponent implements OnInit {
  constructor(private cookieService: CookieService, private router: Router, private userService: UserService,  private route: ActivatedRoute, private jobService: JobService) {}

  email: string = null;
  username : string = null;
  firstname : string = null;
  lastname : string = null;
  birthday : Date = null;
  phone : string = null;
  location : string = null;
  type : string = null;
  photo : string = null;
  // comments : any[] = [];
  // comment : string = null;
  // visibleComments: number = 3;
  rating: number = 0;
  userRate: number = 0;
  userRateLen: number = 0;
  cookie: string = "";
  idUser: string = "";
  // imagesLoaded: boolean = false;
  jobs: Array<any>;
  jobNumber: number = 0;
  allJobs: Array<any>;
  backPhoto: string = "";


  ngOnInit(): void {
    console.log("Profile - ngOnInit: START")

    this.getToken();
    this.getRate();
    this.getUser();
    this.getJobs();
   
    console.log("Profile - ngOnInit: END")
  }

  getToken(){
    console.log("Profile - getToken: START")

    this.route.paramMap.subscribe(params => {
      this.idUser = params.get('id');
    });
    this.cookie =  this.cookieService.get("token");

    console.log("Profile - getToken: END")

  }

  getRate(){
    console.log("Profile - getRate: START")

    this.userService.getRateByIdUser({idUser: this.idUser}).subscribe((message: any) => {
      this.userRate = 0;
      message["message"].forEach(element => {
        this.userRate += parseInt(element.rate);
      });
      this.userRateLen =  message["message"].length;
      this.userRate = this.userRate / this.userRateLen;
      this.userService.getRateByIdUserAndRater( {idUser: this.idUser, idRater:  this.cookie}).subscribe((message: any) => {
        this.rating = parseInt(message["message"][0].rate);
      })
      console.log("Profile - getRate: END")
    })
  }

  getUser(){
    console.log("Profile - getUser: START")

    const data = {id:  this.cookie}
    this.userService.getUserById(data).subscribe((message: any) => {
      if (message['error'] == "0") {
       console.log(message['message'])
       this.email =  message['message'].email;
       this.username =  message['message'].username;
       this.firstname =  message['message'].firstname;
       this.lastname =  message['message'].lastname;
       this.birthday =  message['message'].birthday;
       this.phone =  message['message'].phone;
       this.location =  message['message'].location;
       this.type =  message['message'].type;
       this.photo =  message['message'].photo;
       this.backPhoto =  message['message'].backPhoto;

       console.log("Profile - getUser: END")
       return;
      } 
    })
  }

  getJobs(){ // TODO: Dodati servis samo za dohvatanje broja poslova
    console.log("Profile - getJobs: START")

    this.jobService.getJobsWithUserInfo2().subscribe((jobs: any) => { 
      this.jobs = jobs.filter(job => job.idUser === parseInt(this.idUser));
      this.jobNumber = this.jobs.length;
    });

    console.log("Profile - getJobs: END")
  }

  rate(){
    console.log("Profile - rate: START")

    const data = {
      idUser:  this.idUser,
      idRater:  this.cookie,
      rate: this.rating
    }

    this.userService.rate(data).subscribe(() => {
      this.getRate();
      console.log("Profile - rate: END")
    });

  }

  setRating(rating) {this.rating = rating;}


  // Pages
  calendar(){this.router.navigate(["/kalendar"]);}
  settings(){this.router.navigate(["/podesavanje_profila"]);}
  jobs1(){ this.router.navigate(["/mojiOglasi"]);}

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
