export interface User {
  id: any
  username: string
  fullname: string
  roles:string[]
  isActive: boolean
  expiresIn?:any
  token?: string
  dhisusersession:string
  userLogo?:any
}


export interface Configs {
  id:any
  showRegisterPage:boolean
}

// export enum Role {
//   User = 'User',
//   Admin = 'Admin'
// }