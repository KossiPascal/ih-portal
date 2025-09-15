import path from "path";

export class Consts {
    private static projectFolderName = path.basename(path.dirname(path.dirname(path.dirname(__dirname))));

    static isProdEnv:boolean = this.projectFolderName === 'ih-portal' ;
    // static isProdEnv:boolean = this.projectFolderName === 'ih-portal-dev' ;

    static child_forms = [
        "pcime_c_asc",
        "pcime_c_followup",
        "pcime_c_referral",
        "usp_pcime_followup",
        "newborn_followup",
        "malnutrition_followup"
    ];

    static child_followup_forms = [
        "pcime_c_followup",
        "pcime_c_referral",
        "usp_pcime_followup",
        "newborn_followup",
        "malnutrition_followup"
    ];

    static home_visit_form = [
        "death_report",
        "home_visit"
    ];

    static women_forms = [
        "pregnancy_family_planning",
        "women_emergency_followup",
        "fp_follow_up_renewal",
        "fp_followup_danger_sign_check",
        "prenatal_followup",
        "postnatal_followup",
        "delivery"
    ];

    static pregnancy_pf_forms = [
        "pregnancy_family_planning",
        "women_emergency_followup",
        "fp_follow_up_renewal",
        "fp_followup_danger_sign_check",
        "delivery"
    ];
  static defaultSecurePort: string  = '3003';
  static defaultPort: string  = '3000';

}






// const home_actions_forms = [
//     `home_visit`,

//   `pcime_c_asc`,
//   `pcime_c_referral`,
//   `pcime_c_followup`,
//   `usp_pcime_followup`,
//   `malnutrition_followup`,
//   `newborn_followup`,

//   `pregnancy_family_planning`,

//   `delivery`,

//   `prenatal_followup`,
//   `postnatal_followup`,
//   `women_emergency_followup`,

//   `fp_followup_danger_sign_check`,
//   `fp_follow_up_renewal`,

//   `death_report`,

//   // `vaccination_followup`,
// ];

// drug_movements
// drug_quantities

// drugs_management



