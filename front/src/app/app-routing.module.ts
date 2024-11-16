import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { authGuard } from "./auth.guard";

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
import { ForgottenPasswordComponent } from "./views/auth/forgotten-password/forgotten-password.component";
import { ForgottenPasswordChangeComponent } from "./views/auth/forgotten-password-change/forgotten-password-change.component";

// no layouts views
import { IndexComponent } from "./views/index/index.component";
import { LandingComponent } from "./views/landing/landing.component";
import { ProfileComponent } from "./views/profile/profile.component";
import { ProfileSettingsComponent } from "./views/profile-settings/profile-settings.component";
import { AdvertisementComponent } from "./views/advertisement/advertisement.component";
import { JobListingComponent } from "./views/job-listing/job-listing.component";
import { SingleJobLongComponent } from "./views/single-job-long/single-job-long.component";
import { CategoriesChoiceComponent } from "./views/categories-choice/categories-choice.component";
import { CalendarComponent } from "./components/calendar/calendar.component";
import { JobSettingsComponent } from "./views/job-settings/job-settings.component";
import { JobCardsComponent } from "./views/job-cards/job-cards.component";

const routes: Routes = [
  // admin views
  {
    path: "admin",
    component: AdminComponent,
    children: [
      { path: "dashboard", component: DashboardComponent },
      { path: "settings", component: SettingsComponent },
      { path: "tables", component: TablesComponent },
      { path: "maps", component: MapsComponent },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },
  // auth views
  {
    path: "autentikacija",
    component: AuthComponent,
    children: [
      { path: "prijava", component: LoginComponent },
      { path: "registracija", component: RegisterComponent },
      { path: "zaboravljena_lozinka", component: ForgottenPasswordComponent },
      { path: 'promena_zaboravljene_lozinke/:reset_token', component: ForgottenPasswordChangeComponent },
      { path: "", redirectTo: "prijava", pathMatch: "full" },
      //{ path: "dodaj_oglas", component: AdvertisementComponent },

    ],
  },
  // no layout views
  { path: "kalendar", component: CalendarComponent },
  { path: "profil/:id", component: ProfileComponent },
  { path: "podesavanje_profila", component: ProfileSettingsComponent, canActivate: [authGuard] },
  { path: "podesavanje_oglasa/:jobId", component: JobSettingsComponent, canActivate: [authGuard] },
  { path: "pocetna", component: LandingComponent },
  { path: "oglasi", component: JobListingComponent, canActivate: [authGuard] },
  // { path: "oglasi/:id", component: JobListingComponent, canActivate: [authGuard]},
  { path: "izbor-kategorije", component: CategoriesChoiceComponent },
  { path: "dodaj_oglas", component: AdvertisementComponent, canActivate: [authGuard] },
  { path: 'oglasi/:id', component: SingleJobLongComponent },
  { path: 'oglasi/:idKorisnik', component: SingleJobLongComponent },
  { path: 'kategorija/:idK', component: JobCardsComponent },
  // { path: "", component: IndexComponent },
  { path: "", component: AuthComponent, children: [{ path: "", component: LoginComponent }] },
  { path: "**", redirectTo: "", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
