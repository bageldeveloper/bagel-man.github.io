/* Load the pack in GitHub-sized pieces, then give Godot its original file. */
(async () => {
  const notice = document.getElementById('status-notice');
  const progress = document.getElementById('status-progress');
  const bar = document.getElementById('status-progress-inner');
  function report(message) {
    window.parent.postMessage({ type: 'x8-status', message }, location.origin);
  }
  try {
    if (!Engine.isWebGLAvailable()) throw new Error('WebGL is unavailable. Try another browser.');
    const response = await fetch('pack.json');
    if (!response.ok) throw new Error('Unable to load the game manifest.');
    const manifest = await response.json();
    let pack = new Uint8Array(manifest.size);
    let offset = 0;
    let lastPercent = -1;
    progress.style.display = 'block';
    for (const chunk of manifest.chunks) {
      const part = await fetch(chunk.file);
      if (!part.ok) throw new Error('Unable to download game data. Check your connection and retry.');
      const reader = part.body.getReader();
      const start = offset;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (offset + value.length > start + chunk.size) throw new Error('Invalid game data size.');
        pack.set(value, offset);
        offset += value.length;
        const percent = Math.floor(offset / manifest.size * 100);
        bar.style.width = percent + '%';
        if (percent !== lastPercent) {
          report('Downloading game… ' + percent + '%');
          lastPercent = percent;
        }
      }
      if (offset - start !== chunk.size) throw new Error('Incomplete game download. Please retry.');
      const digest = await crypto.subtle.digest('SHA-256', pack.subarray(start, offset));
      const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      if (hash !== chunk.sha256) throw new Error('Game data failed verification. Please retry.');
    }
    if (offset !== manifest.size) throw new Error('Incomplete game download. Please retry.');
    report('Starting game…');
    progress.style.display = 'none';
    document.getElementById('status-indeterminate').style.display = 'block';
    const engine = new Engine({
      executable: 'game', canvasResizePolicy: 2, focusCanvas: true,
      fileSizes: { 'game.wasm': 13790961 },
      args: ['--main-pack', 'game.pck'],
    });
    await engine.preloadFile(pack.buffer, 'game.pck');
    pack = null;
    await engine.init('game');
    await engine.start();
    document.getElementById('status').style.display = 'none';
    document.getElementById('canvas').focus();
    report('Ready to play. Click inside the game for keyboard controls.');
  } catch (error) {
    progress.style.display = 'none';
    document.getElementById('status-indeterminate').style.display = 'none';
    notice.style.display = 'block';
    notice.textContent = error.message || 'Unable to start the game.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Retry';
    retry.addEventListener('click', () => location.reload());
    notice.append(document.createElement('br'), retry);
    report(notice.textContent);
  }
})();
