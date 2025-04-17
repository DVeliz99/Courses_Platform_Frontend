import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { DOCUMENT } from '@angular/common'; //sirve para recargar la pagina
import { Inject } from '@angular/core';//sirve para recargar la pagina
import { NgForm } from '@angular/forms';  // Importa NgForm
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DecodeTokenService } from '../../services/tokenDecoded.service';
import { TokenService } from '../../signals/token.service';




@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  public page_title: string;
  public identity: any;
  public user: any;
  public status: any;
  public token: any;
  public isLogginButtonClicked = false;


  constructor(
    private formbuilder: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _tokenService: TokenService,
    @Inject(DOCUMENT) private document: Document

  ) {

    // this.user = new User(1, '', '', 'ROLE_USER', '', '', '', ''); //Objeto user
    this.page_title = "¡Bienvenido! Inicia sesión para continuar.";

  }

  ngOnInit(): void {

    console.log('Iniciando componente de login');

    // Creamos el formulario reactivo con los campos y validaciones
    this.loginForm = this.formbuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern('^[a-zA-Z0-9_]*$')]]

    });








  }

  loadPage() { this.document.location.reload(); }

  isLoginButtonShownup() {
    this.isLogginButtonClicked = false;
  }

  onSubmit(loginForm: FormGroup) {

    const formData = {
      email: loginForm.value.email,
      password: loginForm.value.password
    };

    console.log(formData);

    this._authService.signup(formData).subscribe(
      response => {

        console.log('response', response);
        if (!response.status || response.status != 'error') {
          this.status = 'success';
          this.token = response; //obtenemos el token en la respuesta

          this.isLogginButtonClicked = true;




          //Obtener el usuario

          this._authService.signup(formData, true).subscribe(
            response => {
              this.identity = response;



              //PERSISTIR DATOS


              this.isLoginButtonShownup();


              localStorage.setItem('token', this.token);
              localStorage.setItem('identity', JSON.stringify(this.identity)); //Se pasa un objeto a json string para poder guardarse en el localstorage


              // decodeAndSetToken(this.token);

              console.log('identity añadido al localstorage desde login component');
              

              this._tokenService.decodeToken();

              // this._decodeTokenService.decodeToken();

              this._router.navigate(['/home']).then(() => {
                this.loadPage(); //promesa

              })

            },
            error => {
              this.status = 'error';
            }

          );
        }
      }, error => {
        this.status = 'error';
        console.log(error);


      }
    );

  }




}
