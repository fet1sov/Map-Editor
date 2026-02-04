<script lang="ts" setup>
import { Editor, type AssetInfo } from '~/engine/Editor';
import type { AssetInfos } from '~/types/AssetInfos';
import type { GameObject } from '~/types/GameObject';

const props = defineProps<{
    currentAsset: AssetInfos,
    mapobjects: Array<GameObject>
}>();

const editorInstance = ref();

onMounted(() => {
    editorInstance.value = new Editor("editorWindow", props.mapobjects);
});

watchEffect(() => {
    if (editorInstance.value)
    {
        editorInstance.value.setGameObjects(props.mapobjects);
        if (props.currentAsset.name)
        {
            editorInstance.value.setCurrentObject(props.currentAsset);   
        }
    }
});
</script>

<template>
  <div class="bg-[black] w-full h-full">
    <canvas id="editorWindow" class="w-full h-full"></canvas>
  </div>
</template>