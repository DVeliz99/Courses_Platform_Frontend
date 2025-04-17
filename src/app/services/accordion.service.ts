import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { Observable } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { Category } from "../models/category"; //model de la categoria 
import { Global } from "./global";
import { BehaviorSubject } from "rxjs";


@Injectable()
export class AccordionService {

    private accordionDataSource = new BehaviorSubject<any>(null);
    currentaccordion = this.accordionDataSource.asObservable();

    constructor(public _http: HttpClient) {


    }

    changeAccordion(accordion: any) {
        this.accordionDataSource.next(accordion);
        console.log('accordion recibidon en accordionService', accordion);

    }


    resetAccordion(): void {
        this.accordionDataSource.next(null);
        // console.log('Avatar eliminado en profileDataService');
    }





    getCourseSectionsData(id: number, token: any): Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);;

        return this._http.get(Global.url + 'accordion/' + id, { headers: headers });
    }

    createAccordion(token: any, accordion: any): Observable<any> {
        let json = JSON.stringify(accordion);
        let params = 'json=' + json;

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.post(Global.url + 'accordion', params, { headers: headers });
    }

    updateAccordion(token: any, accordion: any, id: any): Observable<any> {

        let json = JSON.stringify(accordion);
        let params = 'json=' + json;


        console.log('params', params);



        //No se necesita convertir a JSON el header lo hace automaticamente 




        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.put(Global.url + 'accordion/' + id, params, { headers: headers });


    }


    deleteAccordion(token: any, id: number): Observable<any> {

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.delete(Global.url + 'accordion/' + id, { headers: headers });

    }
}