import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { BehaviorSubject, Observable, ObservableLike } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { Course } from "../models/course";
import { Global } from "./global";
import { jwtDecode } from 'jwt-decode';
import { throwError } from "rxjs";
import { catchError } from "rxjs";
import { globalEval } from "jquery";


@Injectable()
export class CartService {

    /*Propiedades */

    private cartDataSource = new BehaviorSubject<any>(null);
    currentCart = this.cartDataSource.asObservable();


    private itemsCartDataSource = new BehaviorSubject<any>(null);
    currentItems = this.itemsCartDataSource.asObservable();


    private subtotalDataSource = new BehaviorSubject<any>(null);
    currentSubtotal = this.subtotalDataSource.asObservable();


    private cartCoursesDataSource = new BehaviorSubject<any>(null);
    currentCartCourses = this.cartCoursesDataSource.asObservable();




    constructor(public _http: HttpClient) {


    }


    changeCartCourses(courses: any) {
        this.cartCoursesDataSource.next(courses);
        // console.log('Avatar recibido en profileDataService',avatar);

    }

    changeSubtotal(subtotal: any) {
        this.subtotalDataSource.next(subtotal);
    }

    changeQuantityItems(items: any) {
        this.itemsCartDataSource.next(items);
    }

    resetCartItems(): void {
        this.itemsCartDataSource.next(null);
    }


    resetCartCourses(): void {
        this.cartCoursesDataSource.next(null);
        // console.log('Avatar eliminado en profileDataService');
    }

    resetSubtotal(): void {
        this.subtotalDataSource.next(null);
        // console.log('Avatar eliminado en profileDataService');
    }


    index(token: any): Observable<any> {

        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);


        return this._http.get(Global.url + 'cart', { headers: headers });
    }

    createCart(token: any, cart: any): Observable<any> {
        let json = JSON.stringify(cart);
        let params = 'json=' + json;

        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Authorization', token);

        return this._http.post(Global.url + 'cart', params, { headers: headers })

    }


    deleteCart(token: any, id: any): Observable<any> {


        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Authorization', token);

        return this._http.delete(Global.url + 'cart/' + id, { headers: headers })

    }


    deleteAllCart(token: any): Observable<any> {


        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Authorization', token);

        return this._http.delete(Global.url + 'delete/cart', { headers: headers }).pipe(
            catchError((error: any) => {
                return throwError(error);
            })
        );

    }


}