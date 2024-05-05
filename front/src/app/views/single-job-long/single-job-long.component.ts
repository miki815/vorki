import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Gallery, GalleryItem, GalleryRef, GalleryState, ImageItem } from 'ng-gallery';
import { CookieService } from 'ngx-cookie-service';
import { JobService } from 'src/app/services/job.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-single-job-long',
  templateUrl: './single-job-long.component.html',
})
export class SingleJobLongComponent implements OnInit {
  job: any;
  jobId: string;
  comments: any[] = [];
  comment: string = null;
  cookie: string = "";
  photo: string = null;
  username: string = null;
  visibleComments: number = 3;
  images: GalleryItem[] = [];
  imagesLoaded: boolean = false;
  galleryId = 'mixed';
  galleryRef: GalleryRef = this.gallery.ref(this.galleryId);
  numberOfPhotos: number = 0;
  imgIndex: number = 0;

  constructor(private jobService: JobService, private route: ActivatedRoute, private cookieService: CookieService, private userService: UserService, private gallery: Gallery) { }
  ngOnInit(): void {
    this.cookie = this.cookieService.get("token");
    this.job = history.state.job;
    this.route.paramMap.subscribe(params => {
      this.jobId = params.get('id');
    });
    this.getComments();
    this.userService.getGalleryById({idUser: this.cookie}).subscribe((message: any) => {
      var imgs =  message['message'];
      imgs.forEach(element => {
        this.galleryRef.add(new ImageItem({ src: element.urlPhoto, thumb: element.urlPhoto }))
        this.numberOfPhotos += 1;
      });
      this.imagesLoaded = true;
    })
    // this.jobService.getJobById(this.jobId).subscribe((job: any) => {
    //   // getJobById returns array of one element
    //   this.job = job[0];
    // });
  }

  addComment() {
    console.log("Job - addComment: START")
    if (this.comment == "") return;
    if (/^\s*$/.test(this.comment)) return;

    const data = { idCommentator: this.cookie, comment: this.comment, idUser: this.job.idUser, dateC: new Date(), jobId: this.job.id }
    this.userService.addComment(data).subscribe((message: any) => {
      this.userService.getUserById({ id: data.idCommentator }).subscribe((message: any) => {
        const data1 = {
          comment: data.comment,
          idCommentator: data.idCommentator,
          dateC: data.dateC,
          photo: message['message'].photo,
          username: message['message'].username,
        }
        this.comments.unshift(data1);
        this.comment = ""
        //  this.visibleComments += 1;
      });
      console.log("Job - addComment: END")
    })
  }

  getComments() {
    console.log("Job - getComments: START")
    this.userService.getCommentsByJobId({jobId: this.job.id}).subscribe((info: any) => {
      this.comments = info['message'];
      this.comments.forEach(comment => {
        this.userService.getUserById({ id: comment.idCommentator }).subscribe((message: any) => {
          comment.photo = message['message'].photo;
          comment.username = message['message'].username;
        });
      });
    });
    console.log("Job - getComments: END")
  }

  onIndexChange(event: GalleryState) {
    this.imgIndex = event.currIndex
  }


}
