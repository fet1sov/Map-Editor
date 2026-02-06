<script lang="ts" setup>
import { EditModes, Editor, type AssetInfo } from '~/engine/Editor';
import type { AssetInfos } from '~/types/AssetInfos';
import type { GameObject } from '~/types/GameObject';

const props = defineProps<{
    editMode: EditModes,
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
        editorInstance.value.setEditMode(props.editMode);
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