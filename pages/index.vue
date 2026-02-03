<script lang="ts" setup>
import { MenuItemsList } from "~/content/MenuItemsList";
import type { GameObject } from '~/types/GameObject';

const gameObjects: Array<GameObject> = ref([]);
function onMapImport(mapObjects: Array<GameObject>) {
    gameObjects.value = mapObjects;
}

provide("gameObjects", gameObjects);
</script>

<template>
    <div class="flex flex-col w-full h-full">
        <NavigationMenu @map-import="onMapImport" :items="MenuItemsList"/>
        <div class="w-full flex flex-row h-[65%]">
            <SceneList :mapobjects="gameObjects"/>
            <EditorWindow :mapobjects="gameObjects"/>
            <AttributeEditor/>
        </div>
        <AssetBrowser></AssetBrowser>
    </div>
</template>