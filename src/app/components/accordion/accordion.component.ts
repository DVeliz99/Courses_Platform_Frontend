import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { Accordion } from '../../models/accordion';
import { AccordionService } from '../../services/accordion.service';
import { Validators } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { TokenService } from '../../signals/token.service';
import { AuthService } from '../../services/auth.service';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { Global } from '../../services/global';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-accordion',
  imports: [CommonModule, ReactiveFormsModule, FileUploadModule, MatTooltipModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.css'
})
export class AccordionComponent implements OnInit, AfterViewInit {

  public accordionForm: FormGroup = new FormGroup({})
  uploader!: FileUploader;

  public identity!: any;
  public status!: string;
  public course_id!: number;
  public courseData!: any;
  public identityString!: any;
  public accordion: Accordion;
  public numOfAccordion!: number;
  public isEditing = false;


  public token: any;
  public categoryToEdit: any = null;
  public accordionData!: any;
  public accordionToEdit: any = {};
  public isAccordionActioned = false;
  public section!: number;



  /*Para file */
  public name_of_image!: string;
  public fileName!: string | undefined;

  /*Editar accordion */
  public num_of_sectionToModify!: number;
  public course_idToModify!: number;
  public section_idToModify!: number;




  constructor(private _accordionService: AccordionService,
    private fb: FormBuilder,
    private _courseService: CourseService,
    private _route: ActivatedRoute,
    private _tokenService: TokenService,
    private _authService: AuthService) {

    this.identity = this._tokenService.getIdentity();
    this.token = this._authService.getToken();
    this.identityString = JSON.parse(this.identity);
    // console.log('identityString', this.identityString);

    this.accordion = new Accordion(1, '', 1);

    this.fileName = '';


  }


  ngOnInit(): void {
    this.getCourse().then(() => {
      this.docConfig();
    });
    this.initializeForm();
  }


  initializeForm(): void {

    this.accordionForm = this.fb.group({
      section_name: ['', [Validators.minLength(2)]]
    });
  }
  ngAfterViewInit(): void {
    console.log('Cargando después de la vista');

    if (this.uploader) {
      this.uploader.onAfterAddingFile = (item => {
        item.withCredentials = false;
        this.name_of_image = item.file.name!;
        console.log('Nombre de la imagen', this.name_of_image);
      });
    } else {
      console.log('Uploader no está inicializado');
    }
  }



  docConfig() {

    console.log('configuracion de doc iniciada');

    // configuracion del uploader
    this.uploader = new FileUploader({
      url: Global.url + 'accordion/upload', // La URL de la API
      headers: [{ name: 'Authorization', value: this.token }], // Encabezados para el Authorization
      allowedFileType: ['doc', 'pdf', 'rar', 'txt'], //
      maxFileSize: 5 * 1024 * 1024, // Límite de 5 MB por archivo
      removeAfterUpload: true, // Opcional: elimina el archivo de la cola después de subirlo
      autoUpload: false, // Opcional: no sube automáticamente al agregar el archivo
      queueLimit: 1, // Opcional: limita la cola de archivos a uno solo

    })







    // Evento que se dispara después de agregar un archivo
    this.uploader.onAfterAddingFile = (fileItem) => {
      // Si hay más de un archivo, eliminamos el primero
      console.log('nombre del archivo', fileItem._file.name);

      if (this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(fileItem);  // Elimina el archivo adicional
        alert('Solo puedes subir un archivo a la vez');
      }
    };



    this.uploader.onSuccessItem = (item, _response, _status, _headers) => {
      console.log('Archivo subido con éxito:', item.file.name);

      this.fileName = item.file.name;

      console.log('fileName', this.fileName);

    };

    this.uploader.onErrorItem = (item, _response, _status, _headers) => {
      console.log('Error al subir el archivo:', item.file.name);
    };

    this.uploader.onProgressItem = (item, progress) => {
      console.log(`Progreso de subida de ${item.file.name}: ${progress}%`);
    };

    this.uploader.onBeforeUploadItem = (item: any) => {

    }

    this.uploader.onBuildItemForm = (fileItem: any, form: FormData) => {
      form.append('course_id', this.course_idToModify.toString());
      form.append('section', this.num_of_sectionToModify.toString());

      console.log('📝 FormData antes de enviar:');
      for (let pair of form.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      console.log('fin de FormData antes de enviar');

    };

  }

  uploadFile(): Promise<any> {
    return new Promise((resolve, reject) => {


      this.upload();

      this.uploader.onSuccessItem = (item, _response, _status, _headers) => {
        console.log('Archivo subido con éxito:', item.file.name);


        resolve({ message: 'Archivo subido con éxito', file: item.file.name });
      };

      this.uploader.onErrorItem = (item, _response, _status, _headers) => {
        console.error('Error al subir el archivo:', item.file.name);

        // Rechazar la promesa cuando ocurra un error en la subida
        reject({ message: 'Error al subir el archivo', file: item.file.name });
      };

      // Opcional: iniciar la subida automáticamente
      if (this.uploader.queue.length > 0) {
        this.uploader.uploadAll();
      } else {
        reject({ message: 'No hay archivos en la cola para subir' });
      }
    });
  }



  clearQueue() {

    console.log('clearQueue');

    this.uploader.clearQueue();

    // Limpiar el valor del input de archivo
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';  // elimina el valor del inpust
    }

  }

  upload() {
    this.uploader.uploadAll();
  }




  onCreate(accordionForm: FormGroup) {

    this.course_idToModify = this.course_id;
    this.num_of_sectionToModify = this.section;

    console.log('course_idToModify', this.course_idToModify);
    console.log('num_of_sectionToModify', this.num_of_sectionToModify);






    this.accordion = {
      course_id: this.course_id,

    };


    if (accordionForm.value.section_name) {
      this.accordion.section_name = accordionForm.value.section_name;
    }




    this._accordionService.createAccordion(this.token, this.accordion).subscribe(response => {
      if (response && response.status == 'success') {

        this.status = response.status;

        this.uploadFile();


        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'La sección se ha creado correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });



        this.getAccordion();


      } else {
        this.status = response.status;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FFD65A',
          color: '#E50046',
          class: 'text-danger',
          message: 'la categoría no se ha podido registrar.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-sharp fa-solid fa-xmark',
          position: 'topRight'
        });
      }

    }, error => {
      console.log(error);
      this.status = 'error';
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

  onUpdate(accordionForm: FormGroup) {
    //El section name es obligatorio


    this.accordionToEdit.section_name = accordionForm.value.section_name;



    console.log('accordion a enviar a la solicitud http', this.accordionToEdit);





    if (this.accordionToEdit.section_name) {

      this._accordionService.updateAccordion(this.token, this.accordionToEdit, this.accordionToEdit.id).subscribe(response => {
        console.log('response en onUpdate', response);

        if (response && response.status == 'success') {
          if (this.accordionToEdit.num_of_section && this.accordionToEdit.course_id) {


            if (this.section && this.course_id) {
              console.log('num_of_section', this.accordionToEdit.num_of_section, 'course_id', this.accordionToEdit.course_id, ' ', 'Para guardar doc');
              this.uploadFile();

            }

          }

          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#FFF',
            color: '#1DC74C',
            class: 'text-success',
            message: 'La sección se ha actualizado correctamente.',
            displayMode: 2,
            maxWidth: 350,
            icon: 'fa-solid fa-square-check',
            position: 'topRight'
          });



          this.getAccordion();

        } else {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FFD65A',
            color: '#E50046',
            class: 'text-danger',
            message: 'la sección no se ha podido actualizar.',
            displayMode: 2,
            maxWidth: 350,
            icon: 'fa-sharp fa-solid fa-xmark',
            position: 'topRight'
          });
        }

      })



    }



  }




  /*Para editar */
  getAccordion(): Promise<any> { //Devolver una promesa para asegurar que los datos esten listos antes de ejecutar getCourse
    return new Promise((resolve, reject) => {

      this._accordionService.getCourseSectionsData(this.courseData.id, this.token).subscribe(response => {

        if (response) {

          this.accordionData = response.accordionData;

          console.log('Response http desde accordionService', this.accordionData);
          resolve(this.accordionData);

        }
        else {
          // resolver la promesa con las categorías

          reject('Error al obtener accordion desde acordionService');

        }

      }, error => {
        reject(error);
      })
    })
  }


  startCreatingSection() {
    this.isAccordionActioned = true;


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

              this.courseData = response.course;

              console.log('courseData', this.courseData);

              if (this.courseData) {
                this.getAccordion();
                this.section = this.courseData.accordion + 1;
                console.log('La seccion del curso disponible para crear es:', this.section);
                this.course_id = this.courseData.id;
                console.log('El curso id obtenifo en getCourse()', this.course_id);





              }

              resolve(this.courseData); //resolver la promesa


              // Esto devolverá 'Backend

            } else {
              this.status = response.status;

              reject(this.status)
              // this._router.navigate(['/home']);
            }
          }, (error: any) => {
            this.status = error;
            // this.isEditing = false;
            // this.isCategoryClicked = false;
            // this.courseForm.reset();
            // this.selectedCategory = '';

            reject(this.status);
            // this._router.navigate(['/home']);

          })

        } else {
          // this.isEditing = false;
          // this.isCategoryClicked = false;
          // this.courseForm.reset();
          // this.selectedCategory = '';
          reject('El parámetro "id" no está definido o es inválido.');

        }


      })



    })



  }





  deleteAccordion(id: number) {
    this._accordionService.deleteAccordion(this.token, id).subscribe(response => {

      console.log('response', response);

      if (response && response.status == 'success') {

        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'La sección se ha eliminado correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });

        this.getAccordion();
      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FFD65A',
          color: '#E50046',
          class: 'text-danger',
          message: 'la sección no se ha podido eliminar.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-sharp fa-solid fa-xmark',
          position: 'topRight'
        });
      }
    }, error => {
      console.log(error);

      iziToast.show({
        title: 'ERROR',
        titleColor: '#FFD65A',
        color: '#E50046',
        class: 'text-danger',
        message: 'Error en la respuesta.',
        displayMode: 2,
        maxWidth: 350,
        icon: 'fa-sharp fa-solid fa-xmark',
        position: 'topRight'
      });

    })
  }




  onUpdateCurrentAccordion(accordion: any) {

    this.accordionToEdit = accordion; // Guardar el accordion seleccionado

    // this.accordionForm.value.section_name = this.accordionToEdit.section_name;

    this.accordionForm.patchValue({
      section_name: this.accordionToEdit.section_name
    });


    this.accordion = {
      course_id: this.accordionToEdit.course_id,
      section_name: this.accordionToEdit.section_name,
      num_of_section: this.accordionToEdit.num_of_section,
      id: this.accordionToEdit.id
    };


    this.course_idToModify = this.accordionToEdit.course_id;
    this.num_of_sectionToModify = this.accordionToEdit.num_of_section;






    console.log('Nueva data en this.accordion', this.accordion);



  }







}
