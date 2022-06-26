import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MapComponent} from "./map.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {AreaSelectMock, BaseHasEventTargetAddRemove, MapHandlerMock} from "./leaflet-fixture";
import {cold} from "jasmine-marbles";
import * as L from "leaflet";
import {shareReplay} from "rxjs/operators";

describe("MapComponent", () => {
    let fixture: ComponentFixture<MapComponent>;
    let component: MapComponent;

    let mapHandler: MapHandlerMock;
    let areaSelect: AreaSelectMock;

    beforeEach(async () => {
        BaseHasEventTargetAddRemove.reset();
        mapHandler = MapHandlerMock.mock();
        areaSelect = AreaSelectMock.mock();
        spyOn(MapComponent, "createMapHandler").and.returnValue(mapHandler);
        spyOn(MapComponent, "createAreaSelect").and.returnValue(areaSelect);
        spyOn(MapComponent, "addOsmLayer");
        await TestBed.configureTestingModule({
            declarations: [MapComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        spyOn(component, "convertRealWidthToPixels").and.callFake(width => width / 10);
        spyOn(component, "convertRealHeightToPixels").and.callFake(height => height / 10);
        spyOn(component, "convertPixelWidthToRealLengthInM").and.callFake(width => width * 10);
        spyOn(component, "convertPixelHeightToRealLengthInM").and.callFake(height => height * 10);
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        mapHandler.destroy();
        areaSelect.destroy();
    });

    it("should be created", () => {
        // given
        spyOn(mapHandler, "panTo");
        let emittedEvents = component.centerCoordinatesChange.pipe(shareReplay(10));
        emittedEvents.subscribe();

        // when
        // component is initialized

        // then
        expect(component).withContext("component").toBeDefined();
        expect(mapHandler.panTo).not.toHaveBeenCalled();
        expect(emittedEvents).withContext("emitted coordinate change events")
            .toBeObservable(cold(""));
    });

    it("should pan to location but not emit any events when center coordinates are set", () => {
        // given
        spyOn(mapHandler, "panTo");
        let emittedEvents = component.centerCoordinatesChange.pipe(shareReplay(10));
        emittedEvents.subscribe();

        // when
        component.centerCoordinates = L.latLng(46.01, 12.01);
        fixture.detectChanges();

        // then
        expect(mapHandler.panTo).toHaveBeenCalledWith(L.latLng(46.01, 12.01), {noMoveStart: true});
        expect(emittedEvents).withContext("emitted coordinate change events")
            .toBeObservable(cold(""));
    });

    it("should stay unchanged when center coordinates are set ot undefined", () => {
        // given
        component.centerCoordinates = L.latLng(46.01, 12.01);
        spyOn(mapHandler, "panTo");
        let emittedEvents = component.centerCoordinatesChange.pipe(shareReplay(10));
        emittedEvents.subscribe();

        // when
        component.centerCoordinates = undefined;
        fixture.detectChanges();

        // then
        expect(mapHandler.panTo).not.toHaveBeenCalled();
        expect(emittedEvents).withContext("emitted coordinate change events")
            .toBeObservable(cold(""));
    });

    it("should update center coordinates when the map is moved around before center coordinates have been initialized", () => {
        // when
        mapHandler.moveMap(L.latLng(46.01, 12.01), L.latLng(46.04, 12.04), 3);
        let emittedEvents = component.centerCoordinatesChange.pipe(shareReplay(10));
        emittedEvents.subscribe();

        // then
        expect(emittedEvents).withContext("emitted coordinate change events")
            .toBeObservable(cold("-abc", {
                a: L.latLng(46.02, 12.02),
                b: L.latLng(46.03, 12.03),
                c: L.latLng(46.04, 12.04)
            }));
    });

    it("should emit center coordinate change events when the map is moved around after center coordinates have been initialized", () => {
        // given
        component.centerCoordinates = L.latLng(46.01, 12.01);
        fixture.detectChanges();
        let emittedEvents = component.centerCoordinatesChange.pipe(shareReplay(10));
        emittedEvents.subscribe();

        // when
        mapHandler.moveMap(L.latLng(46.01, 12.01), L.latLng(46.04, 12.04), 3);

        // then
        expect(emittedEvents).withContext("emitted coordinate change events")
            .toBeObservable(cold("-abc", {
                a: L.latLng(46.02, 12.02),
                b: L.latLng(46.03, 12.03),
                c: L.latLng(46.04, 12.04)
            }));
    });

    it("should not emit center coordinate change events when the map is moved programmatically (i.e. panned to an location) after it has been moved by user", () => {
        // given
        component.centerCoordinates = L.latLng(46.00, 12.00);
        mapHandler.moveMap(L.latLng(46.00, 12.00), L.latLng(46.01, 12.01), 1, true);
        let emittedEvents = component.centerCoordinatesChange.pipe(shareReplay(10));
        emittedEvents.subscribe();

        // when
        BaseHasEventTargetAddRemove.doNext(() => component.centerCoordinates = L.latLng(46.04, 12.04));
        mapHandler.moveMap(L.latLng(46.01, 12.01), L.latLng(46.04, 12.04), 3, false);

        // then
        expect(emittedEvents).withContext("emitted coordinate change events")
            .toBeObservable(cold("-a", {
                a: L.latLng(46.01, 12.01)
            }));
    });

    it("should not add a new area select layer when area selection is enabled but no selected area has been set", () => {
        // when
        component.enableAreaSelection = true;

        // then
        expect(MapComponent.createAreaSelect).not.toHaveBeenCalled();
    });

    it("should add a new area select layer when area selection is enabled after selected area has been set", () => {
        // given
        spyOn(areaSelect, "addTo");

        // when
        component.selectedArea = {width: 2000, height: 3000};
        component.reductionFactor = 25000;
        component.enableAreaSelection = true;

        // then
        expect(MapComponent.createAreaSelect).toHaveBeenCalledOnceWith();
        expect(areaSelect.addTo).toHaveBeenCalledOnceWith(mapHandler);
    });

    it("should add a new area select layer when area selection is enabled an then selected area has been set", () => {
        // given
        spyOn(areaSelect, "addTo");

        // when
        component.enableAreaSelection = true;
        component.selectedArea = {width: 2000, height: 3000};
        component.reductionFactor = 25000;

        // then
        expect(MapComponent.createAreaSelect).toHaveBeenCalledOnceWith();
        expect(areaSelect.addTo).toHaveBeenCalledOnceWith(mapHandler);
    });

    it("should remove area select layer when area selection is disabled", () => {
        // given
        component.enableAreaSelection = true;
        component.selectedArea = {width: 2000, height: 3000};
        component.reductionFactor = 25000;
        spyOn(areaSelect, "remove");

        // when
        component.enableAreaSelection = false;

        // then
        expect(areaSelect.remove).toHaveBeenCalledOnceWith();
    });

    it("should remove area select layer when area selection is set to undefined", () => {
        // given
        component.enableAreaSelection = true;
        component.selectedArea = {width: 2000, height: 3000};
        component.reductionFactor = 25000;
        spyOn(areaSelect, "remove");

        // when
        component.selectedArea = undefined;

        // then
        expect(areaSelect.remove).toHaveBeenCalledOnceWith();
    });

    it("should not update size od selection area when selection area ist set and area selection isn't enabled", () => {
        // given
        component.enableAreaSelection = false;
        component.selectedArea = {width: 2000, height: 3000};
        component.reductionFactor = 25000;
        spyOn(areaSelect, "setDimensions");

        // when
        component.selectedArea = {width: 2500, height: 3500};

        // then
        expect(areaSelect.setDimensions).not.toHaveBeenCalled();
        expect(component.selectedAreaChange).withContext("emitted selected area change events")
            .toBeObservable(cold(""));
    });

    it("should update size of selection area when selection area ist set and area selection is enabled", () => {
        // given
        component.enableAreaSelection = true;
        component.selectedArea = {width: 2000, height: 3000};
        component.reductionFactor = 25000;
        spyOn(areaSelect, "setDimensions");

        // when
        component.selectedArea = {width: 2500, height: 3500};

        // then
        expect(areaSelect.setDimensions).toHaveBeenCalledWith({width: 250, height: 350});
        expect(component.selectedAreaChange).withContext("emitted selected area change events")
            .toBeObservable(cold(""));
    });

    it("should emit selected area change events when the area is resized after selected area and reduction factor have been initialized and selection of area has been enabled", () => {
        // given
        component.enableAreaSelection = true;
        component.selectedArea = {width: 2000, height: 3000};
        component.reductionFactor = 25000;
        let emittedEvents = component.selectedAreaChange.pipe(shareReplay(10));
        emittedEvents.subscribe();

        // when
        areaSelect.resize({width: 200, height: 300}, {width: 230, height: 330}, 3);

        // then
        expect(emittedEvents).withContext("emitted selected area change events")
            .toBeObservable(cold("abc", {
                a: {width: 2100, height: 3100},
                b: {width: 2200, height: 3200},
                c: {width: 2300, height: 3300}
            }));
    });

    it("should not emit any selected area change event when the area is resized but reduction factor has not been initialized", () => {
        // given
        component.enableAreaSelection = true;
        component.selectedArea = {width: 2000, height: 3000};
        let emittedEvents = component.selectedAreaChange.pipe(shareReplay(10));
        emittedEvents.subscribe();

        // when
        areaSelect.resize({width: 200, height: 300}, {width: 230, height: 330}, 3);

        // then
        expect(emittedEvents).withContext("emitted selected area change events")
            .toBeObservable(cold(""));
    });

    it("should not emit any selected area change event when the area is resized but area selection is disabled", () => {
        // given
        component.enableAreaSelection = false;
        component.selectedArea = {width: 2000, height: 3000};
        component.reductionFactor = 25000;
        let emittedEvents = component.selectedAreaChange.pipe(shareReplay(10));
        emittedEvents.subscribe();

        // when
        areaSelect.resize({width: 200, height: 300}, {width: 230, height: 330}, 3);

        // then
        expect(emittedEvents).withContext("emitted selected area change events")
            .toBeObservable(cold(""));
    });
});