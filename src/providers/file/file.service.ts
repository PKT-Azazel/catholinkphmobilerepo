import { Injectable } from '@angular/core';
import { BackEndConfig } from '../../backend.config';
import { Http, Headers,RequestOptions } from '@angular/http';


@Injectable()
export class FileService {

  apiEndpoint : string = BackEndConfig.API_ENDPOINT;


  constructor(private http: Http) { 
    
    
  }

  httpUploadFiles(files,filePageOwner) {
    let headers = new Headers();
    let requestOptions = new RequestOptions({ headers: headers , withCredentials: true }); 
    return this.http.post(this.apiEndpoint + "file/upload?filePageOwner="+filePageOwner,files, requestOptions)
      .map(res =>  res.json());
  }

}
