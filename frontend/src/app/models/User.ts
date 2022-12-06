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

export enum Role {
  User = 'User',
  Admin = 'Admin'
}

export interface UserValueData {
  token: string
  id: string
  username: string
  fullname: string
  roles:any
  isActive:boolean
  expiresIn:any
}