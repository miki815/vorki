import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
})




export class ProfileComponent implements OnInit {
  constructor(private cookieService: CookieService, private userService: UserService) {}

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
  

  ngOnInit(): void {
    console.log("Profile - ngOnInit: START")
    this.getRate()
    const id = this.cookieService.get("token");
    const data = {id: id}
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

    const data1 = {idUser: localStorage.getItem("idProfile")}

    this.userService.getCommentById(data1).subscribe((message: any) => {
      var comments  = message["message"];
      comments.forEach(comm => {
        this.userService.getUserById({ id: comm.idCommentator }).subscribe((message: any) => {
          const data =  {
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

    console.log("Profile - ngOnInit: END")



   

  }

  addComment(){
    console.log("Profile - addComment: START")
    if (/^\s*$/.test( this.comment)) {return;}
    const data = {idCommentator: this.cookieService.get("token"), comment: this.comment, idUser: localStorage.getItem("idProfile"), dateC: new Date() }
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

  more() {
    this.visibleComments += 3;
  }

  less(){
    this.visibleComments -= 3;
    if(this.visibleComments< 1) this.visibleComments = 1;
  }

  setRating(rating) {
    this.rating = rating;
  }

  getRate(){
    this.userService.getRateByIdUser({idUser: localStorage.getItem("idProfile")}).subscribe((message: any) => {
      this.userRate = 0;
      message["message"].forEach(element => {
        this.userRate += parseInt(element.rate);
      });
      this.userRateLen =  message["message"].length;
      this.userService.getRateByIdUserAndRater( {idUser: localStorage.getItem("idProfile"), idCommentator: this.cookieService.get("token") }).subscribe((message: any) => {
        this.rating = parseInt(message["message"][0].rate);
      })


    })
  }

  rate(){
    console.log("Profile - rate: START")

    const data = {
      idUser:  localStorage.getItem("idProfile"),
      idCommentator: this.cookieService.get("token"),
      rate: this.rating
    }

    this.userService.rate(data).subscribe((message: any) => {
      this.getRate();
      console.log("Profile - rate: END")
    });

  }
}
