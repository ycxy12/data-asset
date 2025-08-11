import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { PlusProComponentsResolver } from '@plus-pro-components/resolver'
import svgLoader from 'vite-svg-loader'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
    return {
        plugins: [
            vue(),
            svgLoader(),
            tailwindcss(),
            AutoImport({ resolvers: [ElementPlusResolver({ importStyle: 'sass' })] }),
            Components({
                dirs: ['src/components'],
                extensions: ['vue'],
                deep: true,
                dts: false,
                resolvers: [ElementPlusResolver({ importStyle: 'sass' }), PlusProComponentsResolver({ importStyle: 'scss' })],
            }),
        ],

        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: ['legacy-js-api', 'new-global'],
                    additionalData: '@use "@/style/element/index.scss" as *;',
                },
            },
        },
        server: {
            open: true,
            proxy: {
                '/data-asset-api': {
                    target: 'https://dataasset.m8bj.cn',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/data-asset-api/, '/data-asset-api'),
                },
            },
        },
        esbuild: {
            pure: ['debugger'],
        },
        build: {
            outDir: 'dist',
            minify: 'esbuild',
            reportCompressedSize: false,
            chunkSizeWarningLimit: 2000,
            rollupOptions: {
                output: {
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
                },
            },
        },
    }
})
