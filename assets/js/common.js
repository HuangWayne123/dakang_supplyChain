(function(){
  const footerHost = document.getElementById('site-footer');
  const nav = document.querySelector('#site-global-header .site-nav');
  const header = document.getElementById('site-global-header');

  if (header && nav && !header.querySelector('.site-menu-toggle')) {
    const btn = document.createElement('button');
    btn.className = 'site-menu-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', '鍒囨崲瀵艰埅');
    btn.textContent = '鑿滃崟';
    header.querySelector('.site-header-inner')?.appendChild(btn);
    btn.addEventListener('click', function(){
      nav.classList.toggle('is-open');
    });
  }

  if(footerHost){
    const pageKey = document.body.getAttribute('data-page') || 'index';
    const isHome = pageKey === 'index';
    const base = isHome ? '.' : '..';
    const navItems = [
      ['index','棣栭〉', `${base}/index.html`],
      ['intelligent_platform','鏅鸿兘骞冲彴', `${base}/pages/intelligent_platform.html`],
      ['industry_solutions','琛屼笟鏂规', `${base}/pages/industry_solutions.html`],
      ['supply_chain_service','渚涘簲閾炬湇鍔?, `${base}/pages/supply_chain_service.html`],
      ['customer_case','瀹㈡埛妗堜緥', `${base}/pages/customer_case.html`],
      ['industry_insights','琛屼笟娲炲療', `${base}/pages/industry_insights.html`],
      ['common_problems','甯歌闂', `${base}/pages/common_problems.html`]
    ];
    footerHost.innerHTML = `
      <footer class="site-footer">
        <div class="site-container site-footer-grid">
          <div>
            <h4>杈惧悍 AI 渚涘簲閾?/h4>
            <p>浠ユ暟鎹€佺畻娉曚笌琛屼笟鐭ヨ瘑鍗忓悓锛屾瀯寤洪潰鍚戦噰璐€佷緵搴旈摼涓庝骇涓氳繍钀ョ殑鏅鸿兘鍖栨湇鍔￠棬鎴枫€?/p>
          </div>
          <div>
            <h4>蹇€熻闂?/h4>
            <ul>${navItems.slice(0,4).map(([,label,href])=>`<li><a href="${href}">${label}</a></li>`).join('')}</ul>
          </div>
          <div>
            <h4>鏇村椤甸潰</h4>
            <ul>${navItems.slice(4).map(([,label,href])=>`<li><a href="${href}">${label}</a></li>`).join('')}</ul>
          </div>
        </div>
        <div class="site-container site-footer-bottom">漏 2026 杈惧悍 AI 渚涘簲閾?路 澶氶〉闈㈠畼缃戝墠绔粨鏋勭増</div>
      </footer>`;
  }
})();

