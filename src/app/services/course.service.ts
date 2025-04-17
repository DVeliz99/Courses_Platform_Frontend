import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { BehaviorSubject, Observable } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { Course } from "../models/course";
import { Global } from "./global";
import { jwtDecode } from 'jwt-decode';
import { throwError } from "rxjs";
import { catchError } from "rxjs";
import { globalEval } from "jquery";



@Injectable()
export class CourseService {

    /*Propiedades */

    private courseOnEditImage = new BehaviorSubject<any>(null);
    currentCourseOnEditImage = this.courseOnEditImage.asObservable();



    private homeCourses = new BehaviorSubject<any>(null);
    currentHomeCourses = this.homeCourses.asObservable();




    constructor(public _http: HttpClient) {


    }





    create(token: any, course: any): Observable<any> {

        if (course) {
            course.detail = Global.htmlEntities(course.detail);
            course.url = Global.htmlEntities(course.url);
        }

        let json = JSON.stringify(course);

        let params = 'json=' + json;

        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);


        return this._http.post(Global.url + 'course', params, { headers: headers });

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

    getCoursesByText(query: string): Observable<any> {
        //Pasamos como parametro el token

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

        return this._http.get(Global.url + 'course/search/' + query, { headers: headers }).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return throwError(error);
            })
        );

    }

    update(token: any, course: any, id: any): Observable<any> {

        //Limpiar a utf8

        if (course) {
            course.detail = Global.htmlEntities(course.detail);
            course.url = Global.htmlEntities(course.url);
        }

        let json = JSON.stringify(course);

        let params = 'json=' + json;

        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);


        return this._http.put(Global.url + 'course/' + id, params, { headers: headers });

    }

    getCourse(id: number, token: any): Observable<any> {

        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.get(Global.url + 'course/' + id, { headers: headers });
    }

    getCoursesByCategory(id: number): Observable<any> {
        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

        return this._http.get(Global.url + 'getCoursesByCategory/' + id, { headers: headers }).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return throwError(error);
            })
        );
    }


    deleteCourse(token: any, id: any): Observable<any> {

        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.delete(Global.url + 'course/' + id, { headers: headers });

    }





    /*Modificaciòn de behavior subject */


    changeCoursesOnHome(courses: any) {
        this.homeCourses.next(courses);

        console.log('homeCourses recibidos en course.service', courses);



    }


    resetCoursesOnHome(): void {
        this.homeCourses.next(null);

    }







    changeCourseOnEditImage(url: any) {
        this.courseOnEditImage.next(url);

        console.log('url recibida en course.service', url);



    }


    resetCourseOnEditImage(): void {
        this.courseOnEditImage.next(null);

    }











}