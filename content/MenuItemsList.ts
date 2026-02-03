import { MenuAction, type MenuItem } from "~/types/MenuItem";

export const MenuItemsList: Array<MenuItem> = [
    {
        title: "menu.save",
        action: MenuAction.SAVE
    },
    {
        title: "menu.load",
        action: MenuAction.LOAD
    }
];