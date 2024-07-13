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
  type : string = null;
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
  poruka : string = ""; // dodao da ne izbacuje gresku
  backPhoto : string = null;

  galleryId = 'mixed';
  galleryRef: GalleryRef = this.gallery.ref(this.galleryId);

  password: string = "";
  password1: string = "";
  oldPassword: string = "";

 
  numberOfPhotos: number = 0;

  err: boolean = false;
  notErr: boolean = false;
  message: string = "";

  imgIndex : number = 0;
  newphoto: string = "";


  ngOnInit(): void {

    console.log("ProfileSettings - ngOnInit: START")

    this.cookie =  this.cookieService.get("token");
    this.cookie = "1";
    this.idUser = localStorage.getItem("idProfile");
    this.userService.getGalleryById({idUser: this.cookie}).subscribe((message: any) => {
      var imgs =  message['message'];
      imgs.forEach(element => {
        this.galleryRef.add(new ImageItem({ src: element.urlPhoto, thumb: element.urlPhoto }))
        this.numberOfPhotos += 1;
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
       this.type =  message['message'].type;
       this.photo =  message['message'].photo;
       this.birthday = new Date(this.birthday);
       this.backPhoto =  message['message'].backPhoto;
       this.birthdayDate = this.birthday.getFullYear() + "-" + (this.birthday.getMonth() + 1).toString().padStart(2, '0') + "-" + this.birthday.getDate().toString().padStart(2, '0');
       return;
      } 
     
    })
    console.log("ProfileSettings - ngOnInit: END")
  }

  delete(){
    this.galleryRef.remove(this.imgIndex);
    this.numberOfPhotos -=1 ;
  }


  onIndexChange(event: GalleryState) {
    this.imgIndex = event.currIndex
  }

  loadPhoto(event,back){
    const files = (event.target as HTMLInputElement).files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.substr(file.name.lastIndexOf('.') + 1);
        if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') {
            this.convertToBase64(file,back);
            //if(gal) this.galleryRef.prev();
        }
    }
   
}

  convertToBase64(file, back) {
    let ob = new Observable((subscriber) => {
        this.resizeImage(file, 800, 600, (resizedFile) => {
            this.readFile(resizedFile, subscriber);
        });
    });
    ob.subscribe((ph: string) => {
        this.newphoto = ph;
        if (!back) this.photo = this.newphoto;
        else{
          this.backPhoto = this.newphoto;
        } 
    });
  }

  resizeImage(file, maxWidth, maxHeight, callback) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        let img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > maxWidth || height > maxHeight) {
                let ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                callback(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            }, 'image/jpeg');
        };
    };
  }



  readFile(file, subscriber){
      let reader=new FileReader();
      reader.readAsDataURL(file);
      reader.onload=()=>{
          subscriber.next(reader.result);
          subscriber.complete(); 
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

  updateGallery(){
    const imgs=[]
    this.galleryRef.stateSnapshot.items.forEach(element => {
      imgs.push(element.data.src)
    });

    const data = {
      images: imgs,
      idUser: this.idUser
    }
    this.userService.updateGallery(data).subscribe((message: any) => {
    })
  }

  update(){
    this.userService.getIdByEmail({email: this.email}).subscribe((message: any) => {
      if(message["message"].length && message["message"][0].id!=this.idUser){ this.message="Email već postoji."}
      this.userService.getIdByUsername({username: this.username}).subscribe((message: any) => {
        if(message["message"].length && message["message"][0].id!=this.idUser){ this.message="Korisničko ime već postoji."}
        if (this.username.length < 3) { this.message = "Korisničko ime je prekratko."; return; }
        if (this.firstname.length < 3) { this.message = "Ime je prekratko."; return; }
        if (this.lastname.length < 3) { this.message = "Prezime je prekratko."; return; }
        if (this.birthday > new Date((new Date()).getFullYear() - 18, (new Date()).getMonth(), (new Date()).getDate())) { this.message = "Morate biti punoletni."; return; }
        if (!/^381\d{6}\d+$/.test(this.phone.slice(1)) || this.phone[0] != "+") { this.message = "Mobilni telefon nije u dobrom formatu."; return; }
        if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.email)) { this.message = "Email nije u dobrom formatu."; return; }
        const data={
          idUser: this.idUser,
          username: this.username,
          email: this.email,
          firstname: this.firstname,
          lastname: this.lastname,
          birthday: this.birthday,
          location: this.location,
          phone: this.phone,
          photo: this.photo,
          backPhoto: this.backPhoto
        }
        this.userService.updateUser(data).subscribe((message: any) => {
          alert(message)
        })
      })
    })

  }


}
