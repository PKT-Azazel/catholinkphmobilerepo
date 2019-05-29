import { Component } from '@angular/core';
import {  NavController, NavParams,LoadingController } from 'ionic-angular';
import { BackEndConfig } from '../../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import {FileService} from '../../../providers/file/file.service';
import 'rxjs/add/operator/map';
import {AuthServiceProvider} from '../../../providers/auth-service/auth-service';
import {GoogleMapsAPIWrapper} from '@agm/core/services/google-maps-api-wrapper';
@Component({
  selector: 'page-information-finder-detail-organization',
  templateUrl: 'information-finder-detail-organization.html'
  // styleUrls: ['/src/pages/information-finder/information-finder.scss']
})
export class InformationFinderDetailOrganizationPage {

    public loader;

    apiEndpoint : string = BackEndConfig.API_ENDPOINT;
    headers;
    requestOptions;

    showError = false;
    showSuccess = false;
    errorMessage;
    successMessage;
    showLoading = false;
    //apiDomain =BackEndConfig.API_DOMAIN; //Local
    apiDomain = ""; //For Cloudinary
    selectedTab = "about";
    gallerySelectedCategory = "all";
    organization;
    selectedEventCategory = "all";
    isUserAdminOrUploader = false;

    monthsList = [
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

    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth();

    eventsCalendarFirstNavMonth :number;
    eventsCalendarSecondNavMonth : number;
    eventsCalendarThirdNavMonth :number;

    eventsCalendarFirstNavYear :number;
    eventsCalendarSecondNavYear : number;
    eventsCalendarThirdNavYear :number;

    eventsSelectedNav = {
      month : "",
      year: ""
    }
    eventsSelectedItem  = [];

    gmapLatitude: number;
    gmapLongitude: number;
    gmap;
    showEditModal = false;
    itemId;
    constructor(public navCtrl: NavController, public navParams: NavParams,
        public http: Http,public loadingCtrl: LoadingController,
        public fileSvc : FileService,
        private googleMapsWrapper : GoogleMapsAPIWrapper,
        private authSvc : AuthServiceProvider) {
          this.headers = new Headers();
          this.headers.append('Authorization', this.authSvc.GetAuthToken());
          this.headers.append('Content-Type', 'application/json');
          this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true });   
    }

    ionViewDidEnter(){
      this.loader = this.loadingCtrl.create({
        content: "Fetching data."
      });
  
      this.loader.present();
      this.itemId = this.navParams.data.id;
      this.http.get(this.apiEndpoint + "organization/organization?id=" + this.navParams.data.id, this.requestOptions)
      .map(res =>  res.json()).subscribe(res =>{
        this.organization = res.data;
        // this.informationFinderSvc.UpdateOrganizationData(this.organization);
        this.organization.aboutImages = JSON.parse(this.organization.aboutImages);
        this.organization.organizationHead = JSON.parse(this.organization.organizationHead);
        this.organization.gallery = JSON.parse(this.organization.gallery);


        this.gmapLatitude =parseFloat(this.organization.googleMapLatitude);
        this.gmapLongitude = parseFloat(this.organization.googleMapLongitude);
        
        this.eventsCalendarFirstNavYear = this.currentYear;
        this.eventsCalendarSecondNavYear = this.currentYear;
        this.eventsCalendarThirdNavYear = this.currentYear;
        this.eventsCalendarFirstNavMonth  = this.currentMonth;
        this.eventsCalendarSecondNavMonth  = this.currentMonth + 1;
        this.eventsCalendarThirdNavMonth  = this.currentMonth + 2;

        if(this.eventsCalendarSecondNavMonth > 11) {
          this.eventsCalendarSecondNavMonth -= 12;
          this.eventsCalendarSecondNavYear++;
        }
        if(this.eventsCalendarThirdNavMonth > 11) {
          this.eventsCalendarThirdNavMonth -= 12;
          this.eventsCalendarThirdNavYear++;
        }

        this.organization.events = JSON.parse(this.organization.events);
        this.UpdateSelectedNav(this.monthsList[this.eventsCalendarFirstNavMonth],this.eventsCalendarFirstNavYear);
        this.loader.dismiss();
      })
        // let mainContainerBg = document.getElementById('main-container-w-bg').setAttribute('style', 'background-image:url("/assets/images/information-finder/information-finder-bg.jpg")');
        this.isUserAdminOrUploader = this.authSvc.CheckIfUserAdminOrUploader();
        this.CheckIfUploaderAuthorized();
    }

    CheckIfUploaderAuthorized(){
      let user = this.authSvc.GetCurrentUser();
      if(user) {
        if(user.role === "uploader") {
          if(user.assignedTo !== this.itemId) {
            this.isUserAdminOrUploader = false;
          }
        }
      }
    }

    UpdateEventsSelectedItem() {
      this.eventsSelectedItem = [];
      for(let i=0;i<this.organization.events.length;i++) {
        if ((this.organization.events[i].month === this.eventsSelectedNav.month) && (this.organization.events[i].year === this.eventsSelectedNav.year)) {
          this.eventsSelectedItem.push(this.organization.events[i]);
        }
      }
  
      function compare(a,b) {
        if (parseInt(a.day) < parseInt(b.day))
          return -1;
        if (parseInt(a.day) > (b.day))
          return 1;
        return 0;
      }
  
      this.eventsSelectedItem = this.eventsSelectedItem.sort(compare);
    }
  
    UpdateSelectedNav(month,year) {
      this.eventsSelectedNav.month = month;
      this.eventsSelectedNav.year = year.toString();
  
      let eventsNavItemsElem = document.getElementsByClassName("events-calendar-nav-item");
      for(let i=0;i<eventsNavItemsElem.length;i++) {
        let currentElement = eventsNavItemsElem[i] as HTMLElement;
        if(currentElement.innerText.toLowerCase().trim() === (this.eventsSelectedNav.month + " " + this.eventsSelectedNav.year).toLowerCase()) {
          currentElement.style.textDecoration = "underline";
        } else {
          currentElement.style.textDecoration = "none";
        }
      }
  
      this.UpdateEventsSelectedItem();
    }
  
    OnEventsNavLeft() {
      this.eventsCalendarFirstNavMonth--;
      this.eventsCalendarSecondNavMonth--;
      this.eventsCalendarThirdNavMonth--;
  
      if(this.eventsCalendarFirstNavMonth < 0) {
        this.eventsCalendarFirstNavMonth += 12;
        this.eventsCalendarFirstNavYear--;
      }
      if(this.eventsCalendarSecondNavMonth < 0) {
        this.eventsCalendarSecondNavMonth += 12;
        this.eventsCalendarSecondNavYear--;
      }
      if(this.eventsCalendarThirdNavMonth < 0) {
        this.eventsCalendarThirdNavMonth += 12;
        this.eventsCalendarThirdNavYear--;
      }
  
      setTimeout(()=>{
        this.UpdateSelectedNav(this.eventsSelectedNav.month,this.eventsSelectedNav.year);
      },10)
      
    }
  
    OnEventsNavRight() {
      this.eventsCalendarFirstNavMonth++;
      this.eventsCalendarSecondNavMonth++;
      this.eventsCalendarThirdNavMonth++;
  
      if(this.eventsCalendarFirstNavMonth > 11) {
        this.eventsCalendarFirstNavMonth -= 12;
        this.eventsCalendarFirstNavYear++;
      }
      if(this.eventsCalendarSecondNavMonth > 11) {
        this.eventsCalendarSecondNavMonth -= 12;
        this.eventsCalendarSecondNavYear++;
      }
      if(this.eventsCalendarThirdNavMonth > 11) {
        this.eventsCalendarThirdNavMonth -= 12;
        this.eventsCalendarThirdNavYear++;
      }
  
      setTimeout(()=>{
        this.UpdateSelectedNav(this.eventsSelectedNav.month,this.eventsSelectedNav.year);
      },10)
    }
  
    UpdateTab(tab){
      this.selectedTab = tab;
    }
  
    ShowEditModal(){
      this.showEditModal = true;
      
      setTimeout(()=>{
        for(let i = 0;i<this.organization.aboutImages.length;i++) {
          this.AddAboutImage(false,this.apiDomain + this.organization.aboutImages[i].path);
        }
        
        for(let i = 0;i<this.organization.organizationHead.length;i++) {
          this.AddOrganizationHead(false,this.apiDomain + this.organization.organizationHead[i].path,this.organization.organizationHead[i].name);
        }
  
        for(let i = 0;i<this.organization.gallery.length;i++) {
          this.AddGallery(false,this.apiDomain + this.organization.gallery[i].path,this.organization.gallery[i].title);
        }
  
  
        for(let i = 0;i<this.organization.events.length;i++) {
          this.AddEvent(false,this.apiDomain + this.organization.events[i].path,this.organization.events[i].title,this.organization.events[i].description,this.organization.events[i].month,this.organization.events[i].day,this.organization.events[i].year);
        }
  
  
      },500);
      
    }
  
    OnDeleteItem(){
      if(confirm("Are you sure you want to delete this record?")) {
        this.loader = this.loadingCtrl.create({
          content: "Fetching data."
        });
        this.loader.present();

        this.http.delete(this.apiEndpoint + "organization/delete-organization?id=" + this.organization._id, this.requestOptions)
        .map(res =>  res.json()).subscribe(res =>{
          this.loader.dismiss();
          if(res.success) {
            setTimeout(()=>{
              this.navCtrl.pop();
            },500)
          } 
        })
      }
      
    }
  
    CloseEditModal(){
      this.showEditModal = false;
    }
  
    IsString(val) {
      return typeof(val) === "string";
    }
  
    EditItem(form){
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
  
          //Check Current aboutImages record
          // Add Existing images to Array
          let existingImages = document.getElementsByClassName("organization-about-image-div-current");
          for(let indx = 0;indx<existingImages.length;indx++ ) {
            let currentExistingImageIndex = existingImages[indx].children[0] as HTMLImageElement;
            aboutImagesPathArr.push(
              {
                path : currentExistingImageIndex.src.replace(this.apiDomain,"")
              }
            );
          }
  
          // Add new uploaded images to Array
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
  
          //-------------------------------------------Organization Head Record Upload Start -------------------------------------------
          
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
              //On Priest Images Upload Success
              let organizationHeadArr = [];
  
              //Check Current aboutImages record
              // Add Existing Head to Array
              let existingHeads = document.getElementsByClassName("organization-head-div-current");
              for(let indx = 0;indx<existingHeads.length;indx++ ) {
                let currentExistingImageIndex = existingHeads[indx].children[0] as HTMLImageElement;
                let currentExistingNameIndex : HTMLInputElement = existingHeads[indx].children[2].children[0] as HTMLInputElement;
  
                organizationHeadArr.push(
                  {
                    name : (currentExistingNameIndex.value !== "") ? currentExistingNameIndex.value : "Unknown",
                    path : currentExistingImageIndex.src.replace(this.apiDomain,"")
                  }
                );
              }
  
              
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
              
              //Add Priest Record
              organization.organizationHead= JSON.stringify(organizationHeadArr); 
              //-------------------------------------------Priest Record Upload Emd -------------------------------------------
  
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
  
                  //Check Current galleryImages record
                  // Add Existing Priest to Array
                  let existingGallery = document.getElementsByClassName("organization-gallery-div-current");
                  for(let galleryIndx = 0;galleryIndx<existingGallery.length;galleryIndx++ ) {
                    let currentExistingGalleryImage = existingGallery[galleryIndx].children[0] as HTMLImageElement;
                    let currentExistingGalleryTitle : HTMLInputElement = existingGallery[galleryIndx].children[2].children[0] as HTMLInputElement;
  
  
                    galleryArr.push(
                      {
                        title : (currentExistingGalleryTitle.value !== "") ? currentExistingGalleryTitle.value : "Unknown",
                        path : currentExistingGalleryImage.src.replace(this.apiDomain,"")
                      }
                    );
                  }
  
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
                  //Add Gallery Record
                  organization.gallery= JSON.stringify(galleryArr);
                  //-------------------------------------------Gallery Record Upload End -------------------------------------------
  
                  //-------------------------------------------Events Record Upload Start --------------------------------------
  
  
  
                  //-------------------------------------------Events Record Upload End --------------------------------------
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
                  
                      //Check Current eventImages record
                      // Add Existing Event to Array
                      let existingEvent = document.getElementsByClassName("organization-event-div-current");
                      for(let eventIndx = 0;eventIndx<existingEvent.length;eventIndx++ ) {
  
                        let currentExistingEventImage = existingEvent[eventIndx].children[0] as HTMLImageElement;
                        let currentExistingEventTitle : HTMLInputElement = existingEvent[eventIndx].children[2].children[0] as HTMLInputElement;
                        let currentExistingEventDescription : HTMLInputElement = existingEvent[eventIndx].children[4].children[0] as HTMLInputElement;
                        let currentExistingEventMonth : HTMLSelectElement = existingEvent[eventIndx].children[6].children[0] as HTMLSelectElement;
                        let currentExistingEventDay : HTMLSelectElement = existingEvent[eventIndx].children[8].children[0] as HTMLSelectElement;
                        let currentExistingEventYear : HTMLSelectElement = existingEvent[eventIndx].children[10].children[0] as HTMLSelectElement;
  
                        eventArr.push(
                          {
                            title : (currentExistingEventTitle.value !== "") ? currentExistingEventTitle.value : "Unknown",
                            description : (currentExistingEventDescription.value !== "") ? currentExistingEventDescription.value : "Unknown",
                            month : currentExistingEventMonth.value,
                            day : currentExistingEventDay.value,
                            year : currentExistingEventYear.value,
                            path : currentExistingEventImage.src.replace(this.apiDomain,"")
                          }
                        );
                      }
  
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
  
                      // Proceed to update Organization Record
                      this.http.put(this.apiEndpoint + "organization/update-organization?id=" + this.organization._id,organization, this.requestOptions)
                      .map(res =>  res.json()).subscribe(res =>{
                        this.showLoading = false;
                        this.loader.dismiss();
                        if(res.success) {
                          this.showSuccess = true;
                          this.successMessage = "Organization has been updated successfully."
                          this.organization = res.data;
  
                          this.organization.aboutImages = JSON.parse(this.organization.aboutImages);
                          this.organization.organizationHead = JSON.parse(this.organization.organizationHead);
                          this.organization.gallery = JSON.parse(this.organization.gallery);
  
                          this.gmapLatitude =parseFloat(this.organization.googleMapLatitude);
                          this.gmapLongitude = parseFloat(this.organization.googleMapLongitude);
  
                          this.organization.events = JSON.parse(this.organization.events);
                          this.UpdateEventsSelectedItem();
  
                          setTimeout(()=>{
                            this.showEditModal= false;
                            this.googleMapsWrapper.triggerMapEvent('resize');
                          },1500)
                        } else {
                          this.errorMessage = res.err;
                          this.showError = true;
                        }
                      })
  
                    } //Upload Event Image "On Success -- (Else Statement)"
                  }); //Upload Event Images Subscribe
  
                } //Upload Gallery Image "On Success -- (Else Statement)"
              }); //Upload Gallery Images Subscribe
  
            } //Upload Priest Image "On Success -- (Else Statement)"
          }); //Upload Priest Images Subscribe
  
        } //Upload About Image "On Success -- (Else Statement)"
      }); //Upload About Image Subscribe 
  
  
  
    }
  
    AddEvent(isNew : boolean,imgSrc :string,title:string,description : string,month : string,day:string, year : string){
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
  
  
      if(isNew) {
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
  
      } else {
        div.className="organization-event-div-current";
  
        div.innerHTML=imagePreviewerHtml +  
        titleLabelHtml + titleInputHtml  + 
        descriptionLabelHtml + descriptionInputHtml + 
        monthLabelHtml + monthSelectHtml + 
        dayLabelHtml + daySelectHtml +
        yearLabelHtml + yearSelectHtml +
        removeItemHtml;
  
        container.appendChild(div);
  
        let titleInput : HTMLInputElement = div.children[2].children[0] as HTMLInputElement;
        titleInput.value = title;
  
        let descriptionInput : HTMLInputElement = div.children[4].children[0] as HTMLInputElement;
        descriptionInput.value = description;
  
        let monthInput : HTMLSelectElement = div.children[6].children[0] as HTMLSelectElement;
        monthInput.value = month;
  
        let yearInput : HTMLSelectElement = div.children[8].children[0] as HTMLSelectElement;
        yearInput.value = year;
  
        let imgPrev : HTMLImageElement = div.children[0] as HTMLImageElement;
        imgPrev.src= imgSrc;
  
  
        let dayInput = div.children[8].children[0] as HTMLSelectElement; 
        
    
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
  
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        monthInput.dispatchEvent(evt);
  
        dayInput.value = day;
        
  
        let removeElem : HTMLButtonElement = div.children[11] as HTMLButtonElement;
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
  
    }
  
  
    AddGallery(isNew : boolean,imgSrc :string,title:string) {
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
  
  
      if(isNew) {
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
      } else {
        div.className="organization-gallery-div-current";
        div.innerHTML=imagePreviewerHtml + titleLabelHtml + titleInputHtml + removeItemHtml;
        container.appendChild(div);
      
        let titleInput : HTMLInputElement = div.children[2].children[0] as HTMLInputElement;
        titleInput.value = title;
  
        let imgPrev : HTMLImageElement = div.children[0] as HTMLImageElement;
        imgPrev.src= imgSrc;
      
        let removeElem : HTMLButtonElement = div.children[3] as HTMLButtonElement;
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
    }
  
  
    AddOrganizationHead(isNew : boolean,imgSrc :string,name:string){
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
  
  
      if(isNew) {
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
      } else {
        div.className="organization-head-div-current";
        div.innerHTML=imagePreviewerHtml + nameLabelHtml + nameInputHtml + removeItemHtml;
        container.appendChild(div);
  
        let nameInput : HTMLInputElement = div.children[2].children[0] as HTMLInputElement;
        nameInput.value = name;
  
        let imgPrev : HTMLImageElement = div.children[0] as HTMLImageElement;
        imgPrev.src= imgSrc;
  
        let removeElem : HTMLButtonElement = div.children[3] as HTMLButtonElement;
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
  
      
    }
  
  
    AddAboutImage(isNew : boolean,imgSrc :string){
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
  
      if(isNew) {
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
      } else {
        div.className="organization-about-image-div-current";
        div.style.maxWidth ="130px"
        div.innerHTML=imagePreviewerHtml + removeItemHtml;
        container.appendChild(div);
  
        let imgPrev : HTMLImageElement = div.children[0] as HTMLImageElement;
        imgPrev.src= imgSrc;
  
        let removeElem : HTMLButtonElement = div.children[1] as HTMLButtonElement;
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
  