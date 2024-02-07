import { DataIndicators } from "./DataAggragate"

export interface ApiTokenAccess {
  id?: number
  token: string
  isActive: boolean
}

export interface HighChart {
  cibleId: string;
  chartOptions: any;
  highchartsOptions: any;
}

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
  InsertIntoDhis2: boolean
  dhisusername?: string
  dhispassword?: string
  userId?: string | null | undefined

  // thinkmd_host: string
  // thinkmd_site: string
  // useToken: string
  // thinkmd_token_username: string
  // thinkmd_token: string
  // thinkmd_username: string
  // thinkmd_password: string

  // medic_host: string
  // medic_username: string
  // medic_password: string
  // medic_database: string

  // cht_host: string
  // cht_username: string
  // cht_password: string
  // cht_database: string

  // dhis2_host: string
  // dhis2_username: string
  // dhis2_password: string

  // port: number
  // ssl_verification: boolean
}

export interface DataFromPython {
  DataFordhis2: DataIndicators[]
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

export interface OrgUnitImport {
  sites: {
    successCount: number
    errorCount: number
    errorElements: string
    errorIds: string
  }
  zones: {
    successCount: number
    errorCount: number
    errorElements: string
    errorIds: string
  }
  familles: {
    successCount: number
    errorCount: number
    errorElements: string
    errorIds: string
  }
  patients: {
    successCount: number
    errorCount: number
    errorElements: string
    errorIds: string
  }
  Asc: {
    successCount: number
    errorCount: number
    errorElements: string
    errorIds: string
  }
  Message: {
    successCount: number
    errorCount: number
    errorElements: string
    errorIds: string
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
  type?: any
  userId?: string | null | undefined
  dhisusername?: string
  dhispassword?: string
  params?: any
  withDhis2Data?: boolean
}

export interface ChwsDataFormDb {
  id: string
  rev: string
  source: string
  form: string
  patient_id: string
  family_id: string
  fields: any
  district: Districts
  site: Sites
  zone: Zones
  chw: Chws
  phone: string
  reported_date: string
  reported_full_date: string
  geolocation: any
}

export interface ChwsDrugFormDb {
  id: string
  rev: string
  source: string
  form: string
  activity_date: string
  activity_type: string;
  loan_borrowing_chws_info: string;
  lumartem: number;
  alben_400: number;
  amox_250: number;
  amox_500: number;
  pills: number;
  para_250: number;
  para_500: number;
  pregnancy_test: number;
  sayana: number;
  sro: number;
  tdr: number;
  vit_A1: number;
  vit_A2: number;
  zinc: number;
  other_drug: number;
  comments: string;
  district: Districts;
  site: Sites
  chw: Chws
  reported_date: string
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
  date_of_birth: string
  sex: string
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
  username?: string
  password?: string
  userId?: string | null | undefined
  dhisusername?: string
  dhispassword?: string
}


export interface SyncOrgUnit {
  start_date: string
  end_date: string
  site: boolean
  zone: boolean
  family: boolean
  patient: boolean
  chw: boolean
  userId: string | null | undefined
  dhisusername?: string
  dhispassword?: string
}

export interface CompareData {
  Code: string
  Name: string
  Pcime: number
  PcimeDhis2: number
  MaternellePf: number
  MaternellePfDhis2: number
  Maternelle: number
  MaternelleDhis2: number
  Pf: number
  PfDhis2: number
  Recherche: number
  RechercheDhis: number
  Consultation: number
  ConsultationDhis: number
  Total: number
  TotalDhis: number
  // TotalDiff: number
  // Ratio: { value: number, color: string }
}