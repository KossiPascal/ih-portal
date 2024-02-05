import { notNull } from '@ih-app/shared/functions';
import { AuthService } from '../services/auth.service';


export interface UserRoles {
    id: number
    name: string
    actions: string[] | null
    pages: string[] | null
    default_page: string | null
    isDeleted: boolean
    deletedAt: Date
}

export function GetRolesIdsOrNames(roles: UserRoles[] | undefined | null, type: 'names' | 'idsNumber' | 'idsString' | 'actions' | 'pages' | 'default_page' = 'names'): string[] | number[] | undefined {
    if (roles != undefined && roles != null) {
        switch (type) {
            case 'names':
                return roles
                    .filter(role => notNull(role?.name))
                    .map(role => role?.name || 'Unknown Role');

            case 'idsNumber':
                return roles
                    .filter(role => notNull(role?.id))
                    .map(role => role?.id || 0);

            case 'idsString':
                return roles
                    .filter(role => notNull(role?.id))
                    .map(role => role?.id ? `${role?.id}` : '');

            case 'actions':
                return (roles
                    .filter(role => notNull(role?.actions))
                    .map(role => role?.actions || [])).flat();

            case 'pages':
                return (roles
                    .filter(role => notNull(role?.pages))
                    .map(role => role?.pages || [])).flat();

            case 'default_page':
                return roles
                    .filter(role => notNull(role?.default_page))
                    .map(role => role?.default_page || 'Unknown Role');

            default:
                return undefined;
        }
    } else {
        return undefined;
    }
}



export class Roles {

    constructor(private auth: AuthService) { }

    public roleName = (): string[] => {
        const names = GetRolesIdsOrNames(this.auth.currentUser()?.roles as UserRoles[], 'names');
        return names ? names as string[] : [];
    }

    public actions = (): string[] => {
        const names = GetRolesIdsOrNames(this.auth.currentUser()?.roles as UserRoles[], 'actions');
        return names ? names as string[] : [];
    }

    public pages = (): string[] => {
        const names = GetRolesIdsOrNames(this.auth.currentUser()?.roles as UserRoles[], 'pages');
        return names ? names as string[] : [];
    }

    public getMeetingReport = (): string[] => {
        const userValue = this.auth.currentUser();
        return userValue && notNull(userValue) ? userValue.meeting_report ?? [] : [];
    }

    isSuperAdmin = (): boolean => {
        return this.roleName().includes('super_admin');
    }

    isUserManager = (): boolean => {
        return this.roleName().includes('user_manager') || this.isSuperAdmin();
    }

    // isAdmin = (): boolean => {
    //     return this.roleName().includes('admin') || this.isSuperAdmin();
    // }

    // isDataManager = (): boolean => {
    //     return this.roleName().includes('data_manager') || this.isSuperAdmin();
    // }

    // isReportsManager = (): boolean => {
    //     return this.roleName().includes('reports_manager') || this.isSuperAdmin();
    // }

    // isChwsDataViewer = (): boolean => {
    //     return this.roleName().includes('chws_data_viewer') || this.isSuperAdmin();
    // }

    // isChwsManager = (): boolean => {
    //     return this.roleName().includes('chws_manager') || this.isSuperAdmin();
    // }

    isChws = (): boolean => {
        return this.roleName().includes('chws');
    }

    
    // hasNoAccess = (): boolean => {
    //     return !this.isSuperAdmin() && !this.isUserManager() && !this.isAdmin() && !this.isDataManager() && !this.isReportsManager() && !this.isChwsDataViewer() && !this.isChwsManager() && !this.isChws();
    // }


    canViewLeftNavigation = (): boolean => {
        return this.actions().includes('can_view_left_navigation') || this.isSuperAdmin();
    }
    canViewTopNavigation = (): boolean => {
        return this.actions().includes('can_view_top_navigation') || this.isChws() || this.canLogOut() || this.isSuperAdmin();
    }
    canCreateTeam = (): boolean => {
        return this.actions().includes('can_create_team') || this.isSuperAdmin();
    }
    canCreatePerson = (): boolean => {
        return this.actions().includes('can_create_person') || this.isSuperAdmin();
    }
    canCreateReport = (): boolean => {
        return this.actions().includes('can_create_report') || this.isSuperAdmin();
    }
    canCreateRole = (): boolean => {
        return this.actions().includes('can_create_role') || this.isSuperAdmin();
    }
    canUpdateTeam = (): boolean => {
        return this.actions().includes('can_update_team') || this.isSuperAdmin();
    }
    canUpdatePerson = (): boolean => {
        return this.actions().includes('can_update_person') || this.isSuperAdmin();
    }
    canUpdateReport = (): boolean => {
        return this.actions().includes('can_update_report') || this.isSuperAdmin();
    }
    canUpdateRole = (): boolean => {
        return this.actions().includes('can_update_role') || this.isSuperAdmin();
    }
    canDeleteTeam = (): boolean => {
        return this.actions().includes('can_delete_team') || this.isSuperAdmin();
    }
    canDeletePerson = (): boolean => {
        return this.actions().includes('can_delete_person') || this.isSuperAdmin();
    }
    canDeleteReport = (): boolean => {
        return this.actions().includes('can_delete_report') || this.isSuperAdmin();
    }
    canDeleteRole = (): boolean => {
        return this.actions().includes('can_delete_role') || this.isSuperAdmin();
    }
    canRegisterUser = (): boolean => {
        return this.actions().includes('can_register_user') || this.isSuperAdmin();
    }
    canLogOut = (): boolean => {
        return this.actions().includes('can_logout') || this.isSuperAdmin();
    }

} 