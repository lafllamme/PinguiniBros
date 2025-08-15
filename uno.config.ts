import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss'
import { animatedUno } from 'animated-unocss'
import {
  presetAttributify,
  presetIcons,
  presetMini,
  presetTypography,
  presetWebFonts,
  presetWind3,
} from 'unocss'
import presetAnimations from 'unocss-preset-animations'
import { presetRadix } from 'unocss-preset-radix'

export default defineConfig({
  presets: [
    presetMini(),
    presetWind3(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    animatedUno(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'Fira Code',
      },
    }),
      // @ts-expect-error presetRadix is not defined
    presetRadix({
      palette: [
        'gray',
        'mauve',
        'slate',
        'sage',
        'olive',
        'sand',
        'gold',
        'bronze',
        'brown',
        'yellow',
        'amber',
        'orange',
        'tomato',
        'red',
        'ruby',
        'crimson',
        'pink',
        'plum',
        'purple',
        'violet',
        'iris',
        'indigo',
        'blue',
        'cyan',
        'teal',
        'jade',
        'green',
        'grass',
        'lime',
        'mint',
        'sky',
        'black',
        'white',
      ],
    }),
    presetAnimations(),
  ],
  
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-medium transition-colors',
    'btn-primary': 'btn bg-primary-500 hover:bg-primary-600 text-white',
    'btn-secondary': 'btn bg-secondary-500 hover:bg-secondary-600 text-white',
    'game-container': 'min-h-screen bg-gradient-to-br from-blue-9 via-blue-8 to-purple-9',
    'game-title': 'text-4xl font-bold text-white text-center mb-8',
    'card': 'bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6',
  },
  
  safelist: [
    'hue-blue',
    'hue-green',
    'hue-red',
    'hue-purple',
    'hue-slate',
    'radix-open',
    'radix-closed',
    'radix-disabled',
    'radix-enabled',
  ],
  
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
