<template>
  <div class="mb-4 flex flex-wrap gap-2">
    <UButton
      :variant="modelValue === null ? 'solid' : 'ghost'"
      @click="emit('update:modelValue', null)"
    >
      全て
    </UButton>
    <UButton
      v-for="publisher in publishers"
      :key="publisher.id"
      :variant="modelValue === publisher.name ? 'solid' : 'ghost'"
      @click="emit('update:modelValue', publisher.name)"
    >
      {{ publisher.name }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    publishers: { id: string | number; name: string }[]
    modelValue: string | null
  }>()

  const emit = defineEmits<{ "update:modelValue": [value: string | null] }>()
</script>
