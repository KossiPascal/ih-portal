import { Injectable } from '@angular/core';
import { Functions } from '@ih-app/shared/functions';
import { ConversionUtils } from 'turbocommons-ts';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleService {

    constructor(private auth: AuthService) { }
  
    private getRoles(): string[] {
      if (this.auth.userValue()!=null) return ConversionUtils.base64ToString(`${this.auth.userValue()?.roles}`) as any;
      return [];
    }
  
    isSuperAdmin(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('super_admin');
      }
      return false;
    }
  
    canManageUser(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('can_manage_user') || this.isSuperAdmin();
      }
      return false;
    }
  
    isAdmin(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('admin') || this.isSuperAdmin();
      }
      return false;
    }
  
    visitor(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('visitor') || this.isAdmin();
      }
      return false;
    }
  
    canSendToDhis2(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('can_send_dhis2') || this.isAdmin();
      }
      return false;
    }
  
    canOnlySeedata(): boolean {
      if (Functions.notNull(this.getRoles())) {
        return this.getRoles().includes('can_only_see') || this.isAdmin();
      }
      return false;
    }
  
} 