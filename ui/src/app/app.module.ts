import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { RouterModule } from "@angular/router";
import { MatCheckboxModule } from "@angular/material";
import { MatButtonModule } from "@angular/material";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSliderModule } from "@angular/material/slider";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatMenuModule } from "@angular/material/menu";
import { CdkTableModule } from "@angular/cdk/table";
import { MatRippleModule } from "@angular/material";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatCardModule } from "@angular/material/card";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTabsModule } from "@angular/material/tabs";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatPaginatorModule } from "@angular/material/paginator";
import { AppRoutingModule } from "./app.routing";
import { AppComponent } from "./app.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { LoginFormComponent } from "./users_management/login-form/login-form.component";
import { DatabaseService } from "./services/database.service";
import { DashboardService } from "./services/dashboard.service";

import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { NavbarComponent } from ".//components/navbar/navbar.component";
import { FooterComponent } from "./components/footer/footer.component";
import { API } from "API.conf";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ChartsModule, WavesModule } from "angular-bootstrap-md";
import { AuthInterceptor } from "./services/authconfig.interceptor";
import { UsersModule } from "./users_management/users.module";
import { ButtonsModule, CollapseModule } from "angular-bootstrap-md";
import { Button } from "protractor";
import { HomeManagementComponent } from "./components/home-management/home-management.component";
import { KitchenPopupComponent } from "./components/home-management/kitchenPopup/kitchen-popup.component";
import { MDBBootstrapModule } from "angular-bootstrap-md";
import { NbThemeService } from '@nebular/theme';
import { NbThemeModule } from '@nebular/theme';
import { Ng5SliderModule } from 'ng5-slider';

import { MqttModule, IMqttServiceOptions } from "ngx-mqtt";
import { ThemeModule } from './@theme/theme.module';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbTabsetModule,
  NbUserModule,
  NbRadioModule,
  NbSelectModule,
  NbListModule,
  NbIconModule,
} from '@nebular/theme';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: "167.71.34.169",
  port: 9001,
  path: "/mqtt",
  username: "control",
  password: "password",
};

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    UsersModule,
    ReactiveFormsModule,
    HttpModule,
    FormsModule,
    ThemeModule,
    NbCardModule,
    Ng5SliderModule,
    NbUserModule,
    NbButtonModule,
    NbTabsetModule,
    NbActionsModule,
    NbRadioModule,
    NbSelectModule,
    NbListModule,
    NbIconModule,
    NbButtonModule,
    ButtonsModule,
    CollapseModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    MatButtonModule,
    MatRippleModule,
    MatCheckboxModule,
    MatGridListModule,
    MatInputModule,
    MatIconModule,
    BrowserAnimationsModule,
    FormsModule,
    CdkTableModule,
    MatButtonModule,
    ChartsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    UsersModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    ThemeModule,
    MDBBootstrapModule.forRoot(),
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    HomeManagementComponent,
    KitchenPopupComponent,
  ],
  exports: [FooterComponent, NavbarComponent, SidebarComponent, UsersModule,KitchenPopupComponent],
  entryComponents: [LoginFormComponent, KitchenPopupComponent],
  providers: [
    API,
    DatabaseService,
    DashboardService,
    NbThemeService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
