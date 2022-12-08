import { User } from '@ih-app/models/User';
import { Functions } from '@ih-app/shared/functions';
import { ConversionUtils } from 'turbocommons-ts';

export class RoleService {

  private static userValue(): User|null {
    if (Functions.notNull(localStorage.getItem('user'))) return JSON.parse(localStorage.getItem('user')??'');
    return null;
  }
  
  
    static getRoles(): string[] {
      if (this.userValue()!=null) return ConversionUtils.base64ToString(`${this.userValue()?.roles}`) as any;
      return [];
    }


  
    static isSuperAdmin(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('super_admin');
      }
      return false;
    }

    
  
    static canManageUser(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('can_manage_user') || this.isSuperAdmin();
      }
      return false;
    }

  
    static isAdmin(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('admin') || this.isSuperAdmin();
      }
      return false;
    }
  
    static visitor(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('visitor') || this.isAdmin();
      }
      return false;
    }
  
    static canSendToDhis2(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('can_send_dhis2') || this.isAdmin();
      }
      return false;
    }
  
    static canOnlySeedata(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('can_only_see') || this.isAdmin();
      }
      return false;
    }
  
} 