import { Component } from '@angular/core';
import {  NavController, NavParams,LoadingController } from 'ionic-angular';
import { BackEndConfig } from '../../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import {FileService} from '../../../providers/file/file.service';
import 'rxjs/add/operator/map';
import {AuthServiceProvider} from '../../../providers/auth-service/auth-service';


@Component({
  selector: 'page-information-finder-religious-congregations',
  templateUrl: 'information-finder-religious-congregations.html'
  // styleUrls: ['/src/pages/information-finder/information-finder.scss']
})
export class InformationFinderReligiousCongregationsPage {
    apiEndpoint : string = BackEndConfig.API_ENDPOINT;
    headers;
    requestOptions;

    public loader;

    showError = false;
    showSuccess = false;
    errorMessage;
    successMessage;
    showLoading = false;
    searchResults = [];
    isSearchLoading =false;
    isUserAdmin = false;
    
    isSearchTriggered = false;
    searchPage : string;
    showAddModal = false;
    showEditModal = false;
    recordToEdit;
    constructor(public navCtrl: NavController, public navParams: NavParams,
        public http: Http,public loadingCtrl: LoadingController,
        public fileSvc : FileService,
        private authSvc : AuthServiceProvider) {
          this.headers = new Headers();
          this.headers.append('Authorization', this.authSvc.GetAuthToken());
          this.headers.append('Content-Type', 'application/json');
          this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true });     
    }

    ionViewDidEnter() {
    this.isUserAdmin = this.authSvc.CheckIfUserAdmin();
      this.OnSearchClick("");
    }


    RouteFromSearch(page,id: string){
      this.navCtrl.push(page,{
        id : id
      });
    }

    OnSearchClick(searchInput){
        this.isSearchLoading = true;

        this.loader = this.loadingCtrl.create({
            content: "Fetching data."
          });
      
        this.loader.present();

        this.http.get(this.apiEndpoint + "religious-congregation/religious-congregations?searchParams=" + searchInput, this.requestOptions)
        .map(res =>  res.json()).subscribe(res => {
            this.isSearchLoading = false;
            this.isSearchTriggered = true;
            this.searchResults = res.data;
            this.loader.dismiss();

            for(let i = 0;i < this.searchResults.length ; i++) {
                this.searchResults[i].image = JSON.parse(this.searchResults[i].image);
            }
        })
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
  
    CloseAddModal(){
      this.showAddModal = false;
    }
  
    ShowEditModal(record){
      this.recordToEdit = record;
      this.showEditModal = true;
  
      setTimeout(()=>{
        let editInputFile = document.getElementById("edit-form-image-input") as HTMLInputElement;
        let editImgPreview = document.getElementById("edit-form-image-preview") as HTMLImageElement;
        //On Input file changed
        editInputFile.addEventListener("change",function(){
          //Update Image Preview
          if(editInputFile.files[0]) {
            editImgPreview.src= window.URL.createObjectURL(editInputFile.files[0]);
          } else {
            editImgPreview.src = "//:0";
          }
        })
      },500);
    }
  
    CloseEditModal(){
      this.showEditModal = false;
    }
  
    OnDeleteItem(id){
      if(confirm("Are you sure you want to delete this record?")) {
        this.loader = this.loadingCtrl.create({
          content: "Fetching data."
        });
    
        this.loader.present();
        this.http.delete(this.apiEndpoint + "religious-congregation/delete-religious-congregation?id=" + id, this.requestOptions)
        .map(res =>  res.json()).subscribe(res =>{
          this.loader.dismiss();
          if(res.success) {
            for(let indx = 0;indx < this.searchResults.length;indx++) {
              if(this.searchResults[indx]._id === id) {
                this.searchResults.splice(indx,1);
              }
            }
            console.log("Record has been deleted successfully.")
          } 
        })
      }
      
    }
    
    EditReligiousCongregation(form,recordId,currentImagePath) {
      this.showLoading = true;
      this.showError = false;
      this.showSuccess = false;
      this.errorMessage = "";
      this.successMessage = "";
  
      this.loader = this.loadingCtrl.create({
        content: "Fetching data."
      });
  
      this.loader.present();
  
      let religiousCongregation = {
        _id : recordId,
        "name" : form.value.name,
        "initials" : form.value.initials,
        "mainHeadquarters" : form.value.mainHeadquarters,
        "charism" : form.value.charism,
        "superior" : form.value.superior,
        "contactNo" : form.value.contactNo,
        "website" : form.value.website,
        "image" : ""
      } 
  
      //-------------------------------------------Image Upload Start -------------------------------------------
      //1) Get Image
      let editInputFile = document.getElementById("edit-form-image-input") as HTMLInputElement;
      let imagesFormData = new FormData();
      if(editInputFile.files[0]){
        imagesFormData.append("religious-congregation-images", editInputFile.files[0], editInputFile.files[0]["name"]);
      } 
      //2)Upload Images
      this.fileSvc.httpUploadFiles(imagesFormData,"religious-congregation-images").subscribe(resImage=>{
        if (!resImage.success) {
          this.showLoading = false;
          this.loader.dismiss();
          this.errorMessage = (resImage.success !== "") ? resImage.err : "Failed to update record. Please try again.";
          this.showError = true;
        } else {
          //On Images Upload Success
          let imagesArr = [];
          if(resImage.data.length >0) {
            resImage.data.forEach((element,i) => {
              imagesArr.push(
                {
                  path : element.secure_url.replace(/\\/g, "/")
                  //path : element.path.replace(/\\/g, "/") //For Local
                }
              );
            });
          } else if (currentImagePath){
            imagesArr.push(
              {
                path : currentImagePath.path
              }
            );
          } else {
  
          }
  
          //Add Priest Record
          religiousCongregation.image= JSON.stringify(imagesArr);
          //-------------------------------------------Priest Record Upload Emd -------------------------------------------
  
          // Proceed to adding Religious Congregation Record
          this.http.put(this.apiEndpoint + "religious-congregation/update-religious-congregation?id=" + recordId,religiousCongregation, this.requestOptions)
          .map(res =>  res.json()).subscribe(res =>{
            this.showLoading = false;
            this.loader.dismiss();
            if(res.success) {
              this.showSuccess = true;
              this.successMessage = "Religious Congregation has been updated successfully."
              for(let indx = 0;indx < this.searchResults.length;indx++) {
                if(this.searchResults[indx]._id === recordId) {
                  religiousCongregation.image = JSON.parse(religiousCongregation.image);
                  this.searchResults[indx] = religiousCongregation;
                }
              }
  
              setTimeout(()=>{
                this.showSuccess = false;
                this.CloseEditModal();
              },1500);
            } else {
              this.errorMessage = res.err;
              this.showError = true;
            }
          })
  
        } //Upload Image "On Success -- (Else Statement)"
      }); //Upload Images Subscribe
  
  
    }
  
    AddNewReligiousCongregation(form){
      this.showLoading = true;
      this.showError = false;
      this.showSuccess = false;
      this.errorMessage = "";
      this.successMessage = "";

      this.loader = this.loadingCtrl.create({
        content: "Fetching data."
      });
  
      this.loader.present();
  
      let religiousCongregation = {
        "name" : form.value.name,
        "initials" : form.value.initials,
        "mainHeadquarters" : form.value.mainHeadquarters,
        "charism" : form.value.charism,
        "superior" : form.value.superior,
        "contactNo" : form.value.contactNo,
        "website" : form.value.website,
        "image" : ""
      }
  
      
      //-------------------------------------------Image Upload Start -------------------------------------------
      //1) Get Image
      let addInputFile = document.getElementById("add-form-image-input") as HTMLInputElement;
      let imagesFormData = new FormData();
      if(addInputFile.files[0]){
        imagesFormData.append("religious-congregation-images", addInputFile.files[0], addInputFile.files[0]["name"]);
      } 
      //2)Upload Images
      this.fileSvc.httpUploadFiles(imagesFormData,"religious-congregation-images").subscribe(resImage=>{
        if (!resImage.success) {
          this.showLoading = false;
          this.loader.dismiss();
          this.errorMessage = (resImage.success !== "") ? resImage.err : "Failed to add new record. Please try again.";
          this.showError = true;
        } else {
          //On Images Upload Success
          let imagesArr = [];
          resImage.data.forEach((element,i) => {
            imagesArr.push(
              {
                path : element.secure_url.replace(/\\/g, "/")
                //path : element.path.replace(/\\/g, "/") //For Local
              }
            );
          });
          
          //Add Priest Record
          religiousCongregation.image= JSON.stringify(imagesArr);
          //-------------------------------------------Priest Record Upload Emd -------------------------------------------
  
          // Proceed to adding Religious Congregation Record
          this.http.post(this.apiEndpoint + "religious-congregation/add-religious-congregation",religiousCongregation, this.requestOptions)
          .map(res =>  res.json()).subscribe(res =>{
            this.showLoading = false;
            this.loader.dismiss();
            if(res.success) {
              this.showSuccess = true;
              this.successMessage = "Religious Congregation has been added successfully."
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
  
    IsString(val) {
      return typeof(val) === "string";
    }
  
  }
  