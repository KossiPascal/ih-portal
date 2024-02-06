import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { SyncService } from '@ih-app/services/sync.service';
import { monthByArg, notNull } from '@ih-app/shared/functions';
import { AuthService } from '@ih-app/services/auth.service';
import { Roles } from '@ih-app/models/Roles';
import { MeetingReport, Person, Team } from '@ih-src/app/models/DataAggragate';
import { User } from '@ih-src/app/models/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meeting-report',
  templateUrl: `./guest_meeting_report.component.html`,
  styleUrls: [
    './guest_meeting_report.component.css'
  ]
})
export class GuestMeetingReportComponent implements OnInit {

  constructor(private auth: AuthService, private sync: SyncService) {
  }

  public roles = new Roles(this.auth);

  GuestTeam!: Team;
  visibleItems: { [key: string]: boolean } = {};

  hasTeamPageAccess(teamId: number):boolean{
    return this.roles.getMeetingReport().includes(`${teamId}`);
  }


  currentUser:User | null | undefined;

  Team$: Team[] = [];
  SelectedTeam: Team | undefined;

  Person$: Person[] = [];
  SearchedPerson$: Person[] = [];

  PresentPersonsList: { [team: number]: Person[] } = {};
  AbsentPersonsList: { [team: number]: Person[] } = {};
  SelectedPerson: Person | undefined;

  AllReports$: MeetingReport[] = [];
  Report$: { [team: number]: { [year: number]: { [month: number]: { [day: number]: { [index: number]: { report: MeetingReport, hour: string } } } } } } = {};
  ViewedReport: { [team: number]: MeetingReport | undefined } = {};


  ngOnInit(): void {
    this.currentUser = this.auth.currentUser();
    this.GetPerson();
    this.GetTeamById();
    this.GetReports();
  }

  showEdit(teamId: number, field:'Input'|'span' = 'Input'):boolean{
    return true;
  }

  editReport(event: Event, teamId: number){
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

  GetTeamById() {
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


  MonthName(arg: any, lang: 'fr' | 'en' = 'fr') {
    const m = monthByArg(arg);
    return lang == 'fr' ? m.labelFR : m.labelEN
  }


  selectPersonToWork(event: Event, person: Person, teamId: number) {
    event.preventDefault();
    if (person) {
      this.SelectedPerson = person;
      this.setValue(`person-name-${teamId}`, person.name ?? '');
      this.setValue(`person-email-${teamId}`, person.email ?? '');
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

  getValue(inputId: string): any {
    const elem = (document.getElementById(inputId) as HTMLInputElement);
    return elem ? elem.value : undefined;
  }

  setValue(inputId: string, value: any) {
    const elem = (document.getElementById(inputId) as HTMLInputElement);
    if (elem) elem.value = value;
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
    return true;
  }

  GetSelectedPersonList(teamId: number, isAbsent:boolean = false): Person[] {
    const tp = (isAbsent ? this.AbsentPersonsList : this.PresentPersonsList)[teamId];
    if (tp && tp.length > 0) {
      return tp;
    }
    return [];
  }


}
