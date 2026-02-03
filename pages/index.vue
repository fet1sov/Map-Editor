<script lang="ts" setup>
import { MenuItemsList } from "~/content/MenuItemsList";
import type { GameObject } from '~/types/GameObject';

const gameObjects: Array<GameObject> = ref([]);
function onMapImport(mapObjects: Array<GameObject>) {
    gameObjects.value = mapObjects;
}
</script>

<template>
    <div class="flex flex-col w-full h-[100%]">
        <NavigationMenu @map-import="onMapImport" :items="MenuItemsList"/>
        <div class="flex flex-row">
            <SceneList :mapobjects="gameObjects"/>
            <EditorWindow/>
        </div>
    </div>
</template>