import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { Observable } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { Category } from "../models/category"; //model de la categoria 
import { Global } from "./global";
import { BehaviorSubject } from "rxjs";


@Injectable()
export class CategoryService {

    private categoriesDataSource = new BehaviorSubject<any>(null);
    currentCategories = this.categoriesDataSource.asObservable();

    constructor(public _http: HttpClient) {


    }

    changeCategories(categories: any) {
        this.categoriesDataSource.next(categories);
        console.log('categorías recibidas en CategoryService', categories);

    }


    resetCategories(): void {
        this.categoriesDataSource.next(null);
        // console.log('Avatar eliminado en profileDataService');
    }


    getCategories(): Observable<any> {
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

        return this._http.get(Global.url + 'categories', { headers: headers });
    }

    createCategory(token: any, category: any): Observable<any> {
        let json = JSON.stringify(category);
        let params = 'json=' + json;

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.post(Global.url + 'categories', params, { headers: headers });
    }

    updateCategory(token: any, category: any, id: any): Observable<any> {

        let json = JSON.stringify(category);
        let params = 'json=' + json;


        console.log('params', params);



        //No se necesita convertir a JSON el header lo hace automaticamente 




        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.put(Global.url + 'categories/' + id, params, { headers: headers });

    }


    deleteCategory(token: any, id: number): Observable<any> {

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.delete(Global.url + 'categories/' + id, { headers: headers });

    }
}