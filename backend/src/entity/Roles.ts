import { Entity, Column, Repository, DataSource, PrimaryGeneratedColumn } from "typeorm"
import { AppDataSource } from '../data_source';
import { notEmpty } from "../utils/functions";

let Connection: DataSource = AppDataSource.manager.connection;

@Entity()
export class Roles {
    constructor() { };
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ unique: true, type: 'varchar', nullable: false })
    name!: string

    @Column({ type: 'simple-array', nullable: true })
    actions!: string[]

    @Column({ type: 'simple-array', nullable: true })
    pages!: string[]

    @Column({ type: 'varchar', nullable: true })
    default_page!: string

    @Column({ nullable: false, default: false })
    isDeleted!: boolean

    @Column({ type: 'timestamp', nullable: true })
    deletedAt!: Date;
}

export async function getRolesRepository(): Promise<Repository<Roles>> {
    return Connection.getRepository(Roles);
}


export async function GetRolesListOrNamesList(rolesIds: any[], getOnlyNames: boolean = false): Promise<string[] | Roles[] | undefined> {
    if (rolesIds && notEmpty(rolesIds)) {
        const repo = await getRolesRepository();
        var roles: Roles[] = await repo.find();
        if (getOnlyNames == true) {
            return rolesIds
                .map(roleId => roles.find(role => role.id === parseInt(roleId.trim(), 10)))
                .filter(role => notEmpty(role?.name))
                .map(role => role?.name || 'Unknown Role');
        } else {
            return rolesIds
                .map(roleId => roles.find(role => role.id === parseInt(roleId.trim(), 10)))
                .filter(role => role?.name !== undefined) as Roles[];
        }
    }
    return undefined;
}
