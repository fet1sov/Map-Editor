export enum MenuAction {
    LOAD = "load",
    SAVE = "save"
}

export interface MenuItem {
    title: string,
    action: MenuAction
}