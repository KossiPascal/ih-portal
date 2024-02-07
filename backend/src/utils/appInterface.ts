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
export interface ChwsDrugQantityInfo {
  month_quantity_beginning?: number
  month_quantity_received?: number
  month_total_quantity?: number
  month_consumption?: number
  theoretical_quantity?: number
  inventory_quantity?: number
  inventory_variance?: number
  year_cmm?: number
  theoretical_quantity_to_order?: number
  quantity_to_order?: number
  quantity_validated?: number
  delivered_quantity?: number
  satisfaction_rate?: string
  loan_borrowing?: string
  loan_borrowing_quantity?: number
  loan_borrowing_chws_code?: string
  quantity_loss?: number
  quantity_damaged?: number
  quantity_broken?: number
  quantity_expired?: number
  other_quantity?: number
  comments?: string
  observations?: string
}
export interface ChwsDrugData {
  Albendazole_400_mg_cp_1: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Amoxiciline_250_mg_2: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Amoxiciline_500_mg_3: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Artemether_Lumefantrine_20_120mg_cp_4: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Oral_Combination_Pills_5: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Paracetamol_250_mg_6: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Paracetamol_500_mg_7: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Pregnancy_Test_8: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Sayana_Press_9: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  SRO_10: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  TDR_11: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Vitamine_A_100000UI_12: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Vitamine_A_200000UI_13: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
  Zinc_14: ChwsDrugQantityInfo | ChwsUpdateDrugInfo
}

export interface ChwsDrugDataWithChws {
  chw:Chws,
  Albendazole_400_mg_cp_1: ChwsDrugQantityInfo
  Amoxiciline_250_mg_2: ChwsDrugQantityInfo
  Amoxiciline_500_mg_3: ChwsDrugQantityInfo
  Artemether_Lumefantrine_20_120mg_cp_4: ChwsDrugQantityInfo
  Oral_Combination_Pills_5: ChwsDrugQantityInfo
  Paracetamol_250_mg_6: ChwsDrugQantityInfo
  Paracetamol_500_mg_7: ChwsDrugQantityInfo
  Pregnancy_Test_8: ChwsDrugQantityInfo
  Sayana_Press_9: ChwsDrugQantityInfo
  SRO_10: ChwsDrugQantityInfo
  TDR_11: ChwsDrugQantityInfo
  Vitamine_A_100000UI_12: ChwsDrugQantityInfo
  Vitamine_A_200000UI_13: ChwsDrugQantityInfo
  Zinc_14: ChwsDrugQantityInfo
}
export interface ChwsUpdateDrugInfo {
  district: string
  site: string
  chw: string
  year: number
  month: string
  drug_index: number
  drug_name: String
  year_cmm: number
  quantity_validated: number
  delivered_quantity: number
  theoretical_quantity_to_order: number
  observations: number
  userId?: string
  dhisusername?: string
  dhispassword?: string
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