
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DecodeTokenService {

    private decodedTokenDataSource = new BehaviorSubject<any>(null);
    currentDecodedToken = this.decodedTokenDataSource.asObservable();

    /*Métodos */

    changeDecodedToken(task: any) {
        this.decodedTokenDataSource.next(task);
        // console.log('Datos actualizados en TaskDetail:', task);
    }

    resetToken(): void {
        this.decodedTokenDataSource.next(null);
    }


    //Obtención y decodificación del token
    decodeToken() {

        let tokenFromLocalstorage = localStorage.getItem('identity');
        if (tokenFromLocalstorage) {
            const decoded = jwtDecode(tokenFromLocalstorage); // Decodificamos el token
            console.log('Token decodificado:', decoded); // Verifica aquí el valor del token decodificado
            this.changeDecodedToken(decoded);
            console.log('Valor emitido por currentDecodedToken:', this.currentDecodedToken); // Verifica el valor actual en el subject
        } else {
            console.log('No se proporcionó token.');
            this.changeDecodedToken(null);
        }
    }



}
