import { Component } from '@angular/core';
import {  NavController, NavParams,LoadingController } from 'ionic-angular';
import { BackEndConfig } from '../../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import {FileService} from '../../../providers/file/file.service';
import 'rxjs/add/operator/map';
import {AuthServiceProvider} from '../../../providers/auth-service/auth-service';
import {InformationFinderDetailDiocesePage} from '../information-finder-detail-diocese/information-finder-detail-diocese';

@Component({
  selector: 'page-information-finder-search-diocese',
  templateUrl: 'information-finder-search-diocese.html'
  // styleUrls: ['/src/pages/information-finder/information-finder.scss']
})
export class InformationFinderSearchDiocesePage {
    apiEndpoint : string = BackEndConfig.API_ENDPOINT;
    headers;
    requestOptions;

    detailPage = InformationFinderDetailDiocesePage;

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

        this.http.get(this.apiEndpoint + "diocese/dioceses?searchParams=" + searchInput, this.requestOptions)
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

    AddNewDiocese(form){
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
                this.errorMessage = (resPriestImage.success !== "") ? resPriestImage.err : "Failed to add new record. Please try again.";
                this.showError = true;
              } else {
                //On Priest Images Upload Success
                let priestsArr = [];
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
                    this.errorMessage = (resDiaImage.success !== "") ? resDiaImage.err : "Failed to add new record. Please try again.";
                    this.showError = true;
                  } else {
                    //On Dia Images Upload Success
                    let diaArr = [];
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
                    //Add Priest Record
                    diocese.dioceseInAction= JSON.stringify(diaArr);
    
                    //-------------------------------------------DIA Record Upload Emd -------------------------------------------
    
                    //-------------------------------------------Events Record Upload Start --------------------------------------
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
    
                        // Proceed to adding Diocese Record
                        this.http.post(this.apiEndpoint + "diocese/add-diocese",diocese, this.requestOptions)
                        .map(res =>  res.json()).subscribe(res =>{
                          this.showLoading = false;
                          this.loader.dismiss();
                          if(res.success) {
                            this.showSuccess = true;
                            this.successMessage = "Diocese has been added successfully."
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
    
      RouteTo(path : string,id: string){
        // this.router.navigate([path,id]);
      }
    
      AddDynamicTextInputNameAndLink(parentContainerId : string, childClassName : string ) {
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
    
      AddCommissionsCommissioners() {
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
    
      
      AddSchedule() {
        let titleLabelHtml = '<div><label>Event Title</label></div>'
        let titleInputHtml = '<div><input type="text"></div>';
        let startTimeLabelHtml = '<div><label>Start Time</label></div>'
        let startTimeInputHtml = '<div><input type="time" ></div>';
        let endTimeLabelHtml = '<div><label>End Time</label></div>'
        let endTimeInputHtml = '<div><input type="time" ></div>';
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
    
      AddDia() {
        let imageInputHtml = '<input style="margin-bottom:3px; margin-top:5px;" type="file" accept="image/*">';
        let imagePreviewerHtml = '<img style="display:block; width:100px; height: 100px; object-fit: cover;">';
        let titleLabelHtml = '<div><label>Title</label></div>'
        let titleInputHtml = '<div><input type="text"></div>';
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
      }
    
      AddPriest(){
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
        let container = document.getElementById("diocese-about-images-container");
        let div = document.createElement('div');
        div.className="diocese-about-image-div";
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