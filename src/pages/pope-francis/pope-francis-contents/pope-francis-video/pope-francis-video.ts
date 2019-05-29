import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BackEndConfig } from '../../../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import {AuthServiceProvider} from '../../../../providers/auth-service/auth-service';
import {FileService} from '../../../../providers/file/file.service';
import {LoadingController } from 'ionic-angular';

@Component({
  selector: 'app-pope-francis-video',
  templateUrl: './pope-francis-video.html'
  // styleUrls: ['/src/pages/pope-francis/pope-francis.scss']
})
export class PopeFrancisVideoComponent implements OnInit{

  public loader;
  isUserAdmin =false;
  apiEndpoint : string = BackEndConfig.API_ENDPOINT;
  headers;
  requestOptions;

  showLoading = false;
  showError = false;
  showSuccess = false;
  errorMessage = "";
  successMessage = "";

  showEditVideoModal = false;
  showAddVideoModal = false;
  radioButtonDefault = true;

  videos;
  videoToUpdateOrDelete;
  showWatchVideoModal= false;
  safeUrl;


  constructor(
      private http: Http,
      private fileSvc : FileService,
      private authSvc : AuthServiceProvider,
      public loadingCtrl: LoadingController,
      private sanitizer: DomSanitizer) { 

      this.headers = new Headers();
      this.headers.append('Authorization', this.authSvc.GetAuthToken());
      this.headers.append('Content-Type', 'application/json');
      this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true }); 

      this.isUserAdmin = this.authSvc.CheckIfUserAdmin();
      // this.isUserAdmin = true;
  }



  ngOnInit() {
    this.loader = this.loadingCtrl.create({
      content: "Fetching data."
    });

    this.loader.present();
    this.http.get(this.apiEndpoint + "pf-video/pf-videos", this.requestOptions)
    .map(res =>  res.json()).subscribe(res =>{
      this.loader.dismiss();
      this.videos = this.MoveFeaturedItemsToTop(res.data);
    });
  }

  MoveFeaturedItemsToTop(data){
    let featured = [];
    let nonFeatured= [];
    // let arrangedData = [];
    for(let i = 0;i<data.length;i++) {
      if(data[i].featured) {
        featured.push(data[i]);
      } else {
        nonFeatured.push(data[i]);
      }
    }
    return featured.concat(nonFeatured);
  }

  ShowWatchVideoModal(video){
    this.showWatchVideoModal = true;
    let videoUrl = video.videoUrl;
    videoUrl = videoUrl.replace("watch?v=", "embed/");
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);

  }


  CloseAddVideoModal(){
    this.showAddVideoModal = false;
  }
  ShowAddVideoModal(){
    this.showAddVideoModal = true;

    setTimeout(()=>{
      let addInputFile = document.getElementById("add-form-image-input") as HTMLInputElement;
      let addImgPreview = document.getElementById("add-form-image-preview") as HTMLImageElement;
      //On Input file changed
      addInputFile.addEventListener("change",function(){
        //Update Image Preview
        if(addInputFile.files[0]) {
          addImgPreview.src= window.URL.createObjectURL(addInputFile.files[0]);
        } else {
          addImgPreview.src = "//:0";
        }
      })
    },500);
  }
  AddNewVideo(form){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let video = {
      "title" : form.value.title,
      "videoUrl" : form.value.videoUrl,
      "date" : form.value.date,
      "featured" : form.value.featured,
      "image" : ""
    }
    
    //-------------------------------------------Image Upload Start -------------------------------------------
    //1) Get Image
    let addInputFile = document.getElementById("add-form-image-input") as HTMLInputElement;
    let imagesFormData = new FormData();
    if(addInputFile.files[0]){
      imagesFormData.append("pf-images", addInputFile.files[0], addInputFile.files[0]["name"]);
    } 
    //2)Upload Images
    this.fileSvc.httpUploadFiles(imagesFormData,"pf-images").subscribe(resImage=>{
      if (!resImage.success) {
        this.showLoading = false;
        this.errorMessage = (resImage.success !== "") ? resImage.err : "Failed to add new record. Please try again.";
        this.showError = true;
      } else {
        //On Images Upload Success
        if(resImage.data.length >0) {
          resImage.data.forEach((element,i) => {
            video.image = element.secure_url.replace(/\\/g, "/");
          });
        } 

        //-------------------------------------------Priest Record Upload Emd -------------------------------------------
        this.http.post(this.apiEndpoint + "pf-video/add-pf-video",video, this.requestOptions)
          .map(res =>  res.json()).subscribe(res =>{
            this.showLoading = false;
            if(res.success) {
              this.videos.push(res.data);
              this.showSuccess = true;
              this.successMessage = "Video has been added successfully."
              this.videos = this.MoveFeaturedItemsToTop(this.videos);
              setTimeout(()=>{
                this.showSuccess = false;
                this.CloseAddVideoModal();
              },1500);
            } else {
              this.errorMessage = res.err;
              this.showError = true;
            }
        })

      } //Upload Image "On Success -- (Else Statement)"
    }); //Upload Images Subscribe
  }

  CloseEditVideoModal(){
    this.showEditVideoModal = false;
  }

  ShowEditVideoModal(video){
    this.videoToUpdateOrDelete = video;
    this.showEditVideoModal = true;

    setTimeout(()=>{
      let inputFile = document.getElementById("edit-form-image-input") as HTMLInputElement;
      let imgPreview = document.getElementById("edit-form-image-preview") as HTMLImageElement;
      //On Input file changed
      inputFile.addEventListener("change",function(){
        //Update Image Preview
        if(inputFile.files[0]) {
          imgPreview.src= window.URL.createObjectURL(inputFile.files[0]);
        } else {
          imgPreview.src = "//:0";
        }
      })
    },50);
  }


  EditVideo(form){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let video = {
      "title" : form.value.title,
      "videoUrl" : form.value.videoUrl,
      "date" : form.value.date,
      "featured" : form.value.featured,
      "image" : this.videoToUpdateOrDelete.image
    };
    
    //1) Get Image
    let editInputFile = document.getElementById("edit-form-image-input") as HTMLInputElement;
    let imagesFormData = new FormData();
    if(editInputFile.files[0]){
      imagesFormData.append("pf-images", editInputFile.files[0], editInputFile.files[0]["name"]);
    } 

    //2)Upload Images
    this.fileSvc.httpUploadFiles(imagesFormData,"pf-images").subscribe(resImage=>{
      if (!resImage.success) {
        this.showLoading = false;
        this.errorMessage = (resImage.success !== "") ? resImage.err : "Failed to update record. Please try again.";
        this.showError = true;
      } else {
        //On Images Upload Success
        if(resImage.data.length >0) {
          resImage.data.forEach((element,i) => {
            video.image = element.secure_url.replace(/\\/g, "/");
          });
        }

         // Proceed to updating Donation Drive Record
        this.http.put(this.apiEndpoint + "pf-video/update-pf-video?id=" + this.videoToUpdateOrDelete._id,video, this.requestOptions)
        .map(res =>  res.json()).subscribe(res =>{
          this.showLoading = false;
          if(res.success) {
            this.showSuccess = true;
            this.videoToUpdateOrDelete = res.data;


            for(let i = 0; i<this.videos.length;i++) {
              if(this.videos[i]._id === res.data._id) {
                this.videos[i]= res.data;
              }
            }

            this.videos = this.MoveFeaturedItemsToTop(this.videos);


            this.successMessage = "Video has been updated successfully."
            setTimeout(()=>{
              this.showSuccess = false;
              this.CloseEditVideoModal();
            },1500);
          } else {
            this.errorMessage = res.err;
            this.showError = true;
          }
        });
      } //Upload Image "On Success -- (Else Statement)"
    }); //Upload Images Subscribe

    
  }

  IsString(val) {
    return typeof(val) === "string";
  }

  DeleteVideo(video){
    if(confirm("Are you sure you want to delete this record?")) {
      this.http.delete(this.apiEndpoint + "pf-video/delete-pf-video?id=" + video._id, this.requestOptions)
      .map(res =>  res.json()).subscribe(res =>{
        if(res.success) {
          for(let indx = 0;indx < this.videos.length;indx++) {
            if(this.videos[indx]._id === video._id) {
              this.videos.splice(indx,1);
            }
          }
          console.log("Record has been deleted successfully.")
        } 
      })
    }
  }

}