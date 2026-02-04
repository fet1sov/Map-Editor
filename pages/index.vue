<script lang="ts" setup>
import { MenuItemsList } from "~/content/MenuItemsList";
import type { AssetInfos } from "~/types/AssetInfos";
import type { GameObject } from '~/types/GameObject';

const gameObjects = ref<Array<GameObject>>([]);
function onMapImport(mapObjects: Array<GameObject>) {
    gameObjects.value = mapObjects;
}

provide("gameObjects", gameObjects);

const currentAsset = ref<AssetInfos>({ name: "", path: ""});

const { data } = await useFetch('/api/files');
const assetFiles = ref(data);

function selectAsset(asset: AssetInfos) {
    currentAsset.value = asset;
}
</script>

<template>
    <div class="flex flex-col w-full h-full">
        <NavigationMenu @map-import="onMapImport" :items="MenuItemsList"/>
        <div class="w-full flex flex-row h-[65%]">
            <SceneList :mapobjects="gameObjects"/>
            <EditorWindow :current-asset="currentAsset" :assets="assetFiles" :mapobjects="gameObjects"/>
            <AttributeEditor/>
        </div>
        <AssetBrowser @select-asset="selectAsset" :assets="assetFiles"/>
    </div>
</template>