import { AfterViewInit, Component, OnInit, Signal, WritableSignal, ViewChild, computed, inject, signal } from '@angular/core';
import { VideoService } from '../../services/video.service';
import { CourseService } from '../../services/course.service';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser'; //Para incrustar el video de youtube
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../signals/token.service';
import { SalesService } from '../../services/sales.service';
import '@justinribeiro/lite-youtube';
// import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbAccordionModule, NgbCollapse, NgbCollapseModule, NgbModal, NgbModalModule, NgbAccordionItem, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import $, { error } from 'jquery';
// import { Collapse } from 'bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccordionModule } from 'primeng/accordion';
import { AccordionService } from '../../services/accordion.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import { Video } from '../../models/video';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { VideoDetailComponent } from '../video-detail/video-detail.component';
import { CommentsService } from '../../services/comments.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart } from 'chart.js';
import { ChartOptions, ChartType } from 'chart.js';
import { ChartData, ChartConfiguration } from 'chart.js';
import { ChartService } from '../../services/chart.service';
import { ChartModule } from 'primeng/chart';
import { Checkbox } from '../../models/checkbox';
import { CheckboxService } from '../../services/checkbox.service';








@Component({
  selector: 'app-course-detail',
  imports: [CommonModule, AccordionModule,
    NgbCollapseModule, NgbModalModule,
    ReactiveFormsModule, MatTooltipModule,
    FroalaEditorModule, VideoDetailComponent, ChartModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements OnInit, AfterViewInit {


  public videoForm: FormGroup = new FormGroup({});



  /*grafico curso */
  @ViewChild('chart') chart: any;
  private _chartService = inject(ChartService);
  public data!: any;
  public options: any;
  public currentCourse: { progreso?: number } = {};
  public courseProgress!: any;
  public percentageXVideo = 0;



  /**********/


  /* Modelo checkbox*/
  public checkbox!: any;
  public userCheckbox: [] = [];
  public userCourseCheckbox: any | null = null; // Permite que sea null


  /*******/

  public identity: any;
  public token: any;
  public identityString: any;
  public videos: any;
  public purchasedCourses!: any;
  public course: any;
  public course_id: any;
  public accordion!: any;
  public accordionData!: any;
  public videoToEdit!: any;
  public status!: string;
  public isCourse!: boolean;
  public indexOfGroup!: number;
  public videosData!: any;
  public video!: Video;
  public isVideo!: boolean;
  public videoId: string | null = null; // Nueva variable para el ID
  public playingVideoId!: number;
  public courseUrlSafe!: any;
  public videoUrlSafe!: any;




  /*Collapse de boostrap */

  isDescriptionCollapsed = true;
  isChatCollapsed = true;
  isContentCollapsed = true;


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





  constructor(private _userService: UserService,
    private _authService: AuthService,
    private _tokenService: TokenService,
    private _salesService: SalesService,
    public _videoService: VideoService,
    private _commentService: CommentsService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _sanitizer: DomSanitizer,
    private _courseService: CourseService,
    private _accordionService: AccordionService,
    private fb: FormBuilder,
    private _checkboxService: CheckboxService

  ) {
    this.checkbox = new Checkbox(1, 1, 1, 1);
    this.isCourse = true;
    this.token = this._authService.getToken();
    // console.log('token', this.token);

    this.identity = this._tokenService.getIdentity();
    this.identityString = JSON.parse(this.identity);
    console.log(this.identityString);
    this.isVideo = false;






  }

  ngOnInit(): void {
    this.getVideoByCourse();
    this.initializeForm();
    if (this.identityString.sub) {
      this.getCourseAndVideos().then(() => {
        this.getSales();
        this.getCheckboxes();
      });

    }





  }







  onUpdateVideo(videoForm: FormGroup) {
    this.video = {
      user_id: this.identityString.sub,
      course_id: this.course_id,
      title: videoForm.value.title,
      content: videoForm.value.content,
      url: videoForm.value.url,
      section: this.videoToEdit.section,
      id: Number(this.videoToEdit.id)
    }


    console.log('new video', this.video);


    this._videoService.updateVideo(this.video, this.token, this.video.id ? this.video.id : 0).subscribe((response: any) => {
      if (response && response.status == 'success') {


        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'El video se ha actualizado correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });

        this.getVideoByCourse();



      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FFD65A',
          color: '#E50046',
          class: 'text-danger',
          message: 'El video no se ha podido actualizar.',
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
        message: 'Error en la respuesta.',
        displayMode: 2,
        maxWidth: 350,
        icon: 'fa-sharp fa-solid fa-xmark',
        position: 'topRight'
      });
    })

  }
  isChecked(video_id: number, course_id: number): boolean {
    // console.log('video_id', video_id);
    // console.log('course_id', course_id);

    const foundCheckbox = this.userCheckbox.find(
      (checkbox: any) =>
        checkbox.course_id === course_id &&
        checkbox.user_id === this.identityString.sub &&
        checkbox.video_id === video_id && checkbox.checkbox === 1
    );

    return !!foundCheckbox; // Retorna true si encuentra un elemento, false si no

  }

  getCheckboxes() {
    this._checkboxService.getCheckboxes(this.token, this.course_id).subscribe((response: any) => {
      if (response && response.status == 'success') {
        this.userCheckbox = response.checkboxes;
        if (this.userCheckbox) {
          console.log('userCheckbox', this.userCheckbox);
          this._checkboxService.changeCurrentUserCheckbox(this.userCheckbox);

        }
      }
    })

  }


  onDeleteVideo(id: number) {
    this._videoService.deleteVideo(this.token, id).subscribe((response: any) => {
      if (response && response.status == 'success') {
        this.getVideoByCourse();


        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'El video se ha eliminado correctamente.',
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
          message: 'El video no se ha podido eliminar.',
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



  ngAfterViewInit(): void {

  }


  getSales() {
    this._salesService.getSales(this.token).subscribe(response => {
      if (response && response.status == 'success') {
        this.purchasedCourses = response.sales;
        console.log('purchasedCourses', this.purchasedCourses);
        if (this.purchasedCourses) {
          this.currentCourse = this.purchasedCourses.find((course: any) => course.course_id === this.course_id && course.user_id === this.identityString.sub);
          // console.log('progreso del curso actual', this.currentCourse?.progreso);
          this.courseProgress = this.currentCourse.progreso;

          console.log('progreso del curso actual', this.courseProgress);
          if (this.courseProgress !== undefined && this.courseProgress !== null) {
            this.updateChartData();
          }

        }


      } else {
        console.log('error');


      }
    }, error => {
      console.log(error);

    })
  }

  //Actualizar datos en el grafico dependiendo el servicio
  updateChartData() {
    console.log('Actualizando gráfico con progreso:', this.courseProgress); // 🔍 Este


    console.log('this.courseProgress en updateChartData', this.courseProgress);

    this.data = {
      // labels: ['Tareas Pendientes', 'Tareas Completadas', 'Tareas Expiradas'],
      datasets: [{
        data: [this.courseProgress - 100, this.courseProgress],
        backgroundColor: ['green', 'white'],
        borderColor: ['green']
        // hoverBackgroundColor: ['#7a92ff', '#7a92ff', '#7a92ff']
      }]
    };

    // console.log('Tareas recibidas en el gráfico', this.tareasCompletadas, this.tareasPendientes, this.tareasExpiradas);


    setTimeout(() => {
      if (this.chart) {
        // console.log('Destruyendo gráfico');
        this.chart.chart.destroy();
        this.chart.initChart();
        // console.log('Gráfico recreado con nuevos datos');
      }
    }, 0);

  }


  clickCheckBox(event: Event, video_id: number, course_id: number) {

    this.checkbox = ({
      user_id: this.identityString.sub,
      course_id: course_id,
      video_id: video_id
    })

    const isChecked = (event.target as HTMLInputElement).checked;
    console.log('Checkbox marcado:', isChecked);
    if (isChecked) {

      if (this.checkbox) {
        this.checkbox.checkbox = 1;
        this.checkbox.percentageXvideo = this.percentageXVideo;

        console.log('checkbox a enviar', this.checkbox);
        this._checkboxService.create(this.token, this.checkbox).subscribe(response => {
          if (response && response.status == 'success') {
            console.log('response', response);
            this.getCheckboxes();

            this._salesService.updateCheckbox(this.token, this.checkbox).subscribe(response => {
              if (response && response.status == 'success') {
                this._chartService.changeProgress(response.progress);
                console.log('progreso actualizado en el chartService', response.progress);
                this.getSales();

              }
            });



          } else {
            console.log('no se pudo guardar el checkbox');
          }
        })

      }
    } else {

      if (this.checkbox) {
        this.checkbox.checkbox = 0;
        this.checkbox.percentageXvideo = -this.percentageXVideo;

        console.log('checkbox a enviar', this.checkbox);
        this._checkboxService.update(this.token, this.checkbox).subscribe(response => {
          if (response && response.status == 'success') {
            console.log('response', response);
            this.getCheckboxes();
            this._salesService.updateCheckbox(this.token, this.checkbox).subscribe(response => {
              if (response && response.status == 'success') {

                console.log('nuevo progreso obtenido', response.progress);
                this.getSales();

              }
            });



          } else {
            console.log('no se pudo eliminar el checkbox');
          }
        }, error => {
          console.log(error);

        })

      }


    }
  }

  getVideoByCourse() {
    this._route.queryParams.subscribe(params => {
      this.course_id = +params['id']; //converitir a entero
      console.log('couse_id', this.course_id);

      this._videoService.getVideosByCourse(this.course_id).subscribe(response => {
        if (response && response.status == 'success') {
          this.videos = response.videos;
        } else {
          console.log('error');
          // this._router.navigate(['/home']);

        }
      })

    }, error => {
      console.log(error);

    })

  }


  getVideo(id: any) {

    this.playingVideoId = id;
    this._commentService.changeCurrentVideoPlayingId(this.playingVideoId)
    this._videoService.getVideo(id).subscribe(response => {
      console.log('response desde el videoService', response);
      if (response && response.status == 'success') {
        this.isVideo = true;
        this.isCourse = false;

        this.video = response.video;
        console.log('video cargado en course-detail', this.video);

        var results = this.video.url.match('[\\?&]v=([^&#]*)');
        var video = (results === null)
          ? this.video.url
          : results[1].trim();


        this.videoUrlSafe = this._sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${video}?controls=0`
        );


      } else {
        // this._router.navigate(['/home']);
      }

    })
  }


  initializeForm(): void {

    this.videoForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      url: ['', [Validators.required, Validators.pattern(/https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/)]],

    });
  }




  getCourseAndVideos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._route.queryParams.subscribe(params => {
        if (params['id']) {
          this.course_id = +params['id']; // Convertir a entero
          console.log('course_id', this.course_id);

          this._courseService.getCourse(this.course_id, this.token).subscribe(
            response => {
              console.log('response desde el método getCourse en el backend', response);

              if (response && response.code == 200) {
                this.course = response.course;
                if (this.course) {
                  console.log('course on course-detail component', this.course);
                  this.indexOfGroup = response.course.accordion;

                  console.log('accordion on course-detail component', this.indexOfGroup);

                  this._accordionService.getCourseSectionsData(this.course_id, this.token).subscribe(
                    response => {
                      if (response) {
                        this.accordionData = response.accordionData;
                        console.log('accordionData', this.accordionData);

                        this._videoService.getVideosByCourse(this.course_id).subscribe(
                          response => {
                            if (response) {
                              this.videosData = response.videos;
                              console.log('videos en videosData', this.videosData);

                              if (this.videosData) {
                                this.percentageXVideo = 100 / this.videosData.length;
                                console.log('porcentaje por video', this.percentageXVideo);

                              }

                              // Asegura que después de ? haya v=, luego agarra todos los caracteres excluyendo ^&#
                              var results = this.course.url.match('[\\?&]v=([^&#]*)');
                              this.videoId = results ? results[1].trim() : null;

                              // console.log("Extracted Video ID:", this.videoId);
                              // // this.course.url = String(video);




                              this.courseUrlSafe = this._sanitizer.bypassSecurityTrustResourceUrl(
                                `https://www.youtube.com/embed/${this.videoId}?controls=0`
                              );
                              resolve({
                                course: this.course,
                                accordionData: this.accordionData,
                                videosData: this.videosData
                              });
                            } else {
                              reject('Error en obtener videos');
                            }
                          },
                          error => {
                            console.error(error);
                            reject(error);
                          }
                        );
                      } else {
                        console.log('Error en obtener data desde accordionService');
                        reject('Error en obtener data desde accordionService');
                      }
                    },
                    error => {
                      console.log(error);
                      reject(error);
                    }
                  );
                }
              } else {
                console.log('Error en getCourse');
                reject('Error en getCourse');
              }
            },
            error => {
              this.status = error;
              console.log(error);
              reject(error);
            }
          );
        } else {
          reject('No se encontró el parámetro id');
        }
      });
    });
  }


  //Evita que se creen los elementos dentro del ng-container si video.section no pertenece a la section del accordion
  displayNone(section: number, num_of_section: number, index: number): string {
    return (section === num_of_section && num_of_section > index && index + 2 > num_of_section) ? '' : 'd-none';
  }


  getNumberArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  isCourseBought(courseId: number): boolean {
    //Para evitar error que lee una propiedad undefined
    if (!courseId || !this.identityString || !this.purchasedCourses) {
      return false;
    }
    return this.purchasedCourses.some((course: any) => course.course_id === courseId && course.user_id === this.identityString.sub);
  }

  onUpdateCurrentVideo(video: any) {

    this.videoToEdit = video; // Guardar el accordion seleccionado

    console.log('Nuevo video seleccionado', this.videoToEdit);


    // this.accordionForm.value.section_name = this.accordionToEdit.section_name;

    this.videoForm.patchValue({
      title: this.videoToEdit.title,
      content: this.videoToEdit.content,
      url: this.videoToEdit.url


    });



  }


  toggleDescription() {
    this.isDescriptionCollapsed = !this.isDescriptionCollapsed;
    this.isChatCollapsed = true;
    this.isContentCollapsed = true;
  }

  toggleChat() {
    this.isChatCollapsed = !this.isChatCollapsed;
    this.isDescriptionCollapsed = true;
    this.isContentCollapsed = true;
  }

  toggleContent() {
    this.isContentCollapsed = !this.isContentCollapsed;
    this.isDescriptionCollapsed = true;
    this.isChatCollapsed = true;
  }

}


