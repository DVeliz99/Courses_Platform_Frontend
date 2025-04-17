import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Inject } from '@angular/core';


@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  public page_title: string;
  user: any;
  public status: string | undefined;
  public isRegisterButtonClicked = false;

  constructor(private formbuilder: FormBuilder, private _userService: UserService, private _router: Router, @Inject(DOCUMENT) private document: Document) {
    this.page_title = "¡Inscribite y comienza a aprender!";

  }

  ngOnInit(): void {

    console.log('Iniciando componente de Register');

    // Creamos el formulario reactivo con los campos y validaciones
    this.registerForm = this.formbuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      surname: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.minLength(6), Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]

      /*Validators.pattern('^[a-zA-Z]+$')
Validators.pattern('^[a-zA-Z]+$') */

    });

  }


  onSubmit(registerForm: FormGroup) {

    const formData = {
      name: registerForm.value.name,
      surname: registerForm.value.surname,
      email: registerForm.value.email,
      password: registerForm.value.password

    };

    console.log('formData', formData);



    this._userService.register(formData).subscribe(response => {

      if (response.status == 'success') {
        this.status = response.status;


        this.isRegisterButtonClicked = true;
        registerForm.reset();
        // Mostrar el mensaje de éxito por 3 segundos antes de redirigir
        setTimeout(() => {
          this._router.navigate(['/home']);
        }, 4000); // 4000 milisegundos = 4 segundos


      } else {
        this.status = response.status;
      }

      console.log(this.status);


      console.log(response);


    }, error => {
      this.status = 'error';
      console.log(error);

    })

  }

  loadPage() { this.document.location.reload(); }




}


