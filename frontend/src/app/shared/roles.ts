import { User } from '@ih-app/models/User';
import { AppStorageService } from '@ih-app/services/cookie.service';
import { notNull } from '@ih-app/shared/functions';

export function UserRole() {
  return {
    SuperUser: { id: 'yrB6vc5Ip3r', name: 'isSuperUser' },
    UserManager: { id: 'kMykXLnMsfF', name: 'isUserManager' },
    Admin: { id: 'FJXxMdr1gIB', name: 'isAdmin' },
    DataManager: { id: 'KWH2Gl2atF8', name: 'isDataManager' },
    SupervisorMentor: { id: 'Vjhs5PHK4lb', name: 'isSupervisorMentor' },
    Chws: { id: 'c3WyuK3ibsN', name: 'isChws' },
    ReportViewer: { id: 'xpG5HJa5Fmf', name: 'isReportViewer' }
  };
}

export function UserGroup() {
  return {
    Chws: {id:'enIOT8b8taV', name:'isChws'},
    ReportViewer: {id:'dtVEW0CoCPl', name:'isReportViewer'},
  }
}

export function UserRolesAsArray(): { id: string, name: string }[] {
  return Object.values(UserRole()) as { id: string, name: string }[];
}

export function UserGroupsAsArray(): { id: string, name: string }[] {
  return Object.values(UserGroup()) as { id: string, name: string }[];
}
 
export class Roles {

  constructor(private store:AppStorageService){ }

  private userValue(): User | null {
    const data = this.store.get('user');
    return notNull(data) ? JSON.parse(data) : null;
  }

  private getRoles = (): string[] => {
    const userValue = this.userValue();
    return userValue && notNull(userValue) ? userValue.roles : [];
  }

  private getGroups = (): string[] => {
    const userValue = this.userValue();
    return userValue && notNull(userValue) ? userValue.groups : [];
  }

  isSuperUser = (): boolean => {
    return this.getRoles().includes(UserRole().SuperUser.id);
  }

  isUserManager = (): boolean => {
    return this.getRoles().includes(UserRole().UserManager.id) || this.isSuperUser();
  }

  isAdmin = (): boolean => {
    return this.getRoles().includes(UserRole().Admin.id) || this.isSuperUser();
  }

  isDataManager = (): boolean => {
    return this.getRoles().includes(UserRole().DataManager.id) || this.isUserManager() || this.isSuperUser() || this.isAdmin();
  }

  isOnlySupervisorMentor = (): boolean => {
    return this.getRoles().includes(UserRole().SupervisorMentor.id);
  }

  isSupervisorMentor = (): boolean => {
    return this.isOnlySupervisorMentor() || this.isDataManager();
  }

  isChws = (): boolean => {
    return this.getRoles().includes(UserRole().Chws.id) || this.getGroups().includes(UserGroup().Chws.id);
  }

  isReportViewer = (): boolean => {
    return this.getRoles().includes(UserRole().ReportViewer.id) || this.getGroups().includes(UserGroup().ReportViewer.id)  || this.isSuperUser();
  }

  hasNoAccess = (): boolean => {
    return !this.isSuperUser() && !this.isUserManager() && !this.isAdmin() && !this.isDataManager() && !this.isOnlySupervisorMentor() && !this.isChws() && !this.isReportViewer();
  }

} 