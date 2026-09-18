(function configureCatalogAds() {
  if (window.DEBUG_ADS !== true) return;

  document.documentElement.classList.add("debug-ads");

  function markAutoAdContainers(root = document) {
    root.querySelectorAll?.(".google-auto-placed, ins.adsbygoogle").forEach(container => {
      container.classList.add("ad-debug-container");
      container.dataset.adLabel = "AD SLOT";
    });
  }

  markAutoAdContainers();
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches?.(".google-auto-placed, ins.adsbygoogle")) {
        node.classList.add("ad-debug-container");
        node.dataset.adLabel = "AD SLOT";
      }
      markAutoAdContainers(node);
    }));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
