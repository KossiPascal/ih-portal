import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@ih-app/services/auth.service';
import { Functions } from '@ih-app/shared/functions';
import { User } from '@ih-models/User';
// import usersDb from '@ih-databases/users.json'; 

@Component({
  selector: 'app-user',
  templateUrl: `./user-list.component.html`,

}) 
export class UserComponent implements OnInit {
activeSave() {
throw new Error('Method not implemented.');
}
  users$!: User[];

  roles$:string[] = [
    'super_admin',
    'can_manage_user',
    'admin',
    'super_admin'
  ]

  constructor(private authService:AuthService, private router: Router) { 
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
      this.authService.getAllUsers().subscribe((userfound:User[]) => {
        this.users$ = userfound;
      }, (err: any) => { console.log(err.error) });
      // const user: User[] = Array.isArray(usersDb) ? usersDb : [];
  }

  EditUser(){

  }
  
  DeleteUser(){
    
  }

  CreateUser() {
    Functions.saveCurrentUrl(this.router);
    location.href = 'auths/register';
  }

}