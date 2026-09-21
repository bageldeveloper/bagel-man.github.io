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

  function closeGapBelowGame() {
    if (!controls || !gameArea || !gameWindow || mobileQuery.matches) {
      controls?.style.removeProperty("margin-top");
      return;
    }

    const areaRect = gameArea.getBoundingClientRect();
    const gameRect = gameWindow.getBoundingClientRect();
    const trailingSpace = Math.max(0, areaRect.bottom - gameRect.bottom);
    controls.style.marginTop = trailingSpace ? `-${trailingSpace}px` : "";
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
    const edgePadding = 16;
    const railGap = 24;
    const visibleTop = Math.max(0, areaRect.top) + edgePadding;
    const visibleBottom = Math.min(window.innerHeight, areaRect.bottom) - edgePadding;
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const firstRail = leftRails[0] || rightRails[0];
    const railHeight = Number.parseFloat(window.getComputedStyle(firstRail).height) || 250;
    const visibleRailCount = Math.min(
      3,
      Math.max(1, Math.floor((visibleHeight + railGap) / (railHeight + railGap)))
    );
    const railTravel = Math.max(0, visibleHeight - railHeight);
    const railTop = visibleTop - areaRect.top;

    const placements = [
      ...leftRails.map((rail, index) => ({ rail, index, side: "left" })),
      ...rightRails.map((rail, index) => ({ rail, index, side: "right" })),
    ];

    placements.forEach(({ rail, index, side }) => {
      if (!rail) return;
      const railStyle = window.getComputedStyle(rail);
      const railWidth = Number.parseFloat(railStyle.width) || 300;
      const currentRailHeight = Number.parseFloat(railStyle.height) || railHeight;
      const left = side === "left"
        ? gameRect.left - areaRect.left - railWidth - railGap
        : gameRect.right - areaRect.left + railGap;
      const viewportLeft = areaRect.left + left;
      const safeLeft = Math.max(0, mainRect.left) + edgePadding;
      const safeRight = Math.min(window.innerWidth, mainRect.right) - edgePadding;
      const fits = index < visibleRailCount &&
        viewportLeft >= safeLeft && viewportLeft + railWidth <= safeRight;
      rail.hidden = !fits;
      if (!fits) return;
      const distributedTop = visibleRailCount === 1
        ? railTop + Math.max(0, (visibleHeight - currentRailHeight) / 2)
        : railTop + index * (railTravel / (visibleRailCount - 1));
      rail.style.left = `${left}px`;
      rail.style.top = `${distributedTop}px`;
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
  closeGapBelowGame();
  keepFooterClearOfContent();
  window.addEventListener("scroll", keepFooterClearOfContent, { passive: true });
  window.addEventListener("resize", () => {
    positionSideAds();
    closeGapBelowGame();
    keepFooterClearOfContent();
  });
  mobileQuery.addEventListener?.("change", () => {
    positionSideAds();
    closeGapBelowGame();
    keepFooterClearOfContent();
  });
  laptopQuery.addEventListener?.("change", positionSideAds);

  if (window.ResizeObserver && gameWindow) {
    new ResizeObserver(() => {
      positionSideAds();
      closeGapBelowGame();
    }).observe(gameWindow);
  }
})();
