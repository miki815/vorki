import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { UserService } from "src/app/services/user.service";
import { GalleryModule, GalleryItem, ImageItem } from 'ng-gallery';
import { ActivatedRoute } from "@angular/router";
import { JobService } from "src/app/services/job.service";


@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  
})

export class ProfileComponent implements OnInit {
  constructor(private cookieService: CookieService, private userService: UserService,  private route: ActivatedRoute, private jobService: JobService) {}

  images: GalleryItem[] = [];
  email: string = null;
  username : string = null;
  firstname : string = null;
  lastname : string = null;
  birthday : Date = null;
  phone : string = null;
  location : string = null;
  ulogaK : boolean = null;
  ulogaM : boolean = null;
  photo : string = null;
  comments : any[] = [];
  comment : string = null;
  visibleComments: number = 3;
  rating: number = 0;
  userRate: number = 0;
  userRateLen: number = 0;
  cookie: string = "";
  idUser: string = "";
  imagesLoaded: boolean = false;
  jobs: Array<any>;
  allJobs: Array<any>;
  

  ngOnInit(): void {

    console.log("Profile - ngOnInit: START")

    this.route.paramMap.subscribe(params => {
      this.idUser = params.get('id');
    });
    this.cookie =  this.cookieService.get("token");
    this.userService.getGalleryById({idUser: this.idUser}).subscribe((message: any) => {
      var imgs =  message['message'];
      imgs.forEach(element => {
        this.images.push(new ImageItem({ src: element.urlPhoto, thumb: element.urlPhoto }));
        this.imagesLoaded = true;
      });
    })
    this.getRate()
   
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
       this.ulogaK =  message['message'].ulogaK;
       this.ulogaM =  message['message'].ulogaM;
       this.photo =  message['message'].photo;
       return;
      } 
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

    this.jobService.getJobsWithUserInfo2().subscribe((jobs: any) => {
      console.log(jobs)
      this.jobs = jobs;
      this.allJobs = jobs;
      this.jobs = this.allJobs.filter(job => job.idUser === parseInt(this.idUser));
    });

    console.log("Profile - ngOnInit: END")
  }

  addComment(){
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

  setRating(rating) {
    this.rating = rating;
  }

  getRate(){
    this.userService.getRateByIdUser({idUser: this.idUser}).subscribe((message: any) => {
      this.userRate = 0;
      message["message"].forEach(element => {
        this.userRate += parseInt(element.rate);
      });
      this.userRateLen =  message["message"].length;
      this.userService.getRateByIdUserAndRater( {idUser: this.idUser, idRater:  this.cookie}).subscribe((message: any) => {
        this.rating = parseInt(message["message"][0].rate);
      })


    })
  }

  rate(){
    console.log("Profile - rate: START")

    const data = {
      idUser:  this.idUser,
      idRater:  this.cookie,
      rate: this.rating
    }

    this.userService.rate(data).subscribe((message: any) => {
      this.getRate();
      console.log("Profile - rate: END")
    });

  }

  
  
 

}
