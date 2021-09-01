export interface IRgbColor {
    r: number;
    g: number;
    b: number;
}

export interface IHSLColor {
    h: number;
    s: number;
    l: number;
}

export interface IColorDescriptor {
    name?: string;
    S?: number;
    L?: number;
    transparent?: boolean;
    isStrict?: boolean;
    callback?: (baseColor: IHSLColor, variableName: string) => IHSLColor;
}
