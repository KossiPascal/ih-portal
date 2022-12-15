

import { Entity, PrimaryGeneratedColumn, Column, Repository, DataSource, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne, Unique, Index } from "typeorm"
import { AppDataSource } from "../data-source"

// export enum FlightType {
//   DOMESTIC = "domestic",
//   INTERNATIONAL = "international",
// }
let Connection: DataSource  = AppDataSource.manager.connection;


@Entity()
export class ChwsData {
  constructor() { };
  @PrimaryColumn({ type: 'varchar', length: 255, nullable: false })
  id!: string

  @Column({ type: 'varchar', nullable: true })
  source?: string

  @Column({ type: 'varchar', default: '', nullable: true })
  form?: string

  @Column({ type: 'varchar', nullable: true })
  patient_id?: string

  @Column('json', { nullable: true })
  fields?: object;

  @ManyToOne(() => Sites, site => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site?: string

  @ManyToOne(() => Zones, zone => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone?: string

  @ManyToOne(() => Chws, chw => chw.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'chw_id', referencedColumnName: 'id' })
  chw?: string

  @Column({ type: 'varchar', nullable: true })
  phone?: string

  @Column({ type: 'varchar', nullable: true })
  reported_date?: string

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

// ##################################################################

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

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  external_id?: string

  @ManyToOne(() => Districts, (district) => district.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'district_id', referencedColumnName: 'id' })
  district?: string

  @Column({ type: 'varchar', nullable: true })
  reported_date?: string

  @Column({ type: 'varchar', nullable: true })
  reported_full_date?: string

  // @CreateDateColumn({ name: 'created_at' })
  // createdAt?: Date;
  
  // @UpdateDateColumn({ name: 'updated_at' })
  // updatedAt?: Date;

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

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  external_id?: string

  @ManyToOne(() => Sites, (site) => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site?: string

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

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  external_id?: string

  @ManyToOne(() => Zones, (zone) => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone?: string

  @ManyToOne(() => Sites, (site) => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site?: string

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
  constructor() { };
  @PrimaryColumn({ type: 'varchar', length: 255, nullable: false })
  id?: string

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  external_id?: string

  @Column({ type: 'varchar', nullable: true })
  role?: string

  @ManyToOne(() => Sites, site => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site?: string

  @ManyToOne(() => Zones, zone => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone?: string

  @ManyToOne(() => Families, family => family.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'family_id', referencedColumnName: 'id' })
  family?: string

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

  @Column({ type: 'varchar', nullable: true })
  source!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string


  @Column({ type: 'varchar', nullable: true })
  @Index({ unique: true })
  external_id?: string
 
  @Column({ type: 'varchar', nullable: true })
  role?: string

  @ManyToOne(() => Sites, site => site.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site?: string

  @ManyToOne(() => Zones, zone => zone.id, { eager: true, nullable: true, onDelete: "CASCADE", onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'zone_id', referencedColumnName: 'id' })
  zone?: string

  @Column({ type: 'varchar', nullable: true })
  reported_date?: string

  @Column({ type: 'varchar', nullable: true })
  reported_full_date?: string
}
export async function getChwsSyncRepository(): Promise<Repository<Chws>> {
  return Connection.getRepository(Chws);
}

