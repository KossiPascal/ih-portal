import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@ih-app/services/auth.service';
import { Consts } from '@ih-app/shared/constantes';
import { notNull } from '@ih-app/shared/functions';
import { ApiTokenAccess } from '@ih-src/app/models/Sync';
import { SyncService } from '@ih-src/app/services/sync.service';

declare var $: any;
declare var showToast: any;
@Component({
  selector: 'user-api',
  templateUrl: `./api-list.component.html`,

})
export class ApiComponent implements OnInit {

  apis$: ApiTokenAccess[] = [];
  apiForm!: FormGroup;
  isLoading: boolean = false;
  LoadingMsg: string = "Loading...";
  isEditMode: boolean = false;
  selectedApi!: ApiTokenAccess | null;
  message: string = '';
  APP_LOGO: string = Consts.APP_LOGO;

  tokenLenght:number = 0;
  defaultTokenLenght:number = 30;

  constructor(private auth: AuthService, private sync: SyncService, private router: Router) {
  }

  ngOnInit(): void {
    this.GetApis();
    this.apiForm = this.createFormGroup();
  }

  generateTokenLenght(event:Event){
    const inputElement = event.target as HTMLInputElement;
    if(inputElement){
      this.tokenLenght = (inputElement.value ?? '').length
    }
  }

  GetApis() {
    this.auth.ApiTokenAccessAction({ action: 'list' }).subscribe(async (_c$: { status: number, data: ApiTokenAccess[] }) => {
      if (_c$.status == 200) this.apis$ = _c$.data;
    }, (err: any) => { });
  }

  EditApi(role: ApiTokenAccess) {
    this.isEditMode = true;
    this.apiForm = this.createFormGroup(role);
    this.ApiSelected(role);
  }

  ApiSelected(role: ApiTokenAccess) {
    this.selectedApi = role;
    this.message = '';
  }

  DeleteApi() {
    this.isEditMode = false;
    if (this.selectedApi) this.auth.ApiTokenAccessAction({ action: 'list', id: this.selectedApi.id }).subscribe((res: { status: number, data: any }) => {
      if (res.status === 200) {
        this.showModalToast('success', 'Supprimé avec success')
        this.GetApis();
        this.selectedApi = null;
        this.isLoading = false;
        this.message = '';
      } else {
        this.message = res.data;
      }
      console.log(this.message);
    }, (err: any) => {
      this.message = err;
      this.isLoading = false;
      console.log(this.message);
    });
  }

  CreateApi() {
    this.isEditMode = false;
    this.apiForm = this.createFormGroup();
    this.selectedApi = null;
    this.message = '';
  }

  createFormGroup(api?: ApiTokenAccess): FormGroup {
    const formControls = {
      token: new FormControl(api != null ? api.token : '', [Validators.required, Validators.minLength(this.defaultTokenLenght), Validators.maxLength(this.defaultTokenLenght)]),
      isActive: new FormControl(api != null ? api.isActive : false),
    };
    return new FormGroup(formControls);
  }


  showModalToast(icon: string, title: string) {
    showToast(icon, title);
    this.closeModal('close-delete-modal');
  }

  closeModal(btnId: string = 'close-modal') {
    $('#' + btnId).trigger('click');
  }


  CreateOrUpdateApi(): any {
    var request: any;
    if (this.isEditMode) {
      if (this.selectedApi) {
        request = this.auth.ApiTokenAccessAction({ action: 'update', id: this.selectedApi.id, token: this.apiForm.value.token, isActive: this.apiForm.value.isActive });
      }
    } else {
      request = this.auth.ApiTokenAccessAction({ action: 'create', token: this.apiForm.value.token, isActive: this.apiForm.value.isActive });
    }

    if (request) {
      return request.subscribe((res: { status: number, data: any }) => {
        if (res.status === 200) {
          this.message = 'Registed successfully !'
          this.closeModal();
          this.GetApis();
          this.selectedApi = null;
          this.message = '';
        } else {
          this.message = res.data;
        }
        console.log(this.message);
        this.isLoading = false;
      }, (err: any) => {
        this.isLoading = false;
      });
    }
  }

}