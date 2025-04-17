import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import $ from 'jquery';
import { CategoryService } from './services/category.service';
import { CommonModule } from '@angular/common';
import { User } from './models/user';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from './services/auth.service';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TokenService } from './signals/token.service';
import { UserService } from './services/user.service';
import { CartService } from './services/cart.service';
import { Global } from './services/global';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CourseService } from './services/course.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, BsDropdownModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],


})
export class AppComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  isLargeScreen = window.innerWidth >= 992; // `lg` en Bootstrap

  searchControl = new FormControl('');

  title = 'frontend';
  public categories: any;
  public identity: any;
  public token: any;
  public sub!: number;
  public name!: string;
  public surname!: string;
  public email!: string;
  public role!: string;
  public avatar!: string;
  public decodedIdentity: any;
  public avatarUrl!: string;
  public newAvatarUrl!: string;
  public url = Global.url;


  /*para el carrito */
  public coursesOnCart: any;
  public quantity = 0;
  public quantities: any;
  public total: any;
  public cart_courses!: any;
  public subtotals!: any;
  public subTotal = 0;
  public enableCart = false;






  public audio = new Audio('/sounds/mouse-click.mp3');


  constructor(
    private _categoryService: CategoryService,
    private _authService: AuthService,
    @Inject(DOCUMENT) private document: Document,
    private _tokenService: TokenService,
    private _userService: UserService,
    private _cartService: CartService,
    private cdr: ChangeDetectorRef,
    private _courseService: CourseService

  ) {

    this.token = this._authService.getToken();
    console.log('token', this.token);





  }


  ngOnInit(): void {
    $('body').css('background', 'black');

    window.addEventListener('resize', () => {
      this.isLargeScreen = window.innerWidth >= 992;
    });


    // console.log('iniciando quantity', this.quantity);


    console.log('Iniciando app component');

    if (this.token) {
      this.indexCart().then(() => {
        this._cartService.currentCartCourses.subscribe(response => {
          this.coursesOnCart = response;
          console.log('courses on Cart en el app component', this.coursesOnCart);
          this._cartService.currentItems.subscribe(response => {
            let quantityResponse = response;

            this.quantity = Number(quantityResponse);
            // this.cdr.detectChanges();



            console.log('quantityTotal recibida en app component desde cartService', this.quantity);

          })

        })

        this._cartService.currentSubtotal.subscribe(response => {
          this.subTotal = response;

          console.log('subtotal al inciar app component', this.subTotal);

        })
      })
    }



    this.getCategories();


    this.identity = this._tokenService.getIdentity();
    this.decodedIdentity = JSON.parse(this.identity);

    console.log('respuesta del tokenService en app component', this.decodedIdentity);

    this._userService.currentavatar.subscribe(updatedAvatar => {
      if (updatedAvatar) {
        console.log('avatar actualizado en app component desde userService', updatedAvatar);

        this.name = this.decodedIdentity.name;
        this.surname = this.decodedIdentity.surname;
        this.email = this.decodedIdentity.email;
        this.role = this.decodedIdentity.role;

        console.log('role del usuario en app component', this.role);

        this.newAvatarUrl = this.getAvatarPath(updatedAvatar);
        console.log('valor de newAvatar Url en app component', this.newAvatarUrl);

      } else {
        this.getDecodedUserData();
      }
    })

    this._cartService.currentSubtotal.subscribe(response => {
      this.subTotal = response;
    })

    this.searchCourses();

  }

  ngAfterViewInit(): void {

  }

  ngAfterViewChecked() {
    // console.log('Quantity después de renderizar:', this.quantity);
    // this.cdr.detectChanges();
  }


  getDecodedUserData() {


    this.name = this.decodedIdentity.name;
    this.surname = this.decodedIdentity.surname;
    this.email = this.decodedIdentity.email;
    this.role = this.decodedIdentity.role;
    this.avatar = this.decodedIdentity.image;

    this.avatarUrl = this.getAvatarPath(this.avatar);
  }



  getAvatarPath(avatar: string) {
    return "http://backend.rest/api/user/avatar/" + avatar;
  }



  playAudio() {
    this.audio.play();
  }




  getCategories() {

    this._categoryService.currentCategories.subscribe(response => {
      if (response) {
        this.categories = response;
        console.log('categorías obtenidas del servicio', this.categories);
      } else {
        this._categoryService.getCategories().subscribe(
          response => {
            if (response.status == 'success') {
              this.categories = response.categories;
              console.log('categorías obtenidas desde el backend', this.categories);

            }
          },
          error => {
            console.log(error);

          }
        );

      }
    })

  }

  getCoursesByCategory(id: number) {
    this._courseService.getCoursesByCategory(id).subscribe(
      (response: any) => {
        console.log('cursos obtenidos por categoría', response);
        if (response && response.status == 'success') {
          this._courseService.changeCoursesOnHome(response.CoursesByCategory);
          console.log('cursos enviados a homeCourses en courseService', response.CoursesByCategory);

        }
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  async searchCourses() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => query ? this._courseService.getCoursesByText(query) : this.getCourses())
    ).subscribe({
      next: (response: any) => {
        if (response && response.status == 'success') {
          this._courseService.changeCoursesOnHome(response.courses);
        }
      },
      error: err => console.error('Error en la búsqueda:', err)
    });

  }


  logout(): void {

    console.log('Llamado al metodo logout');
    this._authService.logout();
  

  }

  loadPage() { this.document.location.reload(); }

  getCourses(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._courseService.getCourses().subscribe(Response => {
        if (Response && Response.status == 'success') {
          this._courseService.changeCoursesOnHome(Response.courses)
          console.log('Respuesta de cursos obtenida en home componenent y enviada al courseService', Response.courses);

          resolve(Response.courses);
        }
      }, error => {
        console.log(error);
        reject(error);
      });
    });
  }

  indexCart(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._cartService.index(this.token).subscribe(
        response => {
          console.log('Response http obtenida desde CartService ', response);

          if (response && response.status == 'success') {
            this.quantity = Number(response.counter);


            this.coursesOnCart = response.courses;
            this.total = response.total;
            this.quantities = response.quantities;
            this.cart_courses = response.cart;
            this.subtotals = response.subtotals;
            if (this.subtotals && Array.isArray(this.subtotals)) {
              this.subTotal = this.subtotals.reduce((acc: number, subtotal: any) => acc + Number(subtotal), 0);
            }
            this.cdr.detectChanges();

            // Guardar en localStorage
            localStorage.setItem('cart', JSON.stringify(this.quantity));

            // Notificar a otros componentes
            this._cartService.changeCartCourses(this.coursesOnCart);
            console.log('Data enviada a CartService');

            // Notificar a otros componentes
            const suma: number = this.quantities.reduce((acumulador: number, valorActual: number) => {
              return acumulador + valorActual;
            }, 0); // El 0 es el valor inicial del acumulador
            this._cartService.changeQuantityItems(suma);
            console.log('quantity enviada a CartService', suma);


            this._cartService.changeSubtotal(this.subTotal);

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
          console.log(' cursos actualizados en coursesOnCart despues de la eliminacion ');

        })




      }
    })

  }

  // toggleCartVisibility(): void {
  //   this.enableCart = !this.enableCart;

  // }

  toggleCartVisibility(): void {
    this.enableCart = !this.enableCart;

  }

  ngOnDestroy(): void {
    this._cartService.resetCartCourses();
    this._cartService.resetSubtotal();
  }


}
