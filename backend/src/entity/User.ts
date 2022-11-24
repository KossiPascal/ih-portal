import { Entity, PrimaryGeneratedColumn, Column,Repository, DataSource, BeforeInsert } from "typeorm"
import { AppDataSource } from "../data-source"
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { response } from 'express';
import { Config } from "../utils/config";

// https://dev.to/brunoblaise/postgresql-how-to-add-array-data-type-and-quiz-api-in-nodejs-1kel


@Entity()
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

    @Column({ nullable: true })
    roles!: string

    // @Column('json', { nullable: true })
    // roles!: object

    @BeforeInsert()
    async hashPassword() {
      this.password = await bcrypt.hash(this.password, 12);
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
      return jwt.sign({ username: this.username, userId: this.id}, Config().secretOrPrivateKey, { expiresIn: `${Config().expiredIn}s` });
    }


}

let connection:DataSource;

export async function getUserRepository(): Promise<Repository<User>> {
  if (connection===undefined) {
    connection =  AppDataSource.manager.connection;
  }
  return connection.getRepository(User);
}

export function toMap(data:any):User{
      const user = new User();
      // user.id = data.id??'';
      user.username = data.username??'';
      user.fullname = data.fullname??'';
      user.email = data.email??'';
      user.password = data.password??'';
      user.roles = data.roles??[]
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
