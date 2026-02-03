<script lang="ts" setup>
import type { GameObject } from '~/types/GameObject';
import { i18n } from "~/plugins/i18n";
const { t } = i18n.global;

const props = defineProps<{
    selectedObject?: GameObject
}>();
</script>

<template>
    <div class="min-w-[15%]">
        <div class="p-[20px]">
            <h2 class="font-bold">{{ t("general.attribute") }}</h2>
        </div>
    </div>
</template>