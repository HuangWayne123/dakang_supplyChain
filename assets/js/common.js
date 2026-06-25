(function () {
  const footerHost = document.getElementById("site-footer");
  const SESSION_STORAGE_KEY = "dakang:supplychain:session";
  const DEFAULT_ANALYTICS_ENDPOINT = "/ops/api/track";
  const LOCAL_PREVIEW_ENDPOINT = "http://127.0.0.1:3200/api/track";

  function trimTrailingSlash(value) {
    return value.replace(/\/+$/, "");
  }

  function resolveAnalyticsEndpoint() {
    const configuredEndpoint = String(window.__DAKANG_ANALYTICS_ENDPOINT__ || "").trim();
    if (configuredEndpoint) {
      return configuredEndpoint;
    }

    const configuredBaseUrl = String(window.__DAKANG_ANALYTICS_BASE_URL__ || "").trim();
    if (configuredBaseUrl) {
      return `${trimTrailingSlash(configuredBaseUrl)}/api/track`;
    }

    if (window.location.protocol === "file:") {
      return LOCAL_PREVIEW_ENDPOINT;
    }

    if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
      return LOCAL_PREVIEW_ENDPOINT;
    }

    return DEFAULT_ANALYTICS_ENDPOINT;
  }

  const ANALYTICS_ENDPOINT = resolveAnalyticsEndpoint();

  function getSessionId() {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return stored;
    }

    const sessionId = `supplychain-${crypto.randomUUID()}`;
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
  }

  function trackEvent(event, meta, options) {
    const payload = {
      site: "supplychain",
      page: window.location.pathname.replace(/\/+$/, "") || "/",
      event,
      sessionId: getSessionId(),
      durationMs: options && options.durationMs ? options.durationMs : 0,
      meta: meta || {},
    };
    const body = JSON.stringify(payload);

    if (options && options.beacon && navigator.sendBeacon) {
      navigator.sendBeacon(
        ANALYTICS_ENDPOINT,
        new Blob([body], {
          type: "application/json",
        }),
      );
      return;
    }

    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      keepalive: Boolean(options && options.beacon),
    }).catch(function () {
      return undefined;
    });
  }

  function bindAnalytics() {
    const enteredAt = Date.now();
    let hasExited = false;

    function sendExit() {
      if (hasExited) {
        return;
      }
      hasExited = true;
      trackEvent("page_exit", { title: document.title }, {
        beacon: true,
        durationMs: Date.now() - enteredAt,
      });
    }

    trackEvent("page_view", { title: document.title });

    document.addEventListener("click", function (event) {
      const target = event.target && event.target.closest ? event.target.closest("a,button") : null;
      if (!target) {
        return;
      }

      const href = target.getAttribute("href") || "";
      const label = (target.textContent || "").trim();

      if (href.indexOf("tel:") === 0) {
        trackEvent("contact_click", { channel: "phone", label: label || "电话联系", destination: href });
        return;
      }

      if (href.indexOf("mailto:") === 0) {
        trackEvent("contact_click", { channel: "email", label: label || "邮件联系", destination: href });
        return;
      }

      if (target.tagName === "BUTTON" && label.indexOf("获取解决方案") !== -1) {
        event.preventDefault();
        trackEvent("contact_click", { channel: "phone", label: "获取解决方案", destination: "tel:07718010105" });
        window.location.href = "tel:07718010105";
        return;
      }
    });

    document.querySelectorAll("input[placeholder*='搜索']").forEach(function (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") {
          return;
        }
        const value = input.value.trim();
        if (!value) {
          return;
        }
        trackEvent("site_search", { keyword: value });
      });
    });

    window.addEventListener("pagehide", sendExit);
  }

  bindAnalytics();

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
          <h4>达康供应链</h4>
          <p>面向政企团餐、学校、医院、工厂和连锁餐饮的生鲜食材配送、净菜加工、冷链仓配与数字化供应链官网。</p>
          <div class="site-footer-contact">
            <a href="tel:07718010105">0771-8010105</a>
            <a href="${base}/pages/supply_chain_service.html">获取解决方案</a>
          </div>
        </div>
        <div>
          <h4>快速访问</h4>
          <ul>${quickLinks}</ul>
        </div>
        <div>
          <h4>集团站群</h4>
          <ul>
            <li><a href="/group/">达康控股</a></li>
            <li><a href="/food/">达康食品股份</a></li>
            <li><a href="/cognivora/">认知黑洞</a></li>
          </ul>
          <h4 style="margin-top: 20px;">更多页面</h4>
          <ul>${moreLinks}</ul>
        </div>
      </div>
      <div class="site-container site-footer-bottom">
        © 2026 达康供应链集团有限公司 | 生鲜食材供应链与智能配送官网
      </div>
    </footer>`;
})();
