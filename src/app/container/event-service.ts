import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class EventService {
    public url = environment.url;

    httpOptions = {
        headers: new HttpHeaders({})
    };

    constructor(public http: HttpClient) {}


    public setStatus(value) {
        const data = {value};
        return this.http.patch(this.url + 'update-status', data).subscribe(res => {
            console.log(res);
          },
          (err: HttpErrorResponse) => {
            console.log(err)
          })
    }

    getWeather() {
        return this.http.get(this.url + `forecast`).toPromise();
    }
}