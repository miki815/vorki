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
import { AdvertisementComponent } from "./views/auth/advertisement/advertisement.component";
import { JobListingComponent } from "./views/job-listing/job-listing.component";
import { SingleJobLongComponent } from "./views/single-job-long/single-job-long.component";
import { CategoriesChoiceComponent } from "./views/categories-choice/categories-choice.component";

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
    path: "auth",
    component: AuthComponent,
    children: [
      { path: "login", component: LoginComponent },
      { path: "register", component: RegisterComponent },
      { path: "dodaj_oglas", component: AdvertisementComponent },
      { path: "zaboravljena_lozinka", component: ForgottenPasswordComponent },
      { path: 'promena_zaboravljene_lozinke/:reset_token', component: ForgottenPasswordChangeComponent },
      { path: "", redirectTo: "login", pathMatch: "full" },
    ],
  },
  // no layout views
  { path: "profile/:id", component: ProfileComponent },
  { path: "profiles", component: ProfileSettingsComponent, canActivate: [authGuard]},
  { path: "landing", component: LandingComponent, canActivate: [authGuard]},
  { path: "oglasi", component: JobListingComponent, canActivate: [authGuard]},
  { path: "izbor-kategorije", component: CategoriesChoiceComponent },
  { path: 'oglasi/:id', component: SingleJobLongComponent },
  { path: "", component: IndexComponent },
  { path: "**", redirectTo: "", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
