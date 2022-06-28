import {cloneDeep, isEqual} from "lodash";

export interface Ordered {
    order: number;
}

export function allValuesOf<T>(enumType: T) {
    return enumType instanceof Object
        ? Object.keys(enumType)
            .filter(key => isNaN(Number(key)))
            .map(key => enumType[key])
        : [];
}

export function compareById<T extends { id: string }>(value1: T, value2: T) {
    return value1.id == value2.id;
}

export function updateListById<T extends { id: string }>(originalList: T[], newList: T[]): T[] {
    return newList?.map(newValue => originalList
            ?.find(originalValue => isEqual(originalValue, newValue))
        ?? cloneDeep(newValue)) ?? [];
}