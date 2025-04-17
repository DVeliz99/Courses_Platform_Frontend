import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NgModule } from '@angular/core';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { AuthGuard } from './services/auth.guard';
import { NewCourseComponent } from './components/new-course/new-course.component';
import { Category } from './models/category';
import { CategoryComponent } from './components/category/category.component';
import { CartComponent } from './components/cart/cart.component';
import { NewVideoComponent } from './components/new-video/new-video.component';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';
import { AccordionComponent } from './components/accordion/accordion.component';
import { MylearningComponent } from './components/mylearning/mylearning.component';




export const routes: Routes = [
  { path: '', component: HomeComponent }, //Pagina de inicio
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, //Pagina de inicio
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegisterComponent },
  { path: 'settings', component: UserEditComponent, canActivate: [AuthGuard] },
  { path: 'new_course', component: NewCourseComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: CategoryComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'video', component: NewVideoComponent, canActivate: [AuthGuard] },
  { path: 'course_detail', component: CourseDetailComponent, canActivate: [AuthGuard] },
  { path: 'sections', component: AccordionComponent, canActivate: [AuthGuard] },
  { path: 'mylearning', component: MylearningComponent, canActivate: [AuthGuard] },

  // Rutas comodín en caso de que la ruta no exista
  { path: '**', redirectTo: '', pathMatch: 'full' },  // Ruta de fallback
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], //para redigir usando elementos html
  exports: [RouterModule]
})

export class AppRoutingModule { }



//
//Cargar el array de rutas

// export const routing: ModuleWithProviders<any> = RouterModule.forRoot(routes); //objeto que tiene todas las rutas 
