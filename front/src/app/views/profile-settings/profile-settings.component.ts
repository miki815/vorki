import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Gallery, GalleryItem, GalleryRef, GalleryState, ImageItem } from 'ng-gallery';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.css'
})
export class ProfileSettingsComponent {

  constructor(private gallery: Gallery,private cookieService: CookieService, private userService: UserService,private cdr: ChangeDetectorRef) {}

  

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
  
  galleryId = 'mixed';
  galleryRef: GalleryRef = this.gallery.ref(this.galleryId);

  password: string = "";
  password1: string = "";
  oldPassword: string = "";

  message: string = "";

  ngOnInit(): void {

    console.log("ProfileSettings - ngOnInit: START")

    this.cookie =  this.cookieService.get("token");
    this.cookie = "1";
    this.idUser = localStorage.getItem("idProfile");
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

  newphoto: string = "";
  

  loadPhoto(event,gal){
    const files = (event.target as HTMLInputElement).files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.substr(file.name.lastIndexOf('.') + 1);
        if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') {
            this.convertToBase64(file,gal);
        }
    }
   
}

  convertToBase64(file, gal){
      let ob=new Observable((subscriber)=>{
          this.readFile(file, subscriber)
      })
      ob.subscribe((ph: string)=>{
          this.newphoto=ph;
          if(!gal) this.photo = this.newphoto;
          if (gal) this.images.push(new ImageItem({ src:  this.newphoto, thumb: this.newphoto }));
          this.cdr.detectChanges(); // Osvežavanje komponente

      })
  }

  readFile(file, subscriber){
      let reader=new FileReader();
      reader.readAsDataURL(file);
      reader.onload=()=>{
          subscriber.next(reader.result);
          subscriber.complete(); // Ispravljena greška u nazivu metode complete()
      }
  }

  newPass(){
    if(!this.password || !this.password1 || !this.oldPassword){
      this.message = "Unesite sva polja.";
      return;
    }
    if(this.password!=this.password1){
      this.message = "Lozinke nisu iste.";
      return;
    }
    if (! /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{6,}$/.test(this.password)) {
      this.message = "Lozinka mora imati barem \
      jedno malo slovo, barem jedno veliko slovo, barem jedan broj i barem jedan specijalni karakter. Lozinka mora\
      imati najmanje 6 karaktera."; return;
    }
    const data = {
      idUser: this.cookie,
      password: this.oldPassword,
      newPassword: this.password
    }
    this.userService.changePassword(data).subscribe((message: any) => {
      if(message["message"].affectedRows){
        this.message = "Uspesno ste promenili lozinku."
      }else{
        this.message = "Niste uneli ispravnu lozinku."
      }
      this.password = "";
      this.password1 = "";
      this.oldPassword = "";
    })

    

  }


}
