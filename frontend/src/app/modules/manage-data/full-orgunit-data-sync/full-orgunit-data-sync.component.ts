import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Districts, OrgUnitImport, Sites } from '@ih-app/models/Sync';
import { AuthService } from '@ih-app/services/auth.service';
import { SyncService } from '@ih-app/services/sync.service';
import { ActivatedRoute } from '@angular/router';
import { startEnd21and20Date } from '@ih-src/app/shared/dates-utils';

@Component({
  selector: 'full-orgunit-data-sync',
  templateUrl: './full-orgunit-data-sync.component.html',
  styleUrls: ['./full-orgunit-data-sync.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class FullOrgUnitDataSyncComponent implements OnInit {

  syncAllForm!: FormGroup;
  tab1_messages: { orgunit: OrgUnitImport| null, tonoudayo: OrgUnitImport| null, dhis2: OrgUnitImport[], globalError: any, successDetails:any } | null = null;
  loading1!: boolean;


  LoadingMsg: string = "Loading..."
  Districts$: Districts[] = [];
  Sites$: Sites[] = [];
  sites$: Sites[] = [];
  initDate!: { start_date: string, end_date: string };

  constructor(private route: ActivatedRoute, private sync: SyncService, private http: HttpClient, private auth: AuthService) { 
  }
  


  ngOnInit(): void {
    this.initDate = startEnd21and20Date();
    this.syncAllForm = this.createSyncAllFormGroup();
  }

  createSyncAllFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl(this.initDate.start_date, [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl(this.initDate.end_date, [Validators.required, Validators.minLength(7)]),
    });
  }


  syncAllFromCouchToDb(): void {
    this.loading1= true;
    this.tab1_messages = null;
    this.sync.syncAll(this.syncAllForm.value).subscribe((res: {status:number, data:any}) => {
      this.tab1_messages = res.data;
      this.loading1 = false;
    }, (err: any) => {
      this.loading1 = false;
      this.tab1_messages = err.error;
    });
  }

}
