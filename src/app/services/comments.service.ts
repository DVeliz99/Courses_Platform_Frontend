import { Injectable } from "@angular/core"; //Inyecta el servicio 
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"; //para peticiones http 
import { BehaviorSubject, Observable } from "rxjs"; //para recoger la informacion que devuelve el api rest 
import { Course } from "../models/course";
import { Global } from "./global";
import { jwtDecode } from 'jwt-decode';
import { throwError } from "rxjs";
import { catchError } from "rxjs";
import { globalEval, param } from "jquery";
import { Comment } from "../models/comment";



@Injectable()
export class CommentsService {

    /*Propiedades */

    private videoPlayingDataSource = new BehaviorSubject<any>(null);
    currentVideoPlaying = this.videoPlayingDataSource.asObservable();


    private commentsDataSource = new BehaviorSubject<any>(null);
    curentComments = this.commentsDataSource.asObservable();





    constructor(public _http: HttpClient) {


    }

    changeCurrentVideoPlayingId(id: number) {
        this.videoPlayingDataSource.next(id);
        console.log('videoPlayingId añadido al commentService', id);

    }



    changeCurrentComments(comments: any) {
        this.commentsDataSource.next(comments);
        console.log('comments añadido al commentService', comments);

    }

    resetCurrentVideoPlayingId() {
        this.videoPlayingDataSource.next(null);
    }

    getComments(videoId: number, token: any) {

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);



        return this._http.get(Global.url + 'comments/' + videoId, { headers: headers })
    }

    create(token: any, comment: any): Observable<any> {

        if (comment.comment) {
            comment.comment = Global.htmlEntities(comment.comment);
        }

        let json = JSON.stringify(comment);
        let params = 'json=' + json;


        console.log('params', params);

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);



        return this._http.post(Global.url + 'comments', params, { headers: headers });
    }

    update(comment: any, id: number, token: any): Observable<any> {

        if (comment.comment) {
            comment.comment = Global.htmlEntities(comment.comment);
        }

        let json = JSON.stringify(comment);
        let params = 'json=' + json;


        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);



        return this._http.put(`${Global.url}comments/${id}`, params, { headers: headers });
    }

    Delete(id: number, token: any): Observable<any> {


        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);



        return this._http.delete(`${Global.url}comments/${id}`, { headers: headers });
    }

}