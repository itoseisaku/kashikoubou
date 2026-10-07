/* Static design sample. Demo values stay in HTML; no orders are transmitted. */
(() => {
  "use strict";
  document.documentElement.classList.remove("no-js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = document.querySelector(".site-loader");
  const startedAt = performance.now();
  let loading = Boolean(loader && !reduced);
  let finishTimer, releaseTimer;
  const releaseLoader = () => {
    clearTimeout(finishTimer);
    if (!loading) return;
    loading = false;
    document.body.classList.remove("is-loading");
    document.body.classList.add("loader-leaving");
    releaseTimer = setTimeout(
      () => document.body.classList.remove("loader-leaving"),
      500,
    );
  };
  if (loading) {
    document.body.classList.add("is-loading");
    const ready = () => {
      clearTimeout(finishTimer);
      finishTimer = setTimeout(
        releaseLoader,
        Math.max(0, 650 - (performance.now() - startedAt)),
      );
    };
    // Never hold the page behind the animation when an external asset is slow.
    finishTimer = setTimeout(releaseLoader, 2200);
    if (document.readyState === "complete") ready();
    else window.addEventListener("load", ready, { once: true });
  }
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-button");
  const panel = document.querySelector(".menu-panel");
  let previousFocus;
  function closeMenu() {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    document
      .querySelectorAll("body > :not(.menu-panel)")
      .forEach((el) => (el.inert = false));
    previousFocus?.focus();
  }
  function openMenu() {
    previousFocus = document.activeElement;
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    document
      .querySelectorAll("body > :not(.menu-panel)")
      .forEach((el) => (el.inert = true));
    panel.querySelector(".menu-close").focus();
  }
  toggle?.addEventListener("click", openMenu);
  panel?.querySelector(".menu-close").addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (!panel || panel.hidden) return;
    if (e.key === "Escape") closeMenu();
    if (e.key === "Tab") {
      const focusable = [...panel.querySelectorAll("a[href],button")];
      const first = focusable[0],
        last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  const scrollHeader = () =>
    header?.classList.toggle("compact", window.scrollY > 80);
  window.addEventListener("scroll", scrollHeader, { passive: true });
  scrollHeader();
  if ("IntersectionObserver" in window) {
    if (!reduced) {
      document.body.classList.add("motion");
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          }),
        { threshold: 0.08 },
      );
      document
        .querySelectorAll(".reveal")
        .forEach((el) => observer.observe(el));
    }
    const footer = document.querySelector(".site-footer");
    const floating = document.querySelector(".floating-shop");
    if (footer && floating)
      new IntersectionObserver((entries) =>
        floating.classList.toggle("footer-visible", entries[0].isIntersecting),
      ).observe(footer);
  }
  const curtain = document.querySelector(".transition-curtain");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (
      !a ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      a.target ||
      a.hasAttribute("download")
    )
      return;
    const url = new URL(a.href, location.href);
    if (
      url.origin !== location.origin ||
      !/\.html$/i.test(url.pathname) ||
      (url.pathname === location.pathname && url.hash) ||
      reduced ||
      !curtain
    )
      return;
    e.preventDefault();
    releaseLoader();
    closeMenu();
    curtain.classList.add("active");
    setTimeout(() => location.assign(url.href), 380);
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      clearTimeout(finishTimer);
      clearTimeout(releaseTimer);
      loading = false;
      document.body.classList.remove("is-loading", "loader-leaving");
    }
    curtain?.classList.remove("active");
    closeMenu();
  });
  const filters = document.querySelectorAll(".filter-button");
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      filters.forEach((b) =>
        b.setAttribute("aria-pressed", String(b === button)),
      );
      const value = button.dataset.filter;
      let count = 0;
      document.querySelectorAll(".product-entry").forEach((entry) => {
        entry.hidden = value !== "all" && entry.dataset.category !== value;
        if (!entry.hidden) count++;
      });
      const status = document.querySelector("#filter-status");
      if (status) status.textContent = `${count}件のお菓子を表示しています。`;
    }),
  );
  const occasion = document.querySelector("#occasion");
  const recommendation = document.querySelector("#recommendation");
  const suggestions = {
    thanks:
      "お礼には、相手の人数に合わせた焼き菓子の詰め合わせを。個包装や手提げの対応を確認してお選びください。",
    visit:
      "手土産には、看板のフィナンシェを中心とした詰め合わせを。移動時間や保管方法も確認すると安心です。",
    seasonal:
      "季節のご挨拶には、贈る時期に合わせた詰め合わせを。配送日とのしの対応を事前にご確認ください。",
    myself:
      "自分へのひとときには、気になる焼き菓子から。お茶やコーヒーと一緒にゆっくりお楽しみください。",
  };
  occasion?.addEventListener(
    "change",
    () => (recommendation.textContent = suggestions[occasion.value]),
  );
  const preview = document.querySelector("#order-preview");
  const selectedProduct = document.querySelector("#shop-product");
  const selectedQuantity = document.querySelector("#shop-quantity");
  const subtotal = document.querySelector("#shop-subtotal");
  function updateSubtotal() {
    if (!selectedProduct || !selectedQuantity || !subtotal) return;
    const price = Number(selectedProduct.selectedOptions[0].dataset.price);
    const quantity = Number(selectedQuantity.value);
    subtotal.textContent = `税込 ${new Intl.NumberFormat("ja-JP").format(price * quantity)}円`;
    if (preview) {
      preview.hidden = true;
      preview.textContent = "";
    }
  }
  selectedProduct?.addEventListener("change", updateSubtotal);
  selectedQuantity?.addEventListener("change", updateSubtotal);
  document.querySelector("#preview-order")?.addEventListener("click", () => {
    preview.hidden = false;
    preview.textContent = `${selectedProduct.selectedOptions[0].textContent} × ${selectedQuantity.value}点。商品小計は${subtotal.textContent}です。これは選択内容のプレビューです。注文・決済は行われません。`;
  });
})();
