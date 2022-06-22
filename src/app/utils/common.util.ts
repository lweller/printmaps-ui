import {KeyValue} from "@angular/common";
import {cloneDeep} from "lodash";

export interface Ordered {
    order: number;
}

export function order<Key, Value extends Ordered>(entry1: KeyValue<Key, Value>, entry2: KeyValue<Key, Value>): number {
    return entry1.value.order - entry2.value.order;
}

export function allValuesOf<T>(enumType: T) {
    return Object.keys(enumType)
        .filter(key => isNaN(Number(key)))
        .map(key => enumType[key]);
}

export function compareById<T extends { id: string }>(value1: T, value2: T) {
    return value1.id == value2.id;
}

export function updateListById<T extends { id: string }>(originalList: T[], newList: T[]): T[] {
    return newList?.map(newValue => originalList
            ?.find(originalValue => compareById(originalValue, newValue))
        ?? cloneDeep(newValue)) ?? [];
}