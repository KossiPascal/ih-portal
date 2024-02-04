
import { Chws, Families } from "./Sync"

// export interface ChtOutPutData {
//     home_visit: any
//     soins_pcime: any
//     suivi_pcime: any
//     reference_pcime: any
//     diarrhee_pcime: any
//     paludisme_pcime: any
//     pneumonie_pcime: any
//     malnutrition_pcime: any
//     prompt_pcime_diarrhee_24h: any
//     prompt_pcime_diarrhee_48h: any
//     prompt_pcime_diarrhee_72h: any
//     prompt_pcime_paludisme_24h: any
//     prompt_pcime_paludisme_48h: any
//     prompt_pcime_paludisme_72h: any
//     prompt_pcime_pneumonie_24h: any
//     prompt_pcime_pneumonie_48h: any
//     prompt_pcime_pneumonie_72h: any
//     femme_enceinte_postpartum_pf: any
//     femme_enceinte: any
//     femme_enceinte_NC: any
//     femme_postpartum: any
//     femme_postpartum_NC: any
//     total_PF: any
//     total_PF_NC: any
//     reference_Pf: any
//     reference_enceinte_postpartum: any
//     test_de_grossesse: any
// }


export interface DataInfos {
    total_visited: number,
    total_not_visited: number,
    family_count: number,
    detail: {
        chw: Chws | null,
        family: Families,
        data: {
            all_visit: number,
            visit_in_day: number,
            death: number,
            child_visit: number,
            women_visit: number,
            home_visit: number,
            isVisited: boolean
        }
    }[]
}


export interface DataIndicators {
    orgUnit?: string
    reported_date?: string
    code_asc?: string
    district?: string
    data_source?: string

    total_vad: { tonoudayo: number; dhis2: number };
    sum_total_vad: number;

    soins_pcime: { tonoudayo: number; dhis2: number };
    sum_soins_pcime: number;

    suivi_pcime: { tonoudayo: number; dhis2: number };
    sum_suivi_pcime: number;

    sum_soins_suivi: { tonoudayo: number; dhis2: number };
    sum_pcime: number;

    femmes_enceinte: { tonoudayo: number; dhis2: number };
    sum_femmes_enceinte: number;

    femmes_postpartum: { tonoudayo: number; dhis2: number };
    sum_femmes_postpartum: number;

    sum_enceinte_postpartum: { tonoudayo: number; dhis2: number };
    sum_maternel: number;

    home_visit: { tonoudayo: number; dhis2: number };
    sum_home_visit: number;

    pf: { tonoudayo: number; dhis2: number };
    sum_pf: number;

    reference_pf: { tonoudayo: number; dhis2: number };
    sum_reference_pf: number;

    reference_pcime: { tonoudayo: number; dhis2: number };
    sum_reference_pcime: number;

    reference_femmes_enceinte_postpartum: { tonoudayo: number; dhis2: number };
    sum_reference_femmes_enceinte_postpartum: number;

    diarrhee_pcime: { tonoudayo: number; dhis2: number };
    sum_diarrhee_pcime: number;

    paludisme_pcime: { tonoudayo: number; dhis2: number };
    sum_paludisme_pcime: number;

    pneumonie_pcime: { tonoudayo: number; dhis2: number };
    sum_pneumonie_pcime: number;

    malnutrition_pcime: { tonoudayo: number; dhis2: number };
    sum_malnutrition_pcime: number;

    prompt_pcime_diarrhee_24h: { tonoudayo: number; dhis2: number };
    sum_prompt_pcime_diarrhee_24h: number;

    prompt_pcime_diarrhee_48h: { tonoudayo: number; dhis2: number };
    sum_prompt_pcime_diarrhee_48h: number;

    prompt_pcime_diarrhee_72h: { tonoudayo: number; dhis2: number };
    sum_prompt_pcime_diarrhee_72h: number;

    prompt_pcime_paludisme_24h: { tonoudayo: number; dhis2: number };
    sum_prompt_pcime_paludisme_24h: number;

    prompt_pcime_paludisme_48h: { tonoudayo: number; dhis2: number };
    sum_prompt_pcime_paludisme_48h: number;

    prompt_pcime_paludisme_72h: { tonoudayo: number; dhis2: number };
    sum_prompt_pcime_paludisme_72h: number;

    prompt_pcime_pneumonie_24h: { tonoudayo: number; dhis2: number };
    sum_prompt_pcime_pneumonie_24h: number;

    prompt_pcime_pneumonie_48h: { tonoudayo: number; dhis2: number };
    sum_prompt_pcime_pneumonie_48h: number;

    prompt_pcime_pneumonie_72h: { tonoudayo: number; dhis2: number };
    sum_prompt_pcime_pneumonie_72h: number;

    femmes_enceintes_NC: { tonoudayo: number; dhis2: number };
    sum_femmes_enceintes_NC: number;

    femme_postpartum_NC: { tonoudayo: number; dhis2: number };
    sum_femme_postpartum_NC: number;

    test_de_grossesse: { tonoudayo: number; dhis2: number };
    sum_test_de_grossesse: number;
}


export interface ChwsDrugQantityInfo {
    month_quantity_beginning: number
    month_quantity_received: number
    month_total_quantity: number
    month_consumption: number
    theoretical_quantity: number
    inventory_quantity: number
    inventory_variance: number
    year_cmm: number
    theoretical_quantity_to_order: number
    quantity_to_order: number
    quantity_validated: number
    delivered_quantity: number
    satisfaction_rate: string
    loan_borrowing: string
    loan_borrowing_quantity: number
    loan_borrowing_chws_code: string
    quantity_loss: number
    quantity_damaged: number
    quantity_broken: number
    quantity_expired: number
    other_quantity: number
    comments: string
    observations: string

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
    userId?: string | null | undefined
    dhisusername?: string
    dhispassword?: string
    forms: string[]
    sources: string[]
}

export interface MeetingReport {
  id?: number
  title: string
  date: string
  start_hour: string
  end_hour: string
  agenda: string
  discussion_topics: string
  next_steps: string
  recommandations: string
  team: Team|number
  present_persons_ids: number[]
  absent_persons_ids: number[]
  other_persons: string
  doNotUpdate: boolean
  dhisusername?: string
  dhispassword?: string
  userId?: string | null | undefined
}

export interface Person {
  id?: number;
//   team: Team|number;
  name: string;
  email?: string;
  dhisusername?: string
  dhispassword?: string
  userId?: string | null | undefined
}

export interface Team {
  id?: number
  show: boolean
  name: string
  dhisusername?: string
  dhispassword?: string
  userId?: string | null | undefined
}