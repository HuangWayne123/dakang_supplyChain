# 达康 AI 供应链官网（正式前端结构）

## 目录结构

- `index.html`：首页
- `pages/`：站点内页
- `assets/css/common.css`：公共样式
- `assets/js/common.js`：公共导航、页脚、移动端菜单脚本
- `assets/images/`：图片资源目录（已预留）

## 使用方式

1. 直接双击 `index.html` 可本地预览。
2. 部署时保持目录结构不变。
3. 新增页面时，复制 `pages` 下任一页面，并在 `assets/js/common.js` 里补充导航项即可。

## 埋点与地址

- 正式环境默认将埋点发送到同域 `/ops/api/track`，建议在站点网关或 Nginx 上把 `/ops/*` 反向代理到 `dakang_ops`，并去掉 `/ops` 前缀。
- 本地如果直接双击 HTML 或用简单静态服务预览，页面会自动把埋点发到 `http://127.0.0.1:3200/api/track`。
- 如果正式环境需要跨域直连，可在页面更早位置注入：

```html
<script>
  window.__DAKANG_ANALYTICS_BASE_URL__ = "https://ops.example.com";
</script>
```

## 后续建议

- 把页面中的图片、图标、背景资源继续迁移到 `assets/images/`
- 逐步把各页面重复的 Tailwind 配置和内联样式再抽成统一资源
- 接入表单提交、埋点统计、SEO meta 和 sitemap
