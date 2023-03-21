
export interface ChtOutPutData {
    home_visit: any
    soins_pcime: any
    suivi_pcime: any
    reference_pcime: any
    diarrhee_pcime: any
    paludisme_pcime: any
    pneumonie_pcime: any
    malnutrition_pcime: any
    prompt_pcime_diarrhee_24h: any
    prompt_pcime_diarrhee_48h: any
    prompt_pcime_diarrhee_72h: any
    prompt_pcime_paludisme_24h: any
    prompt_pcime_paludisme_48h: any
    prompt_pcime_paludisme_72h: any
    prompt_pcime_pneumonie_24h: any
    prompt_pcime_pneumonie_48h: any
    prompt_pcime_pneumonie_72h: any
    femme_enceinte: any
    femme_enceinte_NC: any
    femme_postpartum: any
    femme_postpartum_NC: any
    total_PF: any
    total_PF_NC: any
    reference_Pf: any
    reference_enceinte_postpartum: any
    test_de_grossesse: any
}


export interface DataIndicators {
    orgUnit?: string;
    reported_date?: string;
    code_asc?: string;
    district?: string;
    data_source?: string;

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

export function sum(t0: number = 0, t1: number = 0, t2: number = 0, t3: number = 0, t4: number = 0, t5: number = 0) {
    return t0 + t1 + t2 + t3 + t4 + t5;
}