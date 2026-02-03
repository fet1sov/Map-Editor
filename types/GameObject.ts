export interface GameObject {
    id: string,
    asset: string,
    x: number,
    y: number,
    z?: number,
    attributes: Map<string, any>
}