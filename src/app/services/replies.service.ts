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
export class RepliesService {

    /*Propiedades */



    private repliesDataSource = new BehaviorSubject<any>(null);
    currentReplies = this.repliesDataSource.asObservable();

    private enableReplyButtonDataSource = new BehaviorSubject<any>(null);
    isEnableReplyButtonClicked = this.enableReplyButtonDataSource.asObservable();

    private currentCommentIdDataSource = new BehaviorSubject<any>(null);
    currentCommentID = this.currentCommentIdDataSource.asObservable();

    private usersReplyDataSource = new BehaviorSubject<any>(null);
    currentUsersReply = this.usersReplyDataSource.asObservable();

    constructor(public _http: HttpClient) {


    }

    changeCurrentCommentId(id: number) {
        this.currentCommentIdDataSource.next(id);
        console.log('id añadido al repliesService', id);

    }

    changeButtonStatus(status: boolean) {
        this.enableReplyButtonDataSource.next(status);
        console.log('status', status);

    }

    changeCurrentUsersReply(users: any) {
        this.usersReplyDataSource.next(users);
        console.log('users añadidos al repliesService', users);

    }



    changeCurrentReplies(replies: any) {
        this.repliesDataSource.next(replies);
        console.log('replies añadidas al repliesService', replies);

    }

    getReplies(comment_id: number) {

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');



        return this._http.get(Global.url + 'replies/' + comment_id, { headers: headers })
    }

    create(token: any, reply: any): Observable<any> {

        if (reply.response) {
            reply.response = Global.htmlEntities(reply.response);
        }

        let json = JSON.stringify(reply);
        let params = 'json=' + json;


        console.log('params', params);

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);



        return this._http.post(Global.url + 'replies', params, { headers: headers });
    }

    update(reply: any, id: any, token: any): Observable<any> {

        if (reply.response) {
            reply.response = Global.htmlEntities(reply.response);
        }

        let json = JSON.stringify(reply);
        let params = 'json=' + json;

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);

        return this._http.put(Global.url + 'replies/' + id, params, { headers: headers });
    }

    delete(id: number, token: any): Observable<any> {


        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', token);



        return this._http.delete(`${Global.url}replies/${id}`, { headers: headers });
    }

}