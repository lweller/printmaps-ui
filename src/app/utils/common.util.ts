import {KeyValue} from "@angular/common";

export interface Ordered {
    order: number
}

export function order<Key, Value extends Ordered>(entry1: KeyValue<Key, Value>, entry2: KeyValue<Key, Value>): number {
    return entry1.value.order - entry2.value.order;
}