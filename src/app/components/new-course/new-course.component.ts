import { AfterViewInit, Component, OnInit, Input } from '@angular/core';
import { Course } from '../../models/course';
import { UserService } from '../../services/user.service';
import { CourseService } from '../../services/course.service';
import { Global } from '../../services/global';
import { User } from '../../models/user';
import { TokenService } from '../../signals/token.service';
import { AuthService } from '../../services/auth.service';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import { Validators } from '@angular/forms';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';





@Component({
  selector: 'app-new-course',
  imports: [CommonModule, ReactiveFormsModule, FileUploadModule, FroalaEditorModule, RouterModule],
  templateUrl: './new-course.component.html',
  styleUrl: './new-course.component.css'
})
export class NewCourseComponent implements OnInit, AfterViewInit {

  courseForm: FormGroup = new FormGroup({});

  uploader!: FileUploader;


  /*Validador de url en youtube  */
  /* youtubeURL: ['', [Validators.required, Validators.pattern(/https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/)]], */


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


  public page_title_create!: string;
  public page_title_edit!: string;
  public identity!: any;
  public token!: any;
  public courseOnEditImageUrl!: any;
  public courseOnEditImage!: string;
  public course!: Course;
  public course_id!: number;
  public data!: any;
  public status!: string;
  public isEditing!: boolean;
  public resetVar = true;
  public categories: { id: number; name: string, deleted_at: Date, created_at: Date, updated_at: Date }[] = [];
  public isCreatingBtnClicked = false;
  public isCategoryClicked = false;
  public isFileAdded = false;
  public selectedCategory!: string;
  public category_id!: number;
  public name_of_image = '';
  public imageToUpdate = '';
  public courseName = '';





  constructor(private _userservice: UserService,
    private _courseService: CourseService,
    private _tokenService: TokenService,
    private _authService: AuthService,
    private fb: FormBuilder,
    private _categoryService: CategoryService,
    private _route: ActivatedRoute) {
    this.page_title_create = "Crear nuevo curso";
    this.page_title_edit = "Edición del curso";
    this.identity = this._tokenService.getIdentity();
    this.token = this._authService.getToken();
    this.course = new Course(1, '', '', '', '', 1, 1, 1);
    this.isEditing = false;
    this.docConfig();
  }


  ngOnInit(): void {

    this.initializeForm();
    this.getCategories().then(() => {

      this.getCourse().then(() => {

        this._courseService.currentCourseOnEditImage.subscribe(response => {

          this.courseOnEditImageUrl = response;
        })

        console.log('isCategoryClicked', this.isCategoryClicked);
      })
    });


    console.log('isCategoryClicked', this.isCategoryClicked);

  }

  initializeForm(): void {

    this.courseForm = this.fb.group({
      name: ['', [Validators.required]],
      youtubeURL: ['', [Validators.required, Validators.pattern(/https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/)]],
      description: ['', [Validators.minLength(8)]],
      sections: ['', [Validators.pattern(/^\d+$/)]],
      priceNow: ['', [Validators.required]],
      priceBefore: ['', [Validators.required]]

    });



    console.log('la form ha sido inicializada');

  }

  docConfig() {

    console.log('configuracion de imagen iniciada');



    // configuracion del uploader
    this.uploader = new FileUploader({
      url: Global.url + 'course/upload', // La URL de la API
      headers: [{ name: 'Authorization', value: this.token }], // Encabezados para el Authorization
      allowedFileType: ['image'], // Solo acepta imágenes (jpg, jpeg, png, gif)
      maxFileSize: 5 * 1024 * 1024, // Límite de 5 MB por archivo
      removeAfterUpload: true, // Opcional: elimina el archivo de la cola después de subirlo
      autoUpload: false, // Opcional: no sube automáticamente al agregar el archivo
      queueLimit: 1, // Opcional: limita la cola de archivos a uno solo
      additionalParameter: {
        courseName: ''// Parámetro adicional (string)
      }
    })

    // console.log('name en imageConfig', this.name);



    // Evento que se dispara después de agregar un archivo
    this.uploader.onAfterAddingFile = (fileItem) => {
      // Si hay más de un archivo, eliminamos el primero



      if (this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(fileItem);  // Elimina el archivo adicional
        alert('Solo puedes subir un archivo a la vez');
      } else {


        this.name_of_image = fileItem.file.name!;
        console.log('nombre de la imagen', fileItem.file.name);



      }

    };





    this.uploader.onSuccessItem = (item, _response, _status, _headers) => {
      console.log('Archivo subido con éxito:', item.file.name);

      // this.newAvatarUrl = this.getAvatarPath(item._file.name);

      // // Actualización de la URL del avatar
      // this._userService.changeProfileAvatar(item._file.name);

      // console.log('Valor de newAvatarUrl', this.newAvatarUrl);



    };

    this.uploader.onBuildItemForm = (fileItem, form) => {
      const courseName = this.course.name || this.courseName;
      form.append('courseName', courseName);

      // 🔍 Verifica que se está añadiendo correctamente
      for (const pair of form.entries()) {
        console.log(pair[0], pair[1]); // Debería mostrar courseName y el archivo
      }
    };

    this.uploader.onCompleteItem = (fileItem, response, status, headers) => {
      console.log('Respuesta del servidor:', response);
      console.log('Estado HTTP:', status);
    };

    this.uploader.onErrorItem = (item, _response, _status, _headers) => {
      console.log('Error al subir el archivo:', item.file.name);
      console.log('Respuesta del servidor:', _response);
      console.log('Estado HTTP:', _status);
    };

    this.uploader.onProgressItem = (item, progress) => {
      console.log(`Progreso de subida de ${item.file.name}: ${progress}%`);
    };

  }

  getCategories(): Promise<any> { //Devolver una promesa para asegurar que los datos esten listos antes de ejecutar getCourse
    return new Promise((resolve, reject) => {
      this._categoryService.getCategories().subscribe(
        response => {
          if (response && response.status === 'success') {
            this.categories = response.categories;
            resolve(this.categories); // resolver la promesa con las categorías
          } else {
            reject('Error al obtener categorías');
          }
        },
        error => reject(error)
      );
    });
  }

  ngAfterViewInit(): void {
    console.log('Cargando despues de la vista');
    this.uploader.onAfterAddingFile = (item => {  // evita el error access-control origin issue
      item.withCredentials = false;
      this.name_of_image = item.file.name!;
      console.log('Name of the image', this.name_of_image);

    });


  }

  clearQueue() {

    console.log('clearQueue');

    this.uploader.clearQueue();

    // Limpiar el valor del input de archivo
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';  // elimina el valor del inpust
    }

  }

  upload() {
    this.uploader.uploadAll();
  }


  onSubmit(courseForm: FormGroup) {

    console.log('onsubmit triggered');

    this.course = {
      category_id: this.category_id, //Falta obtener el category_id de la categoria seleccionada
      name: courseForm.value.name,
      detail: courseForm.value.description, //=>htmlentitities
      image: this.name_of_image,
      url: courseForm.value.youtubeURL,//=>htmlentitities
      accordion: courseForm.value.sections,
      price_now: courseForm.value.priceNow,
      price_before: courseForm.value.priceBefore,
    }

    console.log('el objeto tipo course', this.course);






    this.upload();





    this._courseService.create(this.token, this.course).subscribe(response => {
      if (response && response.status == 'success') {
        this.status = response.status;


        //plugin para mensajes 
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'El curso se ha registrado correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });

        this.courseForm.reset();
        this.clearQueue();
      } else {
        this.status = response.status;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FFD65A',
          color: '#E50046',
          class: 'text-danger',
          message: 'El curso no se ha podido registrar.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-sharp fa-solid fa-xmark',
          position: 'topRight'
        });
      }
    }, error => {
      this.status = 'error';
      console.log(error);

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

  onUpdate(courseForm: FormGroup) {

    console.log('onUpdate triggered');

    this.course = {
      category_id: this.category_id, //Falta obtener el category_id de la categoria seleccionada
      name: courseForm.value.name,
      detail: courseForm.value.description, //=>htmlentitities
      image: this.name_of_image,
      url: courseForm.value.youtubeURL,//=>htmlentitities
      accordion: courseForm.value.sections,
      price_now: courseForm.value.priceNow,
      price_before: courseForm.value.priceBefore,
    }

    console.log('el objeto tipo course', this.course);

    this.courseName = this.course.name; //asigna el valor del nombre del curso a crear

    this.upload();



    this._courseService.update(this.token, this.course, this.course_id).subscribe(response => {
      if (response && response.status == 'success') {
        this.status = response.status;


        //plugin para mensajes 
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'El curso se ha actualizado correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });

        this.courseForm.reset();
        this.clearQueue();
      } else {
        this.status = response.status;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FFD65A',
          color: '#E50046',
          class: 'text-danger',
          message: 'El curso no se ha podido actualizar.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-sharp fa-solid fa-xmark',
          position: 'topRight'
        });
      }
    }, error => {
      this.status = 'error';
      console.log(error);

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



  docUpload(data: any) {
    let image_detail = JSON.parse(data.reponse); //Convertir a JSON

    /**agregar el nombre de la imagen al objeto course **/
    this.course.image = image_detail.image;
  }


  toggleShowCategories(): void {
    this.isCategoryClicked = !this.isCategoryClicked;
    console.log('isCategoryClicked', this.isCategoryClicked);


  }

  //Añadir categoría como valor actual en el formulario

  selectCategory(category: string): void {

    console.log('Categoría seleccionada', category);
    this.isCategoryClicked = true;


    const theCategory = this.categories.find(theCategory => theCategory.name === category);


    if (theCategory) {

      //añadir el category_id al objeto tipo  course
      this.category_id = theCategory.id;

    }

    this.selectedCategory = category;

  }

  getCourse(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._route.queryParams.subscribe(params => {
        if (params['id']) {
          this.course_id = +params['id']; //Obtención del id en la ruta //el + convierte params['id'] en un entero


          /*Intenta obtener el curso */

          this._courseService.getCourse(this.course_id, this.token).subscribe(response => {
            if (response && response.code == 200) {
              this.status = response.status;

              this.data = response;



              console.log('data', this.data);

              this.course = this.data.course;

              console.log('curso recibido en course-edit componente', this.course);

              let categoryOfCourse = this.data.course.category_id;

              console.log('categoryOfCourse_id', categoryOfCourse);

              let name_of_category = this.getNameofCategory(categoryOfCourse)
              console.log('name_of_category', name_of_category);


              this.selectedCategory = name_of_category;
              this.name_of_image = this.course.image;

              this.selectCategory(this.selectedCategory);

              this.course_id = this.course.id!;

              this.courseForm.patchValue({
                name: this.course.name,
                description: this.course.detail,
                youtubeURL: this.course.url,
                sections: this.course.accordion,
                priceNow: this.course.price_now,
                priceBefore: this.course.price_before

              });



              this.isEditing = true;

              this.courseOnEditImage = this.course.image;
              this.courseName = this.course.name;


              this.courseOnEditImageUrl = this.getImagePath(this.courseOnEditImage);

              this._courseService.changeCourseOnEditImage(this.courseOnEditImageUrl);

              console.log(this.courseOnEditImageUrl);




              resolve(this.courseOnEditImageUrl); //resolver la promesa

              // Esto devolverá 'Backend

            } else {
              this.status = response.status;

              reject(this.status)
              // this._router.navigate(['/home']);
            }
          }, error => {
            this.status = error;
            this.isEditing = false;
            this.isCategoryClicked = false;
            this.courseForm.reset();
            this.selectedCategory = '';

            reject(this.status);
            // this._router.navigate(['/home']);

          })

        } else {
          this.isEditing = false;
          this.isCategoryClicked = false;
          this.courseForm.reset();
          this.selectedCategory = '';
          reject('El parámetro "id" no está definido o es inválido.');

        }


      })



    })



  }

  getNameofCategory(id: any): string {
    let category = this.categories.find(category => category.id == id);

    return category ? category.name : '';
  }

  getImagePath(avatar: string) {
    return Global.url + 'course/image/' + avatar;
  }


  // activateIziToast() {

  //   iziToast.show({
  //     title: 'SUCCESS',
  //     titleColor: '#FFF',
  //     color: '#1DC74C',
  //     class: 'text-success',
  //     message: 'El curso se ha registrado correctamente.',
  //     displayMode: 2,
  //     maxWidth: 350,
  //     icon: 'fa-solid fa-square-check',
  //     position: 'topRight'
  //   });
  // }
}
