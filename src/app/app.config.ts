import { ApplicationConfig, CUSTOM_ELEMENTS_SCHEMA, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { CategoryService } from './services/category.service';
import { User } from './models/user';
import { AuthService } from './services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from './services/user.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FileSelectDirective, FileUploadModule } from 'ng2-file-upload';  // Importa el módulo
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { FileDropDirective } from 'ng2-file-upload';
import { CourseService } from './services/course.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CartService } from './services/cart.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SalesService } from './services/sales.service';
import { VideoService } from './services/video.service';
import { AccordionService } from './services/accordion.service';
import { NgbAccordionItem, NgbAccordionModule, NgbCollapseModule, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommentsService } from './services/comments.service';
import { RepliesService } from './services/replies.service';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { CheckboxService } from './services/checkbox.service';
import { ChartService } from './services/chart.service';





export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(), providePrimeNG({ theme: { preset: Aura } }), provideHttpClient(withFetch()),
  provideRouter(routes), provideCharts(withDefaultRegisterables()), CategoryService, AuthService, UserService, CourseService, ReactiveFormsModule, FileUploadModule, FileSelectDirective, FroalaViewModule, FroalaEditorModule,
    FileDropDirective, BrowserAnimationsModule, MatTooltipModule, CartService, CheckboxService, SalesService, CommentsService, RepliesService, VideoService, AccordionService, NgbAccordionModule, NgbModalModule, NgbModal, NgbAccordionItem, NgbCollapseModule, ChartService]
};
