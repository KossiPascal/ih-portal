import * as jwt from 'jsonwebtoken';
import { JsonDatabase } from '../json-data-source';
import { isChws, notEmpty } from '../utils/functions';

export class User {
    id!: string;
    username!: string;
    fullname!: string;
    roles!: string[];
    groups!: string[];
    isActive!: boolean;
    expiresIn?: any;
    dhisusersession?: any;
    defaultRedirectUrl!:string;
    token!:string;
}


export function toMap(user: User){
    return {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        roles: user.roles,
        groups: user.groups,
        isActive: user.isActive,
        expiresIn: user.expiresIn,
        token:token(user),
        dhisusersession: user.dhisusersession,
        defaultRedirectUrl: user.defaultRedirectUrl
    }
}


export function token(user: User) {
    return jwt.sign({ id: `${user.id}`, username: user.username, roles: user.roles, groups: user.groups, isActive: user.isActive }, jwSecretKey({user:user}).secretOrPrivateKey, { expiresIn: `${jwSecretKey({user:user}).expiredIn}s` });
}


export function jwSecretKey(data:{userId?:string, user?:User}): { expiredIn: string, secretOrPrivateKey: string } {
    var userIsChws:boolean = false;
    if (notEmpty(data.user)) {
        userIsChws = isChws(data.user!);
    } else if (notEmpty(data.userId)) {
        const _repoUser = new JsonDatabase('users');
        const jData = _repoUser.getBy(data.userId!) as User;
        if (notEmpty(jData)) {
            userIsChws = isChws(jData);
        }
    }

    const second1 = 1000 * 60 * 60 * 24 * 366;
    const second2 = 1000 * 60 * 60 * 24 * 366;
    return {
        expiredIn: userIsChws ? `${second1}` : `${second2}`,
        secretOrPrivateKey: 'kossi-secretfortoken',
    }
}








// import { Entity, PrimaryGeneratedColumn, Column,Repository, DataSource, BeforeInsert } from "typeorm"
// import { AppDataSource } from "../data-source"
// import * as bcrypt from 'bcryptjs';
// import { response } from 'express';
// import { Utils } from "../utils/utils";
// import { token, notEmpty } from "../utils/functions";



// @Entity("user", {
//   orderBy: {
//       username: "ASC",
//       id: "DESC"
//   }
// })
// export class User {
//     constructor(){};
//     @PrimaryGeneratedColumn()
//     id!: string

//     @Column({unique: true,type: 'varchar'})
//     username!: string

//     @Column({ nullable: true })
//     fullname!: string

//     @Column({unique: true,type: 'varchar'})
//     email!: string

//     @Column()
//     password!: string

//     @Column({ nullable: false, default:'[]' })
//     roles!: string

//     @Column({ nullable: false, default: false })
//     isActive!: boolean

//     @Column({ nullable: false, default: false })
//     isSuperAdmin!: boolean

//     // @Column('json', { nullable: true })
//     // roles!: object

//     // @BeforeInsert()
//     async hashPassword(newPassword?:string): Promise<string> {
//       // this.password = await bcrypt.hash(this.password, 12);
//       return await bcrypt.hash(newPassword??this.password, 12);
//     }
//     toResponseObject(showToken:boolean = true) {
//       const { id, username,token } = this;
  
//       const responseObject =  { id, username,token };
//       if(showToken)responseObject.token = token
//       return responseObject;
//     }
      
//     async comparePassword(attempt: string) {
//       return await bcrypt.compare(attempt, this.password);
//     }
  
//     token() {
//       return token({id:this.id, name:this.username, role:this.roles, isActive:this.isActive});
//     }


// }

// let connection:DataSource;

// export async function getUserRepository(): Promise<Repository<User>> {
//   if (connection===undefined) connection =  AppDataSource.manager.connection;
//   return connection.getRepository(User);
// }

// export function toMap(data:any):User{
//       const user = new User();
//       // user.id = data.id??'';
//       user.username = data.username??'';
//       user.fullname = data.fullname??'';
//       user.email = data.email??'';
//       user.password = data.password??'';
//       user.roles = notEmpty(data.roles)?`[${data.roles}]`:'[]';
//       user.isActive = data.isActive??false;
//       user.isSuperAdmin = data.isSuperAdmin??false;
//     return user;
// }

