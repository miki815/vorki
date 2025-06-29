import { BrowserModule } from "@angular/platform-browser";
import { NgModule, isDevMode } from "@angular/core";
import { NgcCookieConsentModule, NgcCookieConsentConfig } from 'ngx-cookieconsent';


import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";


// layouts
import { AdminComponent } from "./layouts/admin/admin.component";
import { AuthComponent } from "./layouts/auth/auth.component";

// admin views
import { DashboardComponent } from "./views/admin/dashboard/dashboard.component";
import { MapsComponent } from "./views/admin/maps/maps.component";
import { SettingsComponent } from "./views/admin/settings/settings.component";
import { TablesComponent } from "./views/admin/tables/tables.component";

// auth views
import { LoginComponent } from "./views/auth/login/login.component";
import { RegisterComponent } from "./views/auth/register/register.component";

// no layouts views
import { IndexComponent } from "./views/index/index.component";
import { LandingComponent } from "./views/landing/landing.component";
import { ProfileComponent } from "./views/profile/profile.component";

// components for views and layouts

import { AdminNavbarComponent } from "./components/navbars/admin-navbar/admin-navbar.component";
import { AuthNavbarComponent } from "./components/navbars/auth-navbar/auth-navbar.component";
import { CardBarChartComponent } from "./components/cards/card-bar-chart/card-bar-chart.component";
import { CardLineChartComponent } from "./components/cards/card-line-chart/card-line-chart.component";
import { CardPageVisitsComponent } from "./components/cards/card-page-visits/card-page-visits.component";
import { CardProfileComponent } from "./components/cards/card-profile/card-profile.component";
import { CardSettingsComponent } from "./components/cards/card-settings/card-settings.component";
import { CardSocialTrafficComponent } from "./components/cards/card-social-traffic/card-social-traffic.component";
import { CardStatsComponent } from "./components/cards/card-stats/card-stats.component";
import { CardTableComponent } from "./components/cards/card-table/card-table.component";
import { FooterAdminComponent } from "./components/footers/footer-admin/footer-admin.component";
import { FooterComponent } from "./components/footers/footer/footer.component";
import { FooterSmallComponent } from "./components/footers/footer-small/footer-small.component";
import { HeaderStatsComponent } from "./components/headers/header-stats/header-stats.component";
import { IndexNavbarComponent } from "./components/navbars/index-navbar/index-navbar.component";
import { MapExampleComponent } from "./components/maps/map-example/map-example.component";
import { IndexDropdownComponent } from "./components/dropdowns/index-dropdown/index-dropdown.component";
import { TableDropdownComponent } from "./components/dropdowns/table-dropdown/table-dropdown.component";
import { PagesDropdownComponent } from "./components/dropdowns/pages-dropdown/pages-dropdown.component";
import { NotificationDropdownComponent } from "./components/dropdowns/notification-dropdown/notification-dropdown.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { UserDropdownComponent } from "./components/dropdowns/user-dropdown/user-dropdown.component";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { CookieService } from 'ngx-cookie-service';
import { GalleryModule } from 'ng-gallery';
import { ProfileSettingsComponent } from "./views/profile-settings/profile-settings.component";
import { CommonModule } from "@angular/common";
import { AdvertisementComponent } from "./views/advertisement/advertisement.component";
import { MainNavbarComponent } from "./components/navbars/main-navbar/main-navbar.component";
import { SettingsDropdownComponent } from "./components/dropdowns/settings-dropdown/settings-dropdown.component";
import { JobListingComponent } from "./views/job-listing/job-listing.component";
import { SingleJobLongComponent } from "./views/single-job-long/single-job-long.component";
import { SingleJobShortComponent } from "./views/single-job-short/single-job-short.component";
import { CategoriesChoiceComponent } from "./views/categories-choice/categories-choice.component";
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import { ForgottenPasswordComponent } from "./views/auth/forgotten-password/forgotten-password.component";
import { ForgottenPasswordChangeComponent } from "./views/auth/forgotten-password-change/forgotten-password-change.component";
import { ServiceWorkerModule } from '@angular/service-worker';
import { CalendarComponent } from "./components/calendar/calendar.component";
import { RecurrenceEditorModule, ScheduleModule, DayService, WeekService, WorkWeekService, MonthService, MonthAgendaService } from "@syncfusion/ej2-angular-schedule";
import { JobSettingsComponent } from "./views/job-settings/job-settings.component";
import { JobCardsComponent } from "./views/job-cards/job-cards.component";
import { ContactComponent } from "./views/contact/contact.component";
import { CookieBannerComponent } from "./views/cookie-banner/cookie-banner.component";
import { UserJobsComponent } from "./views/user-jobs/user-jobs.component";
import { AdvertisementExchangeComponent } from "./views/advertisement-exchange/advertisement-exchange.component";
import { ExchangeComponent } from "./views/exchange/exchange.component";


const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    // domain: 'vorki.rs'
    domain: ''
  },
  palette: {
    popup: {
      background: '#000'
    },
    button: {
      background: '#f1d600'
    }
  },
  theme: 'classic',
  type: 'opt-in',
  content: {
    message: 'Ova stranica koristi kolačiće za poboljšanje korisničkog iskustva.',
    dismiss: 'U redu',
    deny: 'Odbijam',
    link: 'Saznaj više',
    href: 'https://www.cookiesandyou.com'
  }
};



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CardBarChartComponent,
    CardLineChartComponent,
    IndexDropdownComponent,
    PagesDropdownComponent,
    TableDropdownComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
    SidebarComponent,
    FooterComponent,
    FooterSmallComponent,
    FooterAdminComponent,
    CardPageVisitsComponent,
    CardProfileComponent,
    CardSettingsComponent,
    CardSocialTrafficComponent,
    CardStatsComponent,
    CardTableComponent,
    HeaderStatsComponent,
    MapExampleComponent,
    AuthNavbarComponent,
    AdminNavbarComponent,
    IndexNavbarComponent,
    AdminComponent,
    AuthComponent,
    MapsComponent,
    SettingsComponent,
    TablesComponent,
    LoginComponent,
    RegisterComponent,
    IndexComponent,
    LandingComponent,
    ProfileComponent,
    ProfileSettingsComponent,
    AdvertisementComponent,
    MainNavbarComponent,
    SettingsDropdownComponent,
    JobListingComponent,
    SingleJobShortComponent,
    SingleJobLongComponent,
    CategoriesChoiceComponent,
    ForgottenPasswordComponent,
    ForgottenPasswordChangeComponent,
    CalendarComponent,
    JobSettingsComponent,
    JobCardsComponent,
    ContactComponent,
    CookieBannerComponent,
    UserJobsComponent,
    AdvertisementExchangeComponent,
    ExchangeComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    GalleryModule,
    CommonModule,
    ScheduleModule,
    RecurrenceEditorModule,
    NgcCookieConsentModule.forRoot(cookieConfig),
    // CalendarModule.forRoot({
    //   provide: DateAdapter,
    //   useFactory: adapterFactory,
    // }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: true,
      // enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })

  ]
  ,
  providers: [CookieService,
    DayService, WeekService, WorkWeekService, MonthService, MonthAgendaService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
