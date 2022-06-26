import {Subject, Subscription} from "rxjs";
import * as L from "leaflet";
import {HasEventTargetAddRemove} from "rxjs/internal/observable/fromEvent";
import {cold} from "jasmine-marbles";
import {round} from "lodash";
import {finalize} from "rxjs/operators";

export class BaseHasEventTargetAddRemove implements HasEventTargetAddRemove<any> {
    private eventEmitters: Map<string, Subject<any>> = new Map();
    private subscriptions: Map<([string, any]), Subscription> = new Map();
    private static emittedEventCount = 0;

    addEventListener(type: string, listener: ((evt: any) => void) | null, _options?: boolean | AddEventListenerOptions): void {
        let eventEmitter = this.eventEmitters.get(type);
        if (!eventEmitter) {
            eventEmitter = new Subject<any>();
            this.eventEmitters.set(type, eventEmitter);
        }
        this.subscriptions.set([type, listener], eventEmitter.subscribe(event => listener(event)));
    }

    removeEventListener(type: string, listener?: ((evt: any) => void) | null, _options?: boolean | EventListenerOptions): void {
        let subscription = this.subscriptions.get([type, listener]);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete([type, listener]);
        }
    }

    destroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        this.eventEmitters = undefined;
        this.subscriptions = undefined;
    }

    emitEvents(events: [string, any][]) {
        // noinspection SpellCheckingInspection
        const VALUES_PLACEHOLDERS = "abcdefghijkl";
        let values: { [k: string]: [string, L.LatLng] } = {};
        VALUES_PLACEHOLDERS.substring(0, events.length)
            .split("")
            .forEach((key, i) => values[key] = events[i]);
        cold("-".repeat(BaseHasEventTargetAddRemove.emittedEventCount) + VALUES_PLACEHOLDERS.substring(0, events.length) + "|", values)
            .subscribe(([type, event]) => this.eventEmitters.get(type)?.next(event));
        BaseHasEventTargetAddRemove.emittedEventCount += events.length;
    }

    static doNext(callback: () => any) {
        cold("-".repeat(this.emittedEventCount++) + "|")
            .pipe(finalize(() => callback())).subscribe();
    }

    static reset() {
        this.emittedEventCount = 0;
    }
}

export class MapHandlerMock extends BaseHasEventTargetAddRemove {

    panTo(_latlng: L.LatLngExpression, _options?: L.PanOptions) {
    }

    moveMap(from: L.LatLng, to: L.LatLng, steps: number, emitmovestart = true) {
        let offsetLng = (to.lng - from.lng) / steps;
        let offsetLat = (to.lat - from.lat) / steps;
        let events: [string, any][] = emitmovestart ? [["movestart", new TestMapEvent(from)]] : [];
        for (let i = 0; i < steps; i++) {
            events.push(["move",
                new TestMapEvent(L.latLng(
                    round(from.lat + offsetLat * (i + 1), 2),
                    round(from.lng + offsetLng * (i + 1), 2)
                ))]);
        }
        events.push(["moveend", new TestMapEvent(to)]);
        this.emitEvents(events);
    }

    static mock(): L.Map {
        return new MapHandlerMock() as L.Map;
    }
}

export class TestMapEvent {
    constructor(private centerCoordinates: L.LatLng) {
    }

    get target() {
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    getCenter() {
        return this.centerCoordinates;
    }
}

export class AreaSelectMock extends BaseHasEventTargetAddRemove {

    resize(from: L.Dimension, to: L.Dimension, steps: number) {
        let offsetWidth = (to.width - from.width) / steps;
        let offsetHeight = (to.height - from.height) / steps;
        let events: [string, any][] = [];
        for (let i = 0; i < steps; i++) {
            events.push(["resize",
                new TestAreaSelectEvent({
                    width: round(from.width + offsetWidth * (i + 1), 2),
                    height: round(from.height + offsetHeight * (i + 1), 2)
                })]);
        }
        this.emitEvents(events);
    }

    addTo(_mapHandler: L.Map) {
    }

    remove() {
    }

    setDimensions(_dimensions: L.Dimension) {
    }

    static mock(): L.Map {
        return new AreaSelectMock() as L.AreaSelect;
    }
}

export class TestAreaSelectEvent {
    constructor(private dimensions: L.Dimension) {
    }

    get target() {
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    getDimensions() {
        return this.dimensions;
    }
}