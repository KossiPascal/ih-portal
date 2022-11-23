
export interface TodoList {
    id?: number
    title: string
}

export interface TodoItem {
    id?: number
    todoListId: number
    title: string
    done?: boolean
}

export interface DataList {  
  id: string
  form: string
  patient_id?: string
  fields?: object
  chw_id: string
  zone_id: string
  site_id: string
  phone?: string
  reported_date: string
  reported_full_date: string
  geolocation?: object
}

// export interface SiteList {
//   id?: string
//   name?: string
//   reported_date?: string
//   reported_full_date?: string

// }

// export interface ZoneList {
//   id?: string
//   name?: string
//   site_id?: string
//   reported_date?: string
//   reported_full_date?: string
// }

// export interface FamilyList {
//   id?: string
//   name?: string
//   zone_id?: string
//   site_id?: string
//   reported_date?: string
//   reported_full_date?: string
// }

// export interface PatientList {
//   id?: string
//   name?: string
//   role?: string
//   family_id?: string
//   zone_id?: string
//   site_id?: string
//   reported_date?: string
//   reported_full_date?: string
// }

// export interface ChwList {
//   id?: string
//   name?: string
//   role?: string
//   zone_id?: string
//   site_id?: string
//   reported_date?: string
//   reported_full_date?: string
// }