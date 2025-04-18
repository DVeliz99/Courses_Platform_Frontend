import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormsModule, FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user';
import { Global } from '../../services/global';
import { Router, UrlHandlingStrategy } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileUploadModule } from 'ng2-file-upload';  // Importar FileUploadModule
import { AuthService } from '../../services/auth.service';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FileSelectDirective } from 'ng2-file-upload';
import { FileUploader } from 'ng2-file-upload';
import { FormBuilder } from '@angular/forms';
import { DecodeTokenService } from '../../services/tokenDecoded.service';
import { AfterViewInit } from '@angular/core';
import { TokenService } from '../../signals/token.service';
// import { createEffect } from '@angular/effects';
import { FileDropDirective } from 'ng2-file-upload';
import { empty } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-user-edit',
  imports: [CommonModule, ReactiveFormsModule, FileUploadModule, FroalaEditorModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent implements OnInit, AfterViewInit {

  userUpdateForm: FormGroup = new FormGroup({});
  public page_title: string;
  public user!: User; //Del modelo user 
  public status!: string;
  public identity!: any;
  public identityString: any = {};
  public token!: any;
  public resetVar = true;
  public isUpdateButtonClicked = false;



  /*Informacion del usuario */
  public decodedIdentity!: any;
  public sub!: any;
  public name!: any;
  public surname!: any;
  public email!: any;
  public description!: any;
  public role!: any;
  public avatar!: any;
  public avatarUrl!: string;
  public newAvatarUrl!: string;







  /************** Fin Informacion del usuario ********************/


  uploader!: FileUploader;


  public froala_options: Object = {
    language: 'es',
    toolbarButtons: [
      'bold', 'italic', 'underline', 'paragraphFormat',
      'formatOL', 'formatUL', 'align', 'insertLink', 'insertImage'
    ],
    toolbarButtonsXS: [
      'bold', 'italic', 'underline', 'paragraphFormat'
    ],
    toolbarButtonsSM: [
      'bold', 'italic', 'underline', 'paragraphFormat'
    ],
    toolbarButtonsMD: [
      'bold', 'italic', 'underline', 'paragraphFormat'
    ],
    charCounterCount: true,  // Esta opción también existe para contar caracteres
    placeholderText: 'Escribe algo...', // Texto de marcador de posición
    heightMin: 200, // Definir altura mínima
    heightMax: 100, // Definir altura máxima
  };


  constructor(private _userService: UserService, private _http: HttpClient,
    private _decodedTokenService: DecodeTokenService,
    private _authService: AuthService,
    private _router: Router, @Inject(DOCUMENT) private document: Document,
    private _tokenService: TokenService,
    private formbuilder: FormBuilder, private cdr: ChangeDetectorRef) {
    this.page_title = "Ajustes del usuario";
    // Creamos el formulario reactivo con los campos y validaciones
    this.initializeForm();

    this.token = this._authService.getToken();

    console.log('Token en el constructor', this.token);


  }

  ngOnInit(): void {

    console.log('Iniciando user-edit component');

    this.identity = this._tokenService.getIdentity();

    this.identityString = JSON.parse(this.identity); //parseo de identity 

    console.log('identity obtenida en el user-edit component', this.identityString);


    this.getUserData(this.identityString);

    // console.log(typeof (this.identityString));


    if (this.identityString) {
      console.log('valor de name en identity', this.identityString);
      console.log('ejecutando patchvalue');
      this.getUserDataToForm();
    } else {
      console.error('Identity es undefined o null');
    }

    this.imageConfig();















  }


  imageConfig() {

    console.log('configuracion de imagen iniciada');

    // configuracion del uploader
    this.uploader = new FileUploader({
      url: Global.url + 'user/upload', // La URL de la API
      headers: [{ name: 'Authorization', value: this.token }], // Encabezados para el Authorization
      allowedFileType: ['image'], // Solo acepta imágenes (jpg, jpeg, png, gif)
      maxFileSize: 5 * 1024 * 1024, // Límite de 5 MB por archivo
      removeAfterUpload: true, // Opcional: elimina el archivo de la cola después de subirlo
      autoUpload: false, // Opcional: no sube automáticamente al agregar el archivo
      queueLimit: 1, // Opcional: limita la cola de archivos a uno solo
      additionalParameter: {
        userName: this.name// Parámetro adicional (string)
      }
    })

    console.log('name en imageConfig', this.name);



    // Evento que se dispara después de agregar un archivo
    this.uploader.onAfterAddingFile = (fileItem) => {
      // Si hay más de un archivo, eliminamos el primero
      if (this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(fileItem);  // Elimina el archivo adicional
        alert('Solo puedes subir un archivo a la vez');
      }
    };



    this.uploader.onSuccessItem = (item, _response, _status, _headers) => {
      console.log('Archivo subido con éxito:', item.file.name);

      this.newAvatarUrl = this.getAvatarPath(item._file.name);

      // Actualización de la URL del avatar
      this._userService.changeProfileAvatar(item._file.name);

      console.log('Valor de newAvatarUrl', this.newAvatarUrl);
    };

    this.uploader.onErrorItem = (item, _response, _status, _headers) => {
      console.log('Error al subir el archivo:', item.file.name);
    };

    this.uploader.onProgressItem = (item, progress) => {
      console.log(`Progreso de subida de ${item.file.name}: ${progress}%`);
    };

  }


  ngAfterViewInit(): void {
    console.log('Cargando despues de la vista');
    this.uploader.onAfterAddingFile = (item => {  // evita el error access-control origin issue
      item.withCredentials = false;
    });


  }



  getUserData(user: any): void {

    this.name = user.name;
    this.surname = user.surname;
    this.email = user.email;
    this.description = user.description;
    this.role = user.role;
    this.avatar = user.image;
    this.avatarUrl = this.getAvatarPath(this.avatar);
    console.log('valor de inicio de la url avatar', this.avatarUrl);



    console.log('Data añadida', user);



  }

  getUserDataToForm() {
    this.userUpdateForm.patchValue({
      name: this.identityString.name,
      surname: this.identityString.surname,
      email: this.identityString.email,
      description: this.identityString.description
    });

  }



  initializeForm(): void {
    this.userUpdateForm = this.formbuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      surname: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(6)]],
      description: ['', [Validators.minLength(8)]]
    });



    console.log('la form ha sido inicializada');

  }

  // Método para subir los archivos
  upload() {
    this.uploader.uploadAll();
    if (this.uploader.queue.length > 0) {
      this.uploader.uploadAll();
    } else {
      console.error('No hay archivos en la cola');
    }
  }


  avatarUpload(datos: any) {
    let data = JSON.parse(datos.response);
    this.user.image = data.image; //nombre de la imagen





  }

  onSubmit(updateUserForm: FormGroup) {

    const formData: { name: any; surname: any; email: any; description: any; image?: any; role: any } = {
      name: updateUserForm.value.name,
      surname: updateUserForm.value.surname,
      email: updateUserForm.value.email,
      description: updateUserForm.value.description,
      role: this.role
    };

    if (this.uploader.queue.length > 0) {
      formData.image = this.uploader.queue[0]._file.name;


    }

    console.log('Formdata', formData);

    console.log('El toquen enviado a .update', this.token);


    this._userService.update(this.token, formData).subscribe(response => {
      if (response && response.status == 'success') {
        this.status = response.status;
        // this.identity = this.user;
        this.isUpdateButtonClicked = true;

        if (formData.image) {
          this.upload();
        }


        this.avatar = formData.image;


        // Actualización del observable
        this._tokenService.changeDecodedToken(formData);









        // localStorage.setItem('identity', JSON.stringify(this.identity)); //Json string

        // this._router.navigate(['/settings']).then(() => {
        //  this.loadPage();

        //  })

      } else {
        this.status = response.status;
      }

    }, error => {
      this.status = 'error';
      console.log(error);

    })

  }

  loadPage() { this.document.location.reload(); }


  getAvatarPath(avatar: string) {

    return Global.url + "user/avatar/" + this.name + '_' + avatar;

  }







}



