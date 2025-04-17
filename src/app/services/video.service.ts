import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { BehaviorSubject, Observable } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { Course } from "../models/course";
import { Global } from "./global";
import { jwtDecode } from 'jwt-decode';
import { throwError } from "rxjs";
import { catchError } from "rxjs";
import { globalEval, param } from "jquery";
import { Video } from "../models/video";



@Injectable()
export class VideoService {

    /*Propiedades */

    private courseOnEditImage = new BehaviorSubject<any>(null);
    currentCourseOnEditImage = this.courseOnEditImage.asObservable();



    private homeCourses = new BehaviorSubject<any>(null);
    currentHomeCourses = this.homeCourses.asObservable();




    constructor(public _http: HttpClient) {


    }





    create(token: any, video: any): Observable<any> {


        let json = JSON.stringify(video);

        let params = 'json=' + json;

        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);


        return this._http.post(Global.url + 'video', params, { headers: headers });

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






    getVideo(id: any): Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');


        return this._http.get(Global.url + 'video/' + id, { headers: headers });
    }

    getSales(token: any): Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.get(Global.url + 'sale', { headers: headers });
    }

    getVideosByCourse(id: any): Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');



        return this._http.get(Global.url + 'video/course/' + id, { headers: headers })


    }

    updateVideo(video: Video, token: any, id: number): Observable<any> {
        let json = JSON.stringify(video);
        let params = 'json=' + json;
        console.log('params', params);

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.put(Global.url + 'video/' + id, params, { headers: headers });

    }

    deleteVideo(token: any, id: number): Observable<any> {

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);



        return this._http.delete(Global.url + 'video/' + id, { headers: headers });
    }












}