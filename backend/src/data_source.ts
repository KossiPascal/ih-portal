// import "reflect-metadata"
import { DataSource } from "typeorm"
import path from "path";
// import { sslFolder } from "./utils/functions";

// require('dotenv').config({ path: sslFolder('.env')});
require('dotenv').config({ path: `${path.dirname(path.dirname(path.dirname(__dirname)))}/ssl/.env` });

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = process.env

// const appdirname = Functions.appDirectory();
// `${appdirname}/ssl/server.key`
 
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: DB_HOST,
    // url: `postgres://kossi:kossi@123@${envs.DB_HOST}:${envs.DB_PORT}/${envs.DB_NAME}`,
    port: parseInt(`${DB_PORT}`),
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    synchronize: true,
    logging: true,
    // ssl:true,
    // entities: [__dirname + "/entity/*.ts"],
    entities: [__dirname + '/entity/*{.ts,.js}'],
    migrations: [__dirname + "/migration/*.sql"],
    migrationsTableName: "custom_migration_table",
    // subscribers: [__dirname + "/subscriber/*.ts"],
    subscribers: [__dirname + "/subscriber/*{.ts,.js}"],
    // replication:{ master: {}, slaves: [] }
    // dropSchema: false,
});

  
// export const AppDataSource = new DataSource({
//     type: "mysql",
//     host: "localhost",
//     port: 3306,
//     username: "kossi",
//     password: "kossi@123",
//     database: "ktsolegnagbo_postgres",
//     synchronize: true, 
//     logging: true,
//     entities: [__dirname + "/entity/*.ts"],
//     migrations: [__dirname + "/migration/*.sql"],
//     migrationsTableName: "custom_migration_table",
//     subscribers: [__dirname + "/subscriber/*.ts"],
//     // dropSchema: false,
// });