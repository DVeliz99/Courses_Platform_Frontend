import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Global } from '../../services/global';
import { UserService } from '../../services/user.service';
import { CourseService } from '../../services/course.service';
import { Video } from '../../models/video';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { TokenService } from '../../signals/token.service';
import { DecodeTokenService } from '../../services/tokenDecoded.service';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { VideoService } from '../../services/video.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import { Validators } from '@angular/forms';


@Component({
  selector: 'app-new-video',
  imports: [CommonModule, ReactiveFormsModule, FileUploadModule, FroalaEditorModule],
  templateUrl: './new-video.component.html',
  styleUrl: './new-video.component.css'
})
export class NewVideoComponent implements OnInit, AfterViewInit, OnDestroy {


  uploader!: FileUploader;
  videoForm: FormGroup = new FormGroup({});

  public page_title_create = 'Registrar video';
  public identity!: any;
  public identityString!: any;
  public token!: any;
  public status!: string;
  public isEditing = false;
  public course: any;
  public video: any;
  public fileName: any;
  public indexOfGroup!: number;
  public resetVar = true;
  public isCreatingBtnClicked = false;
  public selectedSecction!: number;
  public isSectionOptionClicked = false;


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


  constructor(private _tokenService: TokenService,
    private _courseService: CourseService,
    private _videoService: VideoService,
    private _userService: UserService,
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _authService: AuthService
  ) {
    this.identity = this._tokenService.getIdentity();
    this.identityString = JSON.parse(this.identity); //parseo de identity 
    this.token = this._authService.getToken();
    this.video = new Video(this.identityString.sub, 0, '', '', '', 1, '');

  }

  ngOnInit(): void {
    this.initializeForm();
    this.getCourse();
    this.docConfig();

  }


  docConfig() {

    console.log('configuracion de doc iniciada');

    // configuracion del uploader
    this.uploader = new FileUploader({
      url: Global.url + 'video/doc', // La URL de la API
      headers: [{ name: 'Authorization', value: this.token }], // Encabezados para el Authorization
      allowedFileType: ['doc', 'pdf', 'rar', 'txt'], //
      maxFileSize: 5 * 1024 * 1024, // Límite de 5 MB por archivo
      removeAfterUpload: true, // Opcional: elimina el archivo de la cola después de subirlo
      autoUpload: false, // Opcional: no sube automáticamente al agregar el archivo
      queueLimit: 1, // Opcional: limita la cola de archivos a uno solo
      // additionalParameter: {
      //   userName: this.name// Parámetro adicional (string)
      // }
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
      this.fileName = item.file.name;


      this.uploadFile();

      console.log('fileName', this.fileName);



    }

  }

  /*Para hacer que se añada el nombre del archivo en course.file */

  uploadFile(): Promise<any> {
    return new Promise((resolve, reject) => {


      this.upload();

      this.uploader.onSuccessItem = (item, _response, _status, _headers) => {
        console.log('Archivo subido con éxito:', item.file.name);

        if (item.file.name) {
          this.video.file = 'no video';
        }

        this.video.file = item.file.name;

        console.log('course.file', this.course.file);

        // Resolver la promesa cuando se complete la subida con éxito
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


  getCourse() {

    this._route.queryParams.subscribe(params => {
      if (params['id']) {
        const course_id = +params['id']; //converitir a entero
        console.log('couse_id', course_id);

        this._courseService.getCourse(course_id, this.token).subscribe(response => {
          console.log('response desde el método getCourse en el backend', response);

          if (response && response.code == 200) {
            this.course = response.course;
            console.log('course on new-video component', this.course);

            this.indexOfGroup = response.course.accordion;

            console.log('group on new-video component', this.indexOfGroup);

            /*Obtener se section y section_name de la tabla accordion */

            /*Preguntar si desea asignar un nombre a la section en caso de que no hay un section_name en la tabla accordion*/

            /** Hacer insercion a la tabla accordion */
            //bucle while para forzar la obtencion de datos de la tabla accordion 






          } else {
            console.log('error');

          }
        }, error => {
          this.status = error;
          console.log(error);


        })
      }




    })

  }

  getNumberArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }


  ngAfterViewInit(): void {

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


  initializeForm(): void {

    this.videoForm = this.fb.group({
      title: ['', [Validators.required]],
      youtubeURL: ['', [Validators.required, Validators.pattern(/https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/)]],
      content: ['', [Validators.minLength(8)]],


    });



    console.log('la form ha sido inicializada');

  }

  toggleShowSections(): void {
    this.isSectionOptionClicked = !this.isSectionOptionClicked;
    console.log('isSectionOptionClicked', this.isSectionOptionClicked);

  }

  selectSection(section: number): void {
    this.selectedSecction = section;

    console.log('section seleccionada', section);
    this.isSectionOptionClicked = true;


    /*Hacer una solicitud de get para verificar si el registro con el course_id y la secction seleccionada tiene el campo section_name lleno o vacio */

    /* Respuesta de solicitud get */

    //podemos retornar true para habilitar la insercion del nombre de la section a la tabla accordion


    // const theCategory = this.categories.find(theCategory => theCategory.name === category);


    // if (theCategory) {

    //   //añadir el category_id al objeto tipo  course
    //   this.category_id = theCategory.id;

    // }

    // this.selectedCategory = category;

  }




  onSubmit(videoForm: FormGroup) {

    this.uploadFile().then(() => {

      this._route.queryParams.subscribe(params => {
        const course_id = +params['id']; //converitir a entero
        console.log('couse_id', course_id);






        // console.log('selectedsection', this.selectedSecction);


        this.video = new Video(this.identityString.sub, course_id, videoForm.value.title, videoForm.value.content, videoForm.value.youtubeURL, this.selectedSecction, videoForm.value.title_accordion, this.fileName);

        console.log('Objeto video a enviar al backend', this.video);




        this._videoService.create(this.token, this.video).subscribe(response => {
          if (response && response.status == 'success') {


            iziToast.show({
              title: 'SUCCESS',
              titleColor: '#FFF',
              color: '#1DC74C',
              class: 'text-success',
              message: 'El video se ha creado correctamente.',
              displayMode: 2,
              maxWidth: 350,
              icon: 'fa-solid fa-square-check',
              position: 'topRight'
            });


            this.videoForm.reset();
            this.isCreatingBtnClicked = false;
            this.selectedSecction = 0;

          } else {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FFD65A',
              color: '#E50046',
              class: 'text-danger',
              message: 'El video no se ha podido registrar.',
              displayMode: 2,
              maxWidth: 350,
              icon: 'fa-sharp fa-solid fa-xmark',
              position: 'topRight'
            });
          }
        })

      })

    })


  }

  // Método para subir los archivos
  upload() {

    if (this.uploader.queue.length > 0) {
      console.log('Hay un archivo seleccionado');

      this.uploader.uploadAll();
    } else {
      console.error('No hay archivos en la cola');
    }
  }




  ngOnDestroy(): void {

  }

}
