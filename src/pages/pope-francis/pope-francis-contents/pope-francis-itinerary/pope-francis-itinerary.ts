import { Component, OnInit } from '@angular/core';
import { BackEndConfig } from '../../../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import {AuthServiceProvider} from '../../../../providers/auth-service/auth-service';
import {FileService} from '../../../../providers/file/file.service';
import { LoadingController } from 'ionic-angular';
@Component({
  selector: 'app-pope-francis-itinerary',
  templateUrl: './pope-francis-itinerary.html'
  // styleUrls: ['/src/pages/pope-francis/pope-francis.scss']
})
export class PopeFrancisItineraryComponent implements OnInit {

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

  showEditItineraryModal = false;
  showAddItineraryModal = false;
  radioButtonDefault = true;

  itineraries;
  itineraryToUpdateOrDelete;


  constructor(
      private http: Http,
      private fileSvc : FileService,
      private authSvc : AuthServiceProvider,
      public loadingCtrl: LoadingController) { 

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
    this.http.get(this.apiEndpoint + "pf-itinerary/pf-itineraries", this.requestOptions)
    .map(res =>  res.json()).subscribe(res =>{
      this.loader.dismiss();
      this.itineraries = this.MoveFeaturedItemsToTop(res.data);
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


  CloseAddItineraryModal(){
    this.showAddItineraryModal = false;
  }
  ShowAddItineraryModal(){
    this.showAddItineraryModal = true;

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
  AddNewItinerary(form){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let itinerary = {
      "title" : form.value.title,
      "description" : form.value.description,
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
            itinerary.image = element.secure_url.replace(/\\/g, "/");
          });
        } 

        //-------------------------------------------Priest Record Upload Emd -------------------------------------------
        this.http.post(this.apiEndpoint + "pf-itinerary/add-pf-itinerary",itinerary, this.requestOptions)
          .map(res =>  res.json()).subscribe(res =>{
            this.showLoading = false;
            if(res.success) {
              this.itineraries.push(res.data);
              this.showSuccess = true;
              this.successMessage = "Itinerary has been added successfully."
              this.itineraries = this.MoveFeaturedItemsToTop(this.itineraries);
              setTimeout(()=>{
                this.showSuccess = false;
                this.CloseAddItineraryModal();
              },1500);
            } else {
              this.errorMessage = res.err;
              this.showError = true;
            }
        })

      } //Upload Image "On Success -- (Else Statement)"
    }); //Upload Images Subscribe
  }

  CloseEditItineraryModal(){
    this.showEditItineraryModal = false;
  }

  ShowEditItineraryModal(itinerary){
    this.itineraryToUpdateOrDelete = itinerary;
    this.showEditItineraryModal = true;

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


  EditItinerary(form){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let itinerary = {
      "title" : form.value.title,
      "description" : form.value.description,
      "date" : form.value.date,
      "featured" : form.value.featured,
      "image" : this.itineraryToUpdateOrDelete.image
    };
    
    //1) Get Image
    let editProfileInputFile = document.getElementById("edit-form-image-input") as HTMLInputElement;
    let imagesFormData = new FormData();
    if(editProfileInputFile.files[0]){
      imagesFormData.append("pf-images", editProfileInputFile.files[0], editProfileInputFile.files[0]["name"]);
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
            itinerary.image = element.secure_url.replace(/\\/g, "/");
          });
        }

         // Proceed to updating Donation Drive Record
        this.http.put(this.apiEndpoint + "pf-itinerary/update-pf-itinerary?id=" + this.itineraryToUpdateOrDelete._id,itinerary, this.requestOptions)
        .map(res =>  res.json()).subscribe(res =>{
          this.showLoading = false;
          if(res.success) {
            this.showSuccess = true;
            this.itineraryToUpdateOrDelete = res.data;


            for(let i = 0; i<this.itineraries.length;i++) {
              if(this.itineraries[i]._id === res.data._id) {
                this.itineraries[i]= res.data;
              }
            }

            this.itineraries = this.MoveFeaturedItemsToTop(this.itineraries);


            this.successMessage = "Itinerary has been updated successfully."
            setTimeout(()=>{
              this.showSuccess = false;
              this.CloseEditItineraryModal();
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

  DeleteItinerary(itinerary){
    if(confirm("Are you sure you want to delete this record?")) {
      this.http.delete(this.apiEndpoint + "pf-itinerary/delete-pf-itinerary?id=" + itinerary._id, this.requestOptions)
      .map(res =>  res.json()).subscribe(res =>{
        if(res.success) {
          for(let indx = 0;indx < this.itineraries.length;indx++) {
            if(this.itineraries[indx]._id === itinerary._id) {
              this.itineraries.splice(indx,1);
            }
          }
          console.log("Record has been deleted successfully.")
        } 
      })
    }
  }

}