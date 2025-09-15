export interface IBreadCrumb {
    label: string
    url: string
    isActiveRoot:boolean
} 


export interface AppLink { 
    icon: string
    link: string
    label: string
    show: boolean
}



export interface RecapActivity {
  program: string;
  orgUnit: string;
  eventDate: string;
  status: string;
  completedDate: string;
  dataValues: {
    dataElement: string;
    value: any;
  }[];
}