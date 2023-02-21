import { Moment } from "moment";

export interface DataFromPython {
  errorToSend: {
    ErrorCount: number
    ErrorData: any[]
    ConsoleError: string
  }
  dataToSend: {
    success: string
    Error: number
    ErrorMsg: any

    Data: {
      head: any
      body: any
    }
  }
}

export interface Sync {
  id: any;
  start_date: string;
  end_date: string;
  dhisusersession:string

  // thinkmd_host: string;
  // thinkmd_site: string;
  // useToken: string;
  // thinkmd_token_username: string;
  // thinkmd_token: string;
  // thinkmd_username: string;
  // thinkmd_password: string;

  // medic_host: string;
  // medic_username: string;
  // medic_password: string;
  // medic_database: string;

  // InsertIntoDhis2: boolean;
  // dhis2_host: string;
  // dhis2_username: string;
  // dhis2_password: string;

  // port: number;
  // ssl_verification: boolean;
}




export interface CouchDbFetchData {
  viewName:string,
  startKey?: string[];
  endKey?: string[];
  // medic_host: string;
  // medic_username: string;
  // medic_password: string;
  // port: number;
  // ssl_verification: boolean;
  descending?: boolean
  dhisusersession?:string
}

export interface Dhis2Sync {
  host: string
  port: number
  cibleName: string
  program?: string
  orgUnit?: string
  filter?: string[]
  fields?: string[]
  order?: string
  user: string
  dhisusersession: string
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


export interface ChwUserParams {
  host:string,
  contact:string, 
  parent:string,
  new_parent:string
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
  id: string
  token: string
  username: string
  fullname: string
  roles:any
  isActive:boolean
  expiresIn:any
  dhisusersession:string
}