import { Component } from '@angular/core';
import { BackEndConfig } from '../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import {LoadingController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import {FileService} from '../../providers/file/file.service';
@Component({
  selector: 'page-inspirational',
  templateUrl: 'inspirational.html',
})
export class InspirationalPage {

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

  showEditModal = false;
  showAddModal = false;
  showVideoModal = false;
  showBlogModal = false;

  inspirationals = [];
  inspirationalToUpdateOrDelete;
  filteredItemsCount = 0

  safeUrl;
  blog;

  selectedFilter = "all";

  constructor(private http: Http,
    private authSvc : AuthServiceProvider,
    public loadingCtrl: LoadingController,
    private sanitizer: DomSanitizer,
    private fileSvc :FileService) { 

    this.headers = new Headers();
    this.headers.append('Authorization', this.authSvc.GetAuthToken());
    this.headers.append('Content-Type', 'application/json');
    this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true }); 

    this.isUserAdmin = this.authSvc.CheckIfUserAdmin();
  }

  ionViewDidEnter(){
    this.loader = this.loadingCtrl.create({
      content: "Fetching data."
    });

    this.loader.present();
    this.http.get(this.apiEndpoint + "inspirational/inspirationals", this.requestOptions)
    .map(res =>  res.json()).subscribe(res =>{
      this.loader.dismiss();
      this.inspirationals = res.data;
      this.UpdateFilteredItemsCount();
    });
  }
  FilterBy(filterVal,elem : HTMLElement){
    this.selectedFilter = filterVal;
    let filterElements = document.getElementsByClassName("active");
    filterElements[0].className = "filter";
    elem.className = "filter active";

    this.UpdateFilteredItemsCount();
  }

  UpdateFilteredItemsCount() {
    if(this.selectedFilter !== "all") {
      let count = 0;
      for(let i =0;i<this.inspirationals.length;i++){
        if(this.inspirationals[i].category === this.selectedFilter) {
          count++;
        }
      }
      this.filteredItemsCount = count;
    } else {
      this.filteredItemsCount = this.inspirationals.length;
    }

  }

  ShowBlogModal(inspirational){
    this.blog = {
      _id : inspirational._id,
      title : inspirational.title,
      blog : inspirational.blog,
      image : inspirational.image,
      type : inspirational.type,
      category : inspirational.category
    };
    this.showBlogModal = true;
    this.blog.blog = this.blog.blog.split("\n\n");
  }

  ShowVideoModal(inspirational) {
    this.showVideoModal = true;
    let videoUrl = inspirational.videoUrl;
    videoUrl = videoUrl.replace("watch?v=", "embed/");
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }

  CloseAddModal(){
    this.showAddModal = false;
  }
  ShowAddModal(){
    this.showAddModal = true;

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

  AddInspirational(form) {
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let inspirational = {
      "title" : form.value.title,
      "videoUrl" : form.value.videoUrl,
      "blog" : form.value.blog,
      "type" : form.value.type,
      "category" : form.value.category,
      "image" : ""
    }

    //-------------------------------------------Image Upload Start -------------------------------------------
    //1) Get Image
    let addInputFile = document.getElementById("add-form-image-input") as HTMLInputElement;
    let imagesFormData = new FormData();
    if(addInputFile.files[0]){
      imagesFormData.append("inspirational-images", addInputFile.files[0], addInputFile.files[0]["name"]);
    } 
    //2)Upload Images
    this.fileSvc.httpUploadFiles(imagesFormData,"inspirational-images").subscribe(resImage=>{
      if (!resImage.success) {
        this.showLoading = false;
        this.errorMessage = (resImage.success !== "") ? resImage.err : "Failed to add new record. Please try again.";
        this.showError = true;
      } else {
        //On Images Upload Success
        if(resImage.data.length >0) {
          resImage.data.forEach((element,i) => {
            inspirational.image = element.secure_url.replace(/\\/g, "/");
          });
        } 

        //-------------------------------------------Priest Record Upload Emd -------------------------------------------
        this.http.post(this.apiEndpoint + "inspirational/add-inspirational",inspirational, this.requestOptions)
          .map(res =>  res.json()).subscribe(res =>{
            this.showLoading = false;
            if(res.success) {
              this.inspirationals.push(res.data);
              this.showSuccess = true;
              this.successMessage = "Record has been added successfully."
              this.UpdateFilteredItemsCount();
              setTimeout(()=>{
                this.showSuccess = false;
                this.CloseAddModal();
              },1500);
            } else {
              this.errorMessage = res.err;
              this.showError = true;
            }
        })

      } //Upload Image "On Success -- (Else Statement)"
    }); //Upload Images Subscribe
  }

  CloseEditModal(){
    this.showEditModal = false;
  }

  ShowEditModal(inspirational){
    this.inspirationalToUpdateOrDelete = inspirational;
    this.showEditModal = true;

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

  EditInspirational(form) {
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let inspirational = {
      "title" : form.value.title,
      "videoUrl" : form.value.videoUrl,
      "blog" : form.value.blog,
      "type" : form.value.type,
      "category" : form.value.category,
      "image" : this.inspirationalToUpdateOrDelete.image
    }

    
    //1) Get Image
    let editInputFile = document.getElementById("edit-form-image-input") as HTMLInputElement;
    let imagesFormData = new FormData();
    if(editInputFile.files[0]){
      imagesFormData.append("inspirational-images", editInputFile.files[0], editInputFile.files[0]["name"]);
    } 

    //2)Upload Images
    this.fileSvc.httpUploadFiles(imagesFormData,"inspirational-images").subscribe(resImage=>{
      if (!resImage.success) {
        this.showLoading = false;
        this.errorMessage = (resImage.success !== "") ? resImage.err : "Failed to update record. Please try again.";
        this.showError = true;
      } else {
        //On Images Upload Success
        if(resImage.data.length >0) {
          resImage.data.forEach((element,i) => {
            inspirational.image = element.secure_url.replace(/\\/g, "/");
          });
        }

         // Proceed to updating Donation Drive Record
        this.http.put(this.apiEndpoint + "inspirational/update-inspirational?id=" + this.inspirationalToUpdateOrDelete._id,inspirational, this.requestOptions)
        .map(res =>  res.json()).subscribe(res =>{
          this.showLoading = false;
          if(res.success) {
            this.showSuccess = true;
            this.inspirationalToUpdateOrDelete = res.data;


            for(let i = 0; i<this.inspirationals.length;i++) {
              if(this.inspirationals[i]._id === res.data._id) {
                this.inspirationals[i]= res.data;
              }
            }



            this.successMessage = "Record has been updated successfully."
            setTimeout(()=>{
              this.showSuccess = false;
              this.CloseEditModal();
            },1500);
          } else {
            this.errorMessage = res.err;
            this.showError = true;
          }
        });
      } //Upload Image "On Success -- (Else Statement)"
    }); //Upload Images Subscribe

  }

  DeleteInspirational(inspirational){
    if(confirm("Are you sure you want to delete this record?")) {
      this.http.delete(this.apiEndpoint + "inspirational/delete-inspirational?id=" + inspirational._id, this.requestOptions)
      .map(res =>  res.json()).subscribe(res =>{
        if(res.success) {
          for(let indx = 0;indx < this.inspirationals.length;indx++) {
            if(this.inspirationals[indx]._id === inspirational._id) {
              this.inspirationals.splice(indx,1);
            }
          }
          this.UpdateFilteredItemsCount();
          console.log("Record has been deleted successfully.")
        } 
      })
    }
  }

  IsString(val) {
    return typeof(val) === "string";
  }

}

