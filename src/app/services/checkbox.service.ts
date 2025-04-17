import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { BehaviorSubject, Observable } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { Course } from "../models/course";
import { Global } from "./global";
import { jwtDecode } from 'jwt-decode';
import { throwError } from "rxjs";
import { catchError } from "rxjs";
import { Checkbox } from "../models/checkbox";


@Injectable()
export class CheckboxService {

    /*Propiedades */



    private checkboxUserDataSource = new BehaviorSubject<any>(null);
    currentCheckboxes = this.checkboxUserDataSource.asObservable();


    constructor(public _http: HttpClient) {


    }

    changeCurrentUserCheckbox(checkbox: any) {
        this.checkboxUserDataSource.next(checkbox);
        console.log('checkbox añadidos al CheckboxService', checkbox);

    }

    getCheckboxes(token: any, course_id: number) {

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.get(Global.url + 'checkbox/' + course_id, { headers: headers })
    }


    create(token: any, checkbox: Checkbox): Observable<any> {


        let json = JSON.stringify(checkbox);
        let params = 'json=' + json;
        console.log('params', params);

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.post(Global.url + 'checkbox', params, { headers: headers });
    }



    update(token: any, checkbox: Checkbox): Observable<any> {


        let json = JSON.stringify(checkbox);
        let params = 'json=' + json;

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.put(Global.url + 'checkbox/' + checkbox.course_id, params, { headers: headers });
    }


}
