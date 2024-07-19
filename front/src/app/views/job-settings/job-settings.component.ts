import { ChangeDetectorRef, Component, CSP_NONCE, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Gallery, GalleryItem, GalleryRef, GalleryState, ImageItem } from 'ng-gallery';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { Job } from 'src/app/models/job';
import { JobService } from 'src/app/services/job.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-job-settings',
  templateUrl: './job-settings.component.html',
})
export class JobSettingsComponent {
  constructor(private gallery: Gallery, private cookieService: CookieService, private userService: UserService, private cdr: ChangeDetectorRef, private jobService: JobService, private route: ActivatedRoute, private router: Router) { }

  // TODO: Obrisati sve prom koje nisu potrebne
  images: GalleryItem[] = [];
  location: string = null;
  type: string = null;
  photo: string = null;
  visibleComments: number = 3;
  rating: number = 0;
  userRate: number = 0;
  userRateLen: number = 0;
  cookie: string = "";
  idUser: string = "";
  imagesLoaded: boolean = false;
  poruka: string = ""; // dodao da ne izbacuje gresku
  backPhoto: string = null;

  galleryId = 'mixed';
  galleryRef: GalleryRef = this.gallery.ref(this.galleryId);


  gradovi: any;

  numberOfPhotos: number = 0;

  err: number = 0;

  message: string = "";

  imgIndex: number = 0;
  newphoto: string = "";

  jobId: string = "";
  job: Job = new Job();
  updatedJob: Job = new Job();

  ngOnInit(): void {
    console.log("JobSettings - ngOnInit: START")
    this.jobId = this.route.snapshot.paramMap.get('jobId')!;
    this.getToken();
    this.getJob();
    this.userService.getGalleryById({ idUser: this.cookie }).subscribe((message: any) => {
      var imgs = message['message'];
      imgs.forEach(element => {
        this.galleryRef.add(new ImageItem({ src: element.urlPhoto, thumb: element.urlPhoto }))
        this.numberOfPhotos += 1;
      });
      this.imagesLoaded = true;
    })
    console.log("JobSettings - ngOnInit: END")
  }

  getJob() {
    console.log("JobSettings - getJob: START")
    this.jobService.getJobById(this.jobId).subscribe((message: any) => {
      this.job = message[0];
      this.updatedJob = this.job;
      console.log(this.job.city);
    })
    console.log("JobSettings - getJob: END")
  }

  /**
   * @notice This function is used to get the token from the cookie and the id of the user from the local storage
   */
  getToken() {
    console.log("JobSettings - getToken: START")
    // TODO - Local storage nije bezbedan
    this.cookie = this.cookieService.get("token");
    console.log("JobSettings - getToken: END")
  }

  update() {
    console.log("JobSettings - update: START");
    this.jobService.updateJob({ job: this.updatedJob }).subscribe((message: any) => {
      // this.message = message.message;
      if (this.message == "Job updated") {
        alert("Uspešno ste ažurirali posao");
      }
    })
    console.log("JobSettings - update: END");
  }


  // Load photo functions  

  loadPhoto(event, back) {
    const files = (event.target as HTMLInputElement).files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.substr(file.name.lastIndexOf('.') + 1);
      if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') {
        this.convertToBase64(file, back);
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
      else {
        this.backPhoto = this.newphoto;
      }
      this.cdr.detectChanges();

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

  readFile(file, subscriber) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      subscriber.next(reader.result);
      subscriber.complete();
    }
  }

  delete(){
    this.galleryRef.remove(this.imgIndex);
    this.numberOfPhotos -=1 ;
  }


  onIndexChange(event: GalleryState) {
    this.imgIndex = event.currIndex
  }


  // updateGallery(){
  //   const imgs=[]
  //   this.galleryRef.stateSnapshot.items.forEach(element => {
  //     imgs.push(element.data.src)
  //   });

  //   const data = {
  //     images: imgs,
  //     idUser: this.idUser
  //   }
  //   this.userService.updateGallery(data).subscribe((message: any) => {
  //   })
  // }

  //  this.userService.getGalleryById({idUser: this.cookie}).subscribe((message: any) => {
  // var imgs =  message['message'];
  // imgs.forEach(element => {
  //   this.galleryRef.add(new ImageItem({ src: element.urlPhoto, thumb: element.urlPhoto }))
  //   this.numberOfPhotos += 1;
  // });
  // this.imagesLoaded = true;
  // }) 

}
