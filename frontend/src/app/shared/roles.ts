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

  getRoles(): string[] {
    const userValue = this.userValue();
    if (userValue) {
      const roles =  userValue.roles;
      return roles;
    };
    return [];
  }

  isSuperUser(): boolean {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('yrB6vc5Ip3r');
    }
    return false;
  }

  isUserManager(): boolean {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('kMykXLnMsfF');
    }
    return false;
  }

  isDataManager(): boolean {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('KWH2Gl2atF8');
    }
    return false;
  }

  isSupervisorMentor(): boolean {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('Vjhs5PHK4lb');
    }
    return false;
  }

  isChws(): boolean {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('c3WyuK3ibsN');
    }
    return false;
  }

  onlySeedata(): boolean {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('STAgD7Z462J');
    }
    return false;
  }

  isAdmin(): boolean {
    if (Functions.notNull(this.getRoles())) {
      return this.getRoles().includes('FJXxMdr1gIB');
    }
    return false;
  }
} 