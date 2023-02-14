import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptorService } from '@ih-services/auth-interceptor.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@ih-environments/environment';
import { OnlineService } from '@ih-services/detecting-online.service';
import { IndexDbItemListComponent } from './modules/index_db/indexdb_items.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Functions } from './shared/functions';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';


MAT_MOMENT_DATE_FORMATS.parse = {
  dateInput: { month: 'short', year: 'numeric', day: 'numeric', date: 'long' },
}

MAT_MOMENT_DATE_FORMATS.display.dateInput = 'short';
MAT_MOMENT_DATE_FORMATS.display.dateA11yLabel = 'long';
MAT_MOMENT_DATE_FORMATS.display.monthYearA11yLabel = 'long';

// MAT_MOMENT_DATE_FORMATS.display.monthLabel = 'short';
// MAT_MOMENT_DATE_FORMATS.display.monthYearLabel = { month: 'long', year: 'numeric' };


// export const APP_DATE_FORMATS =  
// {
//   parse : {
//     dateInput: { month: 'short', year: 'numeric', day: 'numeric', date: 'long' },
//   },
//   display : {
//     dateInput: { month: 'short', year: 'numeric', day: 'numeric', date: 'short' },
//     // monthLabel:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
//     // monthYearLabel: { month: 'long', year: 'numeric' },
//     // dateA11yLabel: 'numeric',
//     // monthYearA11yLabel: 'numeric',
//   }
// }
export const APP_DATE_FORMATS: MatDateFormats = MAT_MOMENT_DATE_FORMATS;

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(
    httpClient,
    Functions.backenUrl()+'/assets/i18n/',
    '-lang.json'
  );
}

@NgModule({
  declarations: [
    AppComponent,
    IndexDbItemListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    NgMultiSelectDropDownModule.forRoot(),
    
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ServiceWorkerModule.register('/ngsw-worker.js', {
      // enabled: true
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      // registrationStrategy: 'registerWhenStable:30000'
    }),
     FontAwesomeModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    OnlineService,
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

