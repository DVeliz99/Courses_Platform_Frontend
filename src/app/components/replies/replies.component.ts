import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RepliesService } from '../../services/replies.service';
import { CommonModule } from '@angular/common';
import { Global } from '../../services/global';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../signals/token.service';
import { FileUploadModule } from 'ng2-file-upload';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import { Reply } from '../../models/reply';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { error } from 'jquery';

@Component({
  selector: 'app-replies',
  imports: [CommonModule, ReactiveFormsModule, FileUploadModule, FroalaEditorModule],
  templateUrl: './replies.component.html',
  styleUrl: './replies.component.css'
})
export class RepliesComponent implements OnInit, AfterViewInit {

  replyForm: FormGroup = new FormGroup({});
  uploader!: FileUploader;

  public comment_id!: number;
  public currentCommentId!: any;
  public repliesData: any[] = [];
  public usersReply: any[] = [];
  public currentReply!: any;
  public token!: any;
  public identity!: any;
  public identityString!: any;
  public replyToEdit: any = {};
  public reply!: any;
  public replyId!: number;
  public showTextArea!: false;
  public status = '';
  public isCreateReplybuttonClicked = false;
  public showCreateReply = false;



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



  constructor(private _repliesService: RepliesService,
    private fb: FormBuilder,
    private _authService: AuthService,
    private _tokenService: TokenService) {

    this.token = this._authService.getToken();
    // console.log('token', this.token);

    this.identity = this._tokenService.getIdentity();
    this.identityString = JSON.parse(this.identity);
    console.log(this.identityString);
    this.reply = new Reply(1, 1, '');

  }

  ngOnInit(): void {

    // console.log('usersReply:', this.usersReply);

    this._repliesService.currentReplies.subscribe(response => {
      if (response) {
        this.repliesData = response;
        console.log('replies en repliesComponent', this.repliesData);

      }
    })


    this._repliesService.currentCommentID.subscribe(response => {
      this.currentCommentId = response;
    })


    this._repliesService.isEnableReplyButtonClicked.subscribe(response => {
      this.showCreateReply = response;
    })

    this.initializeForm();
    this.imageConfig();

    this._repliesService.currentUsersReply.subscribe(response => {
      this.usersReply = response;
      console.log('users en repliesComponent', this.usersReply);
    }

    )

  }

  initializeForm() {
    // Creamos el formulario reactivo con los campos y validaciones
    this.replyForm = this.fb.group({
      reply: ['', [Validators.required]]

    });
  }

  imageConfig() {

    console.log('configuracion de imagen iniciada');

    // configuracion del uploader
    this.uploader = new FileUploader({
      url: Global.url + 'replies/upload', // La URL de la API
      headers: [{ name: 'Authorization', value: this.token }], // Encabezados para el Authorization
      allowedFileType: ['image'], // Solo acepta imágenes (jpg, jpeg, png, gif)
      maxFileSize: 5 * 1024 * 1024, // Límite de 5 MB por archivo
      removeAfterUpload: true, // Opcional: elimina el archivo de la cola después de subirlo
      autoUpload: false, // Opcional: no sube automáticamente al agregar el archivo
      queueLimit: 1, // Opcional: limita la cola de archivos a uno solo

    })





    this.uploader.onBuildItemForm = (fileItem, form) => {
      if (this.replyId) {
        form.append('id', this.replyId);
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



  }

  getReplies(comment_id: number) {
    console.log('comment_id de las respuestas', comment_id);

    this._repliesService.getReplies(comment_id).subscribe((response: any) => {
      if (response && response.status == 'success') {

        if (response.isEmpty != 'yes') {
          this.repliesData = response.replies; //Transformacion a un arreglo
          console.log('replies en repliesComponent', this.repliesData);
        }

      }
    }, error => {
      console.log(error);
      this.repliesData = [];

    })
  }


  getAvatarPath(user: string, image: string) {
    return Global.url + 'user/avatar/' + user + '_' + image;
  }

  getReplyImage(image: string) {

    return Global.url + 'replies/image/' + image;

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


  updateCurrentReply(reply: any) {
    if (reply) {
      this.replyToEdit = reply;
      console.log('replytoEdit', this.replyToEdit);
      this.replyForm.patchValue({
        reply: this.replyToEdit.response
      })



    }
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

    if (this.uploader.queue.length > 0) {
      console.log('Hay un archivo seleccionado');

      this.uploader.uploadAll();
    } else {
      console.error('No hay archivos en la cola');
    }
  }

  onCreate(replyForm: FormGroup) {

    console.log('currentCommentId', this.currentCommentId);


    if (this.currentCommentId) {
      this.reply = ({
        user_id: this.identityString.sub,
        comment_id: this.currentCommentId,
        response: replyForm.value.reply,

      })


      console.log('reply', this.reply);

      if (this.reply) {



        this._repliesService.create(this.token, this.reply).subscribe(response => {
          if (response && response.status == 'success') {
            this.status = response.status;
            console.log('respuesta obtenida', response);

            this.replyId = response.Reply.id;
            console.log('this.replyId', this.replyId);

            if (this.replyId) {
              this.upload();
            }


            this.getReplies(this.reply.comment_id);


            iziToast.show({
              title: 'SUCCESS',
              titleColor: '#FFF',
              color: '#1DC74C',
              class: 'text-success',
              message: 'la respuesta se ha creado correctamente.',
              displayMode: 2,
              maxWidth: 350,
              icon: 'fa-solid fa-square-check',
              position: 'topRight'
            });

            this._repliesService.changeButtonStatus(false);
            this.isCreateReplybuttonClicked = false;


          } else {

            this.status = 'error';
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FFD65A',
              color: '#E50046',
              class: 'text-danger',
              message: 'El respuesta no se ha podido crear.',
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
    }

  }

  onDelete(reply: any) {
    console.log('id de la respuesta a eliminar', reply.id);
    if (reply) {

      this.comment_id = this.reply.comment_id;
      this._repliesService.delete(reply.id, this.token).subscribe(response => {
        if (response && response.status == 'success') {
          console.log('Respuesta en onDelete', response);

          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#FFF',
            color: '#1DC74C',
            class: 'text-success',
            message: 'la respuesta se ha actualizado correctamente.',
            displayMode: 2,
            maxWidth: 350,
            icon: 'fa-solid fa-square-check',
            position: 'topRight'
          });


          console.log('this.comment.id', this.comment_id)
          if (this.comment_id) {
            this.getReplies(this.comment_id);
          }


        } else {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FFD65A',
            color: '#E50046',
            class: 'text-danger',
            message: 'El respuesta no se ha eliminado.',
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

  onEdit(replyForm: FormGroup) {

    this.reply = ({
      user_id: this.identityString.sub,
      comment_id: this.replyToEdit.comment_id,
      response: replyForm.value.reply,
      id: Number(this.replyToEdit.id)

    })




    // console.log('currentReply', this.reply);
    // console.log('replyToEdit.id:', this.replyToEdit.id);
    // console.log('this.reply.id', this.reply.id);




    if (this.reply) {



      this._repliesService.update(this.reply, this.reply.id, this.token).subscribe(response => {
        if (response && response.status == 'success') {
          console.log('respuesta obtenida', response);

          this.replyId = this.reply.id;
          console.log('this.replyId', this.replyId);

          if (this.reply.id) {
            this.upload();
          }


          this.getReplies(this.reply.comment_id);


          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#FFF',
            color: '#1DC74C',
            class: 'text-success',
            message: 'la respuesta se ha actualizado correctamente.',
            displayMode: 2,
            maxWidth: 350,
            icon: 'fa-solid fa-square-check',
            position: 'topRight'
          });




        } else {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FFD65A',
            color: '#E50046',
            class: 'text-danger',
            message: 'El respuesta no se ha podido actualizar.',
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


  getReplyImagePath(image: string) {

    return Global.url + 'replies/image/' + image;

  }




}
