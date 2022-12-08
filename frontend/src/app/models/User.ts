export interface User {
  id: any
  username: string
  fullname: string
  email: string
  password?: string
  roles:string[]
  isActive: boolean
  token?: string
  expiresIn?:any
  isSuperAdmin:any
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