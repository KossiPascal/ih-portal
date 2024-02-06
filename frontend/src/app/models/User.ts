import { UserRoles } from "./Roles"
import { Chws } from "./Sync"

export interface User {
  id: string
  username: string
  fullname: string
  email?: string
  // password?: string
  roles: UserRoles[] | string[]
  meeting_report: string[]
  isActive: boolean
  expiresIn: number | undefined | null
  token: string
  dhisusername?: string
  dhispassword?: string
  userLogo: string
  mustLogin: boolean
  useLocalStorage: boolean
  isDeleted: boolean
  // pages:string[]
  // actions:string[]
  // default_page:string

}

export interface Configs {
  id: any
  showRegisterPage: boolean
}
