import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../signals/token.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoService } from '../../services/video.service';
import { CourseService } from '../../services/course.service';
import { AccordionService } from '../../services/accordion.service';
import { error } from 'jquery';
import { CommonModule } from '@angular/common';
import { Global } from '../../services/global';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { Comment } from '../../models/comment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import { NgbCollapse, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { RepliesComponent } from '../replies/replies.component';
import { RepliesService } from '../../services/replies.service';
import { ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-video-detail',
  imports: [CommonModule, FileUploadModule, FroalaEditorModule, NgbCollapseModule, ReactiveFormsModule, RepliesComponent],
  templateUrl: './video-detail.component.html',
  styleUrl: './video-detail.component.css'
})
export class VideoDetailComponent implements OnInit, AfterViewInit {

  public commentForm: FormGroup = new FormGroup({});


  public token!: any;
  public status!: string;
  public identity!: any;
  public identityString!: any;
  public videoPlaying_id!: number;
  public course_id!: number;
  public comment_id!: number;
  public singlevideoData!: any;
  public videoUrlSafe!: SafeResourceUrl;
  public videosData!: any;
  public courseData!: any;
  public accordionData!: any;
  public indexOfGroup!: number;
  public isAskQuestionBtnClicked = false;
  public isCreateCommentbuttonClicked = false;

  /*Comentarios y respuestas */
  public comments!: any;
  public repliesXcomment_cant: any;
  public users: any;
  public url!: any;
  public currentComment: any = {};
  public commenToEdit: any = { image: '' }; // Inicializar con una propiedad vacía para evitar error 
  public uploader!: FileUploader;
  public selectedFileName = '';
  public commentData!: any;
  public isEditing = false;
  public showTextArea = false;
  public showResponses = false;
  public currentCommentId!: number;







  public froala_options: Object = {
    language: 'es',
    toolbarButtons: [
      'bold', 'italic', 'underline', 'paragraphFormat',
      'formatOL', 'formatUL', 'align', 'insertLink', 'insertImage'
    ],
    toolbarButtonsXS: ['bold', 'italic', 'underline', 'paragraphFormat'],
    toolbarButtonsSM: ['bold', 'italic', 'underline', 'paragraphFormat'],
    toolbarButtonsMD: ['bold', 'italic', 'underline', 'paragraphFormat'],
    charCounterCount: true,
    placeholderText: 'Escribe algo...',
    heightMin: 200,
    heightMax: 100,

  };




  constructor(
    private _commentService: CommentsService,
    private _authService: AuthService,
    private _tokenService: TokenService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private _videoService: VideoService,
    private _courseService: CourseService,
    private _accordionService: AccordionService,
    private _replieService: RepliesService,
    private fb: FormBuilder) {

    this.url = Global.url;
    this.commentData = new Comment(1, 1, '');

    this.token = this._authService.getToken();
    // console.log('token', this.token);

    this.identity = this._tokenService.getIdentity();
    this.identityString = JSON.parse(this.identity);
    console.log(this.identityString);


  }

  ngOnInit(): void {

    this._replieService.currentCommentID.subscribe(response => {
      this.currentCommentId = response;
      console.log('currentCommentId', this.currentCommentId);



    })






    this.showTextArea = false;
    this._commentService.currentVideoPlaying.subscribe(response => {

      if (response) {
        this.videoPlaying_id = response;
        console.log('videoPlayingId', this.videoPlaying_id);
        if (this.videoPlaying_id) {
          this.getComments();
        }

      }

    })

    this._commentService.curentComments.subscribe(response => {
      if (response) {
        this.comments = response;

        console.log('comments', this.comments);




      }
    })

    this.initializeForm();
    this.imageConfig();


  }






  initializeForm() {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required]]

      /*Validators.pattern('^[a-zA-Z]+$')
Validators.pattern('^[a-zA-Z]+$') */

    });
  }

  imageConfig() {

    console.log('configuracion de imagen iniciada');

    // configuracion del uploader
    this.uploader = new FileUploader({
      url: Global.url + 'comments/upload', // La URL de la API
      headers: [{ name: 'Authorization', value: this.token }], // Encabezados para el Authorization
      allowedFileType: ['image'], // Solo acepta imágenes (jpg, jpeg, png, gif)
      maxFileSize: 5 * 1024 * 1024, // Límite de 5 MB por archivo
      removeAfterUpload: true, // Opcional: elimina el archivo de la cola después de subirlo
      autoUpload: false, // Opcional: no sube automáticamente al agregar el archivo
      queueLimit: 1, // Opcional: limita la cola de archivos a uno solo

    })





    this.uploader.onBuildItemForm = (fileItem, form) => {
      if (this.videoPlaying_id && this.identityString.sub) {
        form.append('user_id', this.identityString.sub);
        form.append('video_id', this.videoPlaying_id)
        if (this.comment_id) {
          form.append('comment_id', this.comment_id);
        }

        // Verifica que se está añadiendo correctamente
        for (const pair of form.entries()) {
          console.log(pair[0], pair[1]); // Debería mostrar user_id y el video_id
        }

      }



    };






    this.uploader.onSuccessItem = (item, _response, _status, _headers) => {
      console.log('Archivo subido con éxito:', item.file.name);

    };

    this.uploader.onErrorItem = (item, _response, _status, _headers) => {
      console.log('Error al subir el archivo:', item.file.name);
    };

    this.uploader.onProgressItem = (item, progress) => {
      console.log(`Progreso de subida de ${item.file.name}: ${progress}%`);
    };
    // Removed duplicate ngAfterViewInit method


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





  ngAfterViewInit(): void {
    // Evento que se dispara después de agregar un archivo
    this.uploader.onAfterAddingFile = (fileItem) => {
      // Si hay más de un archivo, eliminamos el primero
      if (this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(fileItem);  // Elimina el archivo adicional
        alert('Solo puedes subir un archivo a la vez');
      }
    };


  }

  getComments() {

    //Obtener el id del video del servicio

    this._commentService.getComments(this.videoPlaying_id, this.token).subscribe((response: any) => {
      console.log('response en video-detail component', response);

      if (response.status == 'success' && response.index == 'full') {
        // this.comments = response.comments;
        this._commentService.changeCurrentComments(response.comments);
        this.repliesXcomment_cant = response.repliesPerComment;
        this.users = response.users;

        console.log('users', this.users);
        console.log('comments', this.comments);


        console.log('repliesXcomment_cant', this.repliesXcomment_cant);



        // var avatarpath = this.getAvatarPath(this.users[0].image);
        // console.log('avatarpath', avatarpath);



      } else if (response.status == 'success' && response.index == 'empty') {
        this.comments = null;


      }
    }, error => {
      console.log(error);

    })


  }


  getReplies(id: number) {

    console.log('Obtener respuestas para id :', id);

    this.toggleReplies();

    this._replieService.changeButtonStatus(true);
    this._replieService.changeCurrentCommentId(id);

    if (this.showResponses) {
      this._replieService.getReplies(id).subscribe((response: any) => {
        if (response) {
          console.log('response en getReplies', response);

          this._replieService.changeCurrentReplies(response.replies);
          this._replieService.changeCurrentCommentId(id);
          this._replieService.changeCurrentUsersReply(response.users);

        }
      })
    }





  }




  updateCurrentComment(comment: any) {
    this.currentComment = comment;
    console.log('currentComment', this.currentComment);

  }


  toggleTextAreaEdit() {
    this.showTextArea = !this.showTextArea;
  }

  toggleReplies() {
    this.showResponses = !this.showResponses;
  }

  toggleTextTarea() {
    this.showTextArea = !this.showTextArea;
    if (this.commenToEdit || this.commenToEdit) {
      this.commentForm.reset();

    }

    this.isEditing = false;
    this.commenToEdit = '';
  }

  getAvatarPath(user: string, avatar: string) {
    return Global.url + "/user/avatar/" + user + '_' + avatar;
  }

  getCommentImagePath(image: string) {
    return Global.url + 'comments/image/' + image;
  }

  onEdit() {

    let newComment = this.commentForm.value.comment;
    console.log('newComment', newComment);

    console.log('commenToEdit', this.commenToEdit);

    this.commentData = ({
      user_id: this.identityString.sub,
      video_id: this.videoPlaying_id,
      comment: newComment,
      id: this.commenToEdit.id
    })

    if (this.commenToEdit.id) {
      this.comment_id = this.commenToEdit.id;
    }

    // console.log('commentData to Edit', this.commentData);

    // console.log('comment_id', this.comment_id);




    this._commentService.update(this.commentData, this.commentData.id, this.token).subscribe(response => {
      if (response && response.status == 'success') {
        // console.log('response en en onEdit', response);
        this.status = response.status;

        //plugin para mensajes 
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'El commentario se ha actualizado correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });


        this.upload();

        this.getComments();




      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FFD65A',
          color: '#E50046',
          class: 'text-danger',
          message: 'El comentario no se ha podido actualizar.',
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
        message: 'Hubo un error en la respuesta.',
        displayMode: 2,
        maxWidth: 350,
        icon: 'fa-sharp fa-solid fa-xmark',
        position: 'topRight'
      });


    })




  }



  onCreate(commentForm: FormGroup) {

    if (this.videoPlaying_id && this.identityString.sub && commentForm.value.comment) {
      this.commentData = ({
        user_id: this.identityString.sub,
        video_id: this.videoPlaying_id,
        comment: commentForm.value.comment
      })

      console.log('commentData', this.commentData);





      this._commentService.create(this.token, this.commentData).subscribe(response => {
        if (response && response.status == 'success') {
          this.status == 'success';

          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#FFF',
            color: '#1DC74C',
            class: 'text-success',
            message: 'El commentario se ha actualizado correctamente.',
            displayMode: 2,
            maxWidth: 350,
            icon: 'fa-solid fa-square-check',
            position: 'topRight'
          });


          this.getComments();

          this.commentForm.reset();
        } else {
          this.status = 'error';

          iziToast.show({
            title: 'ERROR',
            titleColor: '#FFD65A',
            color: '#E50046',
            class: 'text-danger',
            message: 'El comentario no se ha podido registrar.',
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
          message: 'Hubo un error en la respuesta.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-sharp fa-solid fa-xmark',
          position: 'topRight'
        });

      })

    }



  }

  onDelete(id: number) {

    console.log('id a eliminar', id);



    this._commentService.Delete(id, this.token).subscribe(response => {
      if (response && response.status == 'success') {
        this.status = response.status;

        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'El commentario se ha eliminado correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });


        this.getComments();


      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FFD65A',
          color: '#E50046',
          class: 'text-danger',
          message: 'El comentario no se ha podido eliminar.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-sharp fa-solid fa-xmark',
          position: 'topRight'
        });

      }

    }, error => {
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


  // Método para subir los archivos
  upload() {
    this.uploader.uploadAll();
    if (this.uploader.queue.length > 0) {
      this.uploader.uploadAll();
    } else {
      console.error('No hay archivos en la cola');
    }
  }

  activateEditMode(comment: any) {

    if (comment) {

      this.commenToEdit = comment;
      this.isEditing = true;
      this.toggleTextAreaEdit();
      console.log('currentComment', this.commenToEdit);
      console.log('showtextarea', this.showTextArea);



      if (this.commenToEdit) {
        this.commentForm.patchValue({
          comment: this.commenToEdit.comment
        });


      }

    } else {
      console.error('Error: El comentario recibido es null o undefined');
      return; // Salimos de la función si no hay comentario
    }



  }

  cancelEditMode() {
    this.isEditing = false;
    this.commentForm.reset();
    this.showTextArea = false;

  }




}
