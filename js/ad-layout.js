(function configureGameAds() {
  const DESKTOP_MIN_WIDTH = 901;
  const RAIL_GAP = 16;
  const NO_FILL_TIMEOUT_MS = 10000;
  const debugAds = window.DEBUG_ADS === true;
  const mobileQuery = window.matchMedia("(max-width: 767px)");

  if (debugAds) document.documentElement.classList.add("debug-ads");

  const mainContent = document.querySelector(".main-content");
  const gameArea = document.querySelector(".game-area");
  const gameWindow = document.querySelector(".game-window");
  const leftRails = Array.from(document.querySelectorAll(".game-ad--rectangle-left"));
  const rightRails = Array.from(document.querySelectorAll(".game-ad--rectangle-right"));
  const banner = document.querySelector(".game-ad--banner");
  const controls = document.querySelector(".game-controls");
  const footer = document.querySelector(".game-ad--mobile-footer");
  const railTimers = new WeakMap();
  let layoutFrame = 0;

  function adFor(container) {
    return container?.querySelector("ins.adsbygoogle") || null;
  }

  function clearRailTimer(ad) {
    const timer = railTimers.get(ad);
    if (timer) window.clearTimeout(timer);
    railTimers.delete(ad);
  }

  function retireRail(rail) {
    if (!rail) return;
    const ad = adFor(rail);
    if (ad) clearRailTimer(ad);
    if (debugAds) {
      rail.dataset.adPreviewEmpty = "true";
      return;
    }
    rail.dataset.adRetired = "true";
    rail.hidden = true;
  }

  function observeRail(rail) {
    const ad = adFor(rail);
    if (!ad || !window.MutationObserver) return;
    const handleStatus = () => {
      const status = ad.dataset.adStatus;
      if (status === "unfilled" || status === "unfill-optimized") {
        retireRail(rail);
      } else if (status === "filled") {
        clearRailTimer(ad);
      }
    };
    new MutationObserver(handleStatus).observe(ad, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });
    handleStatus();
  }

  function initializeAd(ad, useNoFillTimeout = false) {
    if (!ad || ad.dataset.adInitialized === "true") return;
    const container = ad.closest(".game-ad");
    if (!container || container.hidden || container.dataset.adRetired === "true") return;
    const style = window.getComputedStyle(container);
    const rect = container.getBoundingClientRect();
    if (style.display === "none" || rect.width <= 0 || rect.height <= 0) return;

    // AdSense must observe the final, visible dimensions before the request.
    void ad.offsetWidth;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      ad.dataset.adInitialized = "true";
      if (useNoFillTimeout) {
        clearRailTimer(ad);
        railTimers.set(ad, window.setTimeout(() => {
          const status = ad.dataset.adStatus;
          if (!ad.querySelector("iframe") && status !== "filled") retireRail(container);
        }, NO_FILL_TIMEOUT_MS));
      }
    } catch (error) {
      console.warn("AdSense slot initialization was deferred.", error);
    }
  }

  function initializeRailPairs(targetCount) {
    for (let index = 0; index < targetCount; index += 1) {
      initializeAd(adFor(leftRails[index]), true);
      initializeAd(adFor(rightRails[index]), true);
    }
  }

  function initializeUtilityAds() {
    initializeAd(adFor(banner));
    initializeAd(adFor(footer));
  }

  function resetRail(rail) {
    if (!rail) return;
    rail.style.removeProperty("left");
    rail.style.removeProperty("top");
    rail.style.removeProperty("height");
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
    if (!gameArea || !gameWindow) {
      initializeUtilityAds();
      return;
    }

    const rails = [...leftRails, ...rightRails];
    rails.forEach(resetRail);
    if (window.innerWidth < DESKTOP_MIN_WIDTH) {
      rails.forEach(rail => { rail.hidden = true; });
      initializeUtilityAds();
      return;
    }

    const areaRect = gameArea.getBoundingClientRect();
    const gameRect = gameWindow.getBoundingClientRect();
    const mainRect = mainContent?.getBoundingClientRect() || {
      left: 0,
      right: window.innerWidth,
    };
    const usableRailHeight = Math.max(0, areaRect.height);
    const firstRail = leftRails[0] || rightRails[0];
    const railStyle = firstRail ? window.getComputedStyle(firstRail) : null;
    const railWidth = Number.parseFloat(railStyle?.width) || 120;
    const railHeight = Number.parseFloat(railStyle?.height) || 240;
    const countByHeight = Math.floor(
      (usableRailHeight + RAIL_GAP) / (railHeight + RAIL_GAP)
    );
    const targetCount = Math.min(3, Math.max(1, countByHeight));
    const safeLeft = Math.max(0, mainRect.left) + RAIL_GAP;
    const safeRight = Math.min(window.innerWidth, mainRect.right) - RAIL_GAP;
    const leftPosition = gameRect.left - areaRect.left - railWidth - RAIL_GAP;
    const rightPosition = gameRect.right - areaRect.left + RAIL_GAP;
    const sidesFit = areaRect.left + leftPosition >= safeLeft &&
      areaRect.left + rightPosition + railWidth <= safeRight;
    const railTravel = Math.max(0, usableRailHeight - railHeight);
    const railTop = 0;

    const placements = [
      ...leftRails.map((rail, index) => ({ rail, index, left: leftPosition })),
      ...rightRails.map((rail, index) => ({ rail, index, left: rightPosition })),
    ];
    placements.forEach(({ rail, index, left }) => {
      if (!rail) return;
      const active = sidesFit && index < targetCount &&
        rail.dataset.adRetired !== "true";
      rail.hidden = !active;
      if (!active) return;
      const top = targetCount === 1
        ? railTop + railTravel / 2
        : railTop + index * (railTravel / (targetCount - 1));
      rail.style.left = `${left}px`;
      rail.style.top = `${top}px`;
    });

    if (sidesFit) initializeRailPairs(targetCount);
    initializeUtilityAds();
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

  function updateLayout() {
    layoutFrame = 0;
    positionSideAds();
    closeGapBelowGame();
    keepFooterClearOfContent();
  }

  function scheduleLayout() {
    if (layoutFrame) window.cancelAnimationFrame(layoutFrame);
    layoutFrame = window.requestAnimationFrame(updateLayout);
  }

  [...leftRails, ...rightRails].forEach(observeRail);
  updateLayout();
  window.addEventListener("scroll", keepFooterClearOfContent, { passive: true });
  window.addEventListener("resize", scheduleLayout);
  mobileQuery.addEventListener?.("change", scheduleLayout);
  if (window.ResizeObserver && gameWindow) {
    new ResizeObserver(scheduleLayout).observe(gameWindow);
  }
})();
