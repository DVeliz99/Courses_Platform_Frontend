import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../signals/token.service';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Cart } from '../../models/cart';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { SalesService } from '../../services/sales.service';
import { error } from 'jquery';


@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  public page_title = "inicio";
  public courses: any;
  public identity: any;
  public identityString: any;
  public token: any;
  public cart!: Cart;
  public courseToModify!: any;
  public coursesOnCart!: any;
  public purchasedCourses !: any // Esto es problemático si no se inicializa.
  public hideCartIcon = false;
  public quantity = 0;
  public subTotal = 0;
  public subtotals!: any;



  constructor(private _courseService: CourseService,
    private _userService: UserService,
    private _authService: AuthService,
    private _tokenService: TokenService,
    private _cartService: CartService,
    private _router: Router,
    private _salesService: SalesService) {
    this.page_title = "Actualizar el curso";
    this.identity = this._tokenService.getIdentity();
    this.identityString = JSON.parse(this.identity); //parseo de identity 
    this.token = this._authService.getToken();
    this.cart = new Cart(1, 1, 1);

  }

  ngOnInit(): void {


    this.getCourses().then(() => {
      this._courseService.getCourses().subscribe(


        (response) => {
          console.log('Respuesta obtenida desde el courseService en home component', response);
          if (response && response.status == 'success') {
            this._courseService.currentHomeCourses.subscribe(response => {
              this.courses = response;
              if (this.courses) {
                console.log('Cursos obtenidos:', this.courses);
                this.getSales();


              }

            })


          } else {
            console.error('Error en la respuesta del servidor', response);
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FFD65A',
              color: '#E50046',
              class: 'text-danger',
              message: 'Los cursos no estan disponibles.',
              displayMode: 2,
              maxWidth: 350,
              icon: 'fa-sharp fa-solid fa-xmark',
              position: 'topRight'
            });
          }
        },
        (error) => {
          console.error('Error en la solicitud', error);

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
        }
      );





    }
    )

    console.log('Token decodificado en home component', this.identityString);

    this._cartService.currentItems.subscribe(response => {
      this.quantity = response;
      console.log('quantity en home component', this.quantity);

    })

  }


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



  getThumb(url: any, size: any): string {

    var video, results, thumbnailURL;

    if (url === null) {
      return '';
    }

    //asegura que despues de ? haya v= , luego agarra todos los caracteres excluyendo ^&#

    results = url.match('[\\?&]v=([^&#]*)');
    video = (results === null) ? url : results[1]; // Si results es igual a null obtiene la url a evaluar, de lo contrario obtenemos el identificador de la url 
    // console.log(video);


    if (size != null) {
      thumbnailURL = 'http://img.youtube.com/vi/' + video + '/' + size + '.jpg';
    } else {
      thumbnailURL = 'http://img.youtube.com/vi/' + video + '/' + '/mqdefault.jpg';
    }

    // retorna la miniatura del video de youtube
    return thumbnailURL;
  }


  deleteCourse(id: any) {
    this._courseService.deleteCourse(this.token, id).subscribe(response => {
      if (response && response.status == 'success') {
        //refrescar los cursos
        this.getCourses();
      }
    }, error => {
      console.log(error);

    })
  }

  addToCart(id: any) {
    if (this.identityString.sub == null || this.identityString.sub == '' || this.identityString == undefined) {
      this._router.navigate(['/login']);
    } else if (this.identityString.sub) {
      console.log();

      //añadir el id del curso
      this.cart.course_id = id;
      this.cart.id = this.identityString.sub;

      console.log('cart a enviar a la solicitud', this.cart);

      this._cartService.createCart(this.token, this.cart).subscribe(response => {
        if (response && response.status == 'success') {


          console.log('respuesta del backend en addToCart', response);
          if (response.cart) {
            console.log('coursesOnCart despues añadir al carrito', response.cart);


            this._cartService.changeQuantityItems(response.cart.length);
            console.log('quantity enviada a cartService desde home component', response.cart.length);

            this.indexCart();


          }



          // this.coursesOnCart = this._cartService.index(this.token);

          // console.log('CoursesOnCart en home componente addToCart', this.coursesOnCart);



        } else {
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

        }
      })

    }

  }

  isCourseBought(courseId: number): boolean {
    //Para evitar error que lee una propiedad undefined
    if (!courseId || !this.identityString || !this.purchasedCourses) {
      return false;
    }
    return this.purchasedCourses.some((course: any) => course.course_id === courseId && course.user_id === this.identityString.sub);
  }


  onUpdateDataCourse(course: any) {


    this.courseToModify = course; // Guardar el curso seleccionado


    console.log('Nueva data en this.courseToModify', this.courseToModify);



  }

  indexCart(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._cartService.index(this.token).subscribe(
        response => {
          console.log('Response http obtenida desde CartService en home component ', response);

          if (response && response.status == 'success') {

            //añadioendo courses en el carrito desde la base de datos a currentCartCourses
            this._cartService.changeCartCourses(response.courses);

            this.subtotals = response.subtotals;
            if (this.subtotals && Array.isArray(this.subtotals)) {
              this.subTotal = this.subtotals.reduce((acc: number, subtotal: any) => acc + Number(subtotal), 0);
            }

            console.log('subtotal a enviar al cartService', this.subTotal);

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


  getSales() {
    this._salesService.getSales(this.token).subscribe(response => {
      if (response && response.status == 'success') {
        this.purchasedCourses = response.sales;
        console.log('purchasedCourses', this.purchasedCourses);

      } else {
        console.log('error');


      }
    }, error => {
      console.log(error);

    })
  }
}
