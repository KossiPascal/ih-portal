import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatabaseUtilService } from '@ih-app/services/database-utils.service';
import { returnDataAsArray } from '@ih-src/app/shared/functions';

@Component({
  selector: 'app-user',
  templateUrl: `./truncate_database.component.html`,

})
export class TruncateDatabaseComponent implements OnInit {

  responseMsg: string = '';
  constMsg: string = "Loading...";
  initMsg: string = this.constMsg;

  isLoading!: boolean;
  isEntityLoading!: boolean;
  EntitiesList$: { name: string, table: string }[] = [];
  EntitiesForm!: FormGroup;
  initEntity: string[] = [];


  constructor(private dbUtils: DatabaseUtilService) { }

  createEntitiesFilterFormGroup(): FormGroup {
    return new FormGroup({
      entities: new FormControl([], [Validators.required]),
    });
  }


  ngOnInit(): void {
    this.EntitiesForm = this.createEntitiesFilterFormGroup();
    this.initAllData();
  }

  async initAllData() {
    this.isLoading = true;
    this.initMsg = 'Chargement des Entities ...';
    this.dbUtils.getDatabaseEntities().subscribe(async (res: { status: number, data: any }) => {
      if (res.status == 200) this.EntitiesList$ = res.data;
    }, (err: any) => {
      this.isLoading = false;
      console.log(err.error);
    });
  }

  EntitiesSelectedList(): { name: string, table: string }[] {
    var entitiesSelected: { name: string, table: string }[] = [];
    const entities: string[] = returnDataAsArray(this.EntitiesForm.value.entities);
    this.initEntity = entities;
    for (let i = 0; i < this.EntitiesList$.length; i++) {
      const entity = this.EntitiesList$[i];
      if (entities.includes(entity.name)) entitiesSelected.push(entity)
    }
    return entitiesSelected;
  }

  TruncateBd() {
    const selectedEntites = this.EntitiesSelectedList();
    if (selectedEntites.length > 0) {
      this.responseMsg = '';
      this.initMsg = this.constMsg;
      this.isEntityLoading = true;
      this.dbUtils.truncateDatabase({ procide: true, entities: selectedEntites }).subscribe(async (res: { status: number, data: any }) => {
        this.responseMsg = res.data.toString();
        if (res.status == 200) this.initEntity = [];
        this.isEntityLoading = false;
      }, (err: any) => {
        console.log(err.error);
        this.isEntityLoading = false;
        this.responseMsg = err.toString();
      });
    }
  }
}