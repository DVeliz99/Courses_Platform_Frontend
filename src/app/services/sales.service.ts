import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { BehaviorSubject, Observable } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { Course } from "../models/course";
import { Global } from "./global";
import { jwtDecode } from 'jwt-decode';
import { throwError } from "rxjs";
import { catchError } from "rxjs";
import { globalEval } from "jquery";
import { Checkbox } from "../models/checkbox";



@Injectable()
export class SalesService {

    /*Propiedades */

    private courseOnEditImage = new BehaviorSubject<any>(null);
    currentCourseOnEditImage = this.courseOnEditImage.asObservable();



    private homeCourses = new BehaviorSubject<any>(null);
    currentHomeCourses = this.homeCourses.asObservable();




    constructor(public _http: HttpClient) {


    }





    create(token: any, user: any): Observable<any> {


        let json = JSON.stringify(user);

        let params = 'json=' + json;

        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);


        return this._http.post(Global.url + 'sale', params, { headers: headers });

    }

    getCourses(): Observable<any> {
        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

        return this._http.get(Global.url + 'course', { headers: headers }).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return throwError(error);
            })
        );
    }

    getSales(token: any): Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.get(Global.url + 'sale', { headers: headers });
    }

    updateCheckbox(token: any, checkbox: Checkbox): Observable<any> {
        let json = JSON.stringify(checkbox);
        let params = 'json=' + json;
        console.log('json a enviar en la solicitud', params);

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);
        return this._http.put(Global.url + 'sale/checkbox/' + checkbox.course_id, params, { headers: headers });

    }












}