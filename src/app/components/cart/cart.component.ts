import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../signals/token.service';
import { Global } from '../../services/global';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { SalesService } from '../../services/sales.service';
import { error } from 'jquery';


@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {

  public identity: any;
  public identityString: any;
  public token: any;
  public status!: any;


  /*para el carrito */
  public coursesOnCart: any;
  public quantity!: 0;
  public quantities: any;
  public total: any;
  public cart_courses!: any;
  public subtotals!: any;

  public subTotal = 0;
  public totalItems = 0;

  public url = Global.url;




  constructor(private _cartService: CartService,
    private _authService: AuthService,
    private _tokenService: TokenService,
    private _salesService: SalesService) {
    this.token = this._authService.getToken();
    this.identity = this._tokenService.getIdentity();

    this.identityString = JSON.parse(this.identity); //parseo de identity 

  }

  ngOnInit(): void {


    console.log('Iniciando cart component');
    console.log('token', this.token);


    if (this.token) {
      this.indexCart().then(() => {
        this._cartService.currentCartCourses.subscribe(response => {
          if (response) {
            this.coursesOnCart = response;
            console.log('courses on Cart en cart component', this.coursesOnCart);

            this._cartService.currentItems.subscribe(response => {
              this.quantity = response;
              console.log('quantityTotal recibida en app component desde cartService', this.quantity);

            })
          } else {

            console.log('quantityTotal no fue recibida en app component desde cartService', this.quantity);



          }


        })

        this._cartService.currentSubtotal.subscribe(response => {
          this.subTotal = response;
        })
      })
    }

  }

  indexCart(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._cartService.index(this.token).subscribe(
        response => {
          console.log('Response obtenida desde CartService', response);

          if (response && response.status == 'success') {
            this.quantity = response.counter;
            this.coursesOnCart = response.courses;
            this.total = response.total;
            this.quantities = response.quantities;
            this.cart_courses = response.cart;
            this.subtotals = response.subtotals;
            if (this.subtotals && Array.isArray(this.subtotals)) {
              this.subTotal = this.subtotals.reduce((acc: number, subtotal: any) => acc + Number(subtotal), 0);
            }

            // Guardar en localStorage
            localStorage.setItem('cart', JSON.stringify(this.quantity));

            // Notificar a otros componentes
            this._cartService.changeCartCourses(this.coursesOnCart);
            console.log('Data enviada a CartService');

            this._cartService.changeSubtotal(this.subTotal);

            const suma: number = this.quantities.reduce((acumulador: number, valorActual: number) => {
              return acumulador + valorActual;
            }, 0); // El 0 es el valor inicial del acumulador
            this._cartService.changeQuantityItems(suma);
            console.log('quantity enviada a CartService', suma);


            resolve(); // Resuelve la promesa cuando todo ha finalizado correctamente
          } else {
            reject('La respuesta del servidor no fue exitosa');
          }
        },
        error => {
          console.log(error);
          reject(error); // Rechaza la promesa en caso de error
        }
      );
    });
  }


  deleteCartItem(id: any) {
    this._cartService.deleteCart(this.token, id).subscribe(response => {
      console.log(response);
      if (response && response.status == 'success') {
        this.indexCart().then(() => {


        })




      }
    })

  }


  onBuy() {
    this._salesService.create(this.token, this.identityString).subscribe(response => {
      console.log(response);
      if (response && response.status === 'success') {
        this.status = response.status;






        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'La compra se ha registrado  correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });

        this.deleteCartItems();
      } else {
        this.status = response.status;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FFD65A',
          color: '#E50046',
          class: 'text-danger',
          message: 'la compra no se ha podido registrar.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-sharp fa-solid fa-xmark',
          position: 'topRight'
        });
      }
    }, error => {
      this.status = error;

      iziToast.show({
        title: 'ERROR',
        titleColor: '#FFD65A',
        color: '#E50046',
        class: 'text-danger',
        message: 'Hubo un error en la respuesta.',
        displayMode: 2,
        maxWidth: 350,
        icon: 'fa-sharp fa-solid fa-xmark',
        position: 'topRight'
      });
    })

  }

  deleteCartItems() {
    this._cartService.resetCartCourses();
    this._cartService.resetCartItems();
    this.coursesOnCart = null;
    this.subTotal = 0;

    this._cartService.deleteAllCart(this.token).subscribe(response => {
      console.log('la respuesta de delete/cart', response);

      if (response.status == 'success') {
        this.indexCart();
      }

    }, error => {
      this.status = error;



    })
  }

  ngOnDestroy(): void {

  }



}
