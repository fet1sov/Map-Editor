export interface GameObject {
    id: string,
    x: number,
    y: number,
    z?: number,
    attributes: Map<string, any>
}