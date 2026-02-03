<script lang="ts" setup>
const props = defineProps<{
    assets: Array<GameAsset>
}>();
</script>

<template>
  <div class="w-full h-[35%]">
      <ul>
        <li v-for="asset in assets">
            
        </li>
      </ul>
  </div>
</template>