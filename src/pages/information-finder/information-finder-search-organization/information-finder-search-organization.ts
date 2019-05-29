import { Component } from '@angular/core';
import {  NavController, NavParams,LoadingController } from 'ionic-angular';
import { BackEndConfig } from '../../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import {FileService} from '../../../providers/file/file.service';
import 'rxjs/add/operator/map';
import {AuthServiceProvider} from '../../../providers/auth-service/auth-service';
import {InformationFinderDetailOrganizationPage} from '../information-finder-detail-organization/information-finder-detail-organization';

@Component({
  selector: 'page-information-finder-search-organization',
  templateUrl: 'information-finder-search-organization.html'
  // styleUrls: ['/src/pages/information-finder/information-finder.scss']
})
export class InformationFinderSearchOrganizationPage {
    apiEndpoint : string = BackEndConfig.API_ENDPOINT;
    headers;
    requestOptions;

    detailPage = InformationFinderDetailOrganizationPage;

    public loader;

    showError = false;
    showSuccess = false;
    errorMessage;
    successMessage;
    showLoading = false;
    searchResults;
    isSearchLoading =false;
    isUserAdmin = false;
    
    isSearchTriggered = false;
    searchPage : string;
    showAddModal = false;

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

        this.http.get(this.apiEndpoint + "organization/organizations?searchParams=" + searchInput, this.requestOptions)
        .map(res =>  res.json()).subscribe(res => {
            this.isSearchLoading = false;
            this.isSearchTriggered = true;
            this.searchResults = res.data;
            this.loader.dismiss();
        })
    }

    ShowAddModal(){
        this.showAddModal = true;
    }

    CloseAddModal(){
        this.showAddModal = false;
    }

    AddNewOrganization(form){
      this.showLoading = true;
      this.showError = false;
      this.showSuccess = false;
      this.errorMessage = "";
      this.successMessage = "";

      this.loader = this.loadingCtrl.create({
        content: "Fetching data."
      });
  
      this.loader.present();
      
      let organization = {
        "organizationName" : form.value.organizationName,
        "about" : form.value.about,
        "diocese" : form.value.diocese,
        "emailAndWebsite" : form.value.emailAndWebsite,
        "address" : form.value.address,
        "contactNo" : form.value.contactNo,
        "googleMapLongitude" : form.value.googleMapLongitude,
        "googleMapLatitude" : form.value.googleMapLatitude,
        "natureOfOrganization" : form.value.natureOfOrganization,
        "dateEstablished" : form.value.dateEstablished,
        "founder" : form.value.founder,
        "services" : form.value.services,
        "aboutImages" : "",
        "organizationHead" : "",
        "events" : "",
        "gallery" : ""
      }
  
      
  
      //-------------------------------------------About Image Upload Start -------------------------------------------
      //1)Get About Images
      let aboutImagesFiles : Array<File> =  this.GetImagesFrom("organization-about-image-div");
      let aboutImagesFormData = new FormData();
      for(let i = 0; i<aboutImagesFiles.length;i++) {
        aboutImagesFormData.append("organization-about-images", aboutImagesFiles[i], aboutImagesFiles[i]['name']);
      }
  
      //2)Upload About Images
      this.fileSvc.httpUploadFiles(aboutImagesFormData,"organization-about-images").subscribe(resAboutImage=>{
        if (!resAboutImage.success) {
          this.showLoading = false;
          this.loader.dismiss();
          this.errorMessage = (resAboutImage.success !== "") ? resAboutImage.err : "Failed to add new record. Please try again.";
          this.showError = true;
        } else {
          //On About Images Upload Success
          let aboutImagesPathArr = [];
          resAboutImage.data.forEach(element => {
            aboutImagesPathArr.push(
              {
                path : element.secure_url.replace(/\\/g, "/")
                //path : element.path.replace(/\\/g, "/") //For Local
              }
            );
          });
          //Add About Images paths
          organization.aboutImages= JSON.stringify(aboutImagesPathArr);
          //-------------------------------------------About Image Upload End -------------------------------------------
  
          //-------------------------------------------Heads Record Upload Start -------------------------------------------
          //1) Get Head Image
          let headImagesFiles : Array<File> =  this.GetImagesFrom("organization-head-div");
          let headImagesFormData = new FormData();
          for(let i = 0; i<headImagesFiles.length;i++) {
            
            headImagesFormData.append("organization-head-images", headImagesFiles[i], headImagesFiles[i]["name"]);
          }
  
          //2)Upload Head Images
          this.fileSvc.httpUploadFiles(headImagesFormData,"organization-head-images").subscribe(resHeadImage=>{
            if (!resHeadImage.success) {
              this.showLoading = false;
              this.loader.dismiss();
              this.errorMessage = (resHeadImage.success !== "") ? resHeadImage.err : "Failed to add new record. Please try again.";
              this.showError = true;
            } else {
              //On Head Images Upload Success
              let organizationHeadArr = [];
              let organizationHeadDiv = document.getElementsByClassName("organization-head-div");
              resHeadImage.data.forEach((element,i) => {
                let inputHeadNameElement = organizationHeadDiv[i].children[3].children[0] as HTMLInputElement;
                organizationHeadArr.push(
                  {
                    name : (inputHeadNameElement.value !== "") ? inputHeadNameElement.value : "Unknown",
                    path : element.secure_url.replace(/\\/g, "/")
                    //path : element.path.replace(/\\/g, "/") //For Local
                  }
                );
              });
              
              //Add Head Record
              organization.organizationHead= JSON.stringify(organizationHeadArr);
              //-------------------------------------------Heads Record Upload Emd -------------------------------------------
  
  
              //-------------------------------------------Gallery Record Upload Start -------------------------------------------
  
              //1) Get Gallery Image
              let galleryImagesFiles : Array<File> =  this.GetImagesFrom("organization-gallery-div");
              let galleryImagesFormData = new FormData();
              for(let i = 0; i<galleryImagesFiles.length;i++) {
                galleryImagesFormData.append("organization-gallery-images", galleryImagesFiles[i], galleryImagesFiles[i]["name"]);
              }
  
              //2)Upload gallery Images
              this.fileSvc.httpUploadFiles(galleryImagesFormData,"organization-gallery-images").subscribe(resgalleryImage=>{
                if (!resgalleryImage.success) {
                  this.showLoading = false;
                  this.loader.dismiss();
                  this.errorMessage = (resgalleryImage.success !== "") ? resgalleryImage.err : "Failed to add new record. Please try again.";
                  this.showError = true;
                } else {
                  //On gallery Images Upload Success
                  let galleryArr = [];
                  let organizationGalleryDiv = document.getElementsByClassName("organization-gallery-div");
                  resgalleryImage.data.forEach((element,i) => {
                    let inputGalleryTitleElement = organizationGalleryDiv[i].children[3].children[0] as HTMLInputElement;
                    galleryArr.push(
                      {
                        title : (inputGalleryTitleElement.value !== "") ? inputGalleryTitleElement.value : "Unknown",
                        path : element.secure_url.replace(/\\/g, "/")
                        //path : element.path.replace(/\\/g, "/") //For Local
                      }
                    );
                  });
                  //Add Priest Record
                  organization.gallery= JSON.stringify(galleryArr);
  
                  //-------------------------------------------Gallery Record Upload Emd -------------------------------------------
  
                  //-------------------------------------------Events Record Upload Start --------------------------------------
                  //1) Get Event Image
                  let eventImagesFiles : Array<File> =  this.GetImagesFrom("organization-event-div");
                  let eventImagesFormData = new FormData();
                  for(let i = 0; i<eventImagesFiles.length;i++) {
                    eventImagesFormData.append("organization-event-images", eventImagesFiles[i], eventImagesFiles[i]["name"]);
                  }
  
                  //2)Upload Event Images
                  this.fileSvc.httpUploadFiles(eventImagesFormData,"organization-event-images").subscribe(resEventImage=>{
                    if (!resEventImage.success) {
                      this.showLoading = false;
                      this.loader.dismiss();
                      this.errorMessage = (resEventImage.success !== "") ? resEventImage.err : "Failed to add new record. Please try again.";
                      this.showError = true;
                    } else {
  
                      //On Event Images Upload Success
                      let eventArr = [];
                      let organizationEventDiv = document.getElementsByClassName("organization-event-div");
                      resEventImage.data.forEach((element,i) => {
                        let inputEventTitleElement = organizationEventDiv[i].children[3].children[0] as HTMLInputElement;
                        let inputEventDescriptionElement = organizationEventDiv[i].children[5].children[0] as HTMLInputElement;
                        let inputEventMonthElement = organizationEventDiv[i].children[7].children[0] as HTMLSelectElement;
                        let inputEventDayElement = organizationEventDiv[i].children[9].children[0] as HTMLSelectElement;
                        let inputEventYearElement = organizationEventDiv[i].children[11].children[0] as HTMLSelectElement;
                        eventArr.push(
                          {
                            title : (inputEventTitleElement.value !== "") ? inputEventTitleElement.value : "Unknown",
                            description : (inputEventDescriptionElement.value !== "") ? inputEventDescriptionElement.value : "Unknown",
                            month : inputEventMonthElement.value,
                            day : inputEventDayElement.value,
                            year : inputEventYearElement.value,
                            path : element.secure_url.replace(/\\/g, "/")
                            //path : element.path.replace(/\\/g, "/") //For Local
                          }
                        );
                      });
                      //Add Events Record
                      organization.events= JSON.stringify(eventArr);
  
                  //-------------------------------------------Events Record Upload End --------------------------------------
  
                      // Proceed to adding OrganizationEventDiv Record
                      this.http.post(this.apiEndpoint + "organization/add-organization",organization, this.requestOptions)
                      .map(res =>  res.json()).subscribe(res =>{
                        this.showLoading = false;
                        this.loader.dismiss();
                        if(res.success) {
                          this.showSuccess = true;
                          this.successMessage = "Organization has been added successfully."
                          setTimeout(()=>{
                            this.showSuccess = false;
                            this.CloseAddModal();
                          },1500);
                        } else {
                          this.errorMessage = res.err;
                          this.showError = true;
                        }
                      })
  
                    } //Upload Event Image "On Success -- (Else Statement)"
                  }); //Upload Event Images Subscribe
              
                } //Upload Dia Image "On Success -- (Else Statement)"
              }); //Upload Dia Images Subscribe
  
            } //Upload Priest Image "On Success -- (Else Statement)"
          }); //Upload Priest Images Subscribe
  
        } //Upload About Image "On Success -- (Else Statement)"
      }); //Upload About Image Subscribe
  
    }
  
    IsString(val) {
      return typeof(val) === "string";
    }

    
    AddEvent(){
      let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" accept="image/*">';
      let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">';
      let titleLabelHtml = '<div><label>Title</label></div>'
      let titleInputHtml = '<div><input type="text"></div>';
      let descriptionLabelHtml = '<div><label>Description</label></div>'
      let descriptionInputHtml = '<div><input type="text"></div>';
  
  
      let monthsList = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december"
      ]
  
      let monthLabelHtml = '<div><label>Month</label></div>'
      let monthSelectHtml = '<div><select style="text-transform:capitalize;">';
      for(let i =0;i<monthsList.length;i++) {
        monthSelectHtml += '<option value="'+ monthsList[i] +'">' + monthsList[i] + '</option>';
      }
      monthSelectHtml += '</select></div>';
  
      let yearListStart = new Date().getFullYear() - 25;
  
      let yearList = [];
      for(let i =0;i<50;i++) {
        yearList.push(yearListStart + i);
      }
  
      let yearLabelHtml = '<div><label>Year</label></div>'
      let yearSelectHtml = '<div><select>';
      for(let i =0;i<yearList.length;i++) {
        if(yearList[i] == new Date().getFullYear()) {
          yearSelectHtml += '<option value="'+ yearList[i] +'" selected>' + yearList[i] + '</option>';
        } else {
          yearSelectHtml += '<option value="'+ yearList[i] +'">' + yearList[i] + '</option>';
        }
        
      }
      yearSelectHtml += '</select></div>';
  
      let dayLabelHtml = '<div><label>Day</label></div>';
      let daySelectHtml = '<div><select>';
      for(let i =1;i<=31;i++) {
          daySelectHtml += '<option value="'+ i +'">' + i + '</option>';
      }
      daySelectHtml += '</select></div>';
      
      let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
      let container = document.getElementById("organization-events-container");
      let div = document.createElement('div');
      div.className="organization-event-div";
      div.style.margin = "2px";
      div.style.padding = "5px";
      div.style.width = "100%";
      div.style.maxWidth ="300px";
      div.style.width = "auto";
      div.style.display = "block";
      div.style.borderStyle ="solid";
      div.style.borderWidth = "1px";
      div.style.position = "relative";
  
  
      div.innerHTML=imagePreviewerHtml + imageInputHtml + 
        titleLabelHtml + titleInputHtml  + 
        descriptionLabelHtml + descriptionInputHtml + 
        monthLabelHtml + monthSelectHtml + 
        dayLabelHtml + daySelectHtml +
        yearLabelHtml + yearSelectHtml +
        removeItemHtml;
  
      container.appendChild(div);
  
      let inputFile : HTMLInputElement  = div.children[1] as HTMLInputElement;
      inputFile.style.width = "100%";
      let imgPrev : HTMLImageElement = div.children[0] as HTMLImageElement;
  
      
  
      //On Input file changed
      inputFile.addEventListener("change",function(){
        //Update Image Preview
        if(inputFile.files[0]) {
          imgPrev.src= window.URL.createObjectURL(inputFile.files[0]);
        } else {
          imgPrev.src = "//:0";
        }
      })
  
      let monthInput  = div.children[7].children[0] as HTMLSelectElement; 
      let dayInput = div.children[9].children[0] as HTMLSelectElement; 
  
      
      //On Month Select changed
      monthInput.addEventListener("change",function(){
        //Remove all Options
        let optLength = dayInput.options.length;
        for (let optCtr = 1;optCtr <= optLength;optCtr++) {
          dayInput.options.remove(0);
        }
  
        let selectedMonthIndex = monthsList.indexOf(monthInput.value) + 1;
        let maxDay = 1;
  
        //General Rule
        if(selectedMonthIndex <=7) {
          if(selectedMonthIndex%2 == 0) {
            maxDay = 30;
          } else {
            maxDay = 31;
          }
        } else {
          if(!(selectedMonthIndex%2 == 0)) {
            maxDay = 30;
          } else {
            maxDay = 31;
          }
        }
  
        //If February
        if(selectedMonthIndex == 2) {
          maxDay = 28;
        } 
  
        for (let optCtr = 1;optCtr <= maxDay;optCtr++) {
          var option = document.createElement("option");
          option.text = optCtr.toString();
          option.value = optCtr.toString();
          dayInput.appendChild(option);
        }
  
      })
  
      let removeElem : HTMLButtonElement = div.children[12] as HTMLButtonElement;
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
  
    AddGallery() {
      let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" accept="image/*">';
      let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">';
      let titleLabelHtml = '<div><label>Title</label></div>'
      let titleInputHtml = '<div><input type="text"></div>';
      let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
      let container = document.getElementById("organization-gallery-container");
      let div = document.createElement('div');
      div.className="organization-gallery-div";
      div.style.margin = "2px";
      div.style.padding = "5px";
      div.style.width = "100%";
      div.style.maxWidth ="300px";
      div.style.width = "auto";
      div.style.display = "block";
      div.style.borderStyle ="solid";
      div.style.borderWidth = "1px";
      div.style.position = "relative";
  
  
      div.innerHTML=imagePreviewerHtml + imageInputHtml + titleLabelHtml + titleInputHtml + removeItemHtml;
      container.appendChild(div);
  
      let inputFile : HTMLInputElement  = div.children[1] as HTMLInputElement;
      inputFile.style.width = "100%";
      let imgPrev : HTMLImageElement = div.children[0] as HTMLImageElement;
  
      
  
      //On Input file changed
      inputFile.addEventListener("change",function(){
        //Update Image Preview
        if(inputFile.files[0]) {
          imgPrev.src= window.URL.createObjectURL(inputFile.files[0]);
        } else {
          imgPrev.src = "//:0";
        }
      })
  
      let removeElem : HTMLButtonElement = div.children[4] as HTMLButtonElement;
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
  
    AddOrganizationHead(){
      let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" accept="image/*">';
      let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">';
      let nameLabelHtml = '<div><label>Name</label></div>'
      let nameInputHtml = '<div><input type="text"></div>';
      let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
      let container = document.getElementById("organization-heads-container");
      let div = document.createElement('div');
      div.className="organization-head-div";
      div.style.margin = "2px";
      div.style.padding = "5px";
      div.style.width = "100%";
      div.style.maxWidth ="300px";
      div.style.width = "auto";
      div.style.display = "block";
      div.style.borderStyle ="solid";
      div.style.borderWidth = "1px";
      div.style.position = "relative";
  
  
      div.innerHTML=imagePreviewerHtml + imageInputHtml + nameLabelHtml + nameInputHtml + removeItemHtml;
      container.appendChild(div);
  
      let inputFile : HTMLInputElement  = div.children[1] as HTMLInputElement;
      inputFile.style.width = "100%";
      let imgPrev : HTMLImageElement = div.children[0] as HTMLImageElement;
  
      
  
      //On Input file changed
      inputFile.addEventListener("change",function(){
        //Update Image Preview
        if(inputFile.files[0]) {
          imgPrev.src= window.URL.createObjectURL(inputFile.files[0]);
        } else {
          imgPrev.src = "//:0";
        }
      })
  
      let removeElem : HTMLButtonElement = div.children[4] as HTMLButtonElement;
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
  
    
    AddAboutImage(){
      let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" accept="image/*">';
      let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">'
      let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
      let container = document.getElementById("organization-about-images-container");
      let div = document.createElement('div');
      div.className="organization-about-image-div";
      div.style.margin = "2px";
      div.style.padding = "5px";
      div.style.width = "100%";
      div.style.maxWidth ="300px";
      div.style.width = "auto";
      div.style.display = "block";
      div.style.borderStyle ="solid";
      div.style.borderWidth = "1px";
      div.style.position = "relative";
  
      div.innerHTML=imagePreviewerHtml + imageInputHtml + removeItemHtml;
      container.appendChild(div);
  
      let inputFile : HTMLInputElement  = div.children[1] as HTMLInputElement;
      inputFile.style.width = "100%";
      let imgPrev : HTMLImageElement = div.children[0] as HTMLImageElement;
  
      //On Input file changed
      inputFile.addEventListener("change",function(){
        //Update Image Preview
        if(inputFile.files[0]) {
          imgPrev.src= window.URL.createObjectURL(inputFile.files[0]);
        } else {
          imgPrev.src = "//:0";
        }
        
      })
  
      let removeElem : HTMLButtonElement = div.children[2] as HTMLButtonElement;
      removeElem.addEventListener("click",function(){
        div.remove();
      })
  
      removeElem.style.position = "absolute";
      removeElem.style.top = "0";
      removeElem.style.right = "0";
      removeElem.style.padding = "0 5px";
      removeElem.style.fontSize = "20px";
      removeElem.style.display = "inline-block";
      removeElem.style.color = "#a40e00";
      removeElem.style.cursor = "pointer";
    }
  
    GetImagesFrom(string){
      let imagesInputDiv = document.getElementsByClassName(string);
      let images = [];
      for(let i=0;i<imagesInputDiv.length;i++) {
        let htmlElement = imagesInputDiv[i].children[1] as HTMLInputElement;
        
        if(htmlElement.files[0]){
          images.push(htmlElement.files[0]);
        } else {
          let imagesInputParent = imagesInputDiv[i] as HTMLElement;
          imagesInputParent.remove();
          i--;
        }
        
      }
      return images;
    }
  
  
  }
  