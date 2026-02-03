<script lang="ts" setup>
import type { GameObject } from '~/types/GameObject';

const props = defineProps<{
    mapobjects: Array<GameObject>
}>();
</script>

<template>
    <div class="min-w-[15%]">
        <div class="p-[20px]">
            <h2 class="font-bold uppercase">{{ $t("general.gameobjects") }}</h2>
            <ul class="mt-[20px]">
                <li v-for="objectItem in props.mapobjects">
                    <p>{{ objectItem.name }}</p>
                </li>
            </ul>
        </div>
    </div>
</template>