import * as jwt from 'jsonwebtoken';
import { JsonDatabase } from '../json-data-source';
import { UserRole, } from '../utils/functions';
import { Entity, PrimaryGeneratedColumn, Column, Repository, DataSource, BeforeInsert } from "typeorm"
// import * as bcrypt from 'bcryptjs';
// import { response } from 'express';
import { notEmpty } from "../utils/functions";
import { AppDataSource } from '../data_source';

let Connection: DataSource = AppDataSource.manager.connection;

@Entity("user", {
    orderBy: {
        username: "ASC",
        id: "DESC"
    }
})
export class User {
    constructor() { };
    @PrimaryGeneratedColumn()
    id!: string

    @Column({ unique: true, type: 'varchar' })
    username!: string

    @Column({ nullable: true })
    fullname!: string

    @Column({ unique: true, type: 'varchar' })
    email!: string

    @Column({ type: 'varchar', nullable: false })
    password!: string

    @Column({ nullable: false, default: false })
    isActive!: boolean

    @Column({ type: 'simple-array', nullable: true })
    roles!: string[]

    @Column({ type: 'simple-array', nullable: true })
    groups!: string[]

    @Column({ type: 'simple-array', nullable: true })
    meeting_report!: string[]

    @Column({ type: 'varchar', nullable: true })
    expiresIn!: string

    @Column({ type: 'varchar', nullable: true })
    dhisusersession!: string

    @Column({ type: 'varchar', nullable: true })
    token!: string

    @Column({ type: 'varchar', nullable: true })
    defaultRedirectUrl!: string

}

export async function getUserRepository(): Promise<Repository<User>> {
   return Connection.getRepository(User);
}



// export class User {
// }

export function token(user: User) {
    return jwt.sign({ id: `${user.id}`, username: user.username, roles: user.roles, groups: user.groups, isActive: user.isActive }, jwSecretKey({ user: user }).secretOrPrivateKey, { expiresIn: `${jwSecretKey({ user: user }).expiredIn}s` });
}

export function jwSecretKey(data: { userId?: string, user?: User }): { expiredIn: string, secretOrPrivateKey: string } {
    var userIsChws: boolean = false;
    if (notEmpty(data.user)) {
        userIsChws = UserRole(data.user!).isChws;
    } else if (notEmpty(data.userId)) {
        const jData = (new JsonDatabase('users')).getBy(data.userId!) as User;
        if (notEmpty(jData)) userIsChws = UserRole(jData).isChws;
    }
    const second1 = 1000 * 60 * 60 * 24 * 366;
    const second2 = 1000 * 60 * 60 * 24 * 366;
    return {
        expiredIn: userIsChws ? `${second1}` : `${second2}`,
        secretOrPrivateKey: 'kossi-secretfortoken',
    }
}
