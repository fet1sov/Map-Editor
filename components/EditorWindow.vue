<script lang="ts" setup>
import { Editor } from '~/engine/Editor';
import type { GameObject } from '~/types/GameObject';

const props = defineProps<{
    mapobjects: Array<GameObject>
}>();

const editorInstance = ref(null);

onMounted(() => {
    editorInstance.value = new Editor("editorWindow", props.mapobjects);
});

watchEffect(() => {
    if (editorInstance.value)
    {
        editorInstance.value.setGameObjects(props.mapobjects);
    }
});
</script>

<template>
  <div class="bg-[black] w-full h-full">
    <canvas id="editorWindow" class="w-full h-full"></canvas>
  </div>
</template>