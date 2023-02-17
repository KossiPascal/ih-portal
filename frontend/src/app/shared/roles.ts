import { User } from '@ih-app/models/User';
import { AppStorageService } from '@ih-app/services/cookie.service';
import { Functions } from '@ih-app/shared/functions';
import { ConversionUtils } from 'turbocommons-ts';

 
export class Roles {

  constructor(private store:AppStorageService){ }

  private userValue(): User | null {
    if (Functions.notNull(this.store.get('user'))) return JSON.parse(this.store.get('user') ?? '');
    return null;
  }

  getRoles = (): string[] => {
    const userValue = this.userValue();
    return userValue && Functions.notNull(userValue) ? userValue.roles : [];
  }

  isSuperUser = (): boolean => {
    return Functions.notNull(this.getRoles()) && this.getRoles().includes('yrB6vc5Ip3r');
  }

  isUserManager = (): boolean => {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('kMykXLnMsfF') || this.isSuperUser();
    }
    return false;
  }

  isAdmin = (): boolean => {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('FJXxMdr1gIB') || this.isSuperUser();
    }
    return false;
  }

  isDataManager = (): boolean => {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('KWH2Gl2atF8') || this.isUserManager() || this.isSuperUser() || this.isAdmin();
    }
    return false;
  }

  isSupervisorMentor = (): boolean => {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('Vjhs5PHK4lb') || this.isDataManager();
    }
    return false;
  }

  isChws = (): boolean => {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('c3WyuK3ibsN') || this.isSuperUser();
    }
    return false;
  }

  onlySeeData = (): boolean => {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('STAgD7Z462J')  || this.isSuperUser();
    }
    return false;
  }
} 