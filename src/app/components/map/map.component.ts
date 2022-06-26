import {AfterViewInit, Component, EventEmitter, Input, Output} from "@angular/core";
import {Geodesic} from "geographiclib";
import * as L from "leaflet";
import "@lweller/leaflet-areaselect";
import {isEqual} from "lodash";
import {combineLatest, fromEvent, ReplaySubject, Subject, Subscription} from "rxjs";
import {bufferCount, filter, finalize, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {Subjectize} from "subjectize";
import {gpx} from "@mapbox/leaflet-omnivore";
import {GpxTrack} from "./map.component.model";

@Component({
    selector: "app-map",
    template: "<div id=\"map\"></div>",
    styles: ["#map { height: 100%; width: 100%; min-width: 100px; min-height: 400px}"]
})
export class MapComponent implements AfterViewInit {

    @Input() centerCoordinates: L.LatLng;
    @Input() enableAreaSelection: boolean;
    @Input() selectedArea: L.Dimension;
    @Input() reductionFactor: number;

    @Output() centerCoordinatesChange = new EventEmitter<L.LatLng>();
    @Output() selectedAreaChange = new EventEmitter<L.Dimension>();

    @Subjectize("centerCoordinates") private centerCoordinates$ = new ReplaySubject<L.LatLng>(1);
    @Subjectize("enableAreaSelection") private enableAreaSelection$ = new ReplaySubject<boolean>(1);
    @Subjectize("selectedArea") private selectedArea$ = new ReplaySubject<L.Dimension>(1);
    @Subjectize("reductionFactor") private reductionFactor$ = new ReplaySubject<number>(1);

    private mapHandler: L.Map;
    private gpxTrackHandlerByElementId: Map<string, any> = new Map<string, any>();
    private gpxTrackLastUpdateByElementId: Map<string, number> = new Map<string, number>();

    constructor() {
        this.centerCoordinates$.next();
        this.enableAreaSelection$.next(false);
        this.reductionFactor$.next();
        this.selectedArea$.next();
    }

    @Input() set gpxTracks(gpxTracks: GpxTrack[]) {
        let gpxTrackIdsToRemove = new Set<string>(this.gpxTrackHandlerByElementId.keys());
        gpxTracks.forEach(gpxTrack => {
            if (gpxTrack.data) {
                gpxTrackIdsToRemove.delete(gpxTrack.id);
                let currentGpxTrackHandler = this.gpxTrackHandlerByElementId.get(gpxTrack.id);
                let lastUpdate = this.gpxTrackLastUpdateByElementId.get(gpxTrack.id) ?? new Date().getTime();
                let modified = gpxTrack.lastModified.getTime() > lastUpdate;
                if (currentGpxTrackHandler && modified) {
                    currentGpxTrackHandler.remove();
                }
                if (!currentGpxTrackHandler || modified) {
                    let gpxTrackHandler = gpx.parse(gpxTrack.data);
                    gpxTrackHandler.setStyle(() => gpxTrack.style);
                    gpxTrackHandler.addTo(this.mapHandler);
                    this.gpxTrackHandlerByElementId.set(gpxTrack.id, gpxTrackHandler);
                    this.gpxTrackLastUpdateByElementId.set(gpxTrack.id, gpxTrack.lastModified.getTime());
                } else {
                    currentGpxTrackHandler.setStyle(() => gpxTrack.style);
                }
            }
        });
        gpxTrackIdsToRemove.forEach(id => {
            let gpxHandler = this.gpxTrackHandlerByElementId.get(id);
            if (gpxHandler) {
                gpxHandler.remove();
            }
            this.gpxTrackHandlerByElementId.delete(id);
        });
    }

    static createMapHandler(): L.Map {
        return L.map("map", {zoom: 12});
    }

    static createAreaSelect() {
        return L.areaSelect({keepAspectRatio: true});
    }

    static addOsmLayer(mapHandler: L.Map) {
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors |" +
                    " Rendering powered by <a href=\"http://printmaps-osm.de\">printmaps-osm.de (Klaus Tockloth)</a>"
            }
        ).addTo(mapHandler);
    }

    private static moveCoordinate(origin: L.LatLng, distanceInM: number, azimuth: number): L.LatLng {
        // noinspection TypeScriptValidateJSTypes
        let result = Geodesic.WGS84.Direct(origin.lat, origin.lng, azimuth, distanceInM);
        return L.latLng(result.lat2, result.lon2);
    }

    ngAfterViewInit() {
        this.mapHandler = MapComponent.createMapHandler();
        MapComponent.addOsmLayer(this.mapHandler);

        let areaSelectHandler;
        let areaSelectHandlerSubscriptions = [];
        combineLatest([
            this.enableAreaSelection$,
            this.selectedArea$,
            this.reductionFactor$
        ])
            .subscribe(([enableAreaSelection, selectedArea, reductionFactor]) => {
                if (enableAreaSelection && selectedArea && reductionFactor) {
                    if (!areaSelectHandler) {
                        areaSelectHandler = MapComponent.createAreaSelect();
                        areaSelectHandler.addTo(this.mapHandler);
                        areaSelectHandlerSubscriptions = this.handleSelectedAreaUpdate(areaSelectHandler);
                    }
                } else {
                    if (areaSelectHandler) {
                        areaSelectHandler.remove();
                    }
                    areaSelectHandler = undefined;
                    areaSelectHandlerSubscriptions.forEach(subscription => subscription.unsubscribe());
                    areaSelectHandlerSubscriptions = [];
                }
            });
        this.handleCenterCoordinatesUpdate();
    }

    convertRealWidthToPixels(realWidthInM: number): number {
        let center = this.mapHandler.getCenter();
        let west = MapComponent.moveCoordinate(center, realWidthInM / 2, 90);
        let east = MapComponent.moveCoordinate(center, realWidthInM / 2, 270);
        return Math.floor(Math.abs(this.mapHandler.project(west).x - this.mapHandler.project(east).x));
    }

    convertRealHeightToPixels(realHeightInM: number): number {
        let center = this.mapHandler.getCenter();
        let north = MapComponent.moveCoordinate(center, realHeightInM / 2, 0);
        let south = MapComponent.moveCoordinate(center, realHeightInM / 2, 180);
        return Math.floor(Math.abs(this.mapHandler.project(north).y - this.mapHandler.project(south).y));
    }

    convertPixelWidthToRealLengthInM(widthInPixel: number): number {
        let centerInPixel = this.mapHandler.project(this.mapHandler.getCenter());
        let halfWidth = widthInPixel / 2;
        let west = this.mapHandler.unproject(L.point(centerInPixel.x - halfWidth, centerInPixel.y));
        let east = this.mapHandler.unproject(L.point(centerInPixel.x + halfWidth, centerInPixel.y));
        return Geodesic.WGS84.Inverse(west.lat, west.lng, east.lat, east.lng).s12;
    }

    convertPixelHeightToRealLengthInM(heightInPixel: number): number {
        let centerInPixel = this.mapHandler.project(this.mapHandler.getCenter());
        let halfHeight = heightInPixel / 2;
        let south = this.mapHandler.unproject(L.point(centerInPixel.x, centerInPixel.y - halfHeight));
        let north = this.mapHandler.unproject(L.point(centerInPixel.x, centerInPixel.y + halfHeight));
        return Geodesic.WGS84.Inverse(south.lat, south.lng, north.lat, north.lng).s12;
    }

    private handleCenterCoordinatesUpdate() {
        let endSyncModelToMap = new Subject();
        let startSyncModelToMap = new Subject();
        this.syncModelToMap(startSyncModelToMap, endSyncModelToMap);
        this.syncMapToModel(startSyncModelToMap, endSyncModelToMap);
    }

    private syncModelToMap(startSyncModelToMap: Subject<any>, endSyncModelToMap: Subject<any>) {
        startSyncModelToMap
            .pipe(switchMap(() => this.centerCoordinates$
                    .pipe(
                        filter(nextMapCenter => !!nextMapCenter),
                        takeUntil(endSyncModelToMap)
                    )
                )
            )
            .subscribe(nextMapCenter => this.mapHandler.panTo(nextMapCenter, {noMoveStart: true}));
        startSyncModelToMap.next();
        this.centerCoordinates$.next(this.centerCoordinates);
    }

    private syncMapToModel(startSyncModelToMap: Subject<any>, endSyncModelToMap: Subject<any>) {
        fromEvent(this.mapHandler, "movestart")
            .pipe(
                tap(() => endSyncModelToMap.next()),
                switchMap(() => fromEvent(this.mapHandler, "move")
                    .pipe(
                        takeUntil(fromEvent(this.mapHandler, "moveend").pipe(bufferCount(1))),
                        finalize(() => startSyncModelToMap.next())
                    )
                ),
                map(event => (event as L.LeafletEvent).target.getCenter())
            )
            .subscribe(nextCenterCoordinates => {
                if (!this.centerCoordinates || !isEqual(this.centerCoordinates, nextCenterCoordinates)) {
                    this.centerCoordinates = nextCenterCoordinates;
                    this.centerCoordinatesChange.emit(nextCenterCoordinates);
                }
            });
    }

    private handleSelectedAreaUpdate(areaSelectHandler: L.AreaSelect): Subscription[] {
        return [
            this.syncModelToAreaSelect(areaSelectHandler),
            this.syncAreaSelectToModel(areaSelectHandler)
        ];
    }

    private syncAreaSelectToModel(areaSelectHandler: L.AreaSelect): Subscription {
        return combineLatest([
            this.enableAreaSelection$,
            this.reductionFactor$,
            fromEvent(areaSelectHandler, "resize")
        ])
            .pipe(
                filter(([enableAreaSelection, reductionFactor]) =>
                    !!enableAreaSelection && !!reductionFactor),
                map(([_, reductionFactor, resizeEvent]) => [
                    reductionFactor,
                    (<L.AreaSelect>(<Event>resizeEvent).target).getDimensions()
                ]),
                map(([reductionFactor, areaSelectDimensionInPx]) => [
                        {
                            width: this.convertPixelWidthToRealLengthInM(areaSelectDimensionInPx.width),
                            height: this.convertPixelHeightToRealLengthInM(areaSelectDimensionInPx.height)
                        },
                        areaSelectDimensionInPx,
                        reductionFactor
                    ]
                ),
                filter(([selectedAreaInM, areaSelectDimensionInPx, reductionFactor]) => {
                    let selectedAreaPrecision = reductionFactor / 1000;
                        return (Math.abs(selectedAreaInM.width - this.selectedArea.width) / selectedAreaPrecision >
                                Math.pow(10, Math.ceil(Math.log10(selectedAreaInM.width / selectedAreaPrecision / areaSelectDimensionInPx.width)))) ||
                            (Math.abs(selectedAreaInM.height - this.selectedArea.height) / selectedAreaPrecision >
                                Math.pow(10, Math.ceil(Math.log10(selectedAreaInM.height / selectedAreaPrecision / areaSelectDimensionInPx.height))));
                    }
                ),
                map(([selectedAreaInM]) => selectedAreaInM)
            )
            .subscribe(nextSelectedAreaInM => {
                this.selectedArea = nextSelectedAreaInM;
                this.selectedAreaChange.emit(nextSelectedAreaInM);
            });
    }

    private syncModelToAreaSelect(areaSelectHandler: L.AreaSelect): Subscription {
        return combineLatest([
            this.enableAreaSelection$,
            this.selectedArea$,
            this.reductionFactor$
        ])
            .pipe(
                filter(([enableAreaSelection, selectedAreaInM, reductionFactor]) =>
                    !!enableAreaSelection && !!selectedAreaInM && !!reductionFactor),
                map(([_, selectedAreaInM]) => selectedAreaInM),
                map(selectedAreaInM => ({
                        width: this.convertRealWidthToPixels(selectedAreaInM.width),
                        height: this.convertRealHeightToPixels(selectedAreaInM.height)
                    })
                )
            )
            .subscribe(nextAreaSelectDimensionInPx => areaSelectHandler.setDimensions(nextAreaSelectDimensionInPx));
    }
}