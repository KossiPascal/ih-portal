import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@ih-app/services/auth.service';
import { AppStorageService } from '@ih-app/services/cookie.service';
import { Consts } from '@ih-app/shared/constantes';
import { Functions, notNull } from '@ih-app/shared/functions';
import { Roles, UserGroupsAsArray, UserRole, UserRolesAsArray } from '@ih-app/shared/roles';
import { User } from '@ih-models/User';
import { Team } from '@ih-src/app/models/DataAggragate';
import { SyncService } from '@ih-src/app/services/sync.service';
// import usersDb from '@ih-databases/users.json'; 

declare var $: any;
declare var showToast: any;
@Component({
  selector: 'app-user',
  templateUrl: `./user-list.component.html`,

})
export class UserComponent implements OnInit {
  activeSave() {
    throw new Error('Method not implemented.');
  }
  users$: User[] = [];

  roles$: { id: string, name: string }[] = UserRolesAsArray();
  groups$: { id: string, name: string }[] = UserGroupsAsArray();
  MeetingReport$!: Team[];

  userForm!: FormGroup;
  isLoginForm: boolean = false;
  isLoading: boolean = false;
  LoadingMsg: string = "Loading...";
  isEditMode: boolean = false;
  selectedUser!:User|null;
  message: string = '';

  APP_LOGO: string = Consts.APP_LOGO;

  constructor(private store: AppStorageService, private auth: AuthService, private sync: SyncService, private router: Router) { 
    if(!this.roles.isSuperUser()) location.href = this.auth.userValue()?.defaultRedirectUrl??'';
  }
  
  private roles = new Roles(this.store);
  
  ngOnInit(): void {
    this.getUsers();
    this.GetTeams();
    this.userForm = this.createFormGroup();
  }

  GetTeams() {
    this.sync.GetTeams().subscribe(async (_c$: { status: number, data: Team[] | string }) => {
      if (_c$.status == 200) {
        this.MeetingReport$ = (_c$.data as Team[]).sort((a, b) => a.name.localeCompare(b.name));
      }
    }, (err: any) => { });
  }

  getUsers() {
    this.auth.getAllUsers().subscribe((res: {status:number, data:any}) => {
      if (res.status === 200){
        this.users$ = [];
        const userfound:User[] = res.data;
        for (let i = 0; i < userfound.length; i++) {
          const user = userfound[i];
          user.isSuperAdmin = user.roles.includes(UserRole().SuperUser.id);
          // delete user.password;
          this.users$.push(user)
        }
      } else {
        console.log(res.data);
      }
    }, (err: any) => { console.log(err.error) });
    // const user: User[] = Array.isArray(usersDb) ? usersDb : [];
  }

  EditUser(user:User) {
    this.isEditMode = true;
    user.roles = (user.roles.toString().replace('[','').replace(']','')).split(',');
    user.groups = (user.groups.toString().replace('[','').replace(']','')).split(',')
    this.userForm = this.createFormGroup(user);
    this.UserSelected(user);
  }

  UserSelected(user:User){
    this.selectedUser = user;
  }
 
  DeleteUser() {
    this.isEditMode = false;
    if (this.selectedUser) this.auth.deleteUser(this.selectedUser).subscribe((res: {status:number, data:any}) => {
      if (res.status === 200) {
        this.showModalToast('success','Supprimé avec success')
        console.log(`successfully deleted!`);
        this.getUsers();
        this.selectedUser = null;
        this.isLoading = false;
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

  CreateUser() {
    this.isEditMode = false;
    this.userForm = this.createFormGroup();
    this.selectedUser = null;
  }

  createFormGroup(user?: User): FormGroup {
    return new FormGroup({
      username: new FormControl(user != null ? user.username : '', [Validators.required, Validators.minLength(4)]),
      fullname: new FormControl(user != null ? user.fullname : '', [Validators.required, Validators.minLength(4)]),
      // email: new FormControl(user != null ? user.email : '', [Validators.required, Validators.email]),
      // password: new FormControl('', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]),
      // passwordConfirm: new FormControl('', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]),
      roles: new FormControl(user != null ? user.roles : '', [Validators.required, Validators.minLength(1)]),
      groups: new FormControl(user != null ? user.groups : '', [Validators.required, Validators.minLength(1)]),
      meeting_report: new FormControl(user != null ? user.meeting_report : '', [Validators.required, Validators.minLength(1)]),
      isActive: new FormControl(user != null ? user.isActive : false),
      // isSuperAdmin: new FormControl(user != null ? user.isSuperAdmin : false)
      
    }, [this.MatchValidator('password', 'passwordConfirm')]);
  }
  passwordMatchError() {
    return this.userForm.getError('password') && this.userForm.get('passwordConfirm')?.touched;
  }

  showModalToast(icon:string, title:string){
    showToast(icon, title);
    this.closeModal('close-delete-modal');
  }

  closeModal(btnId:string = 'close-modal'){
    $('#'+btnId).trigger('click');
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


  register(): any {
    if (this.auth.isLoggedIn()) {

      var request:any;

      if (this.isEditMode) {
        if (this.selectedUser) {
          this.selectedUser.groups = this.userForm.value['groups']
          this.selectedUser.roles = this.userForm.value['roles']
          this.selectedUser.meeting_report = this.userForm.value['meeting_report']
          // const editPassword: boolean = notNull(this.userForm.value.password) && notNull(this.userForm.value.passwordConfirm);
          // this.userForm.value['editPassword'] = editPassword;
          // this.userForm.value['id'] = this.selectedUser!.id;
          request = this.auth.updateUser(this.selectedUser);
        }
      } else {
        request = this.auth.register(this.userForm.value);
      }

      if (request) {
        return request.subscribe((res: {status:number, data:any}) => {
          if (res.status === 200) {
            this.message = 'Registed successfully !'
            // this.message = 'Registed successfully !'
            this.closeModal();
            console.log(`successfully !`);
            this.getUsers();
          } else {
            this.message = res.data;
          }
          console.log(this.message);   
          this.isLoading = false;
        }, (err: any) => {
          // this.message = err.error;
          this.isLoading = false;
          // console.log(this.message);
        });
      }

      
    } else {
      this.auth.logout();
    }
  }

}