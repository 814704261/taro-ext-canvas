import NodePath from 'node:path'
import RollupJson from '@rollup/plugin-json'
import RollupNodeResolve from '@rollup/plugin-node-resolve'
import RollupCommonjs from '@rollup/plugin-commonjs'
import RollupTypescript from 'rollup-plugin-typescript2'
import RollupCopy from 'rollup-plugin-copy'

import Package from './package.json'

const resolveFile = path => NodePath.resolve(__dirname, path)

const externalPackages = [
  'react',
  'react-dom',
  '@tarojs/components',
  '@tarojs/runtime',
  '@tarojs/taro',
  '@tarojs/react'
]

const banner = `/*!
 * ${Package.name} v${Package.version}
 * (c) ${new Date().getFullYear()} ${Package.author}
 * License: ${Package.license || 'MIT'}
 * ${Package.homepage ? `Homepage: ${Package.homepage}` : ''}
 */`

export default {
  input: resolveFile(Package.source),
  output: [
    {
      file: resolveFile(Package.main),
      format: 'cjs',
      sourcemap: true,
      banner
    },
    {
      file: resolveFile(Package.module),
      format: 'es',
      sourcemap: true,
      banner
    },
    {
      file: resolveFile(Package.browser),
      format: 'umd',
      name: 'taro-ext-canvas',
      sourcemap: true,
      globals: {
        react: 'React',
        '@tarojs/components': 'components',
        '@tarojs/taro': 'Taro'
      },
      banner
    }
  ],
  external: externalPackages,
  plugins: [
    RollupNodeResolve({
      customResolveOptions: {
        moduleDirectories: ['node_modules']
      }
    }),
    RollupCommonjs({
      include: /\/node_modules\//
    }),
    RollupJson(),
    RollupTypescript({
      tsconfig: resolveFile('tsconfig.rollup.json'),
      useTsconfigDeclarationDir: true
    }),
    RollupCopy({
      targets: [
        {
          src: resolveFile('src/styles'),
          dest: resolveFile('dist')
        }
      ]
    })
  ]
}
