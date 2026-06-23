(function () {
  const footerHost = document.getElementById("site-footer");

  if (!footerHost) {
    return;
  }

  const pageKey = document.body.getAttribute("data-page") || "index";
  const isHome = pageKey === "index";
  const base = isHome ? "." : "..";

  const navItems = [
    ["index", "首页", `${base}/index.html`],
    ["intelligent_platform", "智能平台", `${base}/pages/intelligent_platform.html`],
    ["industry_solutions", "行业方案", `${base}/pages/industry_solutions.html`],
    ["supply_chain_service", "供应链服务", `${base}/pages/supply_chain_service.html`],
    ["customer_case", "客户案例", `${base}/pages/customer_case.html`],
    ["industry_insights", "行业洞察", `${base}/pages/industry_insights.html`],
    ["about_us", "关于我们", `${base}/pages/about_us.html`],
    ["common_problems", "常见问题", `${base}/pages/common_problems.html`],
  ];

  const quickLinks = navItems
    .slice(0, 4)
    .map(([key, label, href]) => {
      const activeClass = key === pageKey ? " class=\"is-active\"" : "";
      return `<li><a${activeClass} href="${href}">${label}</a></li>`;
    })
    .join("");

  const moreLinks = navItems
    .slice(4)
    .map(([key, label, href]) => {
      const activeClass = key === pageKey ? " class=\"is-active\"" : "";
      return `<li><a${activeClass} href="${href}">${label}</a></li>`;
    })
    .join("");

  footerHost.innerHTML = `
    <footer class="site-footer">
      <div class="site-container site-footer-grid">
        <div>
          <h4>达康 AI 供应链</h4>
          <p>面向企业数字化采购、协同履约、供应链运营与行业解决方案的一体化官网。</p>
        </div>
        <div>
          <h4>快速访问</h4>
          <ul>${quickLinks}</ul>
        </div>
        <div>
          <h4>更多页面</h4>
          <ul>${moreLinks}</ul>
        </div>
      </div>
      <div class="site-container site-footer-bottom">
        © 2026 达康 AI 供应链 | 多页面官网前端结构版
      </div>
    </footer>`;
})();
