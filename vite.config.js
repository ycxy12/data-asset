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
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
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
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@use "@/style/element/index.scss" as *;',
                },
            },
        },
        plugins: [
            vue(),
            svgLoader(),
            tailwindcss(),
            AutoImport({
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                // dirs: ['src/components'],
                // extensions: ['vue'],
                // deep: true,
                dts: false,
                resolvers: [
                    // 使用unplugin-vue-components按需加载样式，开发环境会导致项目异常卡顿
                    ElementPlusResolver({
                        // importStyle: mode === 'development' ? false : 'sass',
                        importStyle:'sass'
                    }),
                    PlusProComponentsResolver(),
                ],
            }),
            // {
            //     name: 'import-element-plus-style',
            //     transform(code, id) {
            //         console.log(code, id)
            //         if (/src\/main\.js$/.test(id)) {
            //             console.log(mode)
            //             if (mode === 'development') {
            //                 return {
            //                     code: `${code};import 'element-plus/dist/index.css';`,
            //                     map: null,
            //                 }
            //             }
            //         }
            //     },
            // },
        ],
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
