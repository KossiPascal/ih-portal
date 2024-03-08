import * as jwt from 'jsonwebtoken';
import { Entity, Column, Repository, DataSource, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm"
import { AppDataSource } from '../data_source';
import { Roles, GetRolesAndNamesPagesActionsList } from './Roles';
import { notEmpty } from '../utils/functions';

let Connection: DataSource = AppDataSource.manager.connection;

@Entity("user", {
    orderBy: {
        username: "ASC",
        id: "DESC"
    }
})
export class User {
    constructor() { };
    // @PrimaryGeneratedColumn()
    // id!: string
    
    @PrimaryColumn({ type: 'varchar', nullable: false })
    id!: string

    @Column({ unique: true, type: 'varchar', nullable: false })
    username!: string

    @Column({ nullable: true })
    fullname!: string

    @Column({ type: 'varchar', nullable: true })
    email!: string

    @Column({ type: 'text', nullable: true })
    password!: string

    @Column({ type: 'text', nullable: true })
    salt!: string

    // @ManyToOne(() => Roles, role => role.id, { eager: true, nullable: true })
    // @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    // role!:Roles

    @Column({ type: 'simple-array', nullable: true })
    roles!: string[] | Roles[]

    @Column({ type: 'simple-array', nullable: true })
    meeting_report!: string[]

    @Column({ type: 'varchar', nullable: true })
    expiresIn!: number

    @Column({ type: 'text', nullable: true })
    token!: string

    @Column({ nullable: false, default: false })
    isActive!: boolean

    @Column({ nullable: false, default: false })
    isDeleted!: boolean

    @Column({ nullable: false, default: false })
    mustLogin!: boolean

    @Column({ nullable: false, default: false })
    useLocalStorage!: boolean

    @Column({ type: 'timestamp', nullable: true })
    deletedAt!: Date;
}

export async function getUsersRepository(): Promise<Repository<User>> {
    return Connection.getRepository(User);
}

export async function jwSecretKey(data: { userId?: string, user?: User }): Promise<{ expiredIn: number, secretOrPrivateKey: string }> {
    var userIsChws: boolean = false;
    if (data.user) {
        const formatedRoles = (await GetRolesAndNamesPagesActionsList(data.user.roles));
        userIsChws = formatedRoles && notEmpty(formatedRoles) ? formatedRoles.rolesNames[0] == 'chws' : false;
    } else if (data.userId) {
        const userRepo = await getUsersRepository();
        const user = await userRepo.findOneBy({ id: data.userId });
        if (user) {
            const formatedRoles = (await GetRolesAndNamesPagesActionsList(user.roles));
            userIsChws = formatedRoles && notEmpty(formatedRoles) ? formatedRoles.rolesNames[0] == 'chws' : false;
        }
    }
    return generateSecret(userIsChws);
}

export function generateSecret(userIsChws:boolean):{ expiredIn: number; secretOrPrivateKey: string; }{
    const second1 = 1000 * 60 * 60 * 24 * 366;
    const second2 = 1000 * 60 * 60 * 12;
    return {
        expiredIn: userIsChws ? second1 : second2,
        secretOrPrivateKey: 'kossi-secretfortoken',
    }
}


export async function token(user: User) {
    const secret = await jwSecretKey({ user: user });
    return jwt.sign({ id: `${user.id}`, username: user.username, email: user.email, roles: user.roles, isActive: user.isActive }, secret.secretOrPrivateKey, { expiresIn: `${secret.expiredIn}s` });
}

export async function UpdateUserData(user: User): Promise<User> {
    user.token = await token(user);
    const secret = await jwSecretKey({ user: user });
    const expireDate = Date.now() + secret.expiredIn;
    user.expiresIn = expireDate;
    // const formatedRoles = (await GetRolesAndNamesPagesActionsList(user.roles));
    // user.useLocalStorage = formatedRoles && notEmpty(formatedRoles) ? formatedRoles.rolesNames[0] == 'chws' : false;
    user.useLocalStorage = true;
    return user;
}