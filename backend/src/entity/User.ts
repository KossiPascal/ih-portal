import { Entity, PrimaryGeneratedColumn, Column,Repository, DataSource, BeforeInsert } from "typeorm"
import { AppDataSource } from "../data-source"
import * as bcrypt from 'bcryptjs';
import { response } from 'express';
import { Utils } from "../utils/utils";
import { genarateToken, isNotNull } from "../utils/functions";

// https://dev.to/brunoblaise/postgresql-how-to-add-array-data-type-and-quiz-api-in-nodejs-1kel


@Entity("user", {
  orderBy: {
      username: "ASC",
      id: "DESC"
  }
})
export class User {
    constructor(){};
    @PrimaryGeneratedColumn()
    id!: string

    @Column({unique: true,type: 'varchar'})
    username!: string

    @Column({ nullable: true })
    fullname!: string

    @Column({unique: true,type: 'varchar'})
    email!: string

    @Column()
    password!: string

    @Column({ nullable: false, default:'[]' })
    roles!: string

    @Column({ nullable: false, default: false })
    isActive!: boolean

    @Column({ nullable: false, default: false })
    isSuperAdmin!: boolean

    // @Column('json', { nullable: true })
    // roles!: object

    // @BeforeInsert()
    async hashPassword(newPassword?:string): Promise<string> {
      // this.password = await bcrypt.hash(this.password, 12);
      return await bcrypt.hash(newPassword??this.password, 12);
    }
    toResponseObject(showToken:boolean = true) {
      const { id, username,token } = this;
  
      const responseObject =  { id, username,token };
      if(showToken)responseObject.token = token
      return responseObject;
    }
      
    async comparePassword(attempt: string) {
      return await bcrypt.compare(attempt, this.password);
    }
  
    token() {
      return genarateToken({id:this.id, name:this.username, role:this.roles, isActive:this.isActive});
    }


}

let connection:DataSource;

export async function getUserRepository(): Promise<Repository<User>> {
  if (connection===undefined) connection =  AppDataSource.manager.connection;
  return connection.getRepository(User);
}

export function toMap(data:any):User{
      const user = new User();
      // user.id = data.id??'';
      user.username = data.username??'';
      user.fullname = data.fullname??'';
      user.email = data.email??'';
      user.password = data.password??'';
      user.roles = isNotNull(data.roles)?`[${data.roles}]`:'[]';
      user.isActive = data.isActive??false;
      user.isSuperAdmin = data.isSuperAdmin??false;
    return user;
}










// //utilizzo Entity da typeorm e creo la tabella User Entity('User)
// @Entity('user')
// export class UserEntity {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @CreateDateColumn()
//   created: Date;

//   @Column({
//     type: 'text',
//     
//   })
//   username: string;

//   @Column('text')
//   password: string;
// }
