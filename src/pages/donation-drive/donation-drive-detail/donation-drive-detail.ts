import { DonationDrivePage } from './../donation-drive';
import { Component } from '@angular/core';
import { NavController, NavParams,LoadingController } from 'ionic-angular';
import { Http, Headers,RequestOptions } from '@angular/http';
import { BackEndConfig } from '../../../backend.config';
import { AuthServiceProvider } from '../../../providers/auth-service/auth-service';
import { FileService } from '../../../providers/file/file.service';

@Component({
  selector: 'page-donation-drive-detail',
  templateUrl: 'donation-drive-detail.html'
  // styleUrls: ['/src/pages/donation-drive/donation-drive.scss']
})
export class DonationDriveDetailPage {
    apiEndpoint : string = BackEndConfig.API_ENDPOINT;
    headers;
    requestOptions;
  
    public loader;
  
    donationDrivePage = DonationDrivePage;
  
    campaignType;
    
    isUserAdmin =false;
    
    showEditModal = false;
    showAddDonorModal = false;
    showEditDonorModal = false;
    
    showLoading = false;
    showError = false;
    showSuccess = false;
    errorMessage = "";
    successMessage = "";

    donationDrive;
    currentAmount = 0;
    currentProgress = 0;
    pageUrl;

    constructor(public navCtrl: NavController, public navParams: NavParams,
        public http: Http,public loadingCtrl: LoadingController,
        public fileSvc : FileService,
        private authSvc : AuthServiceProvider) {
          this.headers = new Headers();
          this.headers.append('Authorization', this.authSvc.GetAuthToken());
          this.headers.append('Content-Type', 'application/json');
          this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true });  
    
          this.isUserAdmin = this.authSvc.CheckIfUserAdmin();
          // this.isUserAdmin = true;
          this.pageUrl = this.apiEndpoint.replace('api', '');
      }


  ionViewDidEnter() {
    this.http.get(this.apiEndpoint + "donation-drive/donation-drive?id=" + this.navParams.data.id, this.requestOptions)
    .map(res =>  res.json()).subscribe(res =>{
      this.donationDrive = res.data;
      for(let i=0; i<this.donationDrive.donors.length;i++) {
        console.log("donors", i)
        this.currentAmount += this.donationDrive.donors[i].amount;
      }
      this.currentProgress = (this.currentAmount/parseFloat(this.donationDrive.targetGoal)) * 100;
      if(this.currentProgress > 100) {
        this.currentProgress = 100;
      }
    });
  }

  RouteTo(page){
    this.navCtrl.push(page);
  }

  RouteFromSearch(page,id: string){
    this.navCtrl.push(page,{
      id : id
    });
  }
  CloseEditModal(){
    this.showEditModal = false;
  }
 
  ShowEditModal(){
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

  EditDonationDrive(){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    this.loader = this.loadingCtrl.create({
        content: "Fetching data."
      });
  
      this.loader.present();

    let donationDrive = {
      "campaignTitle" : this.donationDrive.campaignTitle,
      "description" : this.donationDrive.description,
      "targetDate" : this.donationDrive.targetDate,
      "targetGoal" : this.donationDrive.targetGoal,
      "paypal" : this.donationDrive.paypal,
      "campaignType": this.donationDrive.campaignType,
      "image" : this.donationDrive.image,
      "donors": this.donationDrive.donors
    }
    
    //-------------------------------------------Image Upload Start -------------------------------------------
    //1) Get Image
    let editInputFile = document.getElementById("edit-form-image-input") as HTMLInputElement;
    let imagesFormData = new FormData();
    if(editInputFile.files[0]){
      imagesFormData.append("donation-drive-images", editInputFile.files[0], editInputFile.files[0]["name"]);
    } 
    //2)Upload Images
    this.fileSvc.httpUploadFiles(imagesFormData,"donation-drive-images").subscribe(resImage=>{
      if (!resImage.success) {
        this.showLoading = false;
        this.loader.dismiss();
        this.errorMessage = (resImage.success !== "") ? resImage.err : "Failed to update record. Please try again.";
        this.showError = true;
      } else {
        //On Images Upload Success
        if(resImage.data.length >0) {
          resImage.data.forEach((element,i) => {
            donationDrive.image = element.secure_url.replace(/\\/g, "/");
          });
        } 
        
        //-------------------------------------------Image Upload Emd -------------------------------------------

        // Proceed to updating Donation Drive Record
        this.http.put(this.apiEndpoint + "donation-drive/update-donation-drive?id=" + this.donationDrive._id,donationDrive, this.requestOptions)
          .map(res =>  res.json()).subscribe(res =>{
            this.showLoading = false;
            this.loader.dismiss();
            if(res.success) {
              this.showSuccess = true;
              this.donationDrive = res.data;

              this.currentAmount = 0;
              for(let i = 0; i < this.donationDrive.donors.length;i++) {
                this.currentAmount += this.donationDrive.donors[i].amount;
              }
              this.currentProgress = (this.currentAmount/parseFloat(this.donationDrive.targetGoal)) * 100;
              if(this.currentProgress > 100) {
                this.currentProgress = 100;
              }
              this.successMessage = "Campaign has been updated successfully."
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


  CloseAddDonorModal(){
    this.showAddDonorModal = false;
  }
 
  ShowAddDonorModal(){
    this.showAddDonorModal = true;

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

  AddDonor(form){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    this.loader = this.loadingCtrl.create({
        content: "Fetching data."
      });
  
      this.loader.present();

    let donationDrive = {
      "campaignTitle" : this.donationDrive.campaignTitle,
      "description" : this.donationDrive.description,
      "targetDate" : this.donationDrive.targetDate,
      "targetGoal" : this.donationDrive.targetGoal,
      "paypal" : this.donationDrive.paypal,
      "campaignType": this.donationDrive.campaignType,
      "image" : this.donationDrive.image,
      "donors": this.donationDrive.donors
    }

    let donor = {
      "name": form.value.name,
      "amount" : form.value.amount,
      "picture" : ""
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
            donor.picture = element.secure_url.replace(/\\/g, "/");
          });
        } 
        
        //-------------------------------------------Image Upload Emd -------------------------------------------

        
        donationDrive.donors.push(donor);

        // Proceed to updating Donation Drive Record
        this.http.put(this.apiEndpoint + "donation-drive/update-donation-drive?id=" + this.donationDrive._id,donationDrive, this.requestOptions)
          .map(res =>  res.json()).subscribe(res =>{
            this.showLoading = false;
            this.loader.dismiss();
            if(res.success) {
              this.showSuccess = true;
              this.donationDrive = res.data;
              this.currentAmount = 0;
              for(let i = 0; i < this.donationDrive.donors.length;i++) {
                this.currentAmount += this.donationDrive.donors[i].amount;
              }
              this.currentProgress = (this.currentAmount/parseFloat(this.donationDrive.targetGoal)) * 100;
              if(this.currentProgress > 100) {
                this.currentProgress = 100;
              }
              this.successMessage = "Campaign has been updated successfully."
              setTimeout(()=>{
                this.showSuccess = false;
                this.CloseAddDonorModal();
              },1500);
            } else {
              this.errorMessage = res.err;
              this.showError = true;
            }
        })

      } //Upload Image "On Success -- (Else Statement)"
    }); //Upload Images Subscribe

  }

  CloseEditDonorModal() {
    this.showEditDonorModal = false;
  }

  ShowEditDonorModal(){
    this.showEditDonorModal = true;
    setTimeout(()=>{
      for(let i = 0;i<this.donationDrive.donors.length;i++) {
        this.PopulateEditDonorModal(this.donationDrive.donors[i].name,this.donationDrive.donors[i].amount,this.donationDrive.donors[i].picture);
      }
    },50);
    
  }

  PopulateEditDonorModal(name,amount,picture){
    // let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" accept="image/*">';
    let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">';
    let nameLabelHtml = '<div><label>Name</label></div>'
    let nameInputHtml = '<div><input type="text"></div>';
    let amountLabelHtml = '<div><label>Amount</label></div>'
    let amountInputHtml = '<div><input type="number"></div>';
    let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
    let container = document.getElementById("donors-edit-container");
    let div = document.createElement('div');
    div.className="donors-div-current";
    div.style.margin = "2px";
    div.style.padding = "5px";
    div.style.width = "100%";
    div.style.maxWidth ="300px";
    div.style.width = "auto";
    div.style.display = "block";
    div.style.borderStyle ="solid";
    div.style.borderWidth = "1px";
    div.style.position = "relative";

    if(!picture) {
      picture = "/assets/images/bfast/avatar-default.png";
    }
   
    div.innerHTML=imagePreviewerHtml + nameLabelHtml + nameInputHtml + amountLabelHtml + amountInputHtml + removeItemHtml;
    container.appendChild(div);

    let nameInput : HTMLInputElement = div.children[2].children[0] as HTMLInputElement;
    nameInput.value = name;

    let amountInput : HTMLInputElement = div.children[4].children[0] as HTMLInputElement;
    amountInput.value = amount;

    let imgPrev : HTMLImageElement = div.children[0] as HTMLImageElement;
    imgPrev.src= picture;

    let removeElem : HTMLButtonElement = div.children[5] as HTMLButtonElement;
    removeElem.style.position = "absolute";
    removeElem.style.top = "0";
    removeElem.style.right = "0";
    removeElem.style.padding = "0 5px";
    removeElem.style.fontSize = "20px";
    removeElem.style.display = "inline-block";
    removeElem.style.color = "#a40e00";
    removeElem.style.cursor = "pointer";

    removeElem.addEventListener("click",function(){
      div.remove();
    })

  }

  EditDonors(){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    this.loader = this.loadingCtrl.create({
        content: "Fetching data."
      });
  
      this.loader.present();

    let donationDrive = {
      "campaignTitle" : this.donationDrive.campaignTitle,
      "description" : this.donationDrive.description,
      "targetDate" : this.donationDrive.targetDate,
      "targetGoal" : this.donationDrive.targetGoal,
      "paypal" : this.donationDrive.paypal,
      "campaignType": this.donationDrive.campaignType,
      "image" : this.donationDrive.image,
      "donors": []
    }

    let donorsArr = [];
    let existingDonors = document.getElementsByClassName("donors-div-current");

    for(let indx = 0;indx<existingDonors.length;indx++ ) {
      let picture = existingDonors[indx].children[0] as HTMLImageElement;
      let name = existingDonors[indx].children[2].children[0] as HTMLInputElement;
      let amount = existingDonors[indx].children[4].children[0] as HTMLInputElement;
      donorsArr.push(
        {
          name : name.value,
          amount : amount.value,
          picture : picture.src,

        }
      );
    }

    donationDrive.donors = donorsArr;

    // Proceed to updating Donation Drive Record
    this.http.put(this.apiEndpoint + "donation-drive/update-donation-drive?id=" + this.donationDrive._id,donationDrive, this.requestOptions)
    .map(res =>  res.json()).subscribe(res =>{
      this.showLoading = false;
      this.loader.dismiss();
      if(res.success) {
        this.showSuccess = true;
        this.donationDrive = res.data;
        this.currentAmount = 0;
        for(let i = 0; i < this.donationDrive.donors.length;i++) {
          this.currentAmount += this.donationDrive.donors[i].amount;
        }
        this.currentProgress = (this.currentAmount/parseFloat(this.donationDrive.targetGoal)) * 100;
        if(this.currentProgress > 100) {
          this.currentProgress = 100;
        }
        this.successMessage = "Campaign has been updated successfully."
        setTimeout(()=>{
          this.showSuccess = false;
          this.CloseEditDonorModal();
        },1500);
      } else {
        this.errorMessage = res.err;
        this.showError = true;
      }
  })

  }

  DeleteDonationDrive(donationDrive){
    if(confirm("Are you sure you want to delete this donation drive?")) { 
      this.http.delete(this.apiEndpoint + "donation-drive/delete-donation-drive?id=" + donationDrive._id, this.requestOptions)
      .map(res => res.json()).subscribe(res => {
        if(res.success) {
          for(let indx=0;indx < this.donationDrive.length;indx++) {
            if(this.donationDrive[indx]._id === donationDrive._id) {
              this.donationDrive.splice(indx,1);
            }
          }
          this.successMessage = "Campaign has been deleted successfully."
          console.log('Deleted');
          setTimeout(()=>{
            this.RouteTo(this.donationDrivePage);
          },1000);
        }
      });
    }
  }

  IsString(val) {
    return typeof(val) === "string";
  }



}
