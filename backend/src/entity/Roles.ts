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


export async function GetRolesAndNamesPagesActionsList(rolesIds: any[]): Promise<{ rolesObjects: Roles[], rolesNames: string[], pages: string[], actions: string[], } | undefined> {
    try {
        if (rolesIds && notEmpty(rolesIds)) {
            const repo = await getRolesRepository();
            var roles: Roles[] = await repo.find();

            if (roles && notEmpty(roles)) {

                const rolesObjects = rolesIds
                    .map(roleId => roles.find(role => role.id === parseInt(roleId.trim(), 10)))
                    .filter(role => notEmpty(role?.name)) as Roles[];

                const rolesNames = rolesIds
                    .map(roleId => roles.find(role => role.id === parseInt(roleId.trim(), 10)))
                    .filter(role => notEmpty(role?.name))
                    .map(role => (role as Roles).name);

                const pages: string[] = Array.from(new Set(
                    rolesIds
                        .map(roleId => roles.find(role => role.id === parseInt(roleId.trim(), 10)))
                        .filter(role => notEmpty(role?.name) && notEmpty(role?.pages))
                        .flatMap(role => role?.pages as string[])
                ));

                const actions: string[] = Array.from(new Set(
                    rolesIds
                        .map(roleId => roles.find(role => role.id === parseInt(roleId.trim(), 10)))
                        .filter(role => notEmpty(role?.name) && notEmpty(role?.actions))
                        .flatMap(role => role?.actions as string[])
                ));

                return { rolesNames: rolesNames, rolesObjects: rolesObjects, pages: pages, actions: actions }
            }

        }
    } catch (error) {

    }
    return undefined;
}


