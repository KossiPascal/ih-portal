import { User } from '@ih-app/models/User';
import { AppStorageService } from '@ih-app/services/cookie.service';
import { Functions, notNull } from '@ih-app/shared/functions';
import { ConversionUtils } from 'turbocommons-ts';

 
export class Roles {

  constructor(private store:AppStorageService){ }

  private userValue(): User | null {
    if (notNull(this.store.get('user'))) return JSON.parse(this.store.get('user') ?? '');
    return null;
  }

  getRoles = (): string[] => {
    const userValue = this.userValue();
    return userValue && notNull(userValue) ? userValue.roles : [];
  }

  getGroups = (): string[] => {
    const userValue = this.userValue();
    return userValue && notNull(userValue) ? userValue.groups : [];
  }

  isSuperUser = (): boolean => {
    return notNull(this.getRoles()) && this.getRoles().includes('yrB6vc5Ip3r');
  }

  isUserManager = (): boolean => {
    if (notNull(this.getRoles())) {
      return this.getRoles().includes('kMykXLnMsfF') || this.isSuperUser();
    }
    return false;
  }

  isAdmin = (): boolean => {
    if (notNull(this.getRoles())) {
      return this.getRoles().includes('FJXxMdr1gIB') || this.isSuperUser();
    }
    return false;
  }

  isDataManager = (): boolean => {
    if (notNull(this.getRoles())) {
      return this.getRoles().includes('KWH2Gl2atF8') || this.isUserManager() || this.isSuperUser() || this.isAdmin();
    }
    return false;
  }

  isOnlySupervisorMentor = (): boolean => {
    if (notNull(this.getRoles())) {
      return this.getRoles().includes('Vjhs5PHK4lb');
    }
    return false;
  }

  isSupervisorMentor = (): boolean => {
    if (notNull(this.getRoles())) {
      return this.isOnlySupervisorMentor() || this.isDataManager();
    }
    return false;
  }

  isChws = (): boolean => {
    if (notNull(this.getRoles())) {
      return this.getRoles().includes('c3WyuK3ibsN');
    }
    if (notNull(this.getGroups())) {
      return this.getGroups().includes('enIOT8b8taV');
    }
    return false;
  }

  onlySeeData = (): boolean => {
    // if (notNull(this.getRoles())) {
    //   return this.getRoles().includes('STAgD7Z462J')  || this.isSuperUser();
    // }
    // return false;
    return true;
  }
} 