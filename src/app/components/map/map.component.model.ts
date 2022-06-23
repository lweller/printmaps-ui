export interface GpxTrack {
    readonly id;
    data: string,
    style: GpxTrackStyle,
    lastModified: Date
}

export interface GpxTrackStyle {
    weight: number,
    color: string,
    opacity: number
}