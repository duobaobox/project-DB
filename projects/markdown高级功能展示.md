---
id: markdown高级功能展示
title: Markdown 高级功能展示
description: 展示 markdown-it 支持的更多高级 Markdown 功能
image: https://via.placeholder.com/350x200?text=Markdown高级功能
---

# Markdown 高级功能展示

本页面展示了新的 Markdown 解析器支持的各种高级功能，基于功能强大的 markdown-it 引擎。

## 目录

[[toc]]

## 基础 Markdown 功能

### 文本格式化

**粗体**, _斜体_, **_粗斜体_**, ~~删除线~~

### 列表

无序列表:

- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2

有序列表:

1. 第一步
2. 第二步
3. 第三步

### 链接和图片

[链接文本](https://example.com)

![图片描述](https://via.placeholder.com/600x300)

### 代码块

行内代码: `const example = "hello world";`

代码块:

```javascript
function hello() {
  console.log("Hello, world!");
  return true;
}
```

## 高级功能

### 任务列表

- [ ] 未完成任务
- [x] 已完成任务
- [ ] 另一个任务

### 表格

| 名称   | 说明       | 数量 |
| ------ | ---------- | ---- |
| 项目 A | 这是项目 A | 10   |
| 项目 B | 这是项目 B | 20   |
| 项目 C | 这是项目 C | 30   |

### 脚注

这是一个带有脚注的句子[^1]。

[^1]: 这是脚注的内容，可以包含多行文本。

### 上标和下标

上标例子：X^2^
下标例子：H~2~O

### 自定义容器

::: tip
这是一个提示信息。
:::

::: warning
这是一个警告信息。
:::

::: danger
这是一个危险警告。
:::

### 引用块

> 这是一个引用块
>
> 它可以包含多个段落

### HTML 内联支持

<div style="padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
  <h3>HTML 内容</h3>
  <p>这是通过 HTML 直接编写的内容</p>
</div>

### 表情符号支持

常用表情: :smile: :heart: :thumbsup: :rocket: :computer:

## 属性扩展

添加自定义类名和属性：

这段文字会变成红色 {.red-text style="color: red;"}

## 自动链接

自动识别网址: https://example.com

## 总结

这些高级功能让 Markdown 更加强大，可以满足更复杂的内容展示需求。
