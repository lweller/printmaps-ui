import {registerLocaleData} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import localeEn from "@angular/common/locales/en";
import localeFr from "@angular/common/locales/fr";
import {APP_INITIALIZER, NgModule} from "@angular/core";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {
    CurrentMapProjectPaneComponent,
    RemoveAttributionConfirmDialog
} from "./components/current-map-project-pane/current-map-project-pane.component";
import {NumericDirective} from "./directives/numeric.directive";
import {printmapsUiReducer} from "./reducers/main.reducers";
import {PrintmapsService} from "./services/printmaps.service";
import {MatListModule} from "@angular/material/list";
import {ButtonBoxComponent} from "./components/button-box/button-box.component";
import {MatIconModule} from "@angular/material/icon";
import {MapProjectReferenceService} from "./services/map-project-reference.service";
import {MatDialogModule} from "@angular/material/dialog";
import {ConfigurationService, configurationServiceInitializerFactory} from "./services/configuration.service";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatMenuModule} from "@angular/material/menu";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatCardModule} from "@angular/material/card";
import {MatTableModule} from "@angular/material/table";
import {FontStyleSelector} from "./components/font-style-selector/font-style-selector.component";
import {LineWidthSelector} from "./components/line-width-selector/line-width-selector.component";
import {ColorSelector} from "./components/color-selector/color-selector.component";
import {ColorSketchModule} from "ngx-color/sketch";
import {OverlayModule} from "@angular/cdk/overlay";
import {PortalModule} from "@angular/cdk/portal";
import {AdditionalElementListComponent} from "./components/additional-element-list/additional-element-list.component";
import {
    AdditionalTextElementDetailComponent
} from "./components/additional-text-element-detail/additional-text-element-detail.component";
import {TextOrientationSelector} from "./components/text-orientation-selector/text-orientation-selector.component";
import {
    AdditionalScaleElementDetailComponent
} from "./components/additional-scale-element-detail/additional-scale-element-detail.component";
import {ScaleService} from "./services/scale.service";
import {
    AdditionalGpxElementDetailComponent
} from "./components/additional-gpx-element-detail/additional-gpx-element-detail.component";
import {MaterialFileInputModule} from "ngx-material-file-input";
import {PRINTMAPS_UI_STATE_ID} from "./selectors/main.selectors";
import {MapProjectConversionService} from "./services/map-project-conversion.service";

registerLocaleData(localeEn);
registerLocaleData(localeDe);
registerLocaleData(localeFr);

export const metaReducers: MetaReducer[] = [];

@NgModule({
    declarations: [
        NumericDirective,
        AppComponent,
        FontStyleSelector,
        LineWidthSelector,
        TextOrientationSelector,
        ColorSelector,
        ButtonBoxComponent,
        MapPaneComponent,
        MapProjectListPaneComponent,
        CurrentMapProjectPaneComponent,
        RemoveAttributionConfirmDialog,
        MapComponent,
        NonexistentMapProjectEvictionConfirmDialog,
        AdditionalElementListComponent,
        AdditionalTextElementDetailComponent,
        AdditionalScaleElementDetailComponent,
        AdditionalGpxElementDetailComponent
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
        EffectsModule.forFeature([MainEffects]), MatListModule, MatIconModule, MatButtonToggleModule, MatMenuModule, MatTooltipModule, MatExpansionModule, MatCardModule, MatTableModule, ReactiveFormsModule, ColorSketchModule, OverlayModule, PortalModule, MaterialFileInputModule],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: configurationServiceInitializerFactory,
            multi: true,
            deps: [ConfigurationService]
        },
        MapProjectConversionService,
        MapProjectReferenceService,
        PrintmapsService,
        ScaleService
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}
