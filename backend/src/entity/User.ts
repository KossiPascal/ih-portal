import * as jwt from 'jsonwebtoken';
import { UserRole, } from '../utils/functions';
import { Entity, Column, Repository, DataSource, PrimaryColumn } from "typeorm"
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
    // @PrimaryGeneratedColumn()
    // id!: string
    @PrimaryColumn({ type: 'varchar', nullable: false })
    id!: string

    @Column({ unique: true, type: 'varchar', nullable: false })
    username!: string

    @Column({ nullable: true })
    fullname!: string

    @Column({ unique: true, type: 'varchar', nullable: true })
    email!: string

    // @Column({ type: 'varchar', nullable: false })
    // password!: string

    @Column({ type: 'simple-array', nullable: true })
    roles!: string[]

    @Column({ type: 'simple-array', nullable: true })
    groups!: string[]

    @Column({ type: 'simple-array', nullable: true })
    meeting_report!: string[]

    @Column({ type: 'simple-array', nullable: true })
    actions!: string[]

    @Column({ type: 'varchar', nullable: false })
    expiresIn!: string

    @Column({ type: 'varchar', nullable: false })
    dhisusersession!: string

    @Column({ type: 'varchar', nullable: false })
    token!: string

    @Column({ type: 'varchar', nullable: false })
    defaultRedirectUrl!: string

    @Column({ nullable: false, default: false })
    isActive!: boolean
}

export async function getUserRepository(): Promise<Repository<User>> {
   return Connection.getRepository(User);
}


export async function token(user: User) {
    const secret = await jwSecretKey({ user: user });
    return jwt.sign({ id: `${user.id}`, username: user.username, roles: user.roles, groups: user.groups, isActive: user.isActive }, secret.secretOrPrivateKey, { expiresIn: `${secret.expiredIn}s` });
}

export async function jwSecretKey(data: { userId?: string, user?: User }): Promise<{ expiredIn: string; secretOrPrivateKey: string; }> {
    var userIsChws: boolean = false;
    if (data.user) {
        userIsChws = UserRole(data.user).isChws;
    } else if (data.userId) {
        const _repoUser = await getUserRepository();
        const user = await _repoUser.findOneBy({id:data.userId});

        if (user) userIsChws = UserRole(user).isChws;
    }
    const second1 = 1000 * 60 * 60 * 24 * 366;
    const second2 = 1000 * 60 * 60 * 24 * 366;
    return {
        expiredIn: userIsChws ? `${second1}` : `${second2}`,
        secretOrPrivateKey: 'kossi-secretfortoken',
    }
}
