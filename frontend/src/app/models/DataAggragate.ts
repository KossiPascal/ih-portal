
export interface ChtOutPutData {
    total_home_visit: any
    total_pcime_soins: any
    total_pcime_suivi: any
    total_reference_pcime_suivi: any
    total_reference_pcime_soins: any
    total_diarrhee_pcime_soins: any
    total_paludisme_pcime_soins: any
    total_pneumonie_pcime_soins: any
    total_malnutrition_pcime_soins: any
    prompt_diarrhee_24h_pcime_soins: any
    prompt_diarrhee_48h_pcime_soins: any
    prompt_diarrhee_72h_pcime_soins: any
    prompt_paludisme_24h_pcime_soins: any
    prompt_paludisme_48h_pcime_soins: any
    prompt_paludisme_72h_pcime_soins: any
    prompt_pneumonie_24h_pcime_soins: any
    prompt_pneumonie_48h_pcime_soins: any
    prompt_pneumonie_72h_pcime_soins: any
    total_pregnancy_family_planning: any
    total_reference_family_planning_soins: any
    total_reference_femme_enceinte_soins: any
    total_vad_femme_enceinte_soins: any
    total_vad_femme_enceinte_NC_soins: any
    total_test_de_grossesse_domicile: any
    total_newborn_suivi: any
    total_reference_newborn: any
    total_malnutrition_suivi: any
    total_reference_malnutrition_suivi: any
    total_prenatal_suivi: any
    total_reference_prenatal_suivi: any
    total_postnatal_suivi: any
    total_reference_postnatal_suivi: any
    total_vad_femme_postpartum_NC: any
    total_vad_women_emergency_suivi: any
    total_reference_women_emergency_suivi: any
    total_femme_enceinte_women_emergency_suivi: any
    total_femme_postpartum_women_emergency_suivi: any
    total_family_planning_renewal_suivi: any
    total_reference_family_planning_renewal_suivi: any
    total_vad_family_planning_NC: any
}


export interface DataIndicators {
    orgUnit?: string
    reported_date?: string
    code_asc?: string
    district?: string
    data_source?: string
    
    total_vad: number
    total_vad_pcime_c: number
    total_suivi_pcime_c: number
    total_vad_femmes_enceinte: number
    total_vad_femmes_postpartum: number
    total_recherche_active: number
    total_vad_family_planning: number
    reference_femmes_pf: number
    reference_pcime: number
    reference_femmes_enceinte_postpartum: number
    total_diarrhee_pcime_soins: number
    total_paludisme_pcime_soins: number
    total_pneumonie_pcime_soins: number
    total_malnutrition_pcime_soins: number
    prompt_diarrhee_24h_pcime_soins: number
    prompt_diarrhee_48h_pcime_soins: number
    prompt_diarrhee_72h_pcime_soins: number
    prompt_paludisme_24h_pcime_soins: number
    prompt_paludisme_48h_pcime_soins: number
    prompt_paludisme_72h_pcime_soins: number
    prompt_pneumonie_24h_pcime_soins: number
    prompt_pneumonie_48h_pcime_soins: number
    prompt_pneumonie_72h_pcime_soins: number
    total_vad_femmes_enceintes_NC: number
    total_vad_femme_postpartum_NC: number
    total_test_de_grossesse_domicile: number
}