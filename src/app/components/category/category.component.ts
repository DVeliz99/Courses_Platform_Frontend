import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';
import { TokenService } from '../../signals/token.service';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-category',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition('void <=> *', [
        animate(500)
      ])
    ])
  ]
})
export class CategoryComponent implements OnInit {

  public identity!: any;
  public status!: string;
  public categories: { id: number; name: string, deleted_at: Date, created_at: Date, updated_at: Date }[] = [];
  public identityString!: any;
  public category: Category;
  public category_id!: number;
  public isEditing = false;
  public categoryForm: FormGroup = new FormGroup({});
  public isCategoryActioned = false;
  public token: any;
  public categoryToEdit: any = null;


  constructor(private _tokenService: TokenService,
    private _categoryService: CategoryService,
    private fb: FormBuilder, private _authService: AuthService,
    private _route: ActivatedRoute
  ) {
    this.identity = this._tokenService.getIdentity();
    this.identityString = JSON.parse(this.identity); //parseo de identity 
    this.token = this._authService.getToken();
    console.log('log del token', this.token);




    this.category = new Category('');
  }

  ngOnInit(): void {
    this.getCategories();
    this.initializeForm();


  }

  initializeForm(): void {

    this.categoryForm = this.fb.group({
      id: [''],
      category: ['', [Validators.required]]

    });
  }


  getCategories(): Promise<any> { //Devolver una promesa para asegurar que los datos esten listos antes de ejecutar getCourse
    return new Promise((resolve, reject) => {
      this._categoryService.getCategories().subscribe(
        response => {
          if (response && response.status === 'success') {
            this.categories = response.categories;
            this._categoryService.changeCategories(this.categories);
            console.log('Data enviada al CategoryService');

            resolve(this.categories); // resolver la promesa con las categorías
          } else {
            reject('Error al obtener categorías');
          }
        },
        error => reject(error)
      );
    });
  }

  onCreate(categoryForm: FormGroup) {

    this.category = {
      name: categoryForm.value.category

    };

    this._categoryService.createCategory(this.token, this.category).subscribe(response => {
      if (response && response.status == 'success') {

        this.status = response.status;

        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'La categoría se ha creado correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });

        this.getCategories();


      } else {
        this.status = response.status;

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

  startCreatingCategory() {
    this.isCategoryActioned = true;


  }


  onUpdateCategory(categoryForm: FormGroup) {

    console.log(' data en this.category', this.category);

    this.category = {
      id: categoryForm.value.id,
      name: categoryForm.value.category
    }


    console.log('this.category despues de accionar el formulario', this.category);




    this._categoryService.updateCategory(this.token, this.category, this.category.id).subscribe(response => {
      if (response && response.status == 'success') {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'La categoría se ha actualizado correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });
        this.getCategories();


      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FFD65A',
          color: '#E50046',
          class: 'text-danger',
          message: 'la categoría no se ha podido actualizar.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-sharp fa-solid fa-xmark',
          position: 'topRight'
        });

      }
    })

  }


  onUpdateForm(category: any) {

    this.categoryToEdit = category; // Guardar la categoría seleccionada
    this.categoryForm.patchValue({
      id: category.id,   // Se asegura de que el ID correcto se establezca en el formulario
      category: category.name
    });

    this.category = {
      id: Number(this.categoryForm.value.id),
      name: this.categoryForm.value.category
    }

    console.log('Nueva data en this.category', this.category);



  }





  deleteCategory(id: number) {
    this._categoryService.deleteCategory(this.token, id).subscribe(response => {

      console.log('response', response);

      if (response && response.status == 'success') {

        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#FFF',
          color: '#1DC74C',
          class: 'text-success',
          message: 'La categoría se ha eliminado correctamente.',
          displayMode: 2,
          maxWidth: 350,
          icon: 'fa-solid fa-square-check',
          position: 'topRight'
        });

        this.getCategories();
      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FFD65A',
          color: '#E50046',
          class: 'text-danger',
          message: 'la categoría no se ha podido eliminar.',
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





}
