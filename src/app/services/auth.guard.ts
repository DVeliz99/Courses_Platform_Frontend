import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  /*Método*/
  canActivate(): boolean {
    // Verificamos si hay un valor "identity" en el localStorage
    const identity = localStorage.getItem('identity');

    if (!identity) {
      // Si no hay "identity", redirigimos al usuario a la página de autenticación
      this.router.navigate(['/login']);
      return false; // No se permite el acceso
    }

    // Si existe "identity", se permite el acceso a la ruta
    return true;
  }
}
