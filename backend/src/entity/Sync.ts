

import { Entity, PrimaryGeneratedColumn, Column, Repository, DataSource, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne, Unique, Index } from "typeorm"
import { AppDataSource } from "../data_source"
import { User } from "./User";

// export enum FlightType { DOMESTIC = "domestic", INTERNATIONAL = "international" }
let Connection: DataSource = AppDataSource.manager.connection;


@Entity()
export class ApiTokenAccess {
  constructor() { };
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: 'varchar', nullable: false })
  token!: string

  @Column({ nullable: false, default: false })
  isActive!: boolean
}
export async function getApiTokenAccessRepository(): Promise<Repository<ApiTokenAccess>> {
  return Connection.getRepository(ApiTokenAccess);
}

@Entity()
export class Districts {
  constructor() { };
  @PrimaryColumn({ type: 'varchar' })
  id?: string

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string
}
export async function getDistrictSyncRepository(): Promise<Repository<Districts>> {
  return Connection.getRepository(Districts);
}

// ##################################################################

@Entity()
export class Sites {
  constructor() { };
  @PrimaryColumn({ type: 'varchar' })
  id?: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  rev?: string

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  external_id?: string

  @ManyToOne(() => Districts, (district) => district.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district!: Districts|null

  @Column({ type: 'varchar', nullable: true })
  reported_date?: string

  @Column({ type: 'varchar', nullable: true })
  reported_full_date?: string

}
export async function getSiteSyncRepository(): Promise<Repository<Sites>> {
  return Connection.getRepository(Sites);
}

// ##################################################################

@Entity()
export class Zones {
  constructor() { };
  @PrimaryColumn({ type: 'varchar', length: 255, nullable: false })
  id?: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  rev?: string

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  external_id?: string

  @ManyToOne(() => Districts, district => district.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district!: Districts|null

  @ManyToOne(() => Sites, (site) => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site!: Sites|null

  @Column({ type: 'varchar', nullable: true })
  chw_id?: string

  @Column({ type: 'varchar', nullable: true })
  reported_date?: string

  @Column({ type: 'varchar', nullable: true })
  reported_full_date?: string
}
export async function getZoneSyncRepository(): Promise<Repository<Zones>> {
  return Connection.getRepository(Zones);
}

// ##################################################################

@Entity()
export class Families {
  constructor() { };
  @PrimaryColumn({ type: 'varchar', length: 255, nullable: false })
  id?: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  rev?: string

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  external_id?: string

  @ManyToOne(() => Districts, district => district.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district!: Districts|null

  @ManyToOne(() => Sites, (site) => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site!: Sites|null

  @ManyToOne(() => Zones, (zone) => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone!: Zones|null

  @Column({ type: 'varchar', nullable: true })
  reported_date?: string

  @Column({ type: 'varchar', nullable: true })
  reported_full_date?: string
}
export async function getFamilySyncRepository(): Promise<Repository<Families>> {
  return Connection.getRepository(Families);
}

// ##################################################################

@Entity()
export class Patients {
  constructor() {}
  @PrimaryColumn({ type: 'varchar', length: 255, nullable: false })
  id?: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  rev?: string

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  external_id?: string

  @Column({ type: 'varchar', nullable: true })
  role?: string

  @Column({ type: 'varchar', nullable: true })
  sex?: string

  @Column({ type: 'varchar', nullable: true })
  date_of_birth?: string

  @ManyToOne(() => Districts, district => district.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district!: Districts|null

  @ManyToOne(() => Sites, site => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site!: Sites|null

  @ManyToOne(() => Zones, zone => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone!: Zones|null

  @ManyToOne(() => Families, family => family.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'family_id', referencedColumnName: 'id' })
  family?: Families

  @Column({ type: 'varchar', nullable: true })
  reported_date?: string

  @Column({ type: 'varchar', nullable: true })
  reported_full_date?: string
}
export async function getPatientSyncRepository(): Promise<Repository<Patients>> {
  return Connection.getRepository(Patients);
}

// ##################################################################

@Entity()
@Unique(['external_id'])
export class Chws {
  constructor() { };
  @PrimaryColumn({ type: 'varchar', length: 255, nullable: false })
  id?: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  rev?: string

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  @Index({ unique: true })
  external_id?: string

  @Column({ type: 'varchar', nullable: true })
  role?: string

  @ManyToOne(() => Districts, district => district.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district!: Districts|null

  @ManyToOne(() => Sites, site => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site!: Sites|null

  @ManyToOne(() => Zones, zone => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone!: Zones|null

  @Column({ type: 'varchar', nullable: true })
  reported_date?: string

  @Column({ type: 'varchar', nullable: true })
  reported_full_date?: string
}
export async function getChwsSyncRepository(): Promise<Repository<Chws>> {
  return Connection.getRepository(Chws);
}

// ##################################################################



@Entity()
export class ChwsData {
  constructor() { };
  @PrimaryColumn({ type: 'varchar', length: 255, nullable: false })
  id!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  rev?: string

  @Column({ type: 'varchar', nullable: true })
  source?: string

  @Column({ type: 'varchar', default: '', nullable: true })
  form?: string

  @Column('json', { nullable: true })
  fields?: any;

  @ManyToOne(() => Districts, district => district.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district!: Districts;

  @ManyToOne(() => Sites, site => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site!: Sites

  @ManyToOne(() => Zones, zone => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone!: Zones

  @ManyToOne(() => Chws, chw => chw.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'chw_id', referencedColumnName: 'id' })
  chw!: Chws

  @Column({ type: 'varchar', nullable: true })
  family_id?: string

  @Column({ type: 'varchar', nullable: true })
  patient_id?: string

  @Column({ type: 'varchar', nullable: true })
  phone?: string

  @Column({ type: 'varchar', nullable: true })
  reported_date!: string

  @Column({ type: 'varchar', nullable: true })
  reported_full_date?: string

  @Column('json', { nullable: true })
  geolocation?: object;

  // @CreateDateColumn({ name: 'created_at' })
  // createdAt?: Date;

  // @UpdateDateColumn({ name: 'updated_at' })
  // updatedAt?: Date;

  // @BeforeInsert()
  // updateFlightCode() {
  //     const randomFlightNumber = Math.floor(Math.random() * 1000);
  //     this.flightCode = this.category.concat(randomFlightNumber.toString());
  // }

  // @Column({
  //   generatedType: 'STORED',
  //   asExpression: `source || destination`
  // })
  // sourceDestinationCode: string;

  // @Column({

  //  cascadeInsert: true,
  //  cascadeUpdate: true,
  //   type: "enum",
  //   enum: FlightType,
  //   default: FlightType.DOMESTIC
  // })
  // flightType: FlightType;

  // _rev
  // content_type
  // hidden_fields
  // _attachments
  // geolocation_log

}
export async function getChwsDataSyncRepository(): Promise<Repository<ChwsData>> {
  return Connection.getRepository(ChwsData);
}


@Entity()
export class ChwsDrug {
  constructor() { };
  @PrimaryColumn({ type: 'varchar', length: 255, nullable: false })
  id!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  rev?: string

  @Column({ type: 'varchar', nullable: true })
  source?: string

  @Column({ type: 'varchar', default: '', nullable: true })
  form?: string

  @Column({ type: 'float', nullable: true })
  year!:number

  @Column({ type: 'varchar', nullable: true })
  month!:string

  @Column({ type: 'varchar', nullable: true })
  activity_type?: string;

  @Column({ type: 'varchar', nullable: true })
  lending_chws_info?: string;

  @Column({ type: 'varchar', nullable: true })
  borrowing_chws_info?: string;

  @Column({ type: 'float', nullable: true })
  lumartem?: number;
  
  @Column({ type: 'float', nullable: true })
  alben_400?: number;
  
  @Column({ type: 'float', nullable: true })
  amox_250?: number;
  
  @Column({ type: 'float', nullable: true })
  amox_500?: number;
  
  @Column({ type: 'float', nullable: true })
  pills?: number;
  
  @Column({ type: 'float', nullable: true })
  para_250?: number;
  
  @Column({ type: 'float', nullable: true })
  para_500?: number;
  
  @Column({ type: 'float', nullable: true })
  pregnancy_test?: number;
  
  @Column({ type: 'float', nullable: true })
  sayana?: number;
  
  @Column({ type: 'float', nullable: true })
  sro?: number;
  
  @Column({ type: 'float', nullable: true })
  tdr?: number;
  
  @Column({ type: 'float', nullable: true })
  vit_A1?: number;
  
  @Column({ type: 'float', nullable: true })
  vit_A2?: number;
  
  @Column({ type: 'float', nullable: true })
  zinc?: number;

  @Column({ type: 'float', nullable: true })
  other_drug?: number;
  
  @Column({ type: 'varchar', nullable: true })
  comments?: string;

  @ManyToOne(() => Districts, district => district.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district!: Districts;

  @ManyToOne(() => Sites, site => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site!: Sites

  @ManyToOne(() => Zones, zone => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone!: Zones

  @ManyToOne(() => Chws, chw => chw.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'chw_id', referencedColumnName: 'id' })
  chw!: Chws

  @Column({ type: 'varchar', nullable: true })
  reported_date!: string

  @Column({ type: 'varchar', nullable: true })
  reported_full_date!: string

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy!:User

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy!:User
  
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt!: Date;
}
export async function getChwsDrugSyncRepository(): Promise<Repository<ChwsDrug>> {
  return Connection.getRepository(ChwsDrug);
}


@Entity()
export class ChwsDrugUpdate {
  constructor() { };
  @PrimaryColumn({ type: 'varchar' })
  id?: string

  @ManyToOne(() => Districts, (district) => district.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district!: Districts|null

  @ManyToOne(() => Sites, site => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site!: Sites

  @ManyToOne(() => Zones, zone => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone!: Zones

  @ManyToOne(() => Chws, chw => chw.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'chw_id', referencedColumnName: 'id' })
  chw!: Chws

  @Column({ type: 'float', nullable: true })
  year!:number

  @Column({ type: 'varchar', nullable: true })
  month!:string

  @Column({ type: 'float', nullable: true })
  drug_index!:number

  @Column({ type: 'varchar', nullable: true })
  drug_name!:string

  @Column({ type: 'float', nullable: true })
  quantity_validated!:number

  @Column({ type: 'float', nullable: true })
  delivered_quantity!:number
  
  @Column({ type: 'varchar', nullable: true })
  observations!:string

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy!:User

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy!:User
  
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt!: Date

}
export async function getChwsDrugUpdateSyncRepository(): Promise<Repository<ChwsDrugUpdate>> {
  return Connection.getRepository(ChwsDrugUpdate);
}


@Entity()
export class DrugChwYearCmm {
  constructor() { };
  @PrimaryColumn({ type: 'varchar' })
  id?: string

  @ManyToOne(() => Districts, (district) => district.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district!: Districts|null

  @ManyToOne(() => Sites, site => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site!: Sites

  @ManyToOne(() => Zones, zone => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone!: Zones

  @ManyToOne(() => Chws, chw => chw.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'chw_id', referencedColumnName: 'id' })
  chw!: Chws

  @Column({ type: 'varchar', nullable: true })
  cmm_start_year_month!:string

  @Column({ type: 'simple-array', nullable: true })
  cmm_year_month_list!: string[]

  @Column({ type: 'float', nullable: true })
  drug_index!:number

  @Column({ type: 'varchar', nullable: true })
  drug_name!:string

  @Column({ type: 'float', nullable: true })
  year_chw_cmm!:number

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy!:User

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy!:User
  
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt!: Date

}
export async function getDrugChwYearCmmSyncRepository(): Promise<Repository<DrugChwYearCmm>> {
  return Connection.getRepository(DrugChwYearCmm);
}

@Entity()
export class Teams {
  constructor() { };
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', nullable: true })
  name!:string;

  @Column({type: 'boolean' })
  show!: boolean;

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy!:User

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy!:User
  
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt!: Date;
}
export async function GetTeamsRepository(): Promise<Repository<Teams>> {
  return Connection.getRepository(Teams);
}

@Entity()
export class Persons {
  constructor() { };
  @PrimaryGeneratedColumn()
  id!: number;

  // @ManyToOne(() => Teams, team => team.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  // @JoinColumn({ name: 'team_id', referencedColumnName: 'id' })
  // team!:Teams

  @Column({ type: 'varchar', nullable: true })
  name?:string;

  @Column({ type: 'varchar', nullable: true })
  email?:string;

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy!:User

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy!:User
  
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt!: Date;
}
export async function GetPersonsRepository(): Promise<Repository<Persons>> {
  return Connection.getRepository(Persons);
}

@Entity()
export class CouchDbUsers {
  constructor() { };
  @PrimaryColumn({ type: 'varchar' })
  id!: string
  
  @Column({ type: 'varchar', nullable: true })
  rev!:string;
  
  @Column({ type: 'varchar', nullable: true })
  username!:string;
  
  @Column({ type: 'varchar', nullable: true })
  fullname!:string;
  
  @Column({ type: 'varchar', nullable: true })
  code!:string;

  @Column({ type: 'varchar', nullable: true })
  type!:string;

  @Column({ type: 'varchar', nullable: true })
  contact!:string;

  @Column({ type: 'varchar', nullable: true })
  role!:string;

  @Column({ type: 'varchar', nullable: true })
  place!:string;

}
export async function getCouchDbUsersSyncRepository(): Promise<Repository<CouchDbUsers>> {
  return Connection.getRepository(CouchDbUsers);
}


@Entity()
export class MeetingReportData {
  constructor() { };
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: true })
  title?:string;

  @Column({ type: 'varchar', nullable: true })
  date?:string;

  @Column({ type: 'varchar', nullable: true })
  start_hour?:string;

  @Column({ type: 'varchar', nullable: true })
  end_hour?:string;

  @Column({ type: 'text', nullable: true })
  agenda?:string;

  @Column({ type: 'text', nullable: true })
  discussion_topics?:string;

  @Column({ type: 'text', nullable: true })
  next_steps?:string;

  @ManyToOne(() => Teams, team => team.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'team_id', referencedColumnName: 'id' })
  team!:Teams

  @Column({ type: 'simple-array', nullable: true })
  present_persons_ids!: number[]

  @Column({ type: 'simple-array', nullable: true })
  absent_persons_ids!: number[]

  @Column({ type: 'text', nullable: true })
  other_persons?:string;

  @Column({ type: 'text', nullable: true })
  recommandations?:string;
  
  @Column({type: 'boolean', default:false})
  doNotUpdate!: boolean;

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy!:User

  @CreateDateColumn({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => User, user => user.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updatedBy!:User
  
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt!: Date;
}
export async function GetMeetingReportDataRepository(): Promise<Repository<MeetingReportData>> {
  return Connection.getRepository(MeetingReportData);
}