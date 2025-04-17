import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private decodedTokenDataSource = new BehaviorSubject<any>(null);
  currentDecodedToken = this.decodedTokenDataSource.asObservable();

  /*Métodos */


  getIdentity(): any {
    let identity = localStorage.getItem('identity');
    return identity;
  }

  changeDecodedToken(newIdentity: any) {
    console.log('nuevo identity set al localstorage', newIdentity);

    localStorage.setItem('identity', JSON.stringify(newIdentity));
  }

  resetIdentity(): void {
    localStorage.setItem('identity', JSON.stringify(null)); //identity token convertido a JSON con valor null
  }


  //Obtención y decodificación del token
  decodeToken() {
    let tokenFromLocalstorage = localStorage.getItem('identity');

    if (tokenFromLocalstorage) {

      const decoded = jwtDecode(tokenFromLocalstorage); // Decodificamos el token
      console.log('Token decodificado:', decoded); // Verifica aquí el valor del token decodificado
      this.changeDecodedToken(decoded);
      console.log('Valor emitido por currentDecodedToken:', this.currentDecodedToken); // Verifica el valor actual en el subject

      localStorage.setItem('identity', JSON.stringify(decoded)); // decoded token convertido a JSON

      console.log('identity añadido desde token.service.ts al localstorage');

    } else {
      console.log('No se proporcionó token.');
      this.changeDecodedToken(null);
    }
  }



}

