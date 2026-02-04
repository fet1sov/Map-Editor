export interface GameObject {
    name: string,
    asset: string,
    x: number,
    y: number,
    z?: number,
    attributes: Map<string, any>
}