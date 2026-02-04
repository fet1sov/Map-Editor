<script lang="ts" setup>
import { i18n } from "~/plugins/i18n";
const { t } = i18n.global;

useSeoMeta({
  title: t("general.title")
});
</script>

<template>
  <div class="w-full h-[100vh]">
    <NuxtPage/>
  </div>
</template>