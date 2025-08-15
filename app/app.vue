<script lang="ts" setup>
import { consola } from 'consola'

const loadingGradient = ref('linear-gradient(90deg, #059669, #064e3b, #6d28d9)')

// If we are in development mode, we set consola log level to 5
if (import.meta.dev) {
  consola.level = 5
  consola.info('Development mode enabled')
}
else {
  consola.level = 0
  consola.info('Production mode enabled')
}

// Custom viewport meta tag to allow fullscreen on iOS devices
useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtLoadingIndicator
      :color="loadingGradient"
      :throttle="0"
    />
    <NuxtPage />
  </NuxtLayout>
</template>
