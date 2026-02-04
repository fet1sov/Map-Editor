<script lang="ts" setup>
import { i18n } from "~/plugins/i18n";
import type { AssetInfos } from "~/types/AssetInfos";
const { t } = i18n.global;

const props = defineProps<{
    assets: Array<AssetInfos> | undefined
}>();

const selectedAsset = ref({ name: "", path: "" });

const emit = defineEmits<{
    selectAsset: [asset: AssetInfos]
}>();

function onAssetClick(asset: AssetInfos)
{
    selectedAsset.value = asset;
    emit('selectAsset', selectedAsset.value);
}
</script>

<template>
  <div class="w-full p-[20px] h-[35%]">
      <h2 class="font-bold">{{ t("general.assetbrowser") }}</h2>
      <ul class="flex flex-wrap">
        <li @click="onAssetClick(asset)" 
          :class="(asset.name == selectedAsset.name ? 'bg-selected' : 'bg-lighttheme-primary-light') + ' max-w-[200px] max-h-[500px] m-[20px] p-[15px] rounded-[20px] flex flex-col justify-center items-center'" 
          v-for="asset in assets">
          <img class="w-[128px] h-[128px]" :src="asset.path">
          <p class="text-center">{{ asset.name }}</p>
        </li>
      </ul>
  </div>
</template>