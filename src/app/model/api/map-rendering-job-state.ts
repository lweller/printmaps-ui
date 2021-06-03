export interface MapRenderingJobState {
    Data: MapStateData;
}

export interface MapStateData {
    Type: "maps"
    ID: string
    Attributes: MapStateAttributes
}

export interface MapStateAttributes {
    MapMetadataWritten: string,
    MapOrderSubmitted: string,
    MapBuildStarted: string,
    MapBuildCompleted: string,
    MapBuildSuccessful: string,
    MapBuildMessage: string,
    MapBuildBoxMillimeter: BuildBox,
    MapBuildBoxPixel: BuildBox,
    MapBuildBoxProjection: BuildBoxProjection,
    MapBuildBoxWGS84: BuildBoxWGS84
}

export interface BuildBox {
    width: number,
    height: number
}

export interface BuildBoxProjection {
    XMin: number,
    YMin: number,
    XMax: number,
    YMax: number,
}

export interface BuildBoxWGS84 {
    LatMin: number,
    LonMin: number,
    LatMax: number,
    LonMax: number,
}