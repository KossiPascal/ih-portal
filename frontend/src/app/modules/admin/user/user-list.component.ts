import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@ih-app/services/auth.service';
import { Consts } from '@ih-app/shared/constantes';
import { notNull } from '@ih-app/shared/functions';
import { User } from '@ih-models/User';
import { Team } from '@ih-src/app/models/DataAggragate';
import { GetRolesIdsOrNames, Roles, UserRoles } from '@ih-src/app/models/Roles';
import { SyncService } from '@ih-src/app/services/sync.service';
// import usersDb from '@ih-databases/users.json'; 

declare var $: any;
declare var showToast: any;
@Component({
  selector: 'app-user',
  templateUrl: `./user-list.component.html`,
  styleUrls: [
    './user-list.component.css'
  ],

})
export class UserComponent implements OnInit {

  activeSave() {
    throw new Error('Method not implemented.');
  }
  users$: User[] = [];
  roles$: UserRoles[] = [];
  MeetingReport$: Team[] = [];

  userForm!: FormGroup;
  isLoginForm: boolean = false;
  isLoading: boolean = false;
  LoadingMsg: string = "Loading...";
  isEditMode: boolean = false;
  selectedUser!: User | null;
  message: string = '';

  APP_LOGO: string = Consts.APP_LOGO;
  selectedRole: string[] = [];
  selectedMR: string[] = [];

  constructor(private auth: AuthService, private sync: SyncService, private router: Router) {
  }

  public roles = new Roles(this.auth);


  ngOnInit(): void {
    this.getUsers();
    this.GetTeams();
    this.GetUserRoles();
    this.userForm = this.createFormGroup();
  }

  GetUserRoles() {
    this.auth.GetAllRoles().subscribe(async (_c$: { status: number, data: UserRoles[] | any }) => {
      if (_c$.status == 200) this.roles$ = _c$.data;
    }, (err: any) => { });
  }

  GetTeams() {
    this.sync.GetTeams().subscribe(async (_c$: { status: number, data: Team[] | string }) => {
      if (_c$.status == 200) {
        this.MeetingReport$ = (_c$.data as Team[]).sort((a, b) => a.name.localeCompare(b.name));
      }
    }, (err: any) => { });
  }

  getUsers() {
    this.auth.getAllUsers().subscribe((res: { status: number, data: any }) => {
      if (res.status === 200) {
        this.users$ = [];
        const userfound: User[] = res.data;
        for (let i = 0; i < userfound.length; i++) {
          const user = userfound[i];
          // delete user.password;
          this.users$.push(user)
        }
      } else {
        console.log(res.data);
      }
    }, (err: any) => { console.log(err.error) });
    // const user: User[] = Array.isArray(usersDb) ? usersDb : [];
  }

  EditUser(user: User) {
    this.isEditMode = true;
    this.userForm = this.createFormGroup(user);
    this.selectedRole = (GetRolesIdsOrNames(user.roles as UserRoles[], 'idsString') ?? []) as string[];
    this.selectedMR = user.meeting_report ?? [];
    this.UserSelected(user);
  }

  UserSelected(user: User) {
    this.selectedUser = user;
    this.message = '';
  }

  DeleteUser() {
    if (this.roles.canDeleteUser()) {
      this.isEditMode = false;
      if (this.selectedUser) this.auth.deleteUser(this.selectedUser).subscribe((res: { status: number, data: any }) => {
        if (res.status === 200) {
          this.showModalToast('success', 'Supprimé avec success');
          this.getUsers();
          this.selectedUser = null;
          this.selectedRole = [];
          this.selectedMR = [];
          this.isLoading = false;
          this.message = '';
        } else {
          this.message = res.data;
        }
      }, (err: any) => {
        this.message = err;
        this.isLoading = false;
      });
    }
  }

  CreateUser() {
    this.isEditMode = false;
    this.userForm = this.createFormGroup();
    this.selectedUser = null;
    this.selectedRole = [];
    this.selectedMR = [];
    this.message = '';
  }


  createFormGroup(user?: User): FormGroup {
    const formControls = {
      username: new FormControl(user != null ? user.username : '', [Validators.required, Validators.minLength(4)]),
      fullname: new FormControl(user != null ? user.fullname : ''),
      email: new FormControl(user != null ? user.email : ''),
      password: new FormControl('', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]),
      passwordConfirm: new FormControl('', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]),
      // roles: new FormControl(user != null ? user.roles : ''),
      // meeting_report: new FormControl(user != null ? user.meeting_report : ''),
      isActive: new FormControl(user != null ? user.isActive : false),
    };
    const validators = [this.MatchValidator('password', 'passwordConfirm')];
    if (this.isEditMode) formControls.username.disable();
    return new FormGroup(formControls, validators);
  }

  passwordMatchError() {
    return this.userForm.getError('password') && this.userForm.get('passwordConfirm')?.touched;
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

  ToStringNewLine(value: string[], type: 'roles' | 'meeting_report'): string {
    // var data:string [] = [];
    // if (type=='meeting_report') data = this.roles$;
    // if (data.length > 0) return (data.filter(r => value.includes(r)).map(r => r)).join('<br>');
    return `${value}`.toString().replace(/,/g, '<br>');
  }

  isSuperUser(roles: any): boolean {
    const rolesName = GetRolesIdsOrNames(roles as UserRoles[], 'names')
    return rolesName ? (rolesName as string[]).includes('super_admin') : false;
  }
  ShowRoles(user: User) {
    this.selectedRole = (GetRolesIdsOrNames(user.roles as UserRoles[], 'idsString') ?? []) as string[];
    this.selectedMR = user.meeting_report ?? [];
  }

  registerOrUpdate(): any {
    if (!this.auth.isLoggedIn()) {
      return;
    }
    var request: any;

    if (this.isEditMode) {
      if (this.selectedUser && this.roles.canUpdateUser()) {
        this.selectedUser.fullname = this.userForm.value.fullname;
        this.selectedUser.email = this.userForm.value.email;
        this.selectedUser.roles = this.selectedRole;
        this.selectedUser.meeting_report = this.selectedMR;
        this.selectedUser.isActive = this.userForm.value.isActive;

        const finalSelectedUser:any = this.selectedUser;
        if (notNull(this.userForm.value.password) && notNull(this.userForm.value.passwordConfirm)) {
          finalSelectedUser['password'] = this.userForm.value.password;
        }
        request = this.auth.updateUser(finalSelectedUser);
      }
    } else {
      if (this.roles.canCreateUser()) {
        delete this.userForm.value.passwordConfirm;
        this.userForm.value["roles"] = this.selectedRole;
        this.userForm.value["meeting_report"] = this.selectedMR;
        request = this.auth.register(this.userForm.value);
      }
    }

    if (request && this.roles.canCreateUser() || this.roles.canUpdateUser()) {
      return request.subscribe((res: { status: number, data: any }) => {
        if (res.status === 200) {
          this.message = 'Registed successfully !'
          this.closeModal();
          this.getUsers();
          const currentUser = this.auth.currentUser();
          const user: User = res.data as User;
          if (currentUser && user && currentUser.id == user.id) {
            this.auth.setUser(user);
          }
          this.selectedUser = null;
          this.selectedRole = [];
          this.selectedMR = [];
          this.message = '';
        } else {
          this.message = res.data;
        }
        this.isLoading = false;
      }, (err: any) => {
        this.isLoading = false;
      });
    }


  }

  containsRole(role: number): boolean {
    return this.selectedRole.includes(`${role}`);
  }

  AddOrRemoveRole(role: number) {
    const index = this.selectedRole.indexOf(`${role}`);
    if (index !== -1) {
      this.selectedRole.splice(index, 1);
    } else {
      this.selectedRole.push(`${role}`);
    }
  }

  SelectAllRoles() {
    if (this.selectedRole.length == this.roles$.length) {
      this.selectedRole = [];
    } else {
      this.selectedRole = this.roles$
        .filter(role => notNull(role?.id))
        .map(role => role?.id ? `${role?.id}` : '');
    }
  }

  containsMR(mr: number | undefined): boolean {
    return mr ? this.selectedMR.includes(`${mr}`) : false;
  }

  SelectAllMRs() {
    if (this.selectedMR.length == this.MeetingReport$.length) {
      this.selectedMR = [];
    } else {
      this.selectedMR = this.MeetingReport$
        .filter(mr => notNull(mr?.id))
        .map(mr => mr?.id ? `${mr?.id}` : '');
    }
  }

  AddOrRemoveMR(mr: number | undefined) {
    if (mr) {
      const index = this.selectedMR.indexOf(`${mr}`);
      if (index !== -1) {
        this.selectedMR.splice(index, 1);
      } else {
        this.selectedMR.push(`${mr}`);
      }
    }
  }
}