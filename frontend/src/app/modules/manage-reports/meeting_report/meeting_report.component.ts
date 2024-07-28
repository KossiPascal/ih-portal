import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Chws } from '@ih-app/models/Sync';
import { SyncService } from '@ih-app/services/sync.service';
import { monthByArg, notNull } from '@ih-app/shared/functions';
import { AuthService } from '@ih-app/services/auth.service';
import { Roles } from '@ih-app/models/Roles';
import { MeetingReport, Person, Team } from '@ih-src/app/models/DataAggragate';
import { compareTimes } from '@ih-src/app/shared/dates-utils';
import { User } from '@ih-src/app/models/User';
import { Router } from '@angular/router';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';

declare var sortTable: any;
declare var $: any;
declare var table2pdf: any;
declare var table2csv: any;
declare var table2json: any;
declare var table2excel: any;
declare var printTable: any;

@Component({
  selector: 'app-meeting-report',
  templateUrl: `./meeting_report.component.html`,
  styleUrls: [
    './meeting_report.component.css'
  ]
})
export class MeetingReportComponent implements OnInit {

  constructor(private auth: AuthService, private sync: SyncService, private el: ElementRef, private renderer: Renderer2, private router: Router) {
  }

  public roles = new Roles(this.auth);
  private pressTimer: any;

  hasTeamPageAccess(teamId: number):boolean{
    return this.roles.getMeetingReport().includes(`${teamId}`);
  }

  visibleItems: { [key: string]: boolean } = {};

  currentUser:User | null | undefined;

  IsTeamAction: boolean = false;
  TeamToUpdateId: number | undefined;
  Team$: Team[] = [];
  SelectedTeam: Team | undefined;

  Person$: Person[] = [];
  SearchedPerson$: Person[] = [];

  PresentPersonsList: { [team: number]: Person[] } = {};
  AbsentPersonsList: { [team: number]: Person[] } = {};

  SelectedPerson: Person | undefined;

  modalReport: { [team: number]: MeetingReport } = {};

  AllReports$: MeetingReport[] = [];
  Report$: { [team: number]: { [year: number]: { [month: number]: { [day: number]: { [index: number]: { report: MeetingReport, hour: string } } } } } } = {};
  ViewedReport: { [team: number]: MeetingReport | undefined } = {};
  EditReportView:{[team: number]: boolean | undefined} = {};

  selected_report_url!:string;

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser();
    this.GetPerson();
    this.GetTeams();
    this.GetReports();
    this.selected_report_url = 'https://tonoudayoanalyse.portal-integratehealth.org/manage-reports/meeting-report';
  }

  openNewWindow(event:Event) {
    event.preventDefault();
    window.open(this.selected_report_url, "_blank");
  }

  showEdit(teamId: number, field:'Input'|'span' = 'Input'):boolean{
    if (this.ViewedReport && this.ViewedReport[teamId]) {
      const r = this.EditReportView[teamId];
      return field == 'Input' ? r == true : r != true
    }
    return field == 'Input' ? true : false;
  }

  SetModalReport(teamId: number, report: MeetingReport){
    this.modalReport[teamId] = report;
  }

  EditWithModalReport(teamId: number){
   this.ViewReport(teamId, this.modalReport[teamId])
  }

  editReport(event: Event, teamId: number){
    this.EditReportView[teamId] = true;
    const r = this.ViewedReport && this.ViewedReport[teamId];
    this.setPersonsData(teamId, r);
  }

  setPersonsData(teamId: number, report: MeetingReport | undefined){
    if (teamId && report && report.id) {
      this.PresentPersonsList[teamId] = this.Person$.filter(p => {
        return p.id && report.present_persons_ids 
        && (report.present_persons_ids.map(String)).includes(`${p.id}`) 
        && (report.team as Team).id == teamId;
      });
      this.AbsentPersonsList[teamId] = this.Person$.filter(p => {
        return p.id && report.absent_persons_ids 
        && (report.absent_persons_ids.map(String)).includes(`${p.id}`) 
        && (report.team as Team).id == teamId;
      });
    }
  }

  ViewReport(teamId: number, r: MeetingReport | undefined) {
    if (r) {
      const tId = r && (r.team as Team).id;
      if (tId && teamId && tId == teamId && r.id) {
        this.ViewedReport[teamId] = r;
        this.setPersonsData(teamId, r);
      }
    }
  }

  generateReport() {
    const data: { [team: number]: { [year: number]: { [month: number]: { [day: number]: { [index: number]: { report: MeetingReport, hour: string } } } } } } = {};
    const teamId = this.SelectedTeam && this.SelectedTeam.id;
    if (teamId) {
      for (let i = 0; i < this.AllReports$.length; i++) {
        const r = this.AllReports$[i];
        if (r.date) {
          const date = new Date(r.date);
          const y = date.getFullYear();
          const m = date.getMonth() + 1;
          const d = date.getDate();

          if (!data[teamId]) data[teamId] = {};
          if (!data[teamId][y]) data[teamId][y] = {};
          if (!data[teamId][y][m]) data[teamId][y][m] = {};
          if (!data[teamId][y][m][d]) data[teamId][y][m][d] = {};
          data[teamId][y][m][d][i + 1] = { report: r, hour: `${r.start_hour}  -  ${r.end_hour}` };
        }
      }
    }
    this.Report$ = data;
  }

  GetTeams() {
    this.sync.GetTeams().subscribe(async (_c$: { status: number, data: Team[] | string }) => {
      if (_c$.status == 200) {
        this.Team$ = (_c$.data as Team[]).sort((a, b) => a.name.localeCompare(b.name));
        // this.SelectedTeam = this.Team$ && this.Team$[0] ? this.Team$[0] : undefined;
      }
    }, (err: any) => { });
  }

  GetPerson() {
    this.sync.GetPersons().subscribe(async (_c$: { status: number, data: Person[] | string }) => {
      if (_c$.status == 200) {
        this.Person$ = (_c$.data as Person[]).sort((a, b) => a.name.localeCompare(b.name));
        this.SearchedPerson$ = this.Person$;
      }
    }, (err: any) => { });
  }

  GetReports() {
    if (this.SelectedTeam && this.SelectedTeam.id) {
      this.sync.GetReports(this.SelectedTeam.id!).subscribe(async (_c$: { status: number, data: MeetingReport[] | string }) => {
        if (_c$.status == 200) {
          this.AllReports$ = _c$.data as MeetingReport[];
          this.generateReport();
        }
      }, (err: any) => { });
    }
  }

  getPresentPersonsIds(){
    const presentPersonIds: number[] = Object.values(this.PresentPersonsList).flat()
      .filter(person => typeof person.id === 'number')
      .map(person => person.id as number);
      return presentPersonIds;
  }

  getAbsentPersonsIds(){
    const absentPersonIds: number[] =  Object.values(this.AbsentPersonsList).flat()
      .filter(person => typeof person.id === 'number')
      .map(person => person.id as number);
      return absentPersonIds;
  }

  AllFieldAreNotEmpty(teamId: number, withUpdateVerification:boolean = true):boolean{
    const presentPersonIds: number[] = this.getPresentPersonsIds();
    const absentPersonIds: number[] = this.getAbsentPersonsIds();

    const title = this.getValue(`title-${teamId}`);
    const date = this.getValue(`date-${teamId}`);
    const start_hour = this.getValue(`start-hour-${teamId}`);
    const end_hour = this.getValue(`end-hour-${teamId}`);
    const agenda = this.getValue(`agenda-${teamId}`);
    const otherPersons = this.getValue(`other_persons-${teamId}`);
    const discussion_topics = this.getValue(`discussion-topics-${teamId}`);
    const next_steps = this.getValue(`next-steps-${teamId}`);
    const recommandations = this.getValue(`recommandations-${teamId}`);
    const isNotNull:boolean = notNull(title) || notNull(date) || notNull(start_hour) || notNull(end_hour) || notNull(presentPersonIds) || notNull(absentPersonIds)
          || notNull(otherPersons)|| notNull(otherPersons) || notNull(agenda) || notNull(recommandations) || notNull(discussion_topics) || notNull(next_steps);
    if (withUpdateVerification) {
      return this.CanUpdateReport(teamId) && this.showEdit(teamId) ? isNotNull : false;  
    } 
    return isNotNull;
  }

  SaveOrUpdateReport(event: Event, teamId: number, doNotUpdate: boolean) {
    event.preventDefault();

    const presentPersonIds: number[] = this.getPresentPersonsIds();
    const absentPersonIds: number[] = this.getAbsentPersonsIds();

    const title = this.getValue(`title-${teamId}`);
    const date = this.getValue(`date-${teamId}`);
    const start_hour = this.getValue(`start-hour-${teamId}`);
    const end_hour = this.getValue(`end-hour-${teamId}`);
    const agenda = this.getValue(`agenda-${teamId}`);
    const otherPersons = this.getValue(`other_persons-${teamId}`);
    const discussion_topics = this.getValue(`discussion-topics-${teamId}`);
    const next_steps = this.getValue(`next-steps-${teamId}`);
    const recommandations = this.getValue(`recommandations-${teamId}`);
    
    var i = 1;

    if (!notNull(title)) {
      i -= 1;
      this.AddOrRemoveClassById(`title-${teamId}`, 'custom-border');
    }
    if (!notNull(date)) {
      i -= 1;
      this.AddOrRemoveClassById(`date-${teamId}`, 'custom-border');
    }
    if (!notNull(start_hour)) {
      i -= 1;
      this.AddOrRemoveClassById(`start-hour-${teamId}`, 'custom-border');
    }
    if (!notNull(end_hour)) {
      i -= 1;
      this.AddOrRemoveClassById(`end-hour-${teamId}`, 'custom-border');
    }
    if (!(compareTimes(start_hour, end_hour) <= 0)) {
      i -= 1;
      this.AddOrRemoveClassById(`start-hour-${teamId}`, 'custom-border');
      this.AddOrRemoveClassById(`end-hour-${teamId}`, 'custom-border');
    }
    if (!notNull(presentPersonIds)) {
      i -= 1;
      this.AddOrRemoveClassById(`present-persons-${teamId}`, 'custom-border');
    }

    // if (!notNull(absentPersonIds)) {
    //   i -= 1;
    //   this.AddOrRemoveClassById(`absent-persons-${teamId}`, 'custom-border');
    // }
    // if (!notNull(otherPersons)) {
    //   i -= 1;
    //   this.AddOrRemoveClassById(`other_persons-${teamId}`, 'custom-border');
    // }
    if (!notNull(agenda)) {
      i -= 1;
      this.AddOrRemoveClassById(`agenda-${teamId}`, 'custom-border');
    }
    if (!notNull(discussion_topics)) {
      i -= 1;
      this.AddOrRemoveClassById(`discussion-topics-${teamId}`, 'custom-border');
    }
    if (!notNull(next_steps)) {
      i -= 1;
      this.AddOrRemoveClassById(`next-steps-${teamId}`, 'custom-border');
    }
    if (!notNull(recommandations)) {
      i -= 1;
      this.AddOrRemoveClassById(`recommandations-${teamId}`, 'custom-border');
    }
    

    if (i == 1) {
      const id = this.ViewedReport[teamId]?.id;
      const data: MeetingReport = {
        id: id,
        title: title,
        date: date,
        start_hour: start_hour,
        end_hour: end_hour,
        team: teamId,
        present_persons_ids: presentPersonIds,
        absent_persons_ids : absentPersonIds,
        other_persons: otherPersons,
        agenda: agenda,
        discussion_topics: discussion_topics,
        next_steps: next_steps,
        recommandations:recommandations,
        doNotUpdate: doNotUpdate
      };

      if (data) {
        this.sync.SaveOrUpdateReport(data).subscribe(async (_c$: { status: number, data: MeetingReport[] | string }) => {
          if (_c$.status == 200) {
            this.AllReports$ = _c$.data as MeetingReport[];
            this.generateReport();
            this.cancelReportAction(event, teamId);
          }
        }, (err: any) => { });
      }
    }
  }

  compareTime(teamId: number) {
    const start_hour = this.getValue(`start-hour-${teamId}`);
    const end_hour = this.getValue(`end-hour-${teamId}`);
    if (notNull(start_hour) && notNull(end_hour)) {
      const isOk = compareTimes(start_hour, end_hour) <= 0;
      this.AddOrRemoveClassById(`start-hour-${teamId}`, 'custom-border', isOk);
      this.AddOrRemoveClassById(`end-hour-${teamId}`, 'custom-border', isOk);
    }
  }

  removeErrorClass(id: string) {
    this.AddOrRemoveClassById(id, 'custom-border', true);
  }

  deleteReport(event: Event, teamId: number) {
    event.preventDefault();
    if (this.ViewedReport && this.ViewedReport[teamId]?.id) {
      this.sync.DeleteReport(this.ViewedReport[teamId]?.id!).subscribe(async (_c$: { status: number, data: any }) => {
        if (_c$.status == 200) {
          this.AllReports$ = this.AllReports$.filter(p => p.id !== this.ViewedReport[teamId]?.id);
          this.generateReport();
          this.cancelReportAction(event, teamId);
        }
      }, (err: any) => { });
    }
  }

  cancelReportAction(event: Event, teamId: number) {
    this.setValue(`title-${teamId}`, '');
    this.setValue(`date-${teamId}`, '');
    this.setValue(`start-hour-${teamId}`, '');
    this.setValue(`end-hour-${teamId}`, '');
    this.setValue(`agenda-${teamId}`, '');
    this.setValue(`other_persons-${teamId}`, '');
    this.setValue(`discussion-topics-${teamId}`, '');
    this.setValue(`next-steps-${teamId}`, '');
    this.setValue(`recommandations-${teamId}`, '');
    this.PresentPersonsList[teamId] = [];
    this.AbsentPersonsList[teamId] = [];
    this.ViewedReport[teamId] = undefined;
    this.EditReportView[teamId] = undefined;
  }

  TeamAction(event: Event) {
    event.preventDefault();
    this.IsTeamAction = !this.IsTeamAction;
  }


  MonthName(arg: any, lang: 'fr' | 'en' = 'fr') {
    const m = monthByArg(arg);
    return lang == 'fr' ? m.labelFR : m.labelEN
  }

  SaveOrUpdatePerson(event: Event, teamId: number) {
    event.preventDefault();
    const newPerson: Person = {
      // id: notNull(this.SelectedPerson?.id) ? this.SelectedPerson?.id! : this.getNextKey(teamId),
      id: this.SelectedPerson?.id,
      name: this.getValue(`person-name-${teamId}`),
      email: this.getValue(`person-email-${teamId}`),
    };
    // const psn = this.Person$.find((p) => (p.id == newPerson.id && p.teamId == teamId));
    // if (psn) {
    //   const index = this.Person$.findIndex(p => (p.id == newPerson.id && p.teamId == teamId));
    //   if (index !== -1) this.Person$[index] = { ...this.Person$[index], ...newPerson };
    // } else {
    //   this.Person$ = [...this.Person$, newPerson];
    // }

    this.sync.SaveOrUpdatePerson(newPerson).subscribe((_res$: { status: number, data: Person | string }) => {
      if (_res$.status == 200) {
        this.GetPerson();
        // this.Person$.push((_res$.data as Person));
        // this.Person$ = this.Person$.sort((a, b) => a.name.localeCompare(b.name));
        this.cancelPersonAction(event, teamId);
      }
    }, (err: any) => { });


  }

  SaveOrUpdateTeam(event: Event) {
    event.preventDefault();
    const newTeam: Team = {
      id: this.TeamToUpdateId,
      name: this.getValue(`team-name`),
      show: true,
    };

    this.sync.SaveOrUpdateTeam(newTeam).subscribe((_res$: { status: number, data: Team | string }) => {
      if (_res$.status == 200) {
        const data = _res$.data as Team;
        if (this.TeamToUpdateId) {
          const Teams = this.Team$.filter((a, b) => a.id != this.TeamToUpdateId);
          this.Team$ = [...Teams, data].sort((a, b) => a.name.localeCompare(b.name));
        } else {
          this.Team$.push(data);
          this.Team$ = this.Team$.sort((a, b) => a.name.localeCompare(b.name));
        }
        console.log(_res$.data)
        // this.SelectedTeam!.show = true;
        this.cancelTeamAction(event);
      }
    }, (err: any) => { });
  }

  getNextKey(teamId: number): number {
    const keys: number[] = this.Person$.map(p => p.id).filter(id => id !== undefined) as number[];
    if (keys.length > 0) return Math.max(...keys) + 1;
    return 1;
  }

  selectPersonToWork(event: Event, person: Person, teamId: number) {
    event.preventDefault();
    if (person) {
      this.SelectedPerson = person;
      this.setValue(`person-name-${teamId}`, person.name ?? '');
      this.setValue(`person-email-${teamId}`, person.email ?? '');
    }
  }

  deletePerson(event: Event, teamId: number) {
    event.preventDefault();
    if (this.SelectedPerson && this.SelectedPerson.id) {
      this.sync.DeletePerson(this.SelectedPerson.id).subscribe(async (_c$: { status: number, data: any }) => {
        if (_c$.status == 200) {
          this.Person$ = this.Person$.filter(p => p.id !== this.SelectedPerson!.id);
          this.cancelPersonAction(event, teamId);
        }
      }, (err: any) => { });
    }
  }

  deleteTeam(event: Event) {
    event.preventDefault();
    if (this.SelectedTeam && this.SelectedTeam.id) {
      this.sync.DeleteTeam(this.SelectedTeam.id).subscribe(async (_c$: { status: number, data: any }) => {
        if (_c$.status == 200) {
          this.SelectedTeam!.show = false;
          this.cancelTeamAction(event);
        }
      }, (err: any) => { });
    }
  }

  personInputIsNotEmpty(teamId: number): boolean {
    this.setSearchPerson(teamId);
    return notNull(this.getValue(`person-name-${teamId}`));
  }

  setSearchPerson(teamId: number) {
    const name = this.getValue(`person-name-${teamId}`);
    const email = this.getValue(`person-email-${teamId}`);
    this.SearchedPerson$ = !(notNull(name) || notNull(email)) ? this.Person$ : this.Person$.filter(p => notNull(name) && p.name.includes(name) || p.email && notNull(email) && p.email.includes(email));
  }

  cancelPersonAction(event: Event, teamId: number) {
    event.preventDefault();
    this.SelectedPerson = undefined;
    this.setValue(`person-name-${teamId}`, '');
    this.setValue(`person-email-${teamId}`, '');
    this.setSearchPerson(teamId);
  }

  cancelTeamAction(event: Event) {
    event.preventDefault();
    this.setValue(`team-name`, '');
    this.IsTeamAction = false;
    this.TeamToUpdateId = undefined;
  }

  getValue(inputId: string): any {
    const elem = (document.getElementById(inputId) as HTMLInputElement);
    return elem ? elem.value : undefined;
  }

  setValue(inputId: string, value: any) {
    const elem = (document.getElementById(inputId) as HTMLInputElement);
    if (elem) elem.value = value;
  }

  presentPerson(event: Event, psn: Person, teamId: number) {
    event.preventDefault();
    if (this.CanUpdateReport(teamId)) {
      if (this.PersonIsSelected(psn, teamId, true)) {
        this.AbsentPersonsList[teamId] = this.AbsentPersonsList[teamId].filter(p => p.id !== psn.id);
      }
      var ppft:Person[] = this.PresentPersonsList[teamId];
      if (this.PersonIsSelected(psn, teamId)) {
        this.PresentPersonsList[teamId] = ppft && ppft.filter(p => p.id !== psn.id);
      } else {
        this.PresentPersonsList[teamId] = ppft && ppft.length > 0 ? [...ppft, psn] : [psn];
      }
      //ppft = this.PresentPersonsList[teamId];
      //if (ppft) this.AddOrRemoveClassById(`present-persons-${teamId}`, 'custom-border', ppft.length > 0);
    }
  }

  absentPerson(event: Event,psn: Person, teamId: number) {
    event.preventDefault();
    if (this.CanUpdateReport(teamId)) {
      if (this.PersonIsSelected(psn, teamId)) {
        this.PresentPersonsList[teamId] = this.PresentPersonsList[teamId].filter(p => p.id !== psn.id);
      }
      var apft:Person[] = this.AbsentPersonsList[teamId];
      if (this.PersonIsSelected(psn, teamId, true)) {
        this.AbsentPersonsList[teamId] = apft && apft.filter(p => p.id !== psn.id);
      } else {
          this.AbsentPersonsList[teamId] = apft && apft.length > 0 ? [...apft, psn] : [psn];
      }
      //apft = this.AbsentPersonsList[teamId];
      //if (apft) this.AddOrRemoveClassById(`absent-persons-${teamId}`, 'custom-border', apft.length > 0);
    }
  }


  PersonIsSelected(pn: Person, teamId: number, isAbsent:boolean = false): boolean {
    const tp = (isAbsent ? this.AbsentPersonsList : this.PresentPersonsList)[teamId];
    return tp ? tp.some(p => p.id === pn.id) : false;
  }

  ClickedIndex(team: Team) {
    this.SelectedTeam = team;
    if (this.IsTeamAction && this.TeamToUpdateId && this.SelectedTeam && this.SelectedTeam.id && this.SelectedTeam.id !== this.TeamToUpdateId) {
      this.setValue(`team-name`, '');
      this.IsTeamAction = false;
      this.TeamToUpdateId = undefined;
    }
    this.GetReports();
  }

  textAreaToString(value:string|undefined):string{
    if(value) return value.replace(/\n/g, '<br>');
    return '';
  }


  GetSeletedPersonName(p: Person, teamId: number, i: number, l: number) {
    return p ? `${p.name}${i != l - 1 ? '&nbsp;&nbsp;|&nbsp;&nbsp;' : ''}` : '';
  }

  GetPersonName(p: Person, tId: number) {
    return p ? `${p.name}` : '';
  }

  onMouseDown(event: Event, team: Team): void {
    this.pressTimer = setTimeout(() => {
      this.onLongPress(team);
    }, 800); // Adjust the duration for your long press
  }

  onMouseUp(): void {
    clearTimeout(this.pressTimer);
  }

  onMouseLeave(): void {
    clearTimeout(this.pressTimer);
  }

  onLongPress(team: Team): void {
    this.IsTeamAction = true;
    this.TeamToUpdateId = team.id;
    setTimeout(() => {
      this.setValue(`team-name`, team.name);
    }, 10);
  }

  ObjectKeys(obj: any, sort: 'asc' | 'desc' = 'desc'): number[] {
    if (obj && notNull(obj)) {
      return Object.keys(obj).map(Number).sort((a, b) => {
        return sort === 'asc' ? a - b : b - a;
      });
    }
    return [];
  }

  toggleVisibility(arg0: number, arg1?: number, arg2?: number, arg3?: number): void {
    var key = `${arg0}`;
    if (arg1) key += `-${arg1}`;
    if (arg2) key += `-${arg2}`;
    if (arg3) key += `-${arg3}`;
    this.visibleItems[key] = !this.visibleItems[key];
  }

  isYearVisible(year: number): boolean {
    return this.visibleItems[`${year}`] ?? false;
  }

  isMonthVisible(year: number, month: number): boolean {
    return this.visibleItems[`${year}-${month}`] ?? false;
  }

  isDayVisible(year: number, month: number, day: number): boolean {
    return this.visibleItems[`${year}-${month}-${day}`] ?? false;
  }

  isHourVisible(year: number, month: number, day: number, hour: number): boolean {
    // return this.visibleItems[`${year}-${month}-${day}-${hour}`] ?? false;
    return true;
  }

  AddOrRemoveClassById(elementId: string, className: string, remove: boolean = false) {
    const element = this.el.nativeElement.querySelector(`#${elementId}`);
    if (element && !remove) this.renderer.addClass(element, className);
    if (element && remove) this.renderer.removeClass(element, className);
  }

  GetSelectedPersonList(teamId: number, isAbsent:boolean = false): Person[] {
    const tp = (isAbsent ? this.AbsentPersonsList : this.PresentPersonsList)[teamId];
    if (tp && tp.length > 0) {
      return tp;
    }
    return [];
  }

  SelectedReportExist(teamId: number) {
    return this.ViewedReport[teamId] && this.ViewedReport[teamId]?.id;
  }
  CanUpdateReport(teamId: number): boolean {
    if (this.ViewedReport[teamId]) {
      return this.ViewedReport[teamId]?.doNotUpdate == false
    }
    return true;
  }

  csv(id: string) {
    table2csv('data2csv', ',', id);
  }

  excel(id: string) {
    table2excel('data2excel', id);
  }

  pdf(id: string) {
    table2pdf('data2pdf', 'l', id);
  }

  json(id: string) {
    table2json('data2json', id)
  }

  print(id: string) {
    printTable('data2print', id);
  }



  // updateOrAddObject<T>(array: T[], newObj: T, key: keyof T): T[] {
  //   const index = array.findIndex(item => item[key] === newObj[key]);
  //   if (index !== -1) {
  //     const updatedArray = [...array];
  //     updatedArray[index] = { ...updatedArray[index], ...newObj };
  //     return updatedArray;
  //   }
  //   return [...array, newObj];
  // }
}
