import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { BehaviorSubject, Observable } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { Course } from "../models/course";
import { Global } from "./global";
import { jwtDecode } from 'jwt-decode';
import { throwError } from "rxjs";
import { catchError } from "rxjs";
import { globalEval, param } from "jquery";




@Injectable()
export class ChartService {

    /*Propiedades */



    private progressDatasource = new BehaviorSubject<any>(null);
    currentProgress = this.progressDatasource.asObservable();



    constructor(public _http: HttpClient) {


    }

    changeProgress(newProgress: number) {
        this.progressDatasource.next(newProgress);
        console.log('progressDatasource al chartservice', newProgress);

    }

    resetProgress() {
        this.progressDatasource.next(null);
        console.log('progressDatasource reseteado');

    }



}