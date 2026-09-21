(function configureGameAds() {
  const debugAds = window.DEBUG_ADS === true;
  const mobileQuery = window.matchMedia("(max-width: 767px)");
  const laptopQuery = window.matchMedia("(min-width: 901px) and (max-width: 1799px)");
  const adElements = Array.from(document.querySelectorAll(".game-ad ins.adsbygoogle"));

  if (debugAds) document.documentElement.classList.add("debug-ads");

  function initializeVisibleAds() {
    adElements.forEach(ad => {
      if (ad.dataset.adInitialized === "true" || ad.offsetParent === null) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        ad.dataset.adInitialized = "true";
      } catch (error) {
        console.warn("AdSense slot initialization was deferred.", error);
      }
    });
  }

  const mainContent = document.querySelector(".main-content");
  const gameArea = document.querySelector(".game-area");
  const gameWindow = document.querySelector(".game-window");
  const leftRails = Array.from(document.querySelectorAll(".game-ad--rectangle-left"));
  const rightRails = Array.from(document.querySelectorAll(".game-ad--rectangle-right"));
  const banner = document.querySelector(".game-ad--banner");
  const controls = document.querySelector(".game-controls");
  const footer = document.querySelector(".game-ad--mobile-footer");

  function resetRail(rail) {
    if (!rail) return;
    rail.style.removeProperty("left");
    rail.style.removeProperty("top");
  }

  function positionSideAds() {
    if (!gameArea || !gameWindow) return;

    if (window.innerWidth <= 900) {
      [...leftRails, ...rightRails].forEach(resetRail);
      [...leftRails, ...rightRails].forEach(rail => { rail.hidden = true; });
      initializeVisibleAds();
      return;
    }

    if (laptopQuery.matches) {
      [...leftRails, ...rightRails].forEach(resetRail);
      leftRails.forEach((rail, index) => { rail.hidden = index > 1; });
      rightRails.forEach((rail, index) => { rail.hidden = index > 1; });
      initializeVisibleAds();
      return;
    }

    const areaRect = gameArea.getBoundingClientRect();
    const gameRect = gameWindow.getBoundingClientRect();
    const mainRect = mainContent?.getBoundingClientRect() || { left: 0, right: window.innerWidth };
    const edgePadding = 12;
    const railGap = 24;
    const railTop = gameRect.top - areaRect.top;

    const placements = [
      ...leftRails.map((rail, index) => ({ rail, index, side: "left" })),
      ...rightRails.map((rail, index) => ({ rail, index, side: "right" })),
    ];

    placements.forEach(({ rail, index, side }) => {
      if (!rail) return;
      const railStyle = window.getComputedStyle(rail);
      const railWidth = Number.parseFloat(railStyle.width) || 300;
      const railHeight = Number.parseFloat(railStyle.height) || 250;
      const left = side === "left"
        ? gameRect.left - areaRect.left - railWidth - railGap
        : gameRect.right - areaRect.left + railGap;
      const viewportLeft = areaRect.left + left;
      const safeLeft = Math.max(0, mainRect.left) + edgePadding;
      const safeRight = Math.min(window.innerWidth, mainRect.right) - edgePadding;
      const fits = viewportLeft >= safeLeft && viewportLeft + railWidth <= safeRight;
      rail.hidden = !fits;
      if (!fits) return;
      rail.style.left = `${left}px`;
      rail.style.top = `${Math.max(0, railTop + index * (railHeight + railGap))}px`;
    });

    initializeVisibleAds();
  }

  function keepFooterClearOfContent() {
    if (!footer || !mobileQuery.matches) return;
    const footerTop = window.innerHeight - footer.offsetHeight;
    const protectedAreas = [gameWindow, ...leftRails, controls, banner];
    const overlaps = protectedAreas.some(element => {
      if (!element || element.hidden) return false;
      const rect = element.getBoundingClientRect();
      return rect.bottom > footerTop && rect.top < window.innerHeight;
    });
    footer.classList.toggle("is-over-game", overlaps);
  }

  positionSideAds();
  keepFooterClearOfContent();
  window.addEventListener("scroll", keepFooterClearOfContent, { passive: true });
  window.addEventListener("resize", () => {
    positionSideAds();
    keepFooterClearOfContent();
  });
  mobileQuery.addEventListener?.("change", () => {
    positionSideAds();
    keepFooterClearOfContent();
  });
  laptopQuery.addEventListener?.("change", positionSideAds);

  if (window.ResizeObserver && gameWindow) {
    new ResizeObserver(positionSideAds).observe(gameWindow);
  }
})();
