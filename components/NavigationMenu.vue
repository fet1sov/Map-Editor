<script lang="ts" setup>
import { type MenuItem } from '~/types/MenuItem';
import { i18n } from "~/plugins/i18n";
import type { GameObject } from '~/types/GameObject';

const { t } = i18n.global;

const props = defineProps<{
    items: Array<MenuItem>
}>();

const emit = defineEmits<{
    mapImport: [mapObjects: Array<GameObject>]
}>();

function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const filesList = Array.from(input?.files || []);

    const reader = new FileReader();
    reader.readAsText(filesList[0], 'UTF-8');
    reader.onload = function({ target }) {
        const mapObjects: Array<GameObject> = JSON.parse(String(target.result));
        emit('mapImport', mapObjects);
    }
}

function saveMapFile() {
    
}
</script>

<template>
    <nav class="w-full bg-lighttheme-primary-light">
        <ul class="flex flex-row">
          <li v-for="menuItem in items" class="mx-[10px]">
            <div v-if="menuItem.action == 'load'">
              <label :for="menuItem.title">
                {{ t(menuItem.title) }}
              </label>
              <input 
                @change="handleFileSelect"
                :id="menuItem.title" type="file" accept=".json" hidden/>
            </div>
            <div 
                @click="saveMapFile" 
                v-if="menuItem.action == 'save'">
                <p>{{ t(menuItem.title) }}</p>
            </div>
          </li>
        </ul>
    </nav>
</template>