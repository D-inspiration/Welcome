/* Sprint Analytics Tracker v1.0 — Drop into any page */
(function() {
  'use strict';

  const STORE_KEY = 'sprint_analytics_v1';
  const SESSION_KEY = 'sprint_session_id';
  const MAX_EVENTS = 8000;

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || defaultData(); }
    catch(e) { return defaultData(); }
  }
  function save(d) { localStorage.setItem(STORE_KEY, JSON.stringify(d)); }
  function defaultData() {
    return { events: [], sessions: {}, pages: {}, startedAt: Date.now(), version: 1 };
  }

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  let data = load();
  let sessionStart = Date.now();
  let maxScroll = 0;
  let clickCount = 0;
  let inputCount = 0;

  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36).slice(-4);
    sessionStorage.setItem(SESSION_KEY, sessionId);
    data.sessions[sessionId] = {
      start: sessionStart, duration: 0, taps: 0, inputs: 0, scrollDepth: 0,
      ended: false, page: location.pathname + location.search
    };
    save(data);
  } else {
    sessionStart = Date.now() - (data.sessions[sessionId]?.duration || 0);
  }

  function track(type, detail) {
    const ev = {
      id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6),
      type: type, timestamp: Date.now(), sessionId: sessionId,
      page: location.pathname + location.search, detail: detail || {},
      url: location.href, referrer: document.referrer || '',
      viewport: { w: window.innerWidth, h: window.innerHeight },
      ua: navigator.userAgent.slice(0, 80)
    };
    data.events.push(ev);
    if (data.events.length > MAX_EVENTS) {
      data.events = data.events.slice(-Math.floor(MAX_EVENTS * 0.8));
    }
    const pageKey = location.pathname + location.search;
    if (!data.pages[pageKey]) {
      data.pages[pageKey] = { visits: 0, clicks: 0, inputs: 0, avgScroll: 0, lastVisit: 0 };
    }
    data.pages[pageKey].lastVisit = Date.now();
    if (type === 'click') data.pages[pageKey].clicks++;
    if (type === 'input') data.pages[pageKey].inputs++;
    save(data);
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('sprint_analytics');
      bc.postMessage({ action: 'track', type: type });
      bc.close();
    }
  }

  document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-track]') || e.target;
    const trackName = target.getAttribute('data-track');
    const elName = trackName || (
      target.tagName.toLowerCase() +
      (target.id ? '#' + target.id : '') +
      (target.className && typeof target.className === 'string' ? '.' + target.className.split(' ')[0] : '')
    );
    track('click', {
      element: elName,
      text: (target.innerText || target.value || target.alt || target.title || '').toString().slice(0, 60),
      x: e.clientX, y: e.clientY,
      path: e.composedPath ? e.composedPath().map(el => el.tagName).filter(Boolean).slice(0, 5).join(' > ') : ''
    });
    clickCount++;
    if (data.sessions[sessionId]) data.sessions[sessionId].taps = clickCount;
    save(data);
  });

  let scrollTimer;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const depth = docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0;
      if (depth > maxScroll) {
        maxScroll = depth;
        track('scroll', { depth: depth + '%', pixel: Math.round(window.scrollY) });
        if (data.sessions[sessionId]) data.sessions[sessionId].scrollDepth = maxScroll;
        save(data);
      }
    }, 400);
  });

  document.addEventListener('input', function(e) {
    const t = e.target;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) {
      const name = t.getAttribute('data-track') || t.name || t.id || t.placeholder?.slice(0, 20) || 'input';
      track('input', {
        element: name, length: (t.value || t.textContent || '').length, type: t.type || 'text'
      });
      inputCount++;
      if (data.sessions[sessionId]) data.sessions[sessionId].inputs = inputCount;
      save(data);
    }
  });

  document.addEventListener('focusin', function(e) {
    const t = e.target;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') {
      track('focus', { element: t.getAttribute('data-track') || t.name || t.id || 'input', type: t.type || 'text' });
    }
  });

  document.addEventListener('visibilitychange', function() {
    if (document.hidden && data.sessions[sessionId]) {
      data.sessions[sessionId].duration = Date.now() - sessionStart;
      save(data);
    }
  });

  window.addEventListener('beforeunload', function() {
    if (data.sessions[sessionId]) {
      data.sessions[sessionId].duration = Date.now() - sessionStart;
      data.sessions[sessionId].ended = true;
      data.sessions[sessionId].scrollDepth = maxScroll;
      save(data);
    }
  });

  setInterval(function() {
    if (data.sessions[sessionId]) {
      data.sessions[sessionId].duration = Date.now() - sessionStart;
      save(data);
    }
  }, 10000);

  const pageKey = location.pathname + location.search;
  data.pages[pageKey] = data.pages[pageKey] || { visits: 0, clicks: 0, inputs: 0, avgScroll: 0, lastVisit: 0 };
  data.pages[pageKey].visits++;
  save(data);

  track('pageview', {
    title: document.title, path: location.pathname, search: location.search, referrer: document.referrer || ''
  });

  window.SprintAnalytics = {
    track: track,
    getData: function() { return load(); },
    getSession: function() { return sessionId; },
    clear: function() {
      if (confirm('Clear all analytics data?')) {
        localStorage.removeItem(STORE_KEY);
        location.reload();
      }
    }
  };

  console.log('[SprintAnalytics] Tracking active. Session:', sessionId.slice(-8));
})();
