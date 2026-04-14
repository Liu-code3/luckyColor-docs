import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const dayjsEsmEntry = require.resolve('dayjs/esm/index.js');
const sanitizeUrlEsmEntry = require.resolve(
  '@braintree/sanitize-url/src/index.ts'
);
const repository = process.env.GITHUB_REPOSITORY;
const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER;
const repositoryName = repository?.split('/')[1] ?? '';
const isUserOrOrgPages = repositoryName.toLowerCase() === `${repositoryOwner ?? ''}.github.io`.toLowerCase();
const siteBase = process.env.VITEPRESS_BASE
  || (repositoryName ? (isUserOrOrgPages ? '/' : `/${repositoryName}/`) : '/');

export default withMermaid(defineConfig({
  base: siteBase,
  lang: 'zh-CN',
  title: 'LuckyColor SaaS Docs',
  description: 'LuckyColor SaaS 系统介绍、使用说明、前后端开发与部署文档中心',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${siteBase}logo.svg` }]
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
    logo: `${siteBase}logo.svg`,
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
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '环境变量对照', link: '/guide/env-alignment' },
            { text: '修复任务板', link: '/guide/repair-task-board' },
            { text: '文档补充清单', link: '/guide/doc-gap-checklist' },
            { text: '核心关系说明', link: '/guide/domain-relationships' },
            { text: '参考项目与改进', link: '/guide/reference-projects' }
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
            { text: '接口规范', link: '/api/spec' },
            { text: '双后端契约对照', link: '/api/contract-comparison' }
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
            { text: '角色权限说明', link: '/security/rbac' },
            { text: '前后端权限码对照', link: '/security/permission-alignment' },
            { text: '身份边界矩阵', link: '/security/actor-boundary-matrix' }
          ]
        }
      ],
      '/frontend/': [
        {
          text: '前端',
          items: [
            { text: '前端说明', link: '/frontend/overview' },
            { text: '会话恢复与联调模式', link: '/frontend/session-and-api-modes' },
            { text: '前端模块渐进式解读', link: '/frontend/module-walkthrough' }
          ]
        }
      ],
      '/backend/': [
        {
          text: '后端',
          items: [
            { text: 'NestJS 后端说明', link: '/backend/overview' },
            { text: 'Spring Boot 后端说明', link: '/backend/springboot-overview' },
            { text: 'Spring Boot 数据库初始化', link: '/backend/springboot-database-bootstrap' },
            { text: 'NestJS 模块渐进式解读', link: '/backend/module-walkthrough' },
            { text: 'Spring Boot 模块渐进式解读', link: '/backend/springboot-module-walkthrough' },
            { text: '模块调用路径图模板', link: '/backend/module-call-path-template' },
            { text: 'users 模块调用路径', link: '/backend/users-call-path' },
            { text: '切换 Java 时的文档更新点', link: '/backend/java-migration' }
          ]
        }
      ],
      '/deployment/': [
        {
          text: '部署',
          items: [
            { text: '本地部署', link: '/deployment/local' },
            { text: '生产部署方案', link: '/deployment/production' },
            { text: 'Spring Boot 部署说明', link: '/deployment/springboot' },
            { text: 'Docker Compose 完整部署', link: '/deployment/docker-compose' },
            { text: 'Nginx / HTTPS 配置', link: '/deployment/nginx-https' },
            { text: '拓扑建议', link: '/deployment/topologies' },
            { text: '部署排查清单', link: '/deployment/troubleshooting' }
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
      { icon: 'github', link: 'https://github.com/Liu-code3' }
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
