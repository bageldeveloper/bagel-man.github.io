(function configureGameAds() {
  const debugAds = window.DEBUG_ADS === true;
  const mobileQuery = window.matchMedia("(max-width: 767px)");
  const laptopQuery = window.matchMedia("(min-width: 901px) and (max-width: 1799px)");
  const laptopShortRailQuery = window.matchMedia(
    "(min-width: 901px) and (max-width: 1799px) and (min-height: 42rem)"
  );
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

  function removeRailOverlaps(rails, minimumGap = 16) {
    let visibleRails = rails.filter(rail =>
      !rail.hidden && window.getComputedStyle(rail).display !== "none"
    );

    while (visibleRails.length > 1) {
      visibleRails.sort((a, b) =>
        a.getBoundingClientRect().top - b.getBoundingClientRect().top
      );
      const overlapIndex = visibleRails.findIndex((rail, index) => {
        if (index === visibleRails.length - 1) return false;
        return rail.getBoundingClientRect().bottom + minimumGap >
          visibleRails[index + 1].getBoundingClientRect().top;
      });
      if (overlapIndex === -1) return;

      const shortRail = visibleRails.find(rail => rail.dataset.adRailPosition === "3");
      const railToHide = shortRail || visibleRails[visibleRails.length - 1];
      railToHide.hidden = true;
      visibleRails = visibleRails.filter(rail => rail !== railToHide);
    }
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
      const areaRect = gameArea.getBoundingClientRect();
      const usableRailHeight = Math.max(
        0,
        Math.min(window.innerHeight, areaRect.bottom) - Math.max(0, areaRect.top) - 32
      );
      const showSecondFullRail = usableRailHeight >= 504;
      const shortRailHeight = Math.min(100, usableRailHeight - 512);
      const showShortRail = showSecondFullRail &&
        laptopShortRailQuery.matches && shortRailHeight >= 50;
      leftRails.forEach((rail, index) => {
        rail.hidden = index > 2 ||
          (index === 1 && !showSecondFullRail) ||
          (index === 2 && !showShortRail);
        if (index === 2 && showShortRail) rail.style.height = `${shortRailHeight}px`;
      });
      rightRails.forEach((rail, index) => {
        rail.hidden = index > 2 ||
          (index === 1 && !showSecondFullRail) ||
          (index === 2 && !showShortRail);
        if (index === 2 && showShortRail) rail.style.height = `${shortRailHeight}px`;
      });
      removeRailOverlaps(leftRails);
      removeRailOverlaps(rightRails);
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
    const fullRailCount = Math.min(
      3,
      Math.max(1, Math.floor((visibleHeight + railGap) / (railHeight + railGap)))
    );
    const railTravel = Math.max(0, visibleHeight - railHeight);
    const railTop = visibleTop - areaRect.top;
    const shortRailHeight = fullRailCount === 2
      ? Math.min(100, visibleHeight - (railHeight * 2) - (railGap * 2))
      : 0;
    const showShortRail = shortRailHeight >= 50;

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
      const isFullRail = index < fullRailCount;
      const isShortRail = index === 2 && fullRailCount === 2 && showShortRail;
      const fits = (isFullRail || isShortRail) &&
        viewportLeft >= safeLeft && viewportLeft + railWidth <= safeRight;
      rail.hidden = !fits;
      if (!fits) return;
      if (isShortRail) rail.style.height = `${shortRailHeight}px`;
      const distributedTop = isShortRail
        ? railTop + (visibleHeight - shortRailHeight) / 2
        : fullRailCount === 1
          ? railTop + Math.max(0, (visibleHeight - currentRailHeight) / 2)
          : railTop + index * (railTravel / (fullRailCount - 1));
      rail.style.left = `${left}px`;
      rail.style.top = `${distributedTop}px`;
    });

    removeRailOverlaps(leftRails);
    removeRailOverlaps(rightRails);

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
  laptopShortRailQuery.addEventListener?.("change", positionSideAds);

  if (window.ResizeObserver && gameWindow) {
    new ResizeObserver(() => {
      positionSideAds();
      closeGapBelowGame();
    }).observe(gameWindow);
  }
})();
