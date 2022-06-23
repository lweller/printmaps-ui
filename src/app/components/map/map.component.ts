import {AfterViewInit, Component, EventEmitter, Input, Output} from "@angular/core";
import {Geodesic} from "geographiclib";
import * as L from "leaflet";
import "@lweller/leaflet-areaselect";
import {isEqual} from "lodash";
import {combineLatest, fromEvent, merge, of, ReplaySubject, Subject, Subscription} from "rxjs";
import {
    bufferCount,
    distinctUntilChanged,
    filter,
    finalize,
    map,
    skip,
    switchMap,
    takeUntil,
    tap
} from "rxjs/operators";
import {Subjectize} from "subjectize";
import {gpx} from "@mapbox/leaflet-omnivore";
import {GpxTrack} from "./map.component.model";

@Component({
    selector: "app-map",
    template: "<div id=\"map\"></div>",
    styles: ["#map { height: 100%;    width: 100%;}"]
})
export class MapComponent implements AfterViewInit {

    @Input() centerCoordinates: L.LatLng;
    @Output() centerCoordinatesChange = new EventEmitter<L.LatLng>();
    @Input() enableAreaSelection: boolean;
    @Input() selectedArea: L.Dimension;
    @Output() selectedAreaChange = new EventEmitter<L.Dimension>();
    @Input() reductionFactor: number;

    @Subjectize("centerCoordinates") private centerCoordinates$ = new ReplaySubject<L.LatLng>(1);
    @Subjectize("enableAreaSelection") private enableAreaSelection$ = new ReplaySubject(1);
    @Subjectize("selectedArea") private selectedArea$ = new ReplaySubject<L.Dimension>(1);
    @Subjectize("reductionFactor") private reductionFactor$ = new ReplaySubject<number>(1);

    private mapHandler: L.Map;
    private gpxTrackHandlerByElementId: Map<string, any> = new Map<string, any>();
    private gpxTrackLastUpdateByElementId: Map<string, number> = new Map<string, number>();

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

    private static addOsmLayer(mapHandler: L.Map) {
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors |" +
                    " Rendering powered by <a href=\"http://printmaps-osm.de\">printmaps-osm.de (Klaus Tockloth)</a>"
            }
        ).addTo(mapHandler);
    }

    private static convertRealWidthToPixels(mapHandler: L.Map, realWidthInM: number): number {
        let center = mapHandler.getCenter();
        let west = MapComponent.moveCoordinate(center, realWidthInM / 2, 90);
        let east = MapComponent.moveCoordinate(center, realWidthInM / 2, 270);
        return Math.floor(Math.abs(mapHandler.project(west).x - mapHandler.project(east).x));
    }

    private static convertRealHeightToPixels(mapHandler: L.Map, realHeightInM: number): number {
        let center = mapHandler.getCenter();
        let north = MapComponent.moveCoordinate(center, realHeightInM / 2, 0);
        let south = MapComponent.moveCoordinate(center, realHeightInM / 2, 180);
        return Math.floor(Math.abs(mapHandler.project(north).y - mapHandler.project(south).y));
    }

    private static moveCoordinate(origin: L.LatLng, distanceInM: number, azimuth: number): L.LatLng {
        // noinspection TypeScriptValidateJSTypes
        let result = Geodesic.WGS84.Direct(origin.lat, origin.lng, azimuth, distanceInM);
        return L.latLng(result.lat2, result.lon2);
    }

    private static convertPixelWidthToRealLength(mapHandler: L.Map, widthInPixel: number): number {
        let centerInPixel = mapHandler.project(mapHandler.getCenter());
        let halfWidth = widthInPixel / 2;
        let west = mapHandler.unproject(L.point(centerInPixel.x - halfWidth, centerInPixel.y));
        let east = mapHandler.unproject(L.point(centerInPixel.x + halfWidth, centerInPixel.y));
        return Geodesic.WGS84.Inverse(west.lat, west.lng, east.lat, east.lng).s12;
    }

    private static convertPixelHeightToRealLength(mapHandler: L.Map, heightInPixel: number): number {
        let centerInPixel = mapHandler.project(mapHandler.getCenter());
        let halfHeight = heightInPixel / 2;
        let south = mapHandler.unproject(L.point(centerInPixel.x, centerInPixel.y - halfHeight));
        let north = mapHandler.unproject(L.point(centerInPixel.x, centerInPixel.y + halfHeight));
        return Geodesic.WGS84.Inverse(south.lat, south.lng, north.lat, north.lng).s12;
    }

    ngAfterViewInit() {
        let mapHandler = L.map("map", {zoom: 12});
        MapComponent.addOsmLayer(mapHandler);

        let areaSelectHandler;
        let areaSelectHandlerSubscriptions = [];
        this.enableAreaSelection$.subscribe(enableAreaSelection => {
            if (enableAreaSelection) {
                if (!areaSelectHandler) {
                    areaSelectHandler = L.areaSelect({keepAspectRatio: true});
                    areaSelectHandler.addTo(mapHandler);
                    areaSelectHandlerSubscriptions = this.handleSelectedAreaUpdate(mapHandler, areaSelectHandler);
                }
            } else {
                if (areaSelectHandler) {
                    areaSelectHandler.remove();
                }
                for (let areaSelectHandlerSubscription of areaSelectHandlerSubscriptions) {
                    areaSelectHandlerSubscription.unsubscribe();
                }
                areaSelectHandler = undefined;
                areaSelectHandlerSubscriptions = [];
            }
        });

        this.handleCenterCoordinatesUpdate(mapHandler);
        this.mapHandler = mapHandler;
    }

    private handleCenterCoordinatesUpdate(mapHandler: L.Map) {
        let endSyncModelToMap = new Subject();
        let startSyncModelToMap = new Subject();
        this.syncModelToMap(mapHandler, startSyncModelToMap, endSyncModelToMap);
        this.syncMapToModel(mapHandler, startSyncModelToMap, endSyncModelToMap);
    }

    private syncModelToMap(mapHandler: L.Map, startSyncModelToMap: Subject<any>, endSyncModelToMap: Subject<any>) {
        startSyncModelToMap
            .pipe(switchMap(() => this.centerCoordinates$
                    .pipe(
                        skip(1),
                        takeUntil(endSyncModelToMap),
                        distinctUntilChanged((previousValue, nextValue) =>
                            isEqual(previousValue, nextValue))
                    )
                )
            )
            .subscribe(nextMapCenter => mapHandler.panTo(nextMapCenter, {noMoveStart: true}));
        startSyncModelToMap.next();
        this.centerCoordinates$.next(this.centerCoordinates);
    }

    private syncMapToModel(mapHandler: L.Map, startSyncModelToMap: Subject<any>, endSyncModelToMap: Subject<any>) {
        fromEvent(mapHandler, "movestart")
            .pipe(
                tap(() => endSyncModelToMap.next()),
                switchMap(() => fromEvent(mapHandler, "move")
                    .pipe(
                        takeUntil(fromEvent(mapHandler, "moveend").pipe(bufferCount(1))),
                        finalize(() => startSyncModelToMap.next())
                    )
                ),
                map(event => (event as L.LeafletEvent).target.getCenter())
            )
            .subscribe(nextCenterCoordinates => {
                if (!isEqual(this.centerCoordinates, nextCenterCoordinates)) {
                    this.centerCoordinates = nextCenterCoordinates;
                    this.centerCoordinatesChange.emit(nextCenterCoordinates);
                }
            });
    }

    private handleSelectedAreaUpdate(mapHandler: L.Map, areaSelectHandler: L.AreaSelect): Subscription[] {
        return [
            this.syncModelToAreaSelect(mapHandler, areaSelectHandler),
            this.syncAreaSelectToModel(areaSelectHandler, mapHandler)
        ];
    }

    private syncAreaSelectToModel(areaSelectHandler: L.AreaSelect, mapHandler: L.Map): Subscription {
        return combineLatest([
                this.enableAreaSelection$,
                fromEvent(mapHandler, "move"),
                this.reductionFactor$,
                fromEvent(areaSelectHandler, "resize")
            ]
        )
            .pipe(
                filter(([enableAreaSelection]) => !!enableAreaSelection),
                map(([_, leafletEvent, reductionFactor]) => [
                    leafletEvent,
                    reductionFactor,
                    areaSelectHandler.getDimensions()
                ]),
                map(([leafletEvent, reductionFactor, areaSelectDimensionInPx]) => [
                        {
                            width: MapComponent.convertPixelWidthToRealLength(leafletEvent.target, areaSelectDimensionInPx.width),
                            height: MapComponent.convertPixelHeightToRealLength(leafletEvent.target, areaSelectDimensionInPx.height)
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

    private syncModelToAreaSelect(mapHandler: L.Map, areaSelectHandler: L.AreaSelect): Subscription {
        return combineLatest([
                this.enableAreaSelection$,
                this.selectedArea$,
                merge(of({target: mapHandler}), fromEvent(mapHandler, "move"))
            ]
        )
            .pipe(
                filter(([enableAreaSelection, selectedAreaInM]) => !!enableAreaSelection && !!selectedAreaInM),
                map(([_, selectedAreaInM, leafletEvent]) => [selectedAreaInM, leafletEvent]),
                map(
                    ([selectedAreaInM, leafletEvent]) => ({
                        width: MapComponent.convertRealWidthToPixels(leafletEvent.target, selectedAreaInM.width),
                        height: MapComponent.convertRealHeightToPixels(leafletEvent.target, selectedAreaInM.height)
                    })
                )
            )
            .subscribe(nextAreaSelectDimensionInPx => areaSelectHandler.setDimensions(nextAreaSelectDimensionInPx));
    }
}