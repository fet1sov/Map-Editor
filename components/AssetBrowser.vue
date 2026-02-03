<script lang="ts" setup>
import { i18n } from "~/plugins/i18n";
const { t } = i18n.global;

const props = defineProps<{
    assets?: Array<GameAsset>
}>();
</script>

<template>
  <div class="w-full p-[20px] h-[35%]">
      <h2 class="font-bold">{{ t("general.assetbrowser") }}</h2>
      <ul>
        <li v-for="asset in assets">

        </li>
      </ul>
  </div>
</template>