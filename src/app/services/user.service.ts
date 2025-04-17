import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { BehaviorSubject, Observable } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { User } from "../models/user";
import { Global } from "./global";
import { jwtDecode } from 'jwt-decode';


@Injectable()
export class UserService {

    /*Propiedades */

    private avatarDatasource = new BehaviorSubject<any>(null);
    currentavatar = this.avatarDatasource.asObservable();




    constructor(public _http: HttpClient) {


    }

    register(user: any): Observable<any> { //Observable para almacenar la respuesta http 

        let json = JSON.stringify(user);//convertir a Json string
        let params = 'json=' + json;
        console.log(params);

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        return this._http.post(Global.url + 'register', params, { headers: headers });
    }


    update(token: any, user: any): Observable<any> {

        let json = JSON.stringify(user); //convertir en json string
        let params = 'json=' + json;

        console.log('user desde user service', params);
        console.log('token desde user service', token);



        //Pasamos como parametro el token
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.put(Global.url + 'user/update', params, { headers: headers });

    }






    /*Métodos */



    changeProfileAvatar(avatar: any) {
        this.avatarDatasource.next(avatar);
        // console.log('Avatar recibido en profileDataService',avatar);

    }


    resetProfileavatar(): void {
        this.avatarDatasource.next(null);
        // console.log('Avatar eliminado en profileDataService');
    }











}