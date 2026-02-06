import type { MapObject } from "./engine/objects/MapObject";

export interface GlobalVars {
    selectedObject: MapObject | undefined
    camera: {
        x: number
        y: number
    }
}

export var GLOBAL_EDITOR_INFO = reactive<GlobalVars>({
    selectedObject: undefined,
    camera: {
        x: 0,
        y: 0
    }
});