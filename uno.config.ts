import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'
import { extendTheme, presets, shortcuts, theme } from './app/assets/unocss'

export default defineConfig({
    shortcuts,
    theme,
    extendTheme,
    // @ts-expect-error presetRadix is not defined
    presets,
    transformers: [
        transformerDirectives(),
        transformerVariantGroup(),
    ],
})
