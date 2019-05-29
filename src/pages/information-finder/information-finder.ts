import { Component } from '@angular/core';
import {  NavController, NavParams,LoadingController } from 'ionic-angular';
import { BackEndConfig } from '../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { InformationFinderSearchDiocesePage } from './information-finder-search-diocese/information-finder-search-diocese';
import { InformationFinderDetailDiocesePage } from './information-finder-detail-diocese/information-finder-detail-diocese';

import { InformationFinderSearchChurchPage } from './information-finder-search-church/information-finder-search-church';
import { InformationFinderDetailChurchPage } from './information-finder-detail-church/information-finder-detail-church';
import {InformationFinderCatholicSchoolPage} from './information-finder-catholic-school/information-finder-catholic-school';
import {InformationFinderSearchOrganizationPage} from './information-finder-search-organization/information-finder-search-organization';
import {InformationFinderDetailOrganizationPage} from './information-finder-detail-organization/information-finder-detail-organization';
import {InformationFinderSocialServicesPage} from './information-finder-social-services/information-finder-social-services';
import {InformationFinderReligiousCongregationsPage} from './information-finder-religious-congregations/information-finder-religious-congregations';
import {InformationFinderCounselingCentersPage} from './information-finder-counseling-centers/information-finder-counseling-centers';
import {InformationFinderRetreatCentersPage} from './information-finder-retreat-centers/information-finder-retreat-centers';
@Component({
  selector: 'page-information-finder',
  templateUrl: 'information-finder.html',
})
export class InformationFinderPage {
  informationFinderSearchDiocesePage = InformationFinderSearchDiocesePage;
  informationFinderDetailDiocesePage = InformationFinderDetailDiocesePage;
  informationFinderSearchChurchPage = InformationFinderSearchChurchPage;
  informationFinderDetailChurchPage= InformationFinderDetailChurchPage;
  informationFinderCatholicSchoolPage = InformationFinderCatholicSchoolPage;
  informationFinderSearchOrganizationPage = InformationFinderSearchOrganizationPage;
  informationFinderDetailOrganizationPage = InformationFinderDetailOrganizationPage;
  informationFinderSocialServicesPage = InformationFinderSocialServicesPage;
  informationFinderReligiousCongregationsPage = InformationFinderReligiousCongregationsPage;
  informationFinderCounselingCentersPage = InformationFinderCounselingCentersPage;
  informationFinderRetreatCentersPage = InformationFinderRetreatCentersPage;
  apiEndpoint : string = BackEndConfig.API_ENDPOINT;
  headers;
  requestOptions;

  public loader;

  isSearchLoading =false;
  isSearchTriggered = false;
  religiousCongregationSearchResults = [];
  searchResultsDiocese = [];
  searchResultsChurch = [];
  searchResultsCatholicSchool = [];
  searchResultsOrganization = [];
  searchResultsSocialService = [];
  searchResultsCounselingCenter = [];
  searchResultsRetreatCenter = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: Http,public loadingCtrl: LoadingController) {
      this.headers = new Headers();
      this.headers.append('Content-Type', 'application/json');
      this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true });

      
      
  }

  RouteTo(path : string){
    this.navCtrl.push(path);
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
    
    //Diocese ------------------------
    this.http.get(this.apiEndpoint + "diocese/dioceses?searchParams=" + searchInput, this.requestOptions)
      .map(res =>  res.json()).subscribe(res => {
        this.searchResultsDiocese = res.data;

      //Churches ------------------------
      this.http.get(this.apiEndpoint + "church/churches?searchParams=" + searchInput, this.requestOptions)
      .map(res =>  res.json()).subscribe(res => {
        this.searchResultsChurch = res.data;

        //Organizations ------------------------
        this.http.get(this.apiEndpoint + "organization/organizations?searchParams=" + searchInput, this.requestOptions)
        .map(res =>  res.json()).subscribe(res => {
          this.searchResultsOrganization = res.data;

          //SocialService ------------------------
          this.http.get(this.apiEndpoint + "social-service-center/social-service-centers?searchParams=" + searchInput, this.requestOptions)
          .map(res =>  res.json()).subscribe(res => {
            this.searchResultsSocialService = res.data;
            for(let i = 0;i < this.searchResultsSocialService.length ; i++) {
              this.searchResultsSocialService[i].image = JSON.parse(this.searchResultsSocialService[i].image);
            }

            //CatholicSchools ------------------------
            this.http.get(this.apiEndpoint + "catholic-school/catholic-schools?searchParams=" + searchInput, this.requestOptions)
            .map(res =>  res.json()).subscribe(res => {
              this.searchResultsCatholicSchool = res.data;
              for(let i = 0;i < this.searchResultsCatholicSchool.length ; i++) {
                this.searchResultsCatholicSchool[i].image = JSON.parse(this.searchResultsCatholicSchool[i].image);
              }

              //ReligiousCongregations ------------------------
              this.http.get(this.apiEndpoint + "religious-congregation/religious-congregations?searchParams=" + searchInput, this.requestOptions)
              .map(res =>  res.json()).subscribe(res => {
                this.religiousCongregationSearchResults = res.data;
                for(let i = 0;i < this.religiousCongregationSearchResults.length ; i++) {
                  this.religiousCongregationSearchResults[i].image = JSON.parse(this.religiousCongregationSearchResults[i].image);
                }

                //CounselingCenters ------------------------
                this.http.get(this.apiEndpoint + "counseling-center/counseling-centers?searchParams=" + searchInput, this.requestOptions)
                .map(res =>  res.json()).subscribe(res => {
                  this.searchResultsCounselingCenter = res.data;
                  for(let i = 0;i < this.searchResultsCounselingCenter.length ; i++) {
                    this.searchResultsCounselingCenter[i].image = JSON.parse(this.searchResultsCounselingCenter[i].image);
                  }

                  //RetreatCenters ------------------------
                  this.http.get(this.apiEndpoint + "retreat-center/retreat-centers?searchParams=" + searchInput, this.requestOptions)
                  .map(res =>  res.json()).subscribe(res => {
                    this.searchResultsRetreatCenter = res.data;
                    for(let i = 0;i < this.searchResultsRetreatCenter.length ; i++) {
                      this.searchResultsRetreatCenter[i].image = JSON.parse(this.searchResultsRetreatCenter[i].image);
                    }

                    this.isSearchLoading = false;
                    this.isSearchTriggered = true;
                    this.loader.dismiss();
                  })//RetreatCenters ------------------------
                })//CounselingCenters ------------------------
              })//ReligiousCongregations ------------------------
            })//CatholicSchools ------------------------
          })//SocialService ------------------------
        })//Organizations ------------------------
      })//Churches ------------------------
    })//Diocese ------------------------
  }

}
