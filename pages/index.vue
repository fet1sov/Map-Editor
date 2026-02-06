<script lang="ts" setup>
import { MenuItemsList } from "~/content/MenuItemsList";
import type { EditModes } from "~/engine/Editor";
import type { AssetInfos } from "~/types/AssetInfos";
import type { GameObject } from '~/types/GameObject';

const gameObjects = ref<Array<GameObject>>([]);
function onMapImport(mapObjects: Array<GameObject>) {
    gameObjects.value = mapObjects;
}

provide("gameObjects", gameObjects);

const currentAsset = ref<AssetInfos>({ name: "", path: ""});
const editMode = ref<EditModes>();

const { data } = await useFetch('/api/files');
const assetFiles = ref(data);

function selectAsset(asset: AssetInfos) {
    currentAsset.value = asset;
}

function onSelectEditMode(newMode: EditModes) {
    editMode.value = newMode;
}
</script>

<template>
    <div class="flex flex-col w-full h-full">
        <NavigationMenu 
            @map-import="onMapImport" 
            @select-edit-mode="onSelectEditMode"
            :items="MenuItemsList"/>
        <div class="w-full flex flex-row h-[65%]">
            <SceneList :mapobjects="gameObjects"/>
            <EditorWindow :current-asset="currentAsset" :edit-mode="editMode" :mapobjects="gameObjects"/>
            <AttributeEditor/>
        </div>
        <AssetBrowser @select-asset="selectAsset" :assets="assetFiles"/>
    </div>
</template>