<script lang="ts" setup>
import { GLOBAL_EDITOR_INFO } from "~/globals";
import { i18n } from "~/plugins/i18n";
const { t } = i18n.global;
</script>

<template>
    <div class="min-w-[15%]">
        <div class="p-[20px]">
            <h2 class="font-bold">{{ t("general.attribute") }}</h2>

            <div v-if="GLOBAL_EDITOR_INFO.selectedObject">
                <p>{{ GLOBAL_EDITOR_INFO.selectedObject.id }}</p>
                <ul class="w-full justify-between flex flex-row">
                    <li>{{  }}</li>

                    <li class="text-[#A35A65]">X {{ GLOBAL_EDITOR_INFO.selectedObject.x }}</li>
                    <li class="text-[#5D8058]">Y {{ GLOBAL_EDITOR_INFO.selectedObject.y }}</li>
                </ul>
            </div>

            <div v-else>
                <p>{{ t("general.camera") }}</p>
                <ul class="w-full justify-between flex flex-row">
                    <li>Position</li>

                    <li class="text-[#A35A65]">X {{ GLOBAL_EDITOR_INFO.camera.x }}</li>
                    <li class="text-[#5D8058]">Y {{ GLOBAL_EDITOR_INFO.camera.y }}</li>
                </ul>
            </div>
        </div>
    </div>
</template>