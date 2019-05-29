import { Component, OnInit } from '@angular/core';
import { BackEndConfig } from '../../../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';
import {AuthServiceProvider} from '../../../../providers/auth-service/auth-service';
// import {FileService} from '../../../../providers/file/file.service';
import {LoadingController } from 'ionic-angular';
@Component({
  selector: 'app-pope-francis-quotes',
  templateUrl: './pope-francis-quotes.html'
  // styleUrls: ['/src/pages/pope-francis/pope-francis.scss']
})
export class PopeFrancisQuotesComponent implements OnInit {

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

  showEditModal = false;
  showAddModal = false;
  radioButtonDefault = true;

  quotes;
  quoteToUpdateOrDelete;


  constructor(
      private http: Http,
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
    this.http.get(this.apiEndpoint + "pf-quote/pf-quotes", this.requestOptions)
    .map(res =>  res.json()).subscribe(res =>{
      this.loader.dismiss();
      this.quotes = this.MoveFeaturedItemsToTop(res.data);
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


  CloseAddModal(){
    this.showAddModal = false;
  }
  ShowAddModal(){
    this.showAddModal = true;
  }
  AddNewQuote(form){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let quote = {
      "quote" : form.value.quote,
      "featured" : form.value.featured
    }
    
    this.http.post(this.apiEndpoint + "pf-quote/add-pf-quote",quote, this.requestOptions)
      .map(res =>  res.json()).subscribe(res =>{
        this.showLoading = false;
        if(res.success) {
          this.quotes.push(res.data);
          this.showSuccess = true;
          this.successMessage = "Quote has been added successfully."
          this.quotes = this.MoveFeaturedItemsToTop(this.quotes);
          setTimeout(()=>{
            this.showSuccess = false;
            this.CloseAddModal();
          },1500);
        } else {
          this.errorMessage = res.err;
          this.showError = true;
        }
    })

  }

  CloseEditModal(){
    this.showEditModal = false;
  }

  ShowEditModal(quote){
    this.quoteToUpdateOrDelete = quote;
    this.showEditModal = true;
  }


  EditQuote(form){
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let quote = {
      "quote" : form.value.quote,
      "featured" : form.value.featured
    };
    
    this.http.put(this.apiEndpoint + "pf-quote/update-pf-quote?id=" + this.quoteToUpdateOrDelete._id,quote, this.requestOptions)
    .map(res =>  res.json()).subscribe(res =>{
      this.showLoading = false;
      if(res.success) {
        this.showSuccess = true;
        this.quoteToUpdateOrDelete = res.data;


        for(let i = 0; i<this.quotes.length;i++) {
          if(this.quotes[i]._id === res.data._id) {
            this.quotes[i]= res.data;
          }
        }

        this.quotes = this.MoveFeaturedItemsToTop(this.quotes);


        this.successMessage = "Quote has been updated successfully."
        setTimeout(()=>{
          this.showSuccess = false;
          this.CloseEditModal();
        },1500);
      } else {
        this.errorMessage = res.err;
        this.showError = true;
      }
    });


    
  }

  IsString(val) {
    return typeof(val) === "string";
  }

  DeleteQuote(quote){
    if(confirm("Are you sure you want to delete this record?")) {
      this.http.delete(this.apiEndpoint + "pf-quote/delete-pf-quote?id=" + quote._id, this.requestOptions)
      .map(res =>  res.json()).subscribe(res =>{
        if(res.success) {
          for(let indx = 0;indx < this.quotes.length;indx++) {
            if(this.quotes[indx]._id === quote._id) {
              this.quotes.splice(indx,1);
            }
          }
          console.log("Record has been deleted successfully.")
        } 
      })
    }
  }

}