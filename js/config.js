/**
 * 网站配置文件 - 个人作品集网站配置中心
 * -------------------------------------------------------
 * 这个文件是整个网站的配置中心，通过修改此文件即可自定义网站内容，
 * 无需修改任何代码逻辑，即可实现个性化。
 *
 * 【配置项说明】
 * site - 网站基本信息（标题、描述、作者等）
 * typing - 首页打字效果配置
 * projects - 项目展示基本配置 (详细项目配置请修改 project-config.js)
 * about - 个人介绍与技能配置
 * resume - 文档下载配置
 *
 * 【快速定位】
 * 搜索 "site:" 修改网站基本信息
 * 搜索 "typing:" 修改打字效果
 * 搜索 "projects:" 修改项目基本配置
 * 搜索 "about:" 修改个人介绍
 * 搜索 "resume:" 修改文档下载
 *
 * @file config.js - 网站基本配置中心
 */

// 网站配置对象
const CONFIG = {
  // ===== site: 网站基本信息 =====
  site: {
    title: "duobaobox", // 网站标题，显示在浏览器标签页
    description: "作品集展示", // 网站描述，用于SEO
    author: "duobao", // 作者姓名
    email: "example@example.com", // 联系邮箱
  },

  // ===== typing: 打字效果配置 =====
  typing: {
    strings: ["独立产品官网模板", "个人作品集展示模板", "微企/工作室官网模板"], // 循环显示的文本
    typeSpeed: 100, // 打字速度 (越大越慢)
    backSpeed: 50, // 删除速度 (越大越慢)
    backDelay: 2000, // 删除前停顿时间(毫秒)
    loop: true, // 是否循环播放
  },

  // ===== projects: 项目基本配置 =====
  // 注意：详细的项目配置请在 js/project-config.js 文件中修改
  projects: {
    // 项目存储位置 (一般不需修改)
    basePath: "projects/",
    extension: ".md",

    // 自动加载模式
    // 设置为 true 将自动加载项目文件
    autoLoadEnabled: true,

    // 项目列表 (会被动态加载的项目覆盖)
    // 此列表仅作为备用，实际项目列表由 project-config.js 控制
    list: [],
  },

  // ===== about: 关于我配置 =====
  about: {
    // 介绍文字
    intro:
      "DB-project是一个简单易部署的作品展示网站模板，不需要安装任何依赖，只需简单配置即可快速部署。网站编辑也不要编辑任何代码，您只需要专注在内容编辑上即可，即可实现高效的网站制作。",

    // 标签列表
    skills: [
      "无需安装依赖",
      "部署简单",
      "开箱即用",
      "Markdown 编辑",
      "更新简单",
      "支持 diy",
    ],
  },

  // ===== resume: 下载文档配置 =====
  resume: {
    path: "./assets/006.pdf", // 文档文件路径
    fileName: "006.pdf", // 下载时的文件名
  },
};

// 导出配置对象 (不要修改)
window.CONFIG = CONFIG;
