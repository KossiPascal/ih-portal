
export interface AggragateData {
  label: string
  count: number
  icon?: string
  color?: string
  detailUrl?: string
}
 
export interface Sync {
  id: any
  start_date: string
  end_date: string
  weekly_Choosen_Dates: string[]

  thinkmd_host: string
  thinkmd_site: string
  useToken: string
  thinkmd_token_username: string
  thinkmd_token: string
  thinkmd_username: string
  thinkmd_password: string

  medic_host: string
  medic_username: string
  medic_password: string
  medic_database: string

  cht_host: string
  cht_username: string
  cht_password: string
  cht_database: string

  InsertIntoDhis2: boolean
  dhis2_host: string
  dhis2_username: string
  dhis2_password: string

  port: number
  ssl_verification: boolean
  
  user?:string
}

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
    Dhis2Import: {
      ErrorCount: number
      ErrorMsg: string
      Created: number
      Updated: number
      Deleted: number
    }
    Data: {
      head: any
      body: any
    }
  }
}

export interface OrgUnitImport {
  sites: {
    error: number
    success: number
  }
  zones: {
    error: number
    success: number
  }
  familles: {
    error: number
    success: number
  }
  patients: {
    error: number
    success: number
  }
  Asc: {
    error: number
    success: number
  }
  Message: {
    error: string
    success: string
  }
}

export interface FilterParams {
  start_date?: string
  end_date?: string
  sources?: string[]
  forms?: string[]
  chws?: string[]
  sites?: string[]
  districts?: string[]
  zones?: string[]
  patients?: string[]
  families?: string[]
  type?:any
  user?:string
}

export interface MedicMobileData {
  id: string
  rev: string
  source: string
  form: string
  patient_id: string
  family_id: string
  fields: any
  site: Sites
  zone: Zones
  chw: Chws
  phone: string
  reported_date: string
  reported_full_date: string
  geolocation: any
}

export interface Districts {
  id: string
  source: string
  name: string
  external_id: string
}

export interface Sites {
  id: string
  source: string
  name: string
  external_id: string
  district: Districts
  reported_date: string
  reported_full_date: string
}

export interface Zones {
  id: string
  source: string
  name: string
  external_id: string
  site: Sites
  chw_id: any
  reported_date: string
  reported_full_date: string
}

export interface Families {
  id: string
  source: string
  name: string
  external_id: string
  zone: Zones
  site: Sites
  reported_date: string
  reported_full_date: string
}

export interface Patients {
  id: string
  source: string
  name: string
  external_id: string
  role: string
  site: Sites
  zone: Zones
  family: Families
  reported_date: string
  reported_full_date: string
}

export interface Chws {
  id: string
  source: string
  name: string
  external_id: string
  code: string
  role: string
  site: Sites
  zone: Zones
  reported_date: string
  reported_full_date: string
}

export interface Dhis2Sync {
  orgUnit?: string
  filter?: string[]
  fields?: string[]
  username?:string
  password?:string
  user?:string
}



export interface CompareData {
  Code: string
  Name: string
  Pcime: number
  PcimeDhis2: number
  MaternellePf: number
  MaternellePfDhis2: number
  Recherche: number
  RechercheDhis: number
  Consultation: number
  ConsultationDhis: number
  Total: number
  TotalDhis: number
  TotalDiff: number
  Ratio: {value:number, color:string}
}