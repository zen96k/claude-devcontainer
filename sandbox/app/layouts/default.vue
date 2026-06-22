<template>
  <div>
    <header class="border-b border-gray-200 dark:border-gray-800">
      <UContainer class="flex items-center justify-between py-3">
        <span class="text-2xl font-semibold">Sandbox</span>
        <UColorModeButton />
      </UContainer>
    </header>
    <slot />
  </div>
</template>
