import { Component } from '@angular/core';
import {  NavController, NavParams,LoadingController } from 'ionic-angular';
import { BackEndConfig } from '../../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import {FileService} from '../../../providers/file/file.service';
import 'rxjs/add/operator/map';
import {AuthServiceProvider} from '../../../providers/auth-service/auth-service';
import {GoogleMapsAPIWrapper} from '@agm/core/services/google-maps-api-wrapper';

@Component({
  selector: 'page-information-finder-detail-diocese',
  templateUrl: 'information-finder-detail-diocese.html'
  // styleUrls: ['/src/pages/information-finder/information-finder.scss']
})
export class InformationFinderDetailDiocesePage {

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
    diaSelectedCategory = "all";
    diocese;
    selectedEventCategory = "all";
    isUserAdminOrUploader = false;
    dioceseSchedules = {
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

    // if (!value) return value;
    // let hrs;
    // let mins;
    // let newTime;
    // let sign;
    // hrs = parseInt(value.split(":")[0]);
    // mins = value.split(":")[1];

    // if(hrs < 12) {
    //   sign = "AM";
    // } else {
    //   sign = "PM";
    // }

    // if(hrs > 12) {
    //   newTime = hrs - 12;
    // } else {
    //   newTime = hrs;
    // }

    // return newTime + ":" + mins + " " + sign;

    ionViewDidEnter(){
      this.loader = this.loadingCtrl.create({
        content: "Fetching data."
      });
  
      this.loader.present();
      this.itemId = this.navParams.data.id;
        this.http.get(this.apiEndpoint + "diocese/diocese?id=" + this.navParams.data.id, this.requestOptions)
        .map(res =>  res.json()).subscribe(res =>{
            this.diocese = res.data;
            // this.informationFinderSvc.UpdateDioceseData(this.diocese);
            this.diocese.aboutImages = JSON.parse(this.diocese.aboutImages);
            this.diocese.priests = JSON.parse(this.diocese.priests);
            this.diocese.dioceseInAction = JSON.parse(this.diocese.dioceseInAction);
    
            this.diocese.listOfVicariates = JSON.parse(this.diocese.listOfVicariates);
            this.diocese.listOfParishes = JSON.parse(this.diocese.listOfParishes);
            this.diocese.listOfSchools = JSON.parse(this.diocese.listOfSchools);
            this.diocese.counselingCenters = JSON.parse(this.diocese.counselingCenters);
            this.diocese.retreatHousesPastoralFormationHouses = JSON.parse(this.diocese.retreatHousesPastoralFormationHouses);
            this.diocese.chaplaincesHospitalWithChaplains = JSON.parse(this.diocese.chaplaincesHospitalWithChaplains);
            this.diocese.charitableInstitutionsAndTheirCategories = JSON.parse(this.diocese.charitableInstitutionsAndTheirCategories);
            this.diocese.associationsReligiousCongregations = JSON.parse(this.diocese.associationsReligiousCongregations);
            this.diocese.listOfCommissionsNamesOfCommisionersContactNumberAddress = JSON.parse(this.diocese.listOfCommissionsNamesOfCommisionersContactNumberAddress);
    
    
            this.diocese.schedules = JSON.parse(this.diocese.schedules);
    
            for(let i=0;i<this.diocese.schedules.length;i++) {
            if(this.diocese.schedules[i].day === "monday") {
                this.dioceseSchedules.monday.push(this.diocese.schedules[i]);
            } else if(this.diocese.schedules[i].day === "tuesday") {
                this.dioceseSchedules.tuesday.push(this.diocese.schedules[i]);
            } else if(this.diocese.schedules[i].day === "wednesday") {
                this.dioceseSchedules.wednesday.push(this.diocese.schedules[i]);
            } else if(this.diocese.schedules[i].day === "thursday") {
                this.dioceseSchedules.thursday.push(this.diocese.schedules[i]);
            } else if(this.diocese.schedules[i].day === "friday") {
                this.dioceseSchedules.friday.push(this.diocese.schedules[i]);
            } else if(this.diocese.schedules[i].day === "saturday") {
                this.dioceseSchedules.saturday.push(this.diocese.schedules[i]);
            } else if(this.diocese.schedules[i].day === "sunday") {
                this.dioceseSchedules.sunday.push(this.diocese.schedules[i]);
            } 
    
            }
    
            this.gmapLatitude =parseFloat(this.diocese.googleMapLatitude);
            this.gmapLongitude = parseFloat(this.diocese.googleMapLongitude);
            
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
    
            this.diocese.events = JSON.parse(this.diocese.events);
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
        for(let i=0;i<this.diocese.events.length;i++) {
          if ((this.diocese.events[i].month === this.eventsSelectedNav.month) && (this.diocese.events[i].year === this.eventsSelectedNav.year)) {
            this.eventsSelectedItem.push(this.diocese.events[i]);
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
          for(let i = 0;i<this.diocese.aboutImages.length;i++) {
            this.AddAboutImage(false,this.apiDomain + this.diocese.aboutImages[i].path);
          }
          
          for(let i = 0;i<this.diocese.priests.length;i++) {
            this.AddPriest(false,this.apiDomain + this.diocese.priests[i].path,this.diocese.priests[i].name);
          }
    
          for(let i = 0;i<this.diocese.dioceseInAction.length;i++) {
            this.AddDia(false,this.apiDomain + this.diocese.dioceseInAction[i].path,this.diocese.dioceseInAction[i].title,this.diocese.dioceseInAction[i].dateLocation,this.diocese.dioceseInAction[i].category);
          }
    
          for(let i = 0;i<this.diocese.schedules.length;i++) {
            this.AddSchedule(false,this.diocese.schedules[i].eventTitle,this.diocese.schedules[i].startTime,this.diocese.schedules[i].endTime,this.diocese.schedules[i].day,this.diocese.schedules[i].category);
          }
    
          for(let i = 0;i<this.diocese.events.length;i++) {
            this.AddEvent(false,this.apiDomain + this.diocese.events[i].path,this.diocese.events[i].title,this.diocese.events[i].description,this.diocese.events[i].month,this.diocese.events[i].day,this.diocese.events[i].year);
          }
    
          for(let i = 0;i<this.diocese.listOfVicariates.length;i++) {
            this.AddDynamicTextInputNameAndLink(
              'diocese-vicariates-container',
              'diocese-vicariates-div',
              false,
              this.diocese.listOfVicariates[i].name,
              this.diocese.listOfVicariates[i].link);
          }
    
          for(let i = 0;i<this.diocese.listOfParishes.length;i++) {
            this.AddDynamicTextInputNameAndLink(
              'diocese-parishes-container',
              'diocese-parishes-div',
              false,
              this.diocese.listOfParishes[i].name,
              this.diocese.listOfParishes[i].link);
          }
    
          for(let i = 0;i<this.diocese.listOfSchools.length;i++) {
            this.AddDynamicTextInputNameAndLink(
              'diocese-schools-container',
              'diocese-schools-div',
              false,
              this.diocese.listOfSchools[i].name,
              this.diocese.listOfSchools[i].link);
          }
    
          for(let i = 0;i<this.diocese.counselingCenters.length;i++) {
            this.AddDynamicTextInputNameAndLink(
              'diocese-counseling-centers-container',
              'diocese-counseling-centers-div',
              false,
              this.diocese.counselingCenters[i].name,
              this.diocese.counselingCenters[i].link);
          }
    
          for(let i = 0;i<this.diocese.retreatHousesPastoralFormationHouses.length;i++) {
            this.AddDynamicTextInputNameAndLink(
              'diocese-retreat-houses-pastoral-formation-houses-container',
              'diocese-retreat-houses-pastoral-formation-houses-div',
              false,
              this.diocese.retreatHousesPastoralFormationHouses[i].name,
              this.diocese.retreatHousesPastoralFormationHouses[i].link);
          }
    
          for(let i = 0;i<this.diocese.chaplaincesHospitalWithChaplains.length;i++) {
            this.AddDynamicTextInputNameAndLink(
              'diocese-chaplaincies-hospitals-with-chaplains-container',
              'diocese-chaplaincies-hospitals-with-chaplains-div',
              false,
              this.diocese.chaplaincesHospitalWithChaplains[i].name,
              this.diocese.chaplaincesHospitalWithChaplains[i].link);
          }
    
          for(let i = 0;i<this.diocese.charitableInstitutionsAndTheirCategories.length;i++) {
            this.AddDynamicTextInputNameAndLink(
              'diocese-charitable-institutions-container',
              'diocese-charitable-institutions-div',
              false,
              this.diocese.charitableInstitutionsAndTheirCategories[i].name,
              this.diocese.charitableInstitutionsAndTheirCategories[i].link);
          }
    
          for(let i = 0;i<this.diocese.associationsReligiousCongregations.length;i++) {
            this.AddDynamicTextInputNameAndLink(
              'diocese-associations-religious-congregations-container',
              'diocese-associations-religious-congregations-div',
              false,
              this.diocese.associationsReligiousCongregations[i].name,
              this.diocese.associationsReligiousCongregations[i].link);
          }
    
          for(let i = 0;i<this.diocese.listOfCommissionsNamesOfCommisionersContactNumberAddress.length;i++) {
            this.AddCommissionsCommissioners(
              false,
              this.diocese.listOfCommissionsNamesOfCommisionersContactNumberAddress[i].commission,
              this.diocese.listOfCommissionsNamesOfCommisionersContactNumberAddress[i].commissioner,
              this.diocese.listOfCommissionsNamesOfCommisionersContactNumberAddress[i].address,
              this.diocese.listOfCommissionsNamesOfCommisionersContactNumberAddress[i].contact);
          }
    
    
          
        },500);
        
      }
    
      OnDeleteItem(){
        if(confirm("Are you sure you want to delete this record?")) {
          this.loader = this.loadingCtrl.create({
            content: "Fetching data."
          });
          this.loader.present();

            this.http.delete(this.apiEndpoint + "diocese/delete-diocese?id=" + this.diocese._id, this.requestOptions)
            .map(res =>  res.json()).subscribe(res =>{
              this.loader.dismiss();
            if(res.success) {
              setTimeout(()=>{
                  this.navCtrl.pop();
                // this.router.navigate(["information-finder/search/diocese"])
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
    
        let diocese = {
          "dioceseName" : form.value.dioceseName,
          "about" : form.value.about,
          "presentBishopName" : form.value.presentBishopName,
          "auxiliaryBishopsName" : form.value.auxiliaryBishopsName,
          "vicarGeneralName" : form.value.vicarGeneralName,
          "provincesCovered" : form.value.provincesCovered,
          "citiesMunicipalitiesCovered" : form.value.citiesMunicipalitiesCovered,
    
          "population" : form.value.population,
          "numberOfPriests" : form.value.numberOfPriests,
          "numberOfReligious" : form.value.numberOfReligious,
          "announcementsCirculars" : form.value.announcementsCirculars,
    
          "address" : form.value.address,
          "contactNo" : form.value.contactNo,
          "emailAndWebsite" : form.value.emailAndWebsite,
          "aboutImages" : "",
          "priests" : "",
          "dioceseInAction" : "",
          "schedules" : "",
          "googleMapLongitude" : form.value.googleMapLongitude,
          "googleMapLatitude" : form.value.googleMapLatitude,
          "events" : "",
    
          "listOfVicariates" : "",
          "listOfParishes" : "",
          "listOfSchools" : "",
          "counselingCenters" : "",
          "retreatHousesPastoralFormationHouses" : "",
          "chaplaincesHospitalWithChaplains" : "",
          "charitableInstitutionsAndTheirCategories" : "",
          "associationsReligiousCongregations" : "",
          "listOfCommissionsNamesOfCommisionersContactNumberAddress" : "",
        }
    
        // Get Vicariates
        let vicariatesList = document.getElementsByClassName("diocese-vicariates-div");
        let vicariatesArr = []; 
        for(let i =0;i<vicariatesList.length;i++) {
          let vicariatesNameInput : HTMLInputElement = vicariatesList[i].children[1].children[0] as HTMLInputElement;
          let vicariatesLinkInput : HTMLInputElement = vicariatesList[i].children[3].children[0] as HTMLInputElement;
          vicariatesArr.push({
            name : (vicariatesNameInput.value !== "") ? vicariatesNameInput.value : "Unknown",
            link : (vicariatesLinkInput.value !== "") ? vicariatesLinkInput.value : "Unknown"
          })
        } 
        diocese.listOfVicariates =JSON.stringify(vicariatesArr);
    
        // Get Parishes
        let parishesList = document.getElementsByClassName("diocese-parishes-div");
        let parishesArr = []; 
        for(let i =0;i<parishesList.length;i++) {
          let parishesNameInput : HTMLInputElement = parishesList[i].children[1].children[0] as HTMLInputElement;
          let parishesLinkInput : HTMLInputElement = parishesList[i].children[3].children[0] as HTMLInputElement;
          parishesArr.push({
            name : (parishesNameInput.value !== "") ? parishesNameInput.value : "Unknown",
            link : (parishesLinkInput.value !== "") ? parishesLinkInput.value : "Unknown"
          })
        } 
        diocese.listOfParishes =JSON.stringify(parishesArr);
    
    
        // Get Schools
        let schoolsList = document.getElementsByClassName("diocese-schools-div");
        let schoolsArr = []; 
        for(let i =0;i<schoolsList.length;i++) {
          let schoolsNameInput : HTMLInputElement = schoolsList[i].children[1].children[0] as HTMLInputElement;
          let schoolsLinkInput : HTMLInputElement = schoolsList[i].children[3].children[0] as HTMLInputElement;
          schoolsArr.push({
            name : (schoolsNameInput.value !== "") ? schoolsNameInput.value : "Unknown",
            link : (schoolsLinkInput.value !== "") ? schoolsLinkInput.value : "Unknown"
          })
        } 
        diocese.listOfSchools =JSON.stringify(schoolsArr);
    
        // Get Counseling Centers
        let counselingCentersList = document.getElementsByClassName("diocese-counseling-centers-div");
        let counselingCentersArr = []; 
        for(let i =0;i<counselingCentersList.length;i++) {
          let counselingCentersNameInput : HTMLInputElement = counselingCentersList[i].children[1].children[0] as HTMLInputElement;
          let counselingCentersLinkInput : HTMLInputElement = counselingCentersList[i].children[3].children[0] as HTMLInputElement;
          counselingCentersArr.push({
            name : (counselingCentersNameInput.value !== "") ? counselingCentersNameInput.value : "Unknown",
            link : (counselingCentersLinkInput.value !== "") ? counselingCentersLinkInput.value : "Unknown"
          })
        } 
        diocese.counselingCenters =JSON.stringify(counselingCentersArr);
    
        // Get Retreat Houses / Pastoral Formation Houses
        let retreatHousesPastoralFormationHousesList = document.getElementsByClassName("diocese-retreat-houses-pastoral-formation-houses-div");
        let retreatHousesPastoralFormationHousesArr = []; 
        for(let i =0;i<retreatHousesPastoralFormationHousesList.length;i++) {
          let retreatHousesPastoralFormationHousesNameInput : HTMLInputElement = retreatHousesPastoralFormationHousesList[i].children[1].children[0] as HTMLInputElement;
          let retreatHousesPastoralFormationHousesLinkInput : HTMLInputElement = retreatHousesPastoralFormationHousesList[i].children[3].children[0] as HTMLInputElement;
          retreatHousesPastoralFormationHousesArr.push({
            name : (retreatHousesPastoralFormationHousesNameInput.value !== "") ? retreatHousesPastoralFormationHousesNameInput.value : "Unknown",
            link : (retreatHousesPastoralFormationHousesLinkInput.value !== "") ? retreatHousesPastoralFormationHousesLinkInput.value : "Unknown"
          })
        } 
        diocese.retreatHousesPastoralFormationHouses =JSON.stringify(retreatHousesPastoralFormationHousesArr);
    
    
        //Get Chaplaincies / Hospitals with Chaplains
        let chaplainciesHospitalWithChaplainsList = document.getElementsByClassName("diocese-chaplaincies-hospitals-with-chaplains-div");
        let chaplainciesHospitalWithChaplainsArr = []; 
        for(let i =0;i<chaplainciesHospitalWithChaplainsList.length;i++) {
          let chaplainciesHospitalWithChaplainsNameInput : HTMLInputElement = chaplainciesHospitalWithChaplainsList[i].children[1].children[0] as HTMLInputElement;
          let chaplainciesHospitalWithChaplainsLinkInput : HTMLInputElement = chaplainciesHospitalWithChaplainsList[i].children[3].children[0] as HTMLInputElement;
          chaplainciesHospitalWithChaplainsArr.push({
            name : (chaplainciesHospitalWithChaplainsNameInput.value !== "") ? chaplainciesHospitalWithChaplainsNameInput.value : "Unknown",
            link : (chaplainciesHospitalWithChaplainsLinkInput.value !== "") ? chaplainciesHospitalWithChaplainsLinkInput.value : "Unknown"
          })
        } 
        diocese.chaplaincesHospitalWithChaplains =JSON.stringify(chaplainciesHospitalWithChaplainsArr);
    
    
        // Get Charitable Institutions
        let charitableInstitutionList = document.getElementsByClassName("diocese-charitable-institutions-div");
        let charitableInstitutionsArr = []; 
        for(let i =0;i<charitableInstitutionList.length;i++) {
          let charitableInstitutionNameInput : HTMLInputElement = charitableInstitutionList[i].children[1].children[0] as HTMLInputElement;
          let charitableInstitutionLinkInput : HTMLInputElement = charitableInstitutionList[i].children[3].children[0] as HTMLInputElement;
          charitableInstitutionsArr.push({
            name : (charitableInstitutionNameInput.value !== "") ? charitableInstitutionNameInput.value : "Unknown",
            link : (charitableInstitutionLinkInput.value !== "") ? charitableInstitutionLinkInput.value : "Unknown"
          })
        } 
        diocese.charitableInstitutionsAndTheirCategories =JSON.stringify(charitableInstitutionsArr);
    
        // Get Associations and Religious Congregations 
        let associationsReligiousCongregationsList = document.getElementsByClassName("diocese-associations-religious-congregations-div");
        let associationsReligiousCongregationsArr = []; 
        for(let i =0;i<associationsReligiousCongregationsList.length;i++) {
          let associationsReligiousCongregationsNameInput : HTMLInputElement = associationsReligiousCongregationsList[i].children[1].children[0] as HTMLInputElement;
          let associationsReligiousCongregationsLinkInput : HTMLInputElement = associationsReligiousCongregationsList[i].children[3].children[0] as HTMLInputElement;
          associationsReligiousCongregationsArr.push({
            name : (associationsReligiousCongregationsNameInput.value !== "") ? associationsReligiousCongregationsNameInput.value : "Unknown",
            link : (associationsReligiousCongregationsLinkInput.value !== "") ? associationsReligiousCongregationsLinkInput.value : "Unknown"
          })
        } 
        diocese.associationsReligiousCongregations =JSON.stringify(associationsReligiousCongregationsArr);
    
        // Get Commissions and Commissioner 
        let commissionsCommissionerList = document.getElementsByClassName("diocese-commissions-and-commissioners-div");
        let commissionsCommissionersArr = []; 
        for(let i =0;i<commissionsCommissionerList.length;i++) {
          let commissionInput : HTMLInputElement = commissionsCommissionerList[i].children[1].children[0] as HTMLInputElement;
          let commissionerInput : HTMLInputElement = commissionsCommissionerList[i].children[3].children[0] as HTMLInputElement;
          let addressInput : HTMLInputElement = commissionsCommissionerList[i].children[5].children[0] as HTMLInputElement;
          let contactInput : HTMLInputElement = commissionsCommissionerList[i].children[7].children[0] as HTMLInputElement;
          commissionsCommissionersArr.push({
            commission : (commissionInput.value !== "") ? commissionInput.value : "Unknown",
            commissioner : (commissionerInput.value !== "") ? commissionerInput.value : "Unknown",
            address : (addressInput.value !== "") ? addressInput.value : "Unknown",
            contact : (contactInput.value !== "") ? contactInput.value : "Unknown",
          })
        } 
        diocese.listOfCommissionsNamesOfCommisionersContactNumberAddress =JSON.stringify(commissionsCommissionersArr);
    
        // Get Schedules
        let schedulesList = document.getElementsByClassName("diocese-schedule-div");
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
    
        diocese.schedules =JSON.stringify(schedulesArr);
    
    
        //-------------------------------------------About Image Upload Start -------------------------------------------
        //1)Get About Images
        let aboutImagesFiles : Array<File> =  this.GetImagesFrom("diocese-about-image-div");
        let aboutImagesFormData = new FormData();
        for(let i = 0; i<aboutImagesFiles.length;i++) {
          aboutImagesFormData.append("diocese-about-images", aboutImagesFiles[i], aboutImagesFiles[i]['name']);
        }
    
        //2)Upload About Images
        this.fileSvc.httpUploadFiles(aboutImagesFormData,"diocese-about-images").subscribe(resAboutImage=>{
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
            let existingImages = document.getElementsByClassName("diocese-about-image-div-current");
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
            diocese.aboutImages= JSON.stringify(aboutImagesPathArr);
            //-------------------------------------------About Image Upload End -------------------------------------------
    
            //-------------------------------------------Priest Record Upload Start -------------------------------------------
            
            //1) Get Priest Image
            let priestImagesFiles : Array<File> =  this.GetImagesFrom("diocese-priest-div");
            let priestImagesFormData = new FormData();
            for(let i = 0; i<priestImagesFiles.length;i++) {
              priestImagesFormData.append("diocese-priest-images", priestImagesFiles[i], priestImagesFiles[i]["name"]);
            }
    
            //2)Upload Priest Images
            this.fileSvc.httpUploadFiles(priestImagesFormData,"diocese-priest-images").subscribe(resPriestImage=>{
              if (!resPriestImage.success) {
                this.showLoading = false;
                this.loader.dismiss();
                this.errorMessage = (resPriestImage.success !== "") ? resAboutImage.err : "Failed to add new record. Please try again.";
                this.showError = true;
              } else {
                //On Priest Images Upload Success
                let priestsArr = [];
    
                //Check Current aboutImages record
                // Add Existing Priest to Array
                let existingPriests = document.getElementsByClassName("diocese-priest-div-current");
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
    
                
                let diocesePriestDiv = document.getElementsByClassName("diocese-priest-div");
                resPriestImage.data.forEach((element,i) => {
                  let inputPriestNameElement = diocesePriestDiv[i].children[3].children[0] as HTMLInputElement;
                  priestsArr.push(
                    {
                      name : (inputPriestNameElement.value !== "") ? inputPriestNameElement.value : "Unknown",
                      path : element.secure_url.replace(/\\/g, "/")
                      //path : element.path.replace(/\\/g, "/") //For Local
                    }
                  );
                });
                
                //Add Priest Record
                diocese.priests= JSON.stringify(priestsArr); 
                //-------------------------------------------Priest Record Upload Emd -------------------------------------------
    
                //-------------------------------------------DIA Record Upload Start -------------------------------------------
    
                //1) Get Dia Image
                let diaImagesFiles : Array<File> =  this.GetImagesFrom("diocese-dia-div");
                let diaImagesFormData = new FormData();
                for(let i = 0; i<diaImagesFiles.length;i++) {
                  diaImagesFormData.append("diocese-dia-images", diaImagesFiles[i], diaImagesFiles[i]["name"]);
                }
    
                //2)Upload Dia Images
                this.fileSvc.httpUploadFiles(diaImagesFormData,"diocese-dia-images").subscribe(resDiaImage=>{
                  if (!resDiaImage.success) {
                    this.showLoading = false;
                    this.loader.dismiss();
                    this.errorMessage = (resDiaImage.success !== "") ? resAboutImage.err : "Failed to add new record. Please try again.";
                    this.showError = true;
                  } else {
                    //On dia Images Upload Success
                    let diaArr = [];
    
                    //Check Current diaImages record
                    // Add Existing Priest to Array
                    let existingDia = document.getElementsByClassName("diocese-dia-div-current");
                    for(let diaIndx = 0;diaIndx<existingDia.length;diaIndx++ ) {
                      let currentExistingDiaImage = existingDia[diaIndx].children[0] as HTMLImageElement;
                      let currentExistingDiaTitle : HTMLInputElement = existingDia[diaIndx].children[2].children[0] as HTMLInputElement;
                      let currentExistingDiaDateLocation : HTMLInputElement = existingDia[diaIndx].children[4].children[0] as HTMLInputElement;
                      let currentExistingDiaCategory : HTMLSelectElement = existingDia[diaIndx].children[6].children[0] as HTMLSelectElement;
    
                      diaArr.push(
                        {
                          title : (currentExistingDiaTitle.value !== "") ? currentExistingDiaTitle.value : "Unknown",
                          dateLocation : (currentExistingDiaDateLocation.value !== "") ? currentExistingDiaDateLocation.value : "Unknown",
                          category : currentExistingDiaCategory.value,
                          path : currentExistingDiaImage.src.replace(this.apiDomain,"")
                        }
                      );
                    }
    
                    let dioceseDiaDiv = document.getElementsByClassName("diocese-dia-div");
                    resDiaImage.data.forEach((element,i) => {
                      let inputDiaTitleElement = dioceseDiaDiv[i].children[3].children[0] as HTMLInputElement;
                      let inputDiaDateLocationElement = dioceseDiaDiv[i].children[5].children[0] as HTMLInputElement;
                      let selectDiaCategory = dioceseDiaDiv[i].children[7].children[0] as HTMLSelectElement;
                      diaArr.push(
                        {
                          title : (inputDiaTitleElement.value !== "") ? inputDiaTitleElement.value : "Unknown",
                          dateLocation : (inputDiaDateLocationElement.value !== "") ? inputDiaDateLocationElement.value : "Unknown",
                          category : selectDiaCategory.value,
                          path : element.secure_url.replace(/\\/g, "/")
                          //path : element.path.replace(/\\/g, "/") //For Local
                        }
                      );
                    });
                    //Add DIA Record
                    diocese.dioceseInAction= JSON.stringify(diaArr);
                    //-------------------------------------------DIA Record Upload End -------------------------------------------
    
                    //-------------------------------------------Events Record Upload Start --------------------------------------
    
    
    
                    //-------------------------------------------Events Record Upload End --------------------------------------
                     //1) Get Event Image
                     let eventImagesFiles : Array<File> =  this.GetImagesFrom("diocese-event-div");
                     let eventImagesFormData = new FormData();
                     for(let i = 0; i<eventImagesFiles.length;i++) {
                       eventImagesFormData.append("diocese-event-images", eventImagesFiles[i], eventImagesFiles[i]["name"]);
                     }
    
                     //2)Upload Event Images
                    this.fileSvc.httpUploadFiles(eventImagesFormData,"diocese-event-images").subscribe(resEventImage=>{
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
                        let existingEvent = document.getElementsByClassName("diocese-event-div-current");
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
    
                        let dioceseEventDiv = document.getElementsByClassName("diocese-event-div");
                        resEventImage.data.forEach((element,i) => {
                          let inputEventTitleElement = dioceseEventDiv[i].children[3].children[0] as HTMLInputElement;
                          let inputEventDescriptionElement = dioceseEventDiv[i].children[5].children[0] as HTMLInputElement;
                          let inputEventMonthElement = dioceseEventDiv[i].children[7].children[0] as HTMLSelectElement;
                          let inputEventDayElement = dioceseEventDiv[i].children[9].children[0] as HTMLSelectElement;
                          let inputEventYearElement = dioceseEventDiv[i].children[11].children[0] as HTMLSelectElement;
    
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
                        diocese.events= JSON.stringify(eventArr);
    
                        //-------------------------------------------Events Record Upload End --------------------------------------
    
                        // Proceed to update Diocese Record
                        this.http.put(this.apiEndpoint + "diocese/update-diocese?id=" + this.diocese._id,diocese, this.requestOptions)
                        .map(res =>  res.json()).subscribe(res =>{
                          this.showLoading = false;
                          this.loader.dismiss();
                          if(res.success) {
                            this.showSuccess = true;
                            this.successMessage = "Diocese has been updated successfully."
                            this.diocese = res.data;
                            // this.informationFinderSvc.UpdateDioceseData(this.diocese);
                            this.diocese.aboutImages = JSON.parse(this.diocese.aboutImages);
                            this.diocese.priests = JSON.parse(this.diocese.priests);
                            this.diocese.dioceseInAction = JSON.parse(this.diocese.dioceseInAction);
                            
                            this.diocese.listOfVicariates = JSON.parse(this.diocese.listOfVicariates);
                            this.diocese.listOfParishes = JSON.parse(this.diocese.listOfParishes);
                            this.diocese.listOfSchools = JSON.parse(this.diocese.listOfSchools);
                            this.diocese.counselingCenters = JSON.parse(this.diocese.counselingCenters);
                            this.diocese.retreatHousesPastoralFormationHouses = JSON.parse(this.diocese.retreatHousesPastoralFormationHouses);
                            this.diocese.chaplaincesHospitalWithChaplains = JSON.parse(this.diocese.chaplaincesHospitalWithChaplains);
                            this.diocese.charitableInstitutionsAndTheirCategories = JSON.parse(this.diocese.charitableInstitutionsAndTheirCategories);
                            this.diocese.associationsReligiousCongregations = JSON.parse(this.diocese.associationsReligiousCongregations);
                            this.diocese.listOfCommissionsNamesOfCommisionersContactNumberAddress = JSON.parse(this.diocese.listOfCommissionsNamesOfCommisionersContactNumberAddress);     
    
                            this.diocese.schedules = JSON.parse(this.diocese.schedules);
                            this.dioceseSchedules = {
                              monday : [],
                              tuesday : [],
                              wednesday : [],
                              thursday : [],
                              friday :[],
                              saturday : [],
                              sunday : []
                            }
                            for(let i=0;i<this.diocese.schedules.length;i++) {
                              if(this.diocese.schedules[i].day === "monday") {
                                this.dioceseSchedules.monday.push(this.diocese.schedules[i]);
                              } else if(this.diocese.schedules[i].day === "tuesday") {
                                this.dioceseSchedules.tuesday.push(this.diocese.schedules[i]);
                              } else if(this.diocese.schedules[i].day === "wednesday") {
                                this.dioceseSchedules.wednesday.push(this.diocese.schedules[i]);
                              } else if(this.diocese.schedules[i].day === "thursday") {
                                this.dioceseSchedules.thursday.push(this.diocese.schedules[i]);
                              } else if(this.diocese.schedules[i].day === "friday") {
                                this.dioceseSchedules.friday.push(this.diocese.schedules[i]);
                              } else if(this.diocese.schedules[i].day === "saturday") {
                                this.dioceseSchedules.saturday.push(this.diocese.schedules[i]);
                              } else if(this.diocese.schedules[i].day === "sunday") {
                                this.dioceseSchedules.sunday.push(this.diocese.schedules[i]);
                              } 
                            }
                            
                            this.gmapLatitude =parseFloat(this.diocese.googleMapLatitude);
                            this.gmapLongitude = parseFloat(this.diocese.googleMapLongitude);
    
                            this.diocese.events = JSON.parse(this.diocese.events);
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
    
                  } //Upload Dia Image "On Success -- (Else Statement)"
                }); //Upload Dia Images Subscribe
    
              } //Upload Priest Image "On Success -- (Else Statement)"
            }); //Upload Priest Images Subscribe
    
          } //Upload About Image "On Success -- (Else Statement)"
        }); //Upload About Image Subscribe 
    
    
    
      }
    
    
      AddDynamicTextInputNameAndLink(parentContainerId : string, childClassName : string,isNew : boolean,name : string, link : string ) {
        let nameLabelHtml = '<div><label>Name</label></div>'
        let nameInputHtml = '<div><input type="text"></div>';
    
        let linkLabelHtml = '<div><label>Link</label></div>'
        let linkInputHtml = '<div><input type="text"></div>';
        
        let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
        let container = document.getElementById(parentContainerId);
        let div = document.createElement('div');
        div.className=childClassName;
        div.style.margin = "2px";
        div.style.padding = "5px";
        div.style.width = "100%";
        div.style.maxWidth ="300px";
        div.style.width = "auto";
        div.style.display = "block";
        div.style.borderStyle ="solid";
        div.style.borderWidth = "1px";
        div.style.position = "relative";
    
        div.innerHTML=nameLabelHtml + nameInputHtml + linkLabelHtml+ linkInputHtml +removeItemHtml;
        container.appendChild(div);
    
        if(!isNew) {
          let nameInput : HTMLInputElement = div.children[1].children[0] as HTMLInputElement;
          nameInput.value = name;
    
          let linkInput : HTMLInputElement = div.children[3].children[0] as HTMLInputElement;
          linkInput.value = link;
        } 
    
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
    
      AddCommissionsCommissioners(isNew : boolean,commission : string, commissioner :string, address : string, contact : string) {
        let commissionLabelHtml = '<div><label>Commission</label></div>'
        let commissionInputHtml = '<div><input type="text"></div>';
    
        let commissionerLabelHtml = '<div><label>Commissioner</label></div>'
        let commissionerInputHtml = '<div><input type="text"></div>';
    
        let addressLabelHtml = '<div><label>Address</label></div>'
        let addressInputHtml = '<div><input type="text"></div>';
    
        let contactLabelHtml = '<div><label>Contact</label></div>'
        let contactInputHtml = '<div><input type="text"></div>';
        
        let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
        let container = document.getElementById("diocese-commissions-and-commissioners-container");
        let div = document.createElement('div');
        div.className="diocese-commissions-and-commissioners-div";
        div.style.margin = "2px";
        div.style.padding = "5px";
        div.style.width = "100%";
        div.style.maxWidth ="300px";
        div.style.width = "auto";
        div.style.display = "block";
        div.style.borderStyle ="solid";
        div.style.borderWidth = "1px";
        div.style.position = "relative";
    
        div.innerHTML=commissionLabelHtml + commissionInputHtml + 
        commissionerLabelHtml+ commissionerInputHtml + 
          addressLabelHtml + addressInputHtml + 
          contactLabelHtml + contactInputHtml + 
          removeItemHtml;
        container.appendChild(div);
    
        if(!isNew) {
          let commissionInput : HTMLInputElement = div.children[1].children[0] as HTMLInputElement;
          commissionInput.value = commission;
    
          let commissionerInput : HTMLInputElement = div.children[3].children[0] as HTMLInputElement;
          commissionerInput.value = commissioner;
    
          let addressInput : HTMLInputElement = div.children[5].children[0] as HTMLInputElement;
          addressInput.value = address;
    
          let contactInput : HTMLInputElement = div.children[7].children[0] as HTMLInputElement;
          contactInput.value = contact;
        } 
    
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
      }
    
      AddSchedule(isNew : boolean,eventTitle:string,startTime : string,endTime : string, day:string,category:string) {
        let titleLabelHtml = '<div><label>Event Title</label></div>'
        let titleInputHtml = '<div><input type="text"></div>';
        let startTimeLabelHtml = '<div><label>Start Time</label></div>'
        let startTimeInputHtml = '<div><input type="time"></div>';
        let endTimeLabelHtml = '<div><label>End Time</label></div>'
        let endTimeInputHtml = '<div><input type="time"></div>';
        let dayLabelHtml = '<div><label>Day</label></div>'
        let daySelectHtml = '<div><select><option value="monday">Monday</option><option value="tuesday">Tuesday</option><option value="wednesday">Wednesday</option><option value="thursday">Thursday</option><option value="friday">Friday</option><option value="saturday">Saturday</option><option value="sunday">Sunday</option></select></div>';
        let categoryLabelHtml = '<div><label>Category</label></div>'
        let categorySelectHtml = '<div><select><option value="massess">Masses</option><option value="confessions">Confessions</option><option value="baptism">Baptism</option><option value="weddings">Weddings</option></select></div>';
        let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
        let container = document.getElementById("diocese-schedule-container");
        let div = document.createElement('div');
        div.className="diocese-schedule-div";
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
        let container = document.getElementById("diocese-events-container");
        let div = document.createElement('div');
        div.className="diocese-event-div";
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
          div.className="diocese-event-div-current";
    
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
    
    
      AddDia(isNew : boolean,imgSrc :string,title:string,dateLocation : string,category : string) {
        let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" accept="image/*">';
        let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">';
        let titleLabelHtml = '<div><label>Title</label></div>'
        let titleInputHtml = '<div><input type="text" ></div>';
        let dateLocationLabelHtml = '<div><label>Date and Location</label></div>'
        let dateLocationInputHtml = '<div><input type="text" ></div>';
        let categoryLabelHtml = '<div><label>Category</label></div>'
        let categorySelectHtml = '<div><select ><option value="socialAction">Social Action</option><option value="activities">Activities</option><option value="fiesta">Fiesta</option></select></div>';
        let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
        let container = document.getElementById("diocese-dia-container");
        let div = document.createElement('div');
        div.className="diocese-dia-div";
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
          div.className="diocese-dia-div-current";
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
        let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" accept="image/*">';
        let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">';
        let nameLabelHtml = '<div><label>Name</label></div>'
        let nameInputHtml = '<div><input type="text"></div>';
        let removeItemHtml = '<span><i class="fa fa-times" aria-hidden="true"></i></span>';
        let container = document.getElementById("diocese-priest-container");
        let div = document.createElement('div');
        div.className="diocese-priest-div";
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
          div.className="diocese-priest-div-current";
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
        let container = document.getElementById("diocese-about-images-container");
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
          div.className="diocese-about-image-div";
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
          div.className="diocese-about-image-div-current";
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