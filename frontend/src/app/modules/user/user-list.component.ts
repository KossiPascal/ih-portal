import { Component, OnInit } from '@angular/core';
import { AuthService } from '@ih-app/services/auth.service';
import { User } from '@ih-models/User';
// import usersDb from '@ih-databases/users.json'; 

@Component({
  selector: 'app-user',
  templateUrl: `./user-list.component.html`,

}) 
export class UserComponent implements OnInit {
  users$!: User[];

  constructor(private authService:AuthService) { 
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

}