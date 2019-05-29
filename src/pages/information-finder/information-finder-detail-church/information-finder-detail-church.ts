import { Component } from '@angular/core';
import {  NavController, NavParams,LoadingController } from 'ionic-angular';
import { BackEndConfig } from '../../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import {FileService} from '../../../providers/file/file.service';
import 'rxjs/add/operator/map';
import {AuthServiceProvider} from '../../../providers/auth-service/auth-service';
import {GoogleMapsAPIWrapper} from '@agm/core/services/google-maps-api-wrapper';
@Component({
  selector: 'page-information-finder-detail-church',
  templateUrl: 'information-finder-detail-church.html'
  // styleUrls: ['/src/pages/information-finder/information-finder.scss']
})
export class InformationFinderDetailChurchPage {

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
    ciaSelectedCategory = "all";
    church;
    selectedEventCategory = "all";
    isUserAdminOrUploader = false;
    churchSchedules = {
      monday : [],
      tuesday : [],
      wednesday : [],
      thursday : [],
      friday :[],
      saturday : [],
      sunday : []
    };
  
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

    Convert24hrs12hrs(value: string) {
      if (!value) return value;
      let hrs;
      let mins;
      let newTime;
      let sign;
      hrs = parseInt(value.split(":")[0]);
      mins = value.split(":")[1];
  
      if(hrs < 12) {
        sign = "AM";
      } else {
        sign = "PM";
      }
  
      if(hrs > 12) {
        newTime = hrs - 12;
      } else {
        newTime = hrs;
      }
  
      return newTime + ":" + mins + " " + sign;
    }

    ionViewDidEnter(){
      this.loader = this.loadingCtrl.create({
        content: "Fetching data."
      });
  
      this.loader.present();
      this.itemId = this.navParams.data.id;
      this.http.get(this.apiEndpoint + "church/church?id=" + this.navParams.data.id, this.requestOptions)
      .map(res =>  res.json()).subscribe(res =>{
        this.church = res.data;
        this.church.aboutImages = JSON.parse(this.church.aboutImages);
        this.church.priests = JSON.parse(this.church.priests);
        this.church.churchInAction = JSON.parse(this.church.churchInAction);
        this.church.schedules = JSON.parse(this.church.schedules);

        for(let i=0;i<this.church.schedules.length;i++) {
          if(this.church.schedules[i].day === "monday") {
            this.churchSchedules.monday.push(this.church.schedules[i]);
          } else if(this.church.schedules[i].day === "tuesday") {
            this.churchSchedules.tuesday.push(this.church.schedules[i]);
          } else if(this.church.schedules[i].day === "wednesday") {
            this.churchSchedules.wednesday.push(this.church.schedules[i]);
          } else if(this.church.schedules[i].day === "thursday") {
            this.churchSchedules.thursday.push(this.church.schedules[i]);
          } else if(this.church.schedules[i].day === "friday") {
            this.churchSchedules.friday.push(this.church.schedules[i]);
          } else if(this.church.schedules[i].day === "saturday") {
            this.churchSchedules.saturday.push(this.church.schedules[i]);
          } else if(this.church.schedules[i].day === "sunday") {
            this.churchSchedules.sunday.push(this.church.schedules[i]);
          } 

        }
    
        this.gmapLatitude =parseFloat(this.church.googleMapLatitude);
        this.gmapLongitude = parseFloat(this.church.googleMapLongitude);
        
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
    
        this.church.events = JSON.parse(this.church.events);
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
      for(let i=0;i<this.church.events.length;i++) {
        if ((this.church.events[i].month === this.eventsSelectedNav.month) && (this.church.events[i].year === this.eventsSelectedNav.year)) {
          this.eventsSelectedItem.push(this.church.events[i]);
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
        for(let i = 0;i<this.church.aboutImages.length;i++) {
          this.AddAboutImage(false,this.apiDomain + this.church.aboutImages[i].path);
        }
        
        for(let i = 0;i<this.church.priests.length;i++) {
          this.AddPriest(false,this.apiDomain + this.church.priests[i].path,this.church.priests[i].name);
        }
  
        for(let i = 0;i<this.church.churchInAction.length;i++) {
          this.AddCia(false,this.apiDomain + this.church.churchInAction[i].path,this.church.churchInAction[i].title,this.church.churchInAction[i].dateLocation,this.church.churchInAction[i].category);
        }
  
        for(let i = 0;i<this.church.schedules.length;i++) {
          this.AddSchedule(false,this.church.schedules[i].eventTitle,this.church.schedules[i].startTime,this.church.schedules[i].endTime,this.church.schedules[i].day,this.church.schedules[i].category);
        }
  
        for(let i = 0;i<this.church.events.length;i++) {
          this.AddEvent(false,this.apiDomain + this.church.events[i].path,this.church.events[i].title,this.church.events[i].description,this.church.events[i].month,this.church.events[i].day,this.church.events[i].year);
        }
        
      },500);
      
    }
  
    OnDeleteItem(){
      if(confirm("Are you sure you want to delete this record?")) {
        this.loader = this.loadingCtrl.create({
          content: "Fetching data."
        });
        this.loader.present();
        this.http.delete(this.apiEndpoint + "church/delete-church?id=" + this.church._id, this.requestOptions)
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
      
      let church = {
        "parishName" : form.value.parishName,
        "about" : form.value.about,
        "vicariate" : form.value.vicariate,
        "diocese" : form.value.diocese,
        "parishPriest" : form.value.parishPriest,
        "dateEstablished" : form.value.dateEstablished,
        "patronSaint" : form.value.patronSaint,
        "feastDay" : form.value.feastDay,
        "address" : form.value.address,
        "contactNo" : form.value.contactNo,
        "emailAndWebsite" : form.value.emailAndWebsite,
        "scheduleOfMasses" : form.value.scheduleOfMasses,
        "scheduleOfConfessions" : form.value.scheduleOfConfessions,
        "scheduleOfBaptism" : form.value.scheduleOfBaptism,
        "scheduleOfWeddings" : form.value.scheduleOfWeddings,
        "upcomingEventsAnnouncements" : form.value.upcomingEventsAnnouncements,
        "aboutImages" : "",
        "priests" : "",
        "churchInAction" : "",
        "schedules" : "",
        "googleMapLongitude" : form.value.googleMapLongitude,
        "googleMapLatitude" : form.value.googleMapLatitude,
        "events": ""
      }
  
      // Get Schedules
      let schedulesList = document.getElementsByClassName("church-schedule-div");
      let schedulesArr = []; 
      for(let i =0;i<schedulesList.length;i++) {
        let eventTitleInput : HTMLInputElement = schedulesList[i].children[1].children[0] as HTMLInputElement;
        let startTimeInput : HTMLInputElement = schedulesList[i].children[3].children[0] as HTMLInputElement;
        let endTimeInput : HTMLInputElement = schedulesList[i].children[5].children[0] as HTMLInputElement;
        let dayInput : HTMLSelectElement = schedulesList[i].children[7].children[0] as HTMLSelectElement;
        let categoryInput : HTMLSelectElement = schedulesList[i].children[9].children[0] as HTMLSelectElement;
        schedulesArr.push({
          eventTitle : (eventTitleInput.value !== "") ? eventTitleInput.value : "Unknown",
          startTime :(startTimeInput.value !== "") ? startTimeInput.value : "08:00",
          endTime : (endTimeInput.value !== "") ? endTimeInput.value : "17:00",
          day : dayInput.value,
          category : categoryInput.value
        })
      } 
  
      church.schedules =JSON.stringify(schedulesArr);
  
      //-------------------------------------------About Image Upload Start -------------------------------------------
      //1)Get About Images
      let aboutImagesFiles : Array<File> =  this.GetImagesFrom("church-about-image-div");
      let aboutImagesFormData = new FormData();
      for(let i = 0; i<aboutImagesFiles.length;i++) {
        aboutImagesFormData.append("church-about-images", aboutImagesFiles[i], aboutImagesFiles[i]['name']);
      }
  
      //2)Upload About Images
      this.fileSvc.httpUploadFiles(aboutImagesFormData,"church-about-images").subscribe(resAboutImage=>{
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
          let existingImages = document.getElementsByClassName("church-about-image-div-current");
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
          church.aboutImages= JSON.stringify(aboutImagesPathArr);
          //-------------------------------------------About Image Upload End -------------------------------------------
  
          //-------------------------------------------Priest Record Upload Start -------------------------------------------
          
          //1) Get Priest Image
          let priestImagesFiles : Array<File> =  this.GetImagesFrom("church-priest-div");
          let priestImagesFormData = new FormData();
          for(let i = 0; i<priestImagesFiles.length;i++) {
            priestImagesFormData.append("church-priest-images", priestImagesFiles[i], priestImagesFiles[i]["name"]);
          }
  
          //2)Upload Priest Images
          this.fileSvc.httpUploadFiles(priestImagesFormData,"church-priest-images").subscribe(resPriestImage=>{
            if (!resPriestImage.success) {
              this.showLoading = false;
              this.loader.dismiss();
              this.errorMessage = (resPriestImage.success !== "") ? resPriestImage.err : "Failed to add new record. Please try again.";
              this.showError = true;
            } else {
              //On Priest Images Upload Success
              let priestsArr = [];
  
              //Check Current aboutImages record
              // Add Existing Priest to Array
              let existingPriests = document.getElementsByClassName("church-priest-div-current");
              for(let indx = 0;indx<existingPriests.length;indx++ ) {
                let currentExistingImageIndex = existingPriests[indx].children[0] as HTMLImageElement;
  
                let currentExistingNameIndex : HTMLInputElement = existingPriests[indx].children[2].children[0] as HTMLInputElement;
  
                priestsArr.push(
                  {
                    name : (currentExistingNameIndex.value !== "") ? currentExistingNameIndex.value : "Unknown",
                    path : currentExistingImageIndex.src.replace(this.apiDomain,"")
                  }
                );
              }
  
              
              let churchPriestDiv = document.getElementsByClassName("church-priest-div");
              resPriestImage.data.forEach((element,i) => {
                let inputPriestNameElement = churchPriestDiv[i].children[3].children[0] as HTMLInputElement;
                priestsArr.push(
                  {
                    name : (inputPriestNameElement.value !== "") ? inputPriestNameElement.value : "Unknown",
                    path : element.secure_url.replace(/\\/g, "/")
                    //path : element.path.replace(/\\/g, "/") //For Local
                  }
                );
              });
              
              //Add Priest Record
              church.priests= JSON.stringify(priestsArr); 
              //-------------------------------------------Priest Record Upload Emd -------------------------------------------
  
              //-------------------------------------------CIA Record Upload Start -------------------------------------------
  
              //1) Get Cia Image
              let ciaImagesFiles : Array<File> =  this.GetImagesFrom("church-cia-div");
              let ciaImagesFormData = new FormData();
              for(let i = 0; i<ciaImagesFiles.length;i++) {
                ciaImagesFormData.append("church-cia-images", ciaImagesFiles[i], ciaImagesFiles[i]["name"]);
              }
  
              //2)Upload Cia Images
              this.fileSvc.httpUploadFiles(ciaImagesFormData,"church-cia-images").subscribe(resCiaImage=>{
                if (!resCiaImage.success) {
                  this.showLoading = false;
                  this.loader.dismiss();
                  this.errorMessage = (resCiaImage.success !== "") ? resCiaImage.err : "Failed to add new record. Please try again.";
                  this.showError = true;
                } else {
                  //On Cia Images Upload Success
                  let ciaArr = [];
  
                  //Check Current ciaImages record
                  // Add Existing Priest to Array
                  let existingCia = document.getElementsByClassName("church-cia-div-current");
                  for(let ciaIndx = 0;ciaIndx<existingCia.length;ciaIndx++ ) {
                    let currentExistingCiaImage = existingCia[ciaIndx].children[0] as HTMLImageElement;
                    let currentExistingCiaTitle : HTMLInputElement = existingCia[ciaIndx].children[2].children[0] as HTMLInputElement;
                    let currentExistingCiaDateLocation : HTMLInputElement = existingCia[ciaIndx].children[4].children[0] as HTMLInputElement;
                    let currentExistingCiaCategory : HTMLSelectElement = existingCia[ciaIndx].children[6].children[0] as HTMLSelectElement;
  
                    ciaArr.push(
                      {
                        title : (currentExistingCiaTitle.value !== "") ? currentExistingCiaTitle.value : "Unknown",
                        dateLocation : (currentExistingCiaDateLocation.value !== "") ? currentExistingCiaDateLocation.value : "Unknown",
                        category : currentExistingCiaCategory.value,
                        path : currentExistingCiaImage.src.replace(this.apiDomain,"")
                      }
                    );
                  }
  
                  let churchCiaDiv = document.getElementsByClassName("church-cia-div");
                  resCiaImage.data.forEach((element,i) => {
                    let inputCiaTitleElement = churchCiaDiv[i].children[3].children[0] as HTMLInputElement;
                    let inputCiaDateLocationElement = churchCiaDiv[i].children[5].children[0] as HTMLInputElement;
                    let selectCiaCategory = churchCiaDiv[i].children[7].children[0] as HTMLSelectElement;
                    ciaArr.push(
                      {
                        title : (inputCiaTitleElement.value !== "") ? inputCiaTitleElement.value : "Unknown",
                        dateLocation : (inputCiaDateLocationElement.value !== "") ? inputCiaDateLocationElement.value : "Unknown",
                        category : selectCiaCategory.value,
                        path : element.secure_url.replace(/\\/g, "/")
                        //path : element.path.replace(/\\/g, "/") //For Local
                      }
                    );
                  });
                  //Add CIA Record
                  church.churchInAction= JSON.stringify(ciaArr);
                  //-------------------------------------------CIA Record Upload End -------------------------------------------
  
                  //-------------------------------------------Events Record Upload Start --------------------------------------
  
  
  
                  //-------------------------------------------Events Record Upload End --------------------------------------
                   //1) Get Event Image
                   let eventImagesFiles : Array<File> =  this.GetImagesFrom("church-event-div");
                   let eventImagesFormData = new FormData();
                   for(let i = 0; i<eventImagesFiles.length;i++) {
                     eventImagesFormData.append("church-event-images", eventImagesFiles[i], eventImagesFiles[i]["name"]);
                   }
  
                   //2)Upload Event Images
                  this.fileSvc.httpUploadFiles(eventImagesFormData,"church-event-images").subscribe(resEventImage=>{
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
                      let existingEvent = document.getElementsByClassName("church-event-div-current");
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
  
                      let churchEventDiv = document.getElementsByClassName("church-event-div");
                      resEventImage.data.forEach((element,i) => {
                        let inputEventTitleElement = churchEventDiv[i].children[3].children[0] as HTMLInputElement;
                        let inputEventDescriptionElement = churchEventDiv[i].children[5].children[0] as HTMLInputElement;
                        let inputEventMonthElement = churchEventDiv[i].children[7].children[0] as HTMLSelectElement;
                        let inputEventDayElement = churchEventDiv[i].children[9].children[0] as HTMLSelectElement;
                        let inputEventYearElement = churchEventDiv[i].children[11].children[0] as HTMLSelectElement;
  
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
                      church.events= JSON.stringify(eventArr);
  
                      //-------------------------------------------Events Record Upload End --------------------------------------
  
                      // Proceed to update Church Record
                      this.http.put(this.apiEndpoint + "church/update-church?id=" + this.church._id,church, this.requestOptions)
                      .map(res =>  res.json()).subscribe(res =>{
                        this.showLoading = false;
                        this.loader.dismiss();
                        if(res.success) {
                          this.showSuccess = true;
                          this.successMessage = "Church has been updated successfully."
                          this.church = res.data;
                          // this.informationFinderSvc.UpdateChurchData(this.church);
                          this.church.aboutImages = JSON.parse(this.church.aboutImages);
                          this.church.priests = JSON.parse(this.church.priests);
                          this.church.churchInAction = JSON.parse(this.church.churchInAction);
  
                          this.church.schedules = JSON.parse(this.church.schedules);
                          this.churchSchedules = {
                            monday : [],
                            tuesday : [],
                            wednesday : [],
                            thursday : [],
                            friday :[],
                            saturday : [],
                            sunday : []
                          }
                          for(let i=0;i<this.church.schedules.length;i++) {
                            if(this.church.schedules[i].day === "monday") {
                              this.churchSchedules.monday.push(this.church.schedules[i]);
                            } else if(this.church.schedules[i].day === "tuesday") {
                              this.churchSchedules.tuesday.push(this.church.schedules[i]);
                            } else if(this.church.schedules[i].day === "wednesday") {
                              this.churchSchedules.wednesday.push(this.church.schedules[i]);
                            } else if(this.church.schedules[i].day === "thursday") {
                              this.churchSchedules.thursday.push(this.church.schedules[i]);
                            } else if(this.church.schedules[i].day === "friday") {
                              this.churchSchedules.friday.push(this.church.schedules[i]);
                            } else if(this.church.schedules[i].day === "saturday") {
                              this.churchSchedules.saturday.push(this.church.schedules[i]);
                            } else if(this.church.schedules[i].day === "sunday") {
                              this.churchSchedules.sunday.push(this.church.schedules[i]);
                            } 
                          }
                          
                          this.gmapLatitude =parseFloat(this.church.googleMapLatitude);
                          this.gmapLongitude = parseFloat(this.church.googleMapLongitude);
  
                          this.church.events = JSON.parse(this.church.events);
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
  
                } //Upload Cia Image "On Success -- (Else Statement)"
              }); //Upload Cia Images Subscribe
  
            } //Upload Priest Image "On Success -- (Else Statement)"
          }); //Upload Priest Images Subscribe
  
        } //Upload About Image "On Success -- (Else Statement)"
      }); //Upload About Image Subscribe 
  
  
  
    }
  
    AddSchedule(isNew : boolean,eventTitle:string,startTime : string,endTime : string, day:string,category:string) {
      let titleLabelHtml = '<div><label>Event Title</label></div>'
      let titleInputHtml = '<div><input type="text" name="church-event-name" id="church-event-name"></div>';
      let startTimeLabelHtml = '<div><label>Start Time</label></div>'
      let startTimeInputHtml = '<div><input type="time" name="church-event-start-date" id="church-event-start-date"></div>';
      let endTimeLabelHtml = '<div><label>End Time</label></div>'
      let endTimeInputHtml = '<div><input type="time" name="church-event-end-date" id="church-event-end-date"></div>';
      let dayLabelHtml = '<div><label>Day</label></div>'
      let daySelectHtml = '<div><select name="church-schedule-day" id="church-schedule-day"><option value="monday">Monday</option><option value="tuesday">Tuesday</option><option value="wednesday">Wednesday</option><option value="thursday">Thursday</option><option value="friday">Friday</option><option value="saturday">Saturday</option><option value="sunday">Sunday</option></select></div>';
      let categoryLabelHtml = '<div><label>Category</label></div>'
      let categorySelectHtml = '<div><select name="church-event-category" id="church-event-category"><option value="massess">Massess</option><option value="confessions">Confessions</option><option value="baptism">Baptism</option><option value="weddings">Weddings</option></select></div>';
      let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
      let container = document.getElementById("church-schedule-container");
      let div = document.createElement('div');
      div.className="church-schedule-div";
      div.style.margin = "2px";
      div.style.padding = "5px";
      div.style.width = "100%";
      div.style.maxWidth ="300px";
      div.style.width = "auto";
      div.style.display = "block";
      div.style.borderStyle ="solid";
      div.style.borderWidth = "1px";
      div.style.position = "relative";
  
  
      div.innerHTML=titleLabelHtml + titleInputHtml + startTimeLabelHtml + startTimeInputHtml  + endTimeLabelHtml + endTimeInputHtml + dayLabelHtml + daySelectHtml + categoryLabelHtml + categorySelectHtml + removeItemHtml;
      container.appendChild(div);
  
      if(!isNew) {
        let titleInput : HTMLInputElement = div.children[1].children[0] as HTMLInputElement;
        titleInput.value = eventTitle;
  
        let startTimeInput : HTMLInputElement = div.children[3].children[0] as HTMLInputElement;
        startTimeInput.value = startTime;
  
        let endTimeInput : HTMLInputElement = div.children[5].children[0] as HTMLInputElement;
        endTimeInput.value = endTime;
  
        let daySelect : HTMLSelectElement = div.children[7].children[0] as HTMLSelectElement;
        daySelect.value = day;
  
        let categorySelect : HTMLSelectElement = div.children[9].children[0] as HTMLSelectElement;
        categorySelect.value = category;
      
      } 
  
      let removeElem : HTMLButtonElement = div.children[10] as HTMLButtonElement;
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
  
    AddEvent(isNew : boolean,imgSrc :string,title:string,description : string,month : string,day:string, year : string){
      let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" name="church-event-image" class="church-event-image" accept="image/*">';
      let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">';
      let titleLabelHtml = '<div><label>Title</label></div>'
      let titleInputHtml = '<div><input type="text" name="church-event-name" id="church-event-name"></div>';
      let descriptionLabelHtml = '<div><label>Description</label></div>'
      let descriptionInputHtml = '<div><input type="text" name="church-event-description" id="church-event-description"></div>';
  
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
      let monthSelectHtml = '<div><select style="text-transform:capitalize;" name="church-event-month" id="church-event-month">';
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
      let yearSelectHtml = '<div><select name="church-event-year" id="church-event-year">';
      for(let i =0;i<yearList.length;i++) {
        if(yearList[i] == new Date().getFullYear()) {
          yearSelectHtml += '<option value="'+ yearList[i] +'" selected>' + yearList[i] + '</option>';
        } else {
          yearSelectHtml += '<option value="'+ yearList[i] +'">' + yearList[i] + '</option>';
        }
        
      }
      yearSelectHtml += '</select></div>';
  
      let dayLabelHtml = '<div><label>Day</label></div>';
      let daySelectHtml = '<div><select name="church-event-day" id="church-event-day">';
      for(let i =1;i<=31;i++) {
          daySelectHtml += '<option value="'+ i +'">' + i + '</option>';
      }
      daySelectHtml += '</select></div>';
  
  
      let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
      let container = document.getElementById("church-events-container");
      let div = document.createElement('div');
      div.className="church-event-div";
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
        div.className="church-event-div-current";
  
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
  
  
    AddCia(isNew : boolean,imgSrc :string,title:string,dateLocation : string,category : string) {
      let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" name="church-cia-image" class="church-cia-image" accept="image/*">';
      let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">';
      let titleLabelHtml = '<div><label>Title</label></div>'
      let titleInputHtml = '<div><input type="text" name="church-cia-name" id="church-cia-name"></div>';
      let dateLocationLabelHtml = '<div><label>Date and Location</label></div>'
      let dateLocationInputHtml = '<div><input type="text" name="church-cia-date-location" id="church-cia-date-location"></div>';
      let categoryLabelHtml = '<div><label>Category</label></div>'
      let categorySelectHtml = '<div><select name="church-cia-date-location" id="church-cia-date-location"><option value="socialAction">Social Action</option><option value="activities">Activities</option><option value="fiesta">Fiesta</option></select></div>';
      let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
      let container = document.getElementById("church-cia-container");
      let div = document.createElement('div');
      div.className="church-cia-div";
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
        div.innerHTML=imagePreviewerHtml + imageInputHtml + titleLabelHtml + titleInputHtml  + dateLocationLabelHtml + dateLocationInputHtml + categoryLabelHtml + categorySelectHtml + removeItemHtml;
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
  
        let removeElem : HTMLButtonElement = div.children[8] as HTMLButtonElement;
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
        div.className="church-cia-div-current";
        div.innerHTML=imagePreviewerHtml + titleLabelHtml + titleInputHtml  + dateLocationLabelHtml + dateLocationInputHtml + categoryLabelHtml + categorySelectHtml + removeItemHtml;
        container.appendChild(div);
      
        let titleInput : HTMLInputElement = div.children[2].children[0] as HTMLInputElement;
        titleInput.value = title;
  
        let dateLocationInput : HTMLInputElement = div.children[4].children[0] as HTMLInputElement;
        dateLocationInput.value = dateLocation;
  
        let categorySelect : HTMLSelectElement = div.children[6].children[0] as HTMLSelectElement;
        categorySelect.value = category;
  
        let imgPrev : HTMLImageElement = div.children[0] as HTMLImageElement;
        imgPrev.src= imgSrc;
      
        let removeElem : HTMLButtonElement = div.children[7] as HTMLButtonElement;
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
  
  
    AddPriest(isNew : boolean,imgSrc :string,name:string){
      let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" name="church-priest-image" class="church-priest-image" accept="image/*">';
      let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">';
      let nameLabelHtml = '<div><label>Name</label></div>'
      let nameInputHtml = '<div><input type="text" name="church-priest-name" id="church-priest-name"></div>';
      let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
      let container = document.getElementById("church-priest-container");
      let div = document.createElement('div');
      div.className="church-priest-div";
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
        div.className="church-priest-div-current";
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
      let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" name="church-about-image" class="church-about-image" accept="image/*">';
      let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">'
      let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
      let container = document.getElementById("church-about-images-container");
      let div = document.createElement('div');
      
      div.style.margin = "2px";
      div.style.padding = "5px";
      div.style.width = "100%";
      div.style.maxWidth ="300px";
      div.style.display = "block";
      div.style.borderStyle ="solid";
      div.style.borderWidth = "1px";
      div.style.position = "relative";
  
      if(isNew) {
        div.className="church-about-image-div";
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
        div.className="church-about-image-div-current";
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
  