import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { BehaviorSubject, Observable, of } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { User } from "../models/user"; //model de la categoria 
import { Global } from "./global";
import { DOCUMENT } from '@angular/common'; //sirve para recargar la pagina
import { Inject } from '@angular/core';//sirve para recargar la pagina
import { Router, ActivatedRoute } from "@angular/router";
import { jwtDecode } from 'jwt-decode';


@Injectable({
    providedIn: 'root'
})

export class AuthService {

    public identity: any;
    public token: any;

    public decodedTokenSubject = new BehaviorSubject<any>(null);
    public currentDecodedToken = this.decodedTokenSubject.asObservable();

    constructor(public _http: HttpClient, private _router: Router,
        private _route: ActivatedRoute,
        @Inject(DOCUMENT) private document: Document) {


    }


    signup(user: any, getToken: any = null): Observable<any> {

        if (getToken != null) {
            user.getToken = 'true';

        }
        let json = JSON.stringify(user); //se convierte en un json string

        let params = 'json=' + json; // se arma el json

        console.log(params);


        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');



        return this._http.post(Global.url + 'login', params, { headers: headers });

    }

    getIdentity(): Observable<any> {
        let identityString = localStorage.getItem('identity');
        let identity = null;


        if (identityString) {
            try {
                identity = JSON.parse(identityString);
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        }

        if (identity && identity !== 'undefined') {
            this.identity = identity;
        } else {
            this.identity = null;
        }

        return this.identity;

    }

    getToken(): Observable<any> {


        let token = localStorage.getItem('token'); //obtenemos el valor del token almacenado en el localstorage, no se necesita parsear ya que es un string puro
        if (token && token != 'undefined') {
            this.token = token;

        } else {
            this.token = null;
        }

        return this.token;

    }


    logout() {
        // console.log('logout method is called');

        // Elimina los datos del almacenamiento local
        localStorage.removeItem('identity');
        localStorage.removeItem('token');
        // localStorage.removeItem('cart');


        this.identity = null;
        this.token = null;

        this._router.navigate(['/login']).then(() => {
            this.loadPage(); // Promesa
        });
    }

    loadPage() { this.document.location.reload(); }

}