import { Component } from '@angular/core';
import { NavController, NavParams,LoadingController } from 'ionic-angular';
import { Http, Headers,RequestOptions } from '@angular/http';
import { BackEndConfig } from '../../../backend.config';
import {AuthServiceProvider} from '../../../providers/auth-service/auth-service';
import {FileService} from '../../../providers/file/file.service';
import {DonationDriveDetailPage} from '../donation-drive-detail/donation-drive-detail';
@Component({
  selector: 'page-donation-drive-list',
  templateUrl: 'donation-drive-list.html'
  // styleUrls: ['/src/pages/donation-drive/donation-drive.scss']
})
export class DonationDriveListPage {
  donationDriveDetailPage = DonationDriveDetailPage;
  apiEndpoint : string = BackEndConfig.API_ENDPOINT;
  headers;
  requestOptions;

  public loader;


  campaignType;
  
  
  isUserAdmin =false;
  
  showAddModal = false;
  
  showLoading = false;
  showError = false;
  showSuccess = false;
  errorMessage = "";
  successMessage = "";

  searchResults = [];

  isSearchLoading =false;
  isSearchTriggered = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: Http,public loadingCtrl: LoadingController,
    public fileSvc : FileService,
    private authSvc : AuthServiceProvider) {
      this.headers = new Headers();
      this.headers.append('Authorization', this.authSvc.GetAuthToken());
      this.headers.append('Content-Type', 'application/json');
      this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true });  

      this.isUserAdmin = this.authSvc.CheckIfUserAdmin();
      this.isUserAdmin = true;
  }


  ionViewDidEnter() {
    this.campaignType = this.navParams.data.campaigntype;
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

    let queryParamCampaignType = this.campaignType.replace("-","");
    this.http.get(this.apiEndpoint + "donation-drive/donation-drives?searchParams=" + searchInput + "&campaignType=" + queryParamCampaignType, this.requestOptions)
      .map(res =>  res.json()).subscribe(res =>{

      this.isSearchLoading = false;
      this.isSearchTriggered = true;
      this.searchResults = res.data;
      this.loader.dismiss();
    });

      

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

  AddNewDonationDrive(form){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    this.loader = this.loadingCtrl.create({
      content: "Fetching data."
    });

    this.loader.present();

    let campaignType = this.campaignType.replace("-","");
    let donationDrive = {
      "campaignTitle" : form.value.campaignTitle,
      "description" : form.value.description,
      "targetDate" : form.value.targetDate,
      "targetGoal" : form.value.targetGoal,
      "paypal" : form.value.paypal,
      "campaignType": campaignType,
      "image" : "",
      "donors": []
    }
    
    //-------------------------------------------Image Upload Start -------------------------------------------
    //1) Get Image
    let addInputFile = document.getElementById("add-form-image-input") as HTMLInputElement;
    let imagesFormData = new FormData();
    if(addInputFile.files[0]){
      imagesFormData.append("donation-drive-images", addInputFile.files[0], addInputFile.files[0]["name"]);
    } 
    //2)Upload Images
    this.fileSvc.httpUploadFiles(imagesFormData,"donation-drive-images").subscribe(resImage=>{
      if (!resImage.success) {
        this.showLoading = false;
        this.loader.dismiss();
        this.errorMessage = (resImage.success !== "") ? resImage.err : "Failed to add new record. Please try again.";
        this.showError = true;
      } else {
        //On Images Upload Success
        if(resImage.data.length >0) {
          resImage.data.forEach((element,i) => {
            donationDrive.image = element.secure_url.replace(/\\/g, "/");
          });
        } 

        //-------------------------------------------Priest Record Upload Emd -------------------------------------------

        // Proceed to adding Donation Drive Record
        this.http.post(this.apiEndpoint + "donation-drive/add-donation-drive",donationDrive, this.requestOptions)
          .map(res =>  res.json()).subscribe(res =>{
            this.showLoading = false;
            this.loader.dismiss();
            if(res.success) {
              this.showSuccess = true;
              this.successMessage = "Campaign has been added successfully."
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
