import {registerLocaleData} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import localeEn from "@angular/common/locales/en";
import localeFr from "@angular/common/locales/fr";
import {APP_INITIALIZER, NgModule} from "@angular/core";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {EffectsModule} from "@ngrx/effects";
import {MetaReducer, StoreModule} from "@ngrx/store";
import {MainEffects} from "./effects/main.effects";
import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {
    MapProjectListPaneComponent,
    NonexistentMapProjectEvictionConfirmDialog
} from "./components/map-project-list-pane/map-project-list-pane.component";
import {MapPaneComponent} from "./components/map-pane/map-pane.component";
import {MapComponent} from "./components/map/map.component";
import {CurrentMapProjectPaneComponent} from "./components/current-map-project-pane/current-map-project-pane.component";
import {NumericDirective} from "./directives/numeric.directive";
import {PRINTMAPS_UI_STATE_ID} from "./model/intern/printmaps-ui-state";
import {printmapsUiReducer} from "./reducers/main.reducers";
import {PrintmapsService} from "./services/printmaps.service";
import {MatListModule} from "@angular/material/list";
import {ButtonBoxComponent} from "./components/button-box/button-box.component";
import {MatIconModule} from "@angular/material/icon";
import {MapProjectReferenceService} from "./services/map-project-reference.service";
import {MatDialogModule} from "@angular/material/dialog";
import {ConfigurationService, configurationServiceInitializerFactory} from "./services/configuration.service";

registerLocaleData(localeEn);
registerLocaleData(localeDe);
registerLocaleData(localeFr);

export const metaReducers: MetaReducer[] = [];

@NgModule({
    declarations: [
        NumericDirective,
        AppComponent,
        ButtonBoxComponent,
        MapPaneComponent,
        MapProjectListPaneComponent,
        CurrentMapProjectPaneComponent,
        MapComponent,
        NonexistentMapProjectEvictionConfirmDialog
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
        FlexLayoutModule,
        FormsModule,
        StoreModule.forRoot(
            {
                printmapsUiReducer
            },
            {
                metaReducers: metaReducers,
                runtimeChecks: {
                    strictStateImmutability: true,
                    strictActionImmutability: true,
                    strictStateSerializability: true,
                    strictActionSerializability: true
                }
            }),
        EffectsModule.forRoot([]),
        StoreModule.forFeature(PRINTMAPS_UI_STATE_ID, printmapsUiReducer),
        EffectsModule.forFeature([MainEffects]), MatListModule, MatIconModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: configurationServiceInitializerFactory,
            multi: true,
            deps: [ConfigurationService]
        },
        MapProjectReferenceService,
        PrintmapsService
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}
