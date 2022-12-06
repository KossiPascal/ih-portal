export interface User {
  id: any
  username: string
  fullname: string
  email: string
  password: string
  roles:string[]
  isActive: boolean
}



export interface Configs {
  id:any
  showRegisterPage:boolean
}

