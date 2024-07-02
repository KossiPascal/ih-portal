import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@ih-app/services/auth.service';
import { Consts } from '@ih-app/shared/constantes';
import { notNull } from '@ih-app/shared/functions';
import { UserRoles, Roles } from '@ih-src/app/models/Roles';
import { SyncService } from '@ih-src/app/services/sync.service';

declare var $: any;
declare var showToast: any;
@Component({
  selector: 'user-role',
  templateUrl: `./role-list.component.html`,

})
export class RoleComponent implements OnInit {
  activeSave() {
    throw new Error('Method not implemented.');
  }
  roles$: UserRoles[] = [];
  pages$: string[] = [];
  actions$: string[] = [];

  roleForm!: FormGroup;
  isLoading: boolean = false;
  LoadingMsg: string = "Loading...";
  isEditMode: boolean = false;
  selectedRole!: UserRoles | null;
  message: string = '';

  APP_LOGO: string = Consts.APP_LOGO;

  selectedPage: string[] = [];
  selectedAction: string[] = [];

  constructor(private auth: AuthService, private sync: SyncService, private router: Router) {
  }

  ngOnInit(): void {
    this.GetRoles();
    this.GetUserActions();
    this.GetUserPages();
    this.roleForm = this.createFormGroup();
  }

  GetRoles() {
    this.auth.GetAllRoles().subscribe(async (_c$: { status: number, data: UserRoles[] }) => {
      if (_c$.status == 200) this.roles$ = _c$.data;
    }, (err: any) => { });
  }

  GetUserActions() {
    this.auth.UserActionsList().subscribe(async (_c$: { status: number, data: string[] }) => {
      if (_c$.status == 200) this.actions$ = _c$.data;
    }, (err: any) => { });
  }

  GetUserPages() {
    this.auth.UserPagesList().subscribe(async (_c$: { status: number, data: string[] }) => {
      if (_c$.status == 200) this.pages$ = _c$.data;
    }, (err: any) => { });
  }

  EditRole(role: UserRoles) {
    this.isEditMode = true;
    this.selectedPage = role.pages ?? [];
    this.selectedAction = role.actions ?? [];
    this.roleForm = this.createFormGroup(role);
    this.RoleSelected(role);
  }

  RoleSelected(role: UserRoles) {
    this.selectedRole = role;
    this.message = '';
  }

  DeleteRole() {
    this.isEditMode = false;
    if (this.selectedRole) this.auth.DeleteRole(this.selectedRole).subscribe((res: { status: number, data: any }) => {
      if (res.status === 200) {
        this.showModalToast('success', 'Supprimé avec success')
        console.log(`successfully deleted!`);
        this.GetRoles();
        this.selectedRole = null;
        this.selectedPage = [];
        this.selectedAction = [];
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

  CreateRole() {
    this.isEditMode = false;
    this.roleForm = this.createFormGroup();
    this.selectedRole = null;
    this.selectedPage = [];
    this.selectedAction = [];
    this.message = '';
  }

  containsPage(page: string): boolean {
    return this.selectedPage.includes(page);
  }

  containsAction(action: string): boolean {
    return this.selectedAction.includes(action);
  }

  AddOrRemovePage(page: string) {
    const index = this.selectedPage.indexOf(page);
    if (index !== -1) {
      this.selectedPage.splice(index, 1);
    } else {
      this.selectedPage.push(page);
    }
  }

  SelectAllPages() {
    if (this.selectedPage.length == this.pages$.length) {
      this.selectedPage = [];
    } else {
      this.selectedPage = this.pages$;
    }
  }

  SelectAllActions() {
    if (this.selectedAction.length == this.actions$.length) {
      this.selectedAction = [];
    } else {
      this.selectedAction = this.actions$;
    }
  }

  AddOrRemoveAction(action: string) {
    const index = this.selectedAction.indexOf(action);
    if (index !== -1) {
      this.selectedAction.splice(index, 1);
    } else {
      this.selectedAction.push(action);
    }
  }
  createFormGroup(role?: UserRoles): FormGroup {
    const formControls = {
      name: new FormControl(role != null ? role.name : '', [Validators.required, Validators.minLength(4)]),
      // pages: new FormControl(role != null ? role.pages : ''),
      // actions: new FormControl(role != null ? role.actions : ''),
      default_page: new FormControl(role != null ? role.default_page : ''),
    };
    if (this.isEditMode) formControls.name.disable();
    return new FormGroup(formControls);
  }

  passwordMatchError() {
    return this.roleForm.getError('password') && this.roleForm.get('passwordConfirm')?.touched;
  }

  showModalToast(icon: string, title: string) {
    showToast(icon, title);
    this.closeModal('close-delete-modal');
  }

  closeModal(btnId: string = 'close-modal') {
    $('#' + btnId).trigger('click');
  }

  MatchValidator(source: string, target: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      const targetCtrl = control.get(target);

      if (sourceCtrl && targetCtrl) {
        if (sourceCtrl.value !== targetCtrl.value) {
          return { mismatch: true };
        }
        if (this.isEditMode) {
          if (notNull(sourceCtrl.value) && sourceCtrl.value.length < 8 || notNull(targetCtrl.value) && targetCtrl.value.length < 8) {
            return { mismatch: true };
          }
        }
      }
      return null;
    };
  }

  ToStringNewLine(value: string[] | null, type: 'pages' | 'actions'): string {
    return value != null ? `${value}`.toString().replace(/,/g, '<br>') : '';
  }


  CreateOrUpdateRole(): any {
    var request: any;
    if (this.isEditMode) {
      if (this.selectedRole) {
        // this.selectedRole.name = this.roleForm.value.name;
        this.selectedRole.default_page = this.roleForm.value.default_page;
        this.selectedRole.pages = this.selectedPage;//this.roleForm.value.pages;
        this.selectedRole.actions = this.selectedAction;//this.roleForm.value.actions;
        request = this.auth.UpdateRole(this.selectedRole);
      }
    } else {
      this.roleForm.value.pages = this.selectedPage;
      this.roleForm.value.actions = this.selectedAction;
      request = this.auth.CreateRole(this.roleForm.value);
    }

    if (request) {
      return request.subscribe((res: { status: number, data: any }) => {
        if (res.status === 200) {
          this.message = 'Registed successfully !'
          this.closeModal();
          this.GetRoles();
          this.selectedRole = null;
          this.selectedPage = [];
          this.selectedAction = [];
          this.message = '';
          // const currentUser = this.auth.currentUser();
          // const user: User = res.data as User;
          // if (currentUser && user && currentUser.id == user.id) {
          //  this.auth.setUser(res.data as User);
          // }

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