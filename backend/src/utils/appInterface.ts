import { Moment } from "moment";



export interface Sync {
  id: any;
  start_date: string;
  end_date: string;

  thinkmd_host: string;
  thinkmd_site: string;
  useToken: string;
  thinkmd_token_username: string;
  thinkmd_token: string;
  thinkmd_username: string;
  thinkmd_password: string;

  medic_host: string;
  medic_username: string;
  medic_password: string;
  medic_database: string;

  InsertIntoDhis2: boolean;
  dhis2_host: string;
  dhis2_username: string;
  dhis2_password: string;

  port: number;
  ssl_verification: boolean;
}


export interface Dhis2Sync {
  host: string;
  port: number
  username: string;
  password: string;
  cibleName: string,
  program?: string,
  orgUnitFilter?: string
  filter?: string[],
  fields?: string[],
  order?: string
}


export interface Dhis2DataFormat {
  event: string
  orgUnit: string
  orgUnitName: string
  dataValues: {
    dataElement: string
    value: any
  }[]
}


export interface MailConfig {
  admin: {
    from: string
    pass: string
  }
  user: {
    to: string
    subject: any
    text: any
  }
}


export interface UserValue {
  token: string
  id: string
  username: string
  fullname: string
  roles:any
  isActive:boolean
  expiresIn:any
}