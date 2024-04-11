import { Component } from '@angular/core';
import { GalleryItem, GalleryState, ImageItem } from 'ng-gallery';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.css'
})
export class ProfileSettingsComponent {

  constructor(private cookieService: CookieService, private userService: UserService) {}

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
  birthdayDate : string = "";
  

  ngOnInit(): void {

    console.log("ProfileSettings - ngOnInit: START")

    this.cookie =  this.cookieService.get("token");
    this.idUser = localStorage.getItem("idProfile");
    this.cookie = "1";
    this.userService.getGalleryById({idUser: this.cookie}).subscribe((message: any) => {
      var imgs =  message['message'];
      imgs.forEach(element => {
        this.images.push(new ImageItem({ src: element.urlPhoto, thumb: element.urlPhoto }));
      });
      this.imagesLoaded = true;
    })

   
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
       this.birthday = new Date(this.birthday);
       this.birthdayDate = this.birthday.getFullYear() + "-" + (this.birthday.getMonth() + 1).toString().padStart(2, '0') + "-" + this.birthday.getDate().toString().padStart(2, '0');
       return;
      } 
     
    })

    const data1 = {idUser: this.idUser}

  
    console.log("ProfileSettings - ngOnInit: END")
  }

  imgIndex : number = 0;
  delete(){
    alert(this.imgIndex);
  }


  onIndexChange(event: GalleryState) {
    this.imgIndex = event.currIndex
  }
}
