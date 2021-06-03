export const ACTION_TYPE_PREFIX = "@printmaps-ui";

export function createActionType(source: string, id: string, message?: string, level?: string): string {
    return ACTION_TYPE_PREFIX + JSON.stringify({
        source: source,
        id: id,
        message: message,
        level: level
    });
}
