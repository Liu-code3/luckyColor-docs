import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const dayjsEsmEntry = require.resolve('dayjs/esm/index.js');
const sanitizeUrlEsmEntry = require.resolve(
  '@braintree/sanitize-url/src/index.ts'
);

export default withMermaid(defineConfig({
  lang: 'zh-CN',
  title: 'LuckyColor SaaS Docs',
  description: 'LuckyColor SaaS 系统介绍、使用说明、前后端开发与部署文档中心',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],
  vite: {
    resolve: {
      alias: [
        {
          find: /^dayjs$/,
          replacement: dayjsEsmEntry
        },
        {
          find: /^@braintree\/sanitize-url$/,
          replacement: sanitizeUrlEsmEntry
        }
      ]
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '产品总览', link: '/guide/overview' },
      { text: '系统架构', link: '/architecture/overview' },
      { text: '接口规范', link: '/api/spec' },
      { text: '数据库设计', link: '/database/design' },
      { text: '权限安全', link: '/security/rbac' },
      { text: '前端文档', link: '/frontend/overview' },
      { text: '后端文档', link: '/backend/overview' },
      { text: '部署方案', link: '/deployment/local' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '产品概述', link: '/guide/overview' },
            { text: '快速开始', link: '/guide/quick-start' }
          ]
        }
      ],
      '/architecture/': [
        {
          text: '架构',
          items: [
            { text: '系统架构总览', link: '/architecture/overview' }
          ]
        }
      ],
      '/api/': [
        {
          text: '接口',
          items: [
            { text: '接口规范', link: '/api/spec' }
          ]
        }
      ],
      '/database/': [
        {
          text: '数据库',
          items: [
            { text: '数据库设计', link: '/database/design' }
          ]
        }
      ],
      '/security/': [
        {
          text: '权限与安全',
          items: [
            { text: '角色权限说明', link: '/security/rbac' }
          ]
        }
      ],
      '/frontend/': [
        {
          text: '前端',
          items: [
            { text: '前端说明', link: '/frontend/overview' }
          ]
        }
      ],
      '/backend/': [
        {
          text: '后端',
          items: [
            { text: '后端说明', link: '/backend/overview' }
          ]
        }
      ],
      '/deployment/': [
        {
          text: '部署',
          items: [
            { text: '本地部署', link: '/deployment/local' },
            { text: '生产部署方案', link: '/deployment/production' },
            { text: 'Docker Compose 完整部署', link: '/deployment/docker-compose' },
            { text: 'Nginx / HTTPS 配置', link: '/deployment/nginx-https' },
            { text: '拓扑建议', link: '/deployment/topologies' }
          ]
        }
      ]
    },
    outline: {
      label: '本页目录'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/message163/react-docs' }
    ],
    footer: {
      message: 'Built with VitePress for LuckyColor SaaS.',
      copyright: 'Copyright © 2026 LuckyColor'
    }
  },
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
}));
