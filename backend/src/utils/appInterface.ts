import { Chws } from "../entity/Sync"

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
  dhisusername: string;
  dhispassword: string;

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
  viewName: string,
  startKey?: string[];
  endKey?: string[];
  // medic_host: string;
  // medic_username: string;
  // medic_password: string;
  // port: number;
  // ssl_verification: boolean;
  descending?: boolean
  dhisusername?: string
  dhispassword?: string
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
  dhisusername?: string
  dhispassword?: string
  pageSize?: number
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
  host: string,
  contact: string,
  parent: string,
  new_parent: string
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
export interface ChwsDrugQuantityInfo {
  month_quantity_beginning?: number
  month_quantity_received?: number
  month_total_quantity?: number
  month_consumption?: number
  theoretical_quantity?: number
  inventory_quantity?: number
  inventory_variance?: number
  year_chw_cmm?: number
  theoretical_quantity_to_order?: number
  quantity_to_order?: number
  quantity_validated?: number
  delivered_quantity?: number
  satisfaction_rate?: string

  lending?: string
  lending_quantity?: number
  lending_chws_code?: string

  borrowing?: string
  borrowing_quantity?: number
  borrowing_chws_code?: string

  quantity_loss?: number
  quantity_damaged?: number
  quantity_broken?: number
  quantity_expired?: number
  other_quantity?: number
  comments?: string
  observations?: string
}
export interface ChwsDrugData {
  Albendazole_400_mg_cp_1: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Amoxiciline_250_mg_2: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Amoxiciline_500_mg_3: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Artemether_Lumefantrine_20_120mg_cp_4: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Oral_Combination_Pills_5: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Paracetamol_250_mg_6: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Paracetamol_500_mg_7: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Pregnancy_Test_8: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Sayana_Press_9: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  SRO_10: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  TDR_11: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Vitamine_A_100000UI_12: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Vitamine_A_200000UI_13: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
  Zinc_14: ChwsDrugQuantityInfo | ChwsUpdateDrugInfo
}

export interface ChwsDrugDataWithChws {
  chw:Chws,
  Albendazole_400_mg_cp_1: ChwsDrugQuantityInfo
  Amoxiciline_250_mg_2: ChwsDrugQuantityInfo
  Amoxiciline_500_mg_3: ChwsDrugQuantityInfo
  Artemether_Lumefantrine_20_120mg_cp_4: ChwsDrugQuantityInfo
  Oral_Combination_Pills_5: ChwsDrugQuantityInfo
  Paracetamol_250_mg_6: ChwsDrugQuantityInfo
  Paracetamol_500_mg_7: ChwsDrugQuantityInfo
  Pregnancy_Test_8: ChwsDrugQuantityInfo
  Sayana_Press_9: ChwsDrugQuantityInfo
  SRO_10: ChwsDrugQuantityInfo
  TDR_11: ChwsDrugQuantityInfo
  Vitamine_A_100000UI_12: ChwsDrugQuantityInfo
  Vitamine_A_200000UI_13: ChwsDrugQuantityInfo
  Zinc_14: ChwsDrugQuantityInfo
}
export interface ChwsUpdateDrugInfo {
  district: string
  site: string
  chw: string
  year: number
  month: string
  drug_index: number
  drug_name: String
  year_chw_cmm: number
  quantity_validated: number
  delivered_quantity: number
  observations: number
  userId?: string
  dhisusername?: string
  dhispassword?: string
}

export interface PatologieData {
  diarrhee_pcime: Record<string, number>
  paludisme_pcime: Record<string, number>
  pneumonie_pcime: Record<string, number>
  malnutrition_pcime: Record<string, number>
}


// export class Roles {
//   isSuperUser: boolean = false;
//   isUserManager: boolean = false;
//   isAdmin: boolean = false;
//   isDataManager: boolean = false;
//   isOnlySupervisorMentor: boolean = false;
//   isSupervisorMentor: boolean = false;
//   isChws: boolean = false;
//   isReportViewer: boolean = false;
// }

// export interface MeetingReport {
//   id: string
//   title: string
//   date: string
//   start_hour: string
//   end_hour: string
//   agenda: string
//   discussion_topics: string
//   next_steps: string
//   team: Team;
//   personIds: number[]
// }

// export interface Person {
//   team: Team;
//   id: number;
//   name: string;
//   email?: string;
// }

// export interface Team {
//   id: number
//   show: boolean
//   name: string
// }