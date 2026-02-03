<script lang="ts" setup>
import type { GameObject } from '~/types/GameObject';

const props = defineProps<{
    mapobjects: Array<GameObject>
}>();
</script>

<template>
    <div class="">
        <h2>{{ $t() }}</h2>
        <ul>
            <li v-for="objectItem in props.mapobjects">
                <p>{{ objectItem.name }}</p>
            </li>
        </ul>
    </div>
</template>