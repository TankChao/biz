import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'distDumi',
  themeConfig: {
    name: '@kachina/biz',
    socialLinks: {
      github: 'https://github.com/TankChao/biz',
    },
    logo: false,
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/data-entries/dictionary' },
    ],
    sidebar: {
      '/data-entries': [
        {
          title: '数据录入',
          children: [
            { title: 'Dictionary 字典', link: '/data-entries/dictionary' },
            { title: 'DatePicker 日期选择', link: '/data-entries/date-picker' },
          ],
        },
        {
          title: '交互',
          children: [
            { title: 'Operate 操作组件', link: '/interactions/operate' },
          ],
        },
      ],
      '/interactions': [
        {
          title: '数据录入',
          children: [
            { title: 'Dictionary 字典', link: '/data-entries/dictionary' },
            { title: 'DatePicker 日期选择', link: '/data-entries/date-picker' },
          ],
        },
        {
          title: '交互',
          children: [
            { title: 'Operate 操作组件', link: '/interactions/operate' },
          ],
        },
      ],
    },
  },
  resolve: {
    atomDirs: [
      { type: 'data-entry', dir: 'src/DataEntry' },
      { type: 'interaction', dir: 'src/Interaction' },
    ],
  },
  alias: {
    '@kachina/biz': '/src/index.ts',
  },
});
