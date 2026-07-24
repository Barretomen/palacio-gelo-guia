(() => {
  'use strict';
  const DATA = window.PG_DATA;
  const STORE_MEDIA = window.PG_STORE_MEDIA || {};
  const STORAGE_KEY = 'pg-guia-bolso-v1';
  const floors = ['-2', '-1', 'P0', '0', '1', '2', '3'];
  const directionsRel = {
    Norte: { Norte: 'Fica no mesmo lado (Norte).', Sul: 'Siga em direção ao lado oposto (Sul).', Poente: 'Vire à esquerda em direção a Poente.', Nascente: 'Vire à direita em direção a Nascente.' },
    Sul: { Sul: 'Fica no mesmo lado (Sul).', Norte: 'Siga em direção ao lado oposto (Norte).', Poente: 'Vire à direita em direção a Poente.', Nascente: 'Vire à esquerda em direção a Nascente.' },
    Poente: { Poente: 'Fica no mesmo lado (Poente).', Nascente: 'Siga em direção ao lado oposto (Nascente).', Norte: 'Vire à direita em direção a Norte.', Sul: 'Vire à esquerda em direção a Sul.' },
    Nascente: { Nascente: 'Fica no mesmo lado (Nascente).', Poente: 'Siga em direção ao lado oposto (Poente).', Norte: 'Vire à esquerda em direção a Norte.', Sul: 'Vire à direita em direção a Sul.' }
  };

  const floorLabel = f => f === 'P0' ? 'Parque P0' : (f === 'unknown' || f === 'Por confirmar') ? 'Por confirmar' : f === 'Shopping' ? 'Todo o shopping' : f === 'Parque' ? 'Parque' : `Piso ${f}`;
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];
  const on = (selector, event, handler) => { const el = qs(selector); if (el) el.addEventListener(event, handler); };
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const initials = value => String(value || 'PG').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();

  function placeVisual(place, variant = '') {
    const url = place.type === 'store' ? STORE_MEDIA[place.id] : '';
    const label = initials(place.name);
    return `<span class="store-media ${variant}"><span class="store-initials" aria-hidden="true">${esc(label)}</span>${url ? `<img src="${esc(url)}" alt="Logótipo de ${esc(place.name)}" loading="lazy" onerror="this.remove()" />` : ''}</span>`;
  }

  const defaultState = {
    favorites: [],
    overrides: {},
    customPlaces: [],
    notes: {},
    quiz: { correct: 0, total: 0 },
    patrol: {},
    userFloor: '0',
    userDir: '',
    failedSearches: {},
    feedbacks: [],
  };

  let saved = loadState();
  let activeScreen = 'home';
  let selectedFloor = '0';
  let selectedPlaceId = null;
  let mapScale = 1;
  let markMode = false;
  let directoryFavoritesOnly = false;
  let trainingMode = 'mixed';
  let currentQuestion = null;
  let deferredInstallPrompt = null;

  function loadState() {
    try {
      const parsed = { ...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
      parsed.failedSearches = parsed.failedSearches || {};
      parsed.feedbacks = parsed.feedbacks || [];
      return parsed;
    } catch {
      return { ...defaultState, failedSearches: {}, feedbacks: [] };
    }
  }

  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }

  function toast(message) {
    const el = qs('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function getStore(id) {
    const catalog = window.PG_SEARCH_CATALOG_V2;
    return catalog.stores.find(s => s.id === id) || catalog.officialServices.find(s => s.id === id);
  }

  function getCustom(id) { return saved.customPlaces.find(p => p.id === id); }
  function isFavorite(id) { return saved.favorites.includes(id); }

  function toggleFavorite(id) {
    saved.favorites = isFavorite(id) ? saved.favorites.filter(x => x !== id) : [...saved.favorites, id];
    saveState();
    renderFavorites(); renderDirectory(); renderFloorPlaces(); renderDashboard();
    toast(isFavorite(id) ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.');
  }

  function effectiveLocations(store) {
    const override = saved.overrides[store.id];
    if (override?.floor) return [{ floor: override.floor, unit: override.unit || '', verified: true, override: true, direction: override.direction || '', note: override.note || '' }];
    return store.locations || [];
  }

  function directionFor(name, location) {
    if (location?.direction) return location.direction;
    const n = norm(name);
    if (n.includes('farmacia pinto')) return 'Poente';
    if (n === 'meo') return 'Norte';
    if (n === 'auchan' || n.startsWith('auchan -') || n.includes('cafe auchan')) return 'Sul';
    const point = location?.map0;
    if (!point) return '';
    const [x, y] = point;
    const dx = x - 50, dy = y - 50;
    return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'Poente' : 'Nascente') : (dy < 0 ? 'Norte' : 'Sul');
  }

  function directionReference(direction) {
    const entries = Object.values(DATA.orientation);
    const found = entries.find(x => x.label === direction);
    return found ? found.reference : '';
  }

  function allPlaces() {
    const catalog = window.PG_SEARCH_CATALOG_V2;
    const standard = catalog.stores.map(store => ({ type:'store', id:store.id, name:store.name, categories:store.categories, locations:effectiveLocations(store), source:store }));
    const services = catalog.officialServices.map(service => ({ type:'service', id:service.id, name:service.name, categories:['Serviços'], locations:service.locations || [], source:service }));
    const custom = saved.customPlaces.map(p => ({ type:'custom', id:p.id, name:p.name, categories:['Personalizado'], locations:[{floor:p.floor, unit:p.unit || '', direction:p.direction || '', map0:p.x !== '' && p.y !== '' ? [Number(p.x), Number(p.y)] : undefined, note:p.note, verified:true}], source:p }));
    return [...standard, ...services, ...custom];
  }

  function primaryLocation(place) { return place.locations?.[0] || null; }

  function searchPlaces(query, limit = 12) {
    return window.pgSearch.search(query, { maxResults: limit });
  }

  function recordFailedSearch(query) {
    const normQuery = norm(query);
    if (!normQuery) return;
    if (!saved.failedSearches) saved.failedSearches = {};
    if (!saved.failedSearches[normQuery]) {
      saved.failedSearches[normQuery] = {
        term: normQuery,
        original: query,
        count: 0,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      };
    }
    saved.failedSearches[normQuery].count += 1;
    saved.failedSearches[normQuery].lastSeen = new Date().toISOString();
    saveState();
    renderFailedSearches();
  }

  function saveFeedback(placeId, query, type) {
    if (!saved.feedbacks) saved.feedbacks = [];
    saved.feedbacks.push({
      placeId,
      query: query || '',
      type,
      timestamp: new Date().toISOString()
    });
    saveState();
    renderDashboard();
    toast('Feedback operacional registado localmente.');
  }

  function navTo(screen) {
    activeScreen = screen;
    qsa('.view').forEach(el => el.classList.toggle('active', el.dataset.screen === screen));
    qsa('.mobile-nav button, #desktopNav button').forEach(btn => {
      const target = btn.dataset.nav || btn.dataset.view;
      btn.classList.toggle('active', target === screen);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (screen === 'map') renderMap();
    if (screen === 'directory') renderDirectory();
    if (screen === 'training' && !currentQuestion) nextQuestion();
    if (screen === 'more') renderMore();
    
    const pageNames = { home: 'Visão geral', map: 'Mapa e orientação', directory: 'Diretório inteligente', training: 'Treino operacional', more: 'Ferramentas' };
    const pageTitle = qs('#pageTitle');
    if (pageTitle && pageNames[screen]) {
      pageTitle.textContent = pageNames[screen];
    }
  }

  function placeFloorText(place) {
    if (!place.locations?.length) return 'Piso por confirmar';
    return place.locations.map(l => `${floorLabel(l.floor)}${l.unit ? ` · ${l.unit}` : ''}`).join(' / ');
  }

  function resultButton(result) {
    const place = allPlaces().find(item => item.id === result.id);
    const floor = result.locations?.length
      ? result.locations.map(loc => `${floorLabel(loc.floor)}${loc.unit ? ` · ${loc.unit}` : ''}`).join(' / ')
      : 'Localização no detalhe';

    const confidenceLabel = result.confidence === 'high' ? 'Confirmado' : result.confidence === 'medium' ? 'Confirmar stock' : 'Verificar';

    return `
      <button class="search-result" type="button" data-place-id="${esc(result.id)}">
        ${place ? placeVisual(place, 'small') : '<span class="store-media small"><span class="store-initials">ℹ</span></span>'}
        <span class="result-main">
          <b>${esc(result.name)}</b>
          <small>${esc(floor)}</small>
          <small class="match-reason">${esc(result.label)}</small>
        </span>
        <span class="confidence confidence-${esc(result.confidence)}">
          ${esc(confidenceLabel)}
        </span>
      </button>`;
  }

  function renderSearchResults(query, resultsEl) {
    const trimmed = query.trim();
    if (!trimmed) {
      resultsEl.innerHTML = '';
      resultsEl.classList.add('hidden');
      return;
    }

    let refinementHtml = '';
    const normQ = norm(trimmed);
    if (normQ === 'manga') {
      refinementHtml = `
        <div class="refinement-block">
          <p>Deseja refinar a pesquisa para "manga"?</p>
          <div class="refinement-chips">
            <button class="refinement-chip" data-search-refine="livros" type="button">📚 BD / Livro</button>
            <button class="refinement-chip" data-search-refine="vestuário" type="button">👕 Roupa</button>
          </div>
        </div>
      `;
    } else if (normQ === 'capa') {
      refinementHtml = `
        <div class="refinement-block">
          <p>Deseja refinar a pesquisa para "capa"?</p>
          <div class="refinement-chips">
            <button class="refinement-chip" data-search-refine="capas" type="button">📱 Capa Telemóvel</button>
            <button class="refinement-chip" data-search-refine="livros" type="button">📚 Capa de Livro</button>
            <button class="refinement-chip" data-search-refine="decoração" type="button">🛏️ Roupa de Cama</button>
          </div>
        </div>
      `;
    } else if (normQ === 'bateria') {
      refinementHtml = `
        <div class="refinement-block">
          <p>Deseja refinar a pesquisa para "bateria"?</p>
          <div class="refinement-chips">
            <button class="refinement-chip" data-search-refine="mister-minit" type="button">⌚ Pilha Relógio</button>
            <button class="refinement-chip" data-search-refine="carregamento" type="button">⚡ Carro Elétrico</button>
          </div>
        </div>
      `;
    } else if (normQ === 'cartão' || normQ === 'cartao') {
      refinementHtml = `
        <div class="refinement-block">
          <p>Deseja refinar a pesquisa para "cartão"?</p>
          <div class="refinement-chips">
            <button class="refinement-chip" data-search-refine="ctt" type="button">📞 SIM CTT</button>
            <button class="refinement-chip" data-search-refine="multibanco" type="button">🏧 Multibanco</button>
            <button class="refinement-chip" data-search-refine="cheque-prenda" type="button">🎁 Cheque-Prenda</button>
          </div>
        </div>
      `;
    } else if (normQ === 'carteira') {
      refinementHtml = `
        <div class="refinement-block">
          <p>Deseja refinar a pesquisa para "carteira"?</p>
          <div class="refinement-chips">
            <button class="refinement-chip" data-search-refine="perdidos achados" type="button">🔍 Perdi a Carteira</button>
            <button class="refinement-chip" data-search-refine="malas" type="button">👜 Comprar Carteira</button>
          </div>
        </div>
      `;
    } else if (normQ === 'carregador') {
      refinementHtml = `
        <div class="refinement-block">
          <p>Deseja refinar a pesquisa para "carregador"?</p>
          <div class="refinement-chips">
            <button class="refinement-chip" data-search-refine="iservices worten fnac" type="button">🔌 Telemóvel / PC</button>
            <button class="refinement-chip" data-search-refine="carregamento" type="button">⚡ Carro Elétrico</button>
          </div>
        </div>
      `;
    }

    const results = searchPlaces(trimmed, 9);
    
    if (!results.length) {
      recordFailedSearch(trimmed);
      resultsEl.innerHTML = refinementHtml + `
        <div style="padding:16px 12px; font-size:12px; color:var(--muted); text-align:center;">
          <p style="margin:0 0 10px;">Não encontrei uma correspondência segura.</p>
          <button id="viewAllDirBtn" class="text-link" style="font-size:11px;" type="button">Ver diretório completo</button>
        </div>
      `;
      resultsEl.classList.remove('hidden');
      const viewDirBtn = qs('#viewAllDirBtn', resultsEl);
      if (viewDirBtn) {
        viewDirBtn.onclick = () => {
          resultsEl.classList.add('hidden');
          navTo('directory');
          const dirSearch = qs('#directorySearch');
          if (dirSearch) dirSearch.value = '';
          renderDirectory();
        };
      }
      return;
    }

    let resultsHtml = refinementHtml;
    const bestMatch = results[0];
    const place = allPlaces().find(p => p.id === bestMatch.id);
    const floorText = bestMatch.locations?.length
      ? bestMatch.locations.map(loc => `${floorLabel(loc.floor)}${loc.unit ? ` · ${loc.unit}` : ''}`).join(' / ')
      : 'Localização no detalhe';

    const disclaimer = window.PG_SEARCH_CATALOG_V2.truthPolicy?.stockDisclaimer;

    resultsHtml += `
      <div class="smart-answer show">
        <div class="answer-top">
          <div>
            <span class="eyebrow" style="color:var(--blue)">Melhor Correspondência</span>
            <h3>Onde fica ${esc(bestMatch.name)}?</h3>
            <p>${results.length} local(is) compatível(is) encontrado(s).</p>
          </div>
          <span class="confidence confidence-${esc(bestMatch.confidence)}">
            ${esc(bestMatch.confidence === 'high' ? 'Confirmado' : bestMatch.confidence === 'medium' ? 'Confirmar stock' : 'Verificar')}
          </span>
        </div>
        <div class="answer-list">
          <button class="search-result" type="button" data-place-id="${esc(bestMatch.id)}">
            ${place ? placeVisual(place, 'small') : '<span class="store-media small"><span class="store-initials">ℹ</span></span>'}
            <span class="result-main">
              <b>${esc(bestMatch.name)}</b>
              <small>${esc(floorText)}</small>
              <small class="match-reason">${esc(bestMatch.label)}</small>
            </span>
          </button>
        </div>
        <div class="answer-footer" style="padding:10px 14px; background:#f8fafc; font-size:10px; color:var(--muted); line-height:1.4; border-top:1px solid var(--line-2)">
          ⚠️ <b>Aviso:</b> ${esc(disclaimer)}
        </div>
      </div>
    `;

    if (results.length > 1) {
      resultsHtml += `<div style="padding:8px 12px 4px; font-size:10px; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:0.05em; border-top:1px solid var(--line-2)">Outras alternativas encontradas</div>`;
      resultsHtml += results.slice(1).map(r => resultButton(r)).join('');
    }

    resultsEl.innerHTML = resultsHtml;
    resultsEl.classList.remove('hidden');
  }

  function wireSearch(input, resultsEl) {
    if (!input || !resultsEl) return;
    input.addEventListener('input', () => {
      renderSearchResults(input.value, resultsEl);
    });
    resultsEl.addEventListener('click', e => {
      const chip = e.target.closest('[data-search-refine]');
      if (chip) {
        e.stopPropagation();
        input.value = chip.dataset.searchRefine;
        renderSearchResults(input.value, resultsEl);
        input.focus();
        return;
      }
      const btn = e.target.closest('[data-place-id]');
      if (!btn) return;
      resultsEl.classList.add('hidden');
      input.value = '';
      openPlace(btn.dataset.placeId);
    });
    document.addEventListener('click', e => {
      if (!resultsEl.contains(e.target) && e.target !== input && !e.target.closest('.chip-btn') && !e.target.closest('.refinement-chip')) {
        resultsEl.classList.add('hidden');
      }
    });
  }

  function openPlace(id) {
    const place = allPlaces().find(p => p.id === id);
    if (!place) return;
    selectedPlaceId = id;
    const locations = place.locations || [];
    const source = place.source;
    const categories = place.categories || [];
    const verified = place.type === 'custom' || place.type === 'service' || (source.verified !== false && locations.every(l => l.verified !== false));
    const note = place.type === 'store' ? (saved.overrides[id]?.note || source.note || '') : source.note || '';

    const userFloor = qs('#userCurrentFloor')?.value || '0';
    const userDir = qs('#userCurrentDir')?.value || '';

    const locHtml = locations.length ? locations.map(loc => {
      const dir = directionFor(place.name, loc);
      
      let relativeRoute = '';
      if (userDir && dir && directionsRel[userDir]?.[dir]) {
        relativeRoute = `<div class="relative-route-hint">🧭 ${directionsRel[userDir][dir]}</div>`;
      }
      
      let floorRoute = '';
      if (userFloor && loc.floor) {
        if (userFloor === loc.floor) {
          floorRoute = '<span class="floor-route-hint same">No mesmo piso</span>';
        } else {
          const userFloorNum = userFloor === 'P0' ? 0 : Number(userFloor);
          const targetFloorNum = loc.floor === 'P0' ? 0 : Number(loc.floor);
          const diff = targetFloorNum - userFloorNum;
          if (!isNaN(diff)) {
            floorRoute = `<span class="floor-route-hint diff">${diff > 0 ? `Suba ${diff} piso(s)` : `Desça ${Math.abs(diff)} piso(s)`}</span>`;
          }
        }
      }

      return `<div class="location-box">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
          <b>${esc(floorLabel(loc.floor))}${loc.unit ? ` · Unidade ${esc(loc.unit)}` : ''}</b>
          ${floorRoute}
        </div>
        ${dir ? `<small>${esc(dir)} — ${esc(directionReference(dir))}</small>` : '<small>Direção por confirmar</small>'}
        ${relativeRoute}
        ${loc.override ? '<small>Correção guardada neste dispositivo</small>' : ''}
      </div>`;
    }).join('') : '<div class="location-box"><b>Localização por confirmar</b><small>Pode corrigir quando confirmar no terreno.</small></div>';

    let providersHtml = '';
    if (place.type === 'service' && source.providerStoreIds?.length) {
      const list = source.providerStoreIds.map(pid => allPlaces().find(p => p.id === pid)).filter(Boolean);
      if (list.length) {
        providersHtml = `
          <div style="margin-top:16px;">
            <label>Lojas/Locais Prestadores:</label>
            <div class="providers-list" style="display:grid; gap:8px; margin-top:6px;">
              ${list.map(p => `
                <div class="provider-box">
                  <div>
                    <b>${esc(p.name)}</b>
                    <span style="font-size:10px; color:var(--muted); display:block;">${esc(placeFloorText(p))}</span>
                  </div>
                  <button type="button" class="select-lite" style="height:32px; padding:0 8px; font-size:10px;" data-dialog-action="map-provider" data-provider-id="${esc(p.id)}">⌖ Ver no mapa</button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    let trustHtml = '';
    if (place.type === 'store' || place.type === 'service') {
      const evidence = source.evidenceLevel;
      let label = window.PG_SEARCH_CATALOG_V2.truthPolicy?.resultLabels?.[evidence] || source.label || 'Registo oficial';
      let confidenceColor = 'low';
      if (evidence && evidence.includes('official')) {
        confidenceColor = 'high';
      } else if (evidence) {
        confidenceColor = 'medium';
      }

      if (!source.currentOfficialDirectoryMatch && place.type !== 'service') {
        confidenceColor = 'low';
        label = 'Não correspondido no diretório oficial atual — confirmar antes de indicar.';
      }

      const lastVer = source.lastVerified || window.PG_SEARCH_CATALOG_V2.generatedAt.slice(0, 10);
      const centerUrl = source.officialCenterUrl;

      trustHtml = `
        <div style="margin-top: 16px; border-top: 1px solid var(--line); padding-top: 14px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="micro-label">Confiança e Evidência</span>
            <span class="confidence confidence-${esc(confidenceColor)}">${esc(confidenceColor === 'high' ? 'Oficial' : confidenceColor === 'medium' ? 'Confirmar' : 'Verificar')}</span>
          </div>
          <p style="font-size:11px; color:var(--ink-2); margin:6px 0 2px; font-weight:600;">${esc(label)}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:var(--muted); margin-top:4px;">
            <span>Última verificação: ${esc(lastVer)}</span>
            ${centerUrl ? `<a href="${esc(centerUrl)}" target="_blank" rel="noopener" style="color:var(--blue)">Ver página ↗</a>` : ''}
          </div>
        </div>
      `;
    }

    let disclaimerHtml = '';
    if (place.type === 'store') {
      const msg = source.availabilityMessage || window.PG_SEARCH_CATALOG_V2.truthPolicy.stockDisclaimer;
      disclaimerHtml = `
        <div style="margin-top: 12px; background:var(--amber-soft); border: 1px solid #fedf89; border-radius:12px; padding:10px; font-size:10px; color:#7a2e0e; line-height:1.4;">
          ⚠️ <b>Disponibilidade:</b> ${esc(msg)}
        </div>
      `;
    }

    const feedbackHtml = `
      <div style="margin-top:16px; border-top:1px solid var(--line); padding-top:14px;">
        <span class="micro-label">Feedback Operacional Local</span>
        <div class="feedback-actions">
          <button type="button" class="feedback-btn" data-feedback="found"><span>👍</span>Encontrou</button>
          <button type="button" class="feedback-btn" data-feedback="no_stock"><span>👎</span>Não vendia</button>
          <button type="button" class="feedback-btn" data-feedback="closed_moved"><span>⚠️</span>Fechado/Mudou</button>
          <button type="button" class="feedback-btn" data-feedback="wrong_loc"><span>📍</span>Incorreto</button>
        </div>
      </div>
    `;

    qs('#placeDialogContent').innerHTML = `
      <div class="place-hero" style="display:flex; gap:12px; align-items:center;">
        ${placeVisual(place, 'large')}
        <div><span class="micro-label">${esc(categories[0] || 'LOCAL')}</span><h2>${esc(place.name)}</h2></div>
      </div>
      <div class="detail-meta" style="margin-top:10px; display:flex; flex-wrap:wrap; gap:6px;">
        ${categories.slice(0,3).map(c => `<span class="tag">${esc(c)}</span>`).join('')}
        <span class="tag">${verified ? '✓ Confirmado' : '△ Confirmar'}</span>
      </div>
      <div class="detail-locations" style="margin-top:16px;">${locHtml}</div>
      ${providersHtml}
      ${note ? `<p class="muted-note" style="margin-top:12px;"><b>Notas:</b> ${esc(note)}</p>` : ''}
      ${disclaimerHtml}
      ${trustHtml}
      ${feedbackHtml}
      <div class="detail-actions" style="margin-top:16px; display:flex; flex-wrap:wrap; gap:8px;">
        <button type="button" class="select-lite" style="height:38px;" data-dialog-action="favorite">${isFavorite(id) ? '★ Remover favorito' : '☆ Favorito'}</button>
        <button type="button" class="select-lite" style="height:38px;" data-dialog-action="map">⌖ Mostrar no mapa</button>
        ${place.type === 'store' ? '<button type="button" class="select-lite" style="height:38px;" data-dialog-action="edit">✎ Corrigir dados</button>' : '<button type="button" class="select-lite" style="height:38px;" data-dialog-action="edit-custom">✎ Editar</button>'}
        ${place.type === 'custom' ? '<button type="button" class="select-lite" style="height:38px; color:var(--red);" data-dialog-action="delete-custom">Eliminar</button>' : ''}
      </div>`;

    const dialog = qs('#placeDialog');
    dialog.showModal();
    
    const feedbackBlock = qs('.feedback-actions', dialog);
    if (feedbackBlock) {
      feedbackBlock.onclick = e => {
        const btn = e.target.closest('[data-feedback]');
        if (!btn) return;
        saveFeedback(id, qs('#homeSearch')?.value || qs('#directorySearch')?.value || '', btn.dataset.feedback);
      };
    }

    qs('#placeDialogContent').onclick = e => {
      const btn = e.target.closest('[data-dialog-action]');
      if (!btn) return;
      const action = btn.dataset.dialogAction;
      
      if (action === 'favorite') { toggleFavorite(id); dialog.close(); openPlace(id); }
      if (action === 'map') {
        const loc = primaryLocation(place);
        if (loc && floors.includes(loc.floor)) selectedFloor = loc.floor;
        dialog.close(); navTo('map'); renderMap(id);
      }
      if (action === 'map-provider') {
        const pid = e.target.closest('[data-provider-id]')?.dataset.providerId;
        const prov = allPlaces().find(p => p.id === pid);
        if (prov) {
          const loc = primaryLocation(prov);
          if (loc && floors.includes(loc.floor)) selectedFloor = loc.floor;
          dialog.close(); navTo('map'); renderMap(prov.id);
        }
      }
      if (action === 'edit') { dialog.close(); openStoreEdit(place); }
      if (action === 'edit-custom') { dialog.close(); openCustomForm(source); }
      if (action === 'delete-custom') {
        if (confirm(`Eliminar “${place.name}”?`)) {
          saved.customPlaces = saved.customPlaces.filter(p => p.id !== id); saveState(); dialog.close(); renderAll(); toast('Local personalizado eliminado.');
        }
      }
    };
  }

  function openStoreEdit(place) {
    const form = qs('#customPlaceForm');
    const override = saved.overrides[place.id] || {};
    const loc = override.floor ? override : primaryLocation(place);
    form.dataset.mode = 'store'; form.dataset.id = place.id;
    qs('#formDialogTitle').textContent = `Corrigir: ${place.name}`;
    form.elements.name.value = place.name; form.elements.name.disabled = true;
    form.elements.floor.value = loc?.floor || '0';
    form.elements.unit.value = loc?.unit || '';
    form.elements.direction.value = override.direction || directionFor(place.name, loc) || '';
    form.elements.note.value = override.note || '';
    form.elements.x.value = loc?.map0?.[0] ?? '';
    form.elements.y.value = loc?.map0?.[1] ?? '';
    qs('#formDialog').showModal();
  }

  function openCustomForm(place = null, coords = null) {
    const form = qs('#customPlaceForm');
    form.dataset.mode = place ? 'custom-edit' : 'custom-new';
    form.dataset.id = place?.id || '';
    qs('#formDialogTitle').textContent = place ? `Editar: ${place.name}` : 'Adicionar local';
    form.elements.name.disabled = false;
    form.elements.name.value = place?.name || '';
    form.elements.floor.value = place?.floor || selectedFloor || '0';
    form.elements.unit.value = place?.unit || '';
    form.elements.direction.value = place?.direction || '';
    form.elements.note.value = place?.note || '';
    form.elements.x.value = coords?.x ?? place?.x ?? '';
    form.elements.y.value = coords?.y ?? place?.y ?? '';
    qs('#formDialog').showModal();
  }

  function renderFavorites() {
    const el = qs('#favoritesList');
    const favs = saved.favorites.map(id => allPlaces().find(p => p.id === id)).filter(Boolean);
    if (!favs.length) {
      el.className = 'store-grid empty-state';
      el.innerHTML = '<p style="grid-column: 1 / -1; color:var(--muted); text-align:center; font-size:11px; margin:20px 0;">Ainda não marcou favoritos.</p>';
      return;
    }
    el.className = 'store-grid';
    el.innerHTML = favs.map(placeCard).join('');
  }

  function renderFloorTabs() {
    const el = qs('#floorTabs');
    if (!el) return;
    el.innerHTML = floors.map(f => `<button type="button" class="${f === selectedFloor ? 'active' : ''}" data-floor="${f}">${f}</button>`).join('');
    el.onclick = e => { const b=e.target.closest('[data-floor]'); if (!b) return; selectedFloor=b.dataset.floor; selectedPlaceId=null; mapScale=1; renderMap(); };
  }

  function renderMap(highlightId = selectedPlaceId) {
    renderFloorTabs();
    qs('#mapTitle').textContent = `Mapa do ${floorLabel(selectedFloor)}`;
    const markModeBtn = qs('#markModeBtn');
    if (markModeBtn) markModeBtn.classList.toggle('hidden', selectedFloor !== '0');
    const image = qs('#floorMapImage');
    if (!image) return;
    image.src = DATA.floorImages[selectedFloor];
    image.alt = `Mapa do ${floorLabel(selectedFloor)}`;
    image.style.transform = `scale(${mapScale})`;
    const layer = qs('#markerLayer');
    layer.style.transform = `scale(${mapScale})`;
    layer.innerHTML = '';
    
    allPlaces().forEach(place => {
      if (place.type !== 'custom' && place.id !== highlightId) return;
      place.locations.forEach(loc => {
        if (loc.floor !== selectedFloor || !loc.map0) return;
        const [x,y] = loc.map0;
        const marker=document.createElement('button');
        marker.type='button'; marker.className=`map-marker ${place.type==='custom'?'custom':''} ${place.id===highlightId?'selected active':''}`;
        marker.style.left=`${x}%`; marker.style.top=`${y}%`; marker.dataset.placeId=place.id; marker.title=place.name;
        layer.appendChild(marker);
      });
    });
    
    layer.onclick=e=>{ const id=e.target.closest('[data-place-id]')?.dataset.placeId; if(id){ selectedPlaceId=id; renderMap(id); openPlace(id); }};
    const mapNotes = {
      '-2': 'Planta oficial · referência a azul: Bowling',
      '-1': 'Planta oficial · referência a azul: Auchan',
      'P0': 'Planta oficial do parque · referência a azul: Eco Car Wash',
      '0': 'Planta oficial · referência a azul: Farmácia · selecione uma loja para a destacar',
      '1': 'Planta oficial · referência a azul: FNAC',
      '2': 'Planta oficial · referência a azul: Cinemas NOS',
      '3': 'Planta oficial · referência a azul: Rádio Estação Diária',
    };
    qs('#mapHint').textContent = mapNotes[selectedFloor] || 'Planta oficial do piso';
    renderFloorPlaces();
  }

  function renderFloorPlaces() {
    const list = allPlaces().filter(p => p.locations.some(l => l.floor === selectedFloor)).sort((a,b)=>a.name.localeCompare(b.name,'pt'));
    const badge = qs('#floorCount');
    if (badge) badge.textContent = `${list.length} locais`;
    qs('#floorPlaces').innerHTML = list.length ? list.map(placeCard).join('') : '<div class="empty-state" style="grid-column:1/-1; color:var(--muted); text-align:center; padding:20px;">Nenhum local cadastrado neste piso.</div>';
  }

  function placeCard(place) {
    const loc = place.locations?.[0] || null;
    const isFav = isFavorite(place.id);
    const verified = place.type === 'custom' || place.type === 'service' || (place.source.verified !== false && place.locations.every(l => l.verified !== false));
    const desc = place.type === 'store' ? (place.source.note || place.categories.join(', ')) : (place.source.note || 'Serviço operacional');
    const tags = place.categories.slice(0, 2).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    const floorText = loc ? `${floorLabel(loc.floor)}${loc.unit ? ` · ${loc.unit}` : ''}` : 'Confirmar piso';

    return `
      <article class="store-card" data-place-id="${esc(place.id)}">
        <div class="store-top">
          ${placeVisual(place, 'small')}
          <button class="fav ${isFav ? 'active' : ''}" data-favorite-id="${esc(place.id)}" type="button" aria-label="Favorito">
            <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </button>
        </div>
        <h3>${esc(place.name)}</h3>
        <p>${esc(desc)}</p>
        <div class="tags">${tags}</div>
        <div class="store-foot">
          <span class="where">
            <svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></svg>
            ${esc(floorText)}
          </span>
          <span class="${verified ? 'verified' : 'verified unverified'}" style="${!verified ? 'color:var(--amber)' : ''}">
            <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>
            ${verified ? 'Oficial' : 'Confirmar'}
          </span>
        </div>
      </article>
    `;
  }

  function renderDirectory() {
    const searchInput = qs('#directorySearch');
    const query = searchInput ? norm(searchInput.value) : '';
    const floor = qs('#floorFilter')?.value || 'all';
    const category = qs('#categoryFilter')?.value || 'all';
    const verified = qs('#verifiedFilter')?.checked || false;
    let list = allPlaces();
    if (query) list = list.filter(p => norm(`${p.name} ${p.categories.join(' ')} ${placeFloorText(p)}`).includes(query));
    if (floor !== 'all') list = list.filter(p => floor === 'unknown' ? !p.locations.length : p.locations.some(l => l.floor === floor));
    if (category !== 'all') list = list.filter(p => p.categories.includes(category));
    if (verified) list = list.filter(p => p.locations.length && p.locations.every(l => l.verified !== false));
    if (directoryFavoritesOnly) list = list.filter(p => isFavorite(p.id));
    list.sort((a,b)=>a.name.localeCompare(b.name,'pt'));
    qs('#directoryCount').textContent = `${list.length} resultado${list.length===1?'':'s'}`;
    qs('#directoryGrid').innerHTML = list.length ? list.map(placeCard).join('') : '<div class="empty-state" style="grid-column: 1 / -1; color:var(--muted); text-align:center; padding:40px;">Nenhum local encontrado com estes filtros.</div>';
    
    const favBtn = qs('#directoryFavoritesOnly');
    if (favBtn) favBtn.classList.toggle('active', directoryFavoritesOnly);
  }

  function handleCardListClick(e) {
    const fav = e.target.closest('[data-favorite-id]');
    if (fav) { e.stopPropagation(); toggleFavorite(fav.dataset.favoriteId); return; }
    const card = e.target.closest('[data-place-id]'); if (card) openPlace(card.dataset.placeId);
  }

  function portugalNow() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Lisbon',weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
    const dayMap={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
    return { day:dayMap[parts.weekday], year:+parts.year, month:+parts.month, date:+parts.day, minutes:+parts.hour*60 + +parts.minute, md:`${parts.month}-${parts.day}` };
  }
  const toMinutes = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };

  function activeHourRows() {
    const now=portugalNow();
    return DATA.hours.filter(h=>h.weekdays.includes(now.day)).map(h=>{
      let close=h.close;
      if(h.seasonal && now.md>=h.seasonal.from && now.md<=h.seasonal.to) close=h.seasonal.close;
      return {...h,close,isOpen:now.minutes>=toMinutes(h.open)&&now.minutes<toMinutes(close)};
    });
  }

  function renderHours() {
    const rows=activeHourRows();
    const shopping=rows.find(r=>r.id==='geral');
    const openStatusBtn = qs('#openStatusBtn');
    if (openStatusBtn) {
      openStatusBtn.className = `status ${shopping?.isOpen?'open':'closed'}`;
    }
    qs('#openStatusText').textContent=shopping?.isOpen?'Shopping aberto':'Shopping fechado';
    const unique=[]; rows.forEach(r=>{if(!unique.some(x=>x.name===r.name)) unique.push(r);});
    qs('#hoursStrip').innerHTML=unique.slice(0,4).map(hourCard).join('');
    qs('#hoursDialogList').innerHTML=unique.map(r=>`<div class="mini-row"><span><b>${esc(r.name)}</b><br><small>${r.isOpen?'Aberto agora':'Fechado agora'}</small></span><small>${esc(r.open)}–${esc(r.close)}</small></div>`).join('');
  }
  
  function hourCard(r){return `<div class="mini-row" style="background:#ffffff; border:1px solid var(--line); flex-shrink:0; width:130px; display:block;"><b>${esc(r.name)}</b><span style="color:${r.isOpen?'var(--green)':'var(--red)'}; font-size:10px; font-weight:700;">● ${r.isOpen?'Aberto':'Fechado'}</span><br><small style="color:var(--muted); font-size:9px;">${esc(r.open)}–${esc(r.close)}</small></div>`;}

  function renderReferences() {
    qs('#referenceCards').innerHTML = Object.values(DATA.orientation).map(x=>`<div class="reference" style="display:flex; justify-content:space-between; width:100%; border-bottom:1px solid var(--line-2); padding:10px 4px;"><b>${esc(x.label)}</b><span>${esc(x.reference)}</span></div>`).join('');
  }

  function randomItem(arr){return arr[Math.floor(Math.random()*arr.length)];}
  function shuffle(arr){return [...arr].sort(()=>Math.random()-.5);}

  function makeCompassQuestion(){
    const items=Object.values(DATA.orientation);
    const correct=randomItem(items);
    const styles=Math.random()<.5;
    return styles?{type:'DIREÇÃO',question:`Qual referência corresponde a ${correct.label}?`,correct:correct.reference,answers:shuffle(items.map(x=>x.reference)),explain:`${correct.label}: ${correct.reference}.`}
      :{type:'REFERÊNCIA',question:`“${correct.reference}” indica qual direção?`,correct:correct.label,answers:shuffle(items.map(x=>x.label)),explain:`${correct.reference} = ${correct.label}.`};
  }

  function makeFloorQuestion(){
    const candidates=window.PG_SEARCH_CATALOG_V2.stores.filter(s=>effectiveLocations(s).some(l=>floors.includes(l.floor)&&l.verified!==false));
    const store=randomItem(candidates); const loc=randomItem(effectiveLocations(store).filter(l=>floors.includes(l.floor)));
    const choices=new Set([loc.floor]); while(choices.size<4) choices.add(randomItem(floors));
    return {type:'PISO',question:`Em que piso fica ${store.name}?`,correct:loc.floor,answers:shuffle([...choices]),explain:`${store.name}: ${floorLabel(loc.floor)}${loc.unit?`, unidade ${loc.unit}`:''}.`};
  }

  function nextQuestion(){
    currentQuestion = trainingMode==='compass'?makeCompassQuestion():trainingMode==='floors'?makeFloorQuestion():(Math.random()<.5?makeCompassQuestion():makeFloorQuestion());
    qs('#quizType').textContent=currentQuestion.type; qs('#quizQuestion').textContent=currentQuestion.question;
    qs('#quizAnswers').innerHTML=currentQuestion.answers.map(a=>`<button class="answer-btn select-lite" style="height:auto; padding:12px; font-size:11px;" type="button" data-answer="${esc(a)}">${currentQuestion.type==='PISO'?esc(floorLabel(a)):esc(a)}</button>`).join('');
    qs('#quizFeedback').classList.add('hidden'); qs('#nextQuestionBtn').classList.add('hidden');
    renderTrainingScore();
  }

  function answerQuestion(answer){
    const ok=answer===currentQuestion.correct; saved.quiz.total++; if(ok)saved.quiz.correct++; saveState();
    qsa('.answer-btn',qs('#quizAnswers')).forEach(btn=>{
      btn.disabled=true;
      if(btn.dataset.answer===currentQuestion.correct) btn.setAttribute('style', 'background:var(--green-soft); color:var(--green); border-color:#b7e7d1;');
      else if(btn.dataset.answer===answer) btn.setAttribute('style', 'background:var(--red-soft); color:var(--red); border-color:#fca5a5;');
    });
    const feedback=qs('#quizFeedback'); 
    feedback.textContent=`${ok?'Certo!':'Ainda não.'} ${currentQuestion.explain}`; 
    feedback.className = `quiz-feedback ${ok ? 'confidence-high' : 'confidence-low'}`;
    qs('#nextQuestionBtn').classList.remove('hidden'); renderTrainingScore();
  }

  function renderTrainingScore(){qs('#trainingScore').textContent=`${saved.quiz.correct} / ${saved.quiz.total}`;}

  function patrolKey(){const n=portugalNow();return `${n.year}-${String(n.month).padStart(2,'0')}-${String(n.date).padStart(2,'0')}`;}
  
  function renderPatrol(){
    const key=patrolKey(); const done=saved.patrol[key]||[];
    qs('#patrolChecklist').innerHTML=floors.map(f=>`<label class="patrol-item"><input type="checkbox" data-patrol-floor="${f}" ${done.includes(f)?'checked':''}/><span><b>${floorLabel(f)}</b><br><small class="muted-note">Confirmar referências e pontos essenciais</small></span></label>`).join('');
  }

  const noteTemplates = {
    radio: 'Charlie, aqui [nome/posição]. Tenho uma ocorrência no Papa [X], junto a [loja/referência]. Trata-se de [descrição]. Solicito Alpha.',
    crianca: 'Charlie, Sierra menor [perdido/encontrado] no Papa [X], junto a [referência]. Descrição: [roupa/idade]. Aguardo com o Sierra menor.',
    objeto: 'Charlie, objeto [encontrado/perdido] no Papa [X], junto a [referência]. Encaminhado para Bravo India às [hora].',
    emergencia: 'Charlie, emergência médica/segurança no Papa [X], junto a [referência]. Ocorrência: [tipo]. Solicito Alpha com prioridade máxima.',
    limaEco: 'Charlie, anomalia na Lima Eco junto a [referência exterior]. Solicito manutenção.'
  };

  function renderNotes(){
    const labels={
      radio:{title:'Comunicação por rádio',hint:'Mensagem curta e objetiva'},
      crianca:{title:'Criança / Sierra menor',hint:'Contacto de menor com a Central'},
      objeto:{title:'Objeto perdido',hint:'Registo e encaminhamento para Bravo India'},
      emergencia:{title:'Emergência',hint:'Comunicação prioritária'},
      limaEco:{title:'Iluminação Exterior (Lima Eco)',hint:'Anomalia nas luzes exteriores'}
    };
    qs('#operationalNotes').innerHTML=Object.entries(labels).map(([id,item])=>`<article class="note-editor" style="background:#ffffff">
      <div class="note-head"><div><span>${esc(item.hint)}</span><b>${esc(item.title)}</b></div><button data-copy-note="${id}" type="button">Copiar</button></div>
      <textarea data-note-id="${id}" aria-label="${esc(item.title)}">${esc(saved.notes[id] ?? noteTemplates[id])}</textarea>
    </article>`).join('');
  }

  async function copyOperationalNote(id) {
    const area = qs(`[data-note-id="${id}"]`);
    if (!area) return;
    try {
      await navigator.clipboard.writeText(area.value);
      toast('Mensagem copiada.');
    } catch {
      area.select();
      document.execCommand('copy');
      toast('Mensagem copiada.');
    }
  }

  function renderMore(){
    qs('#servicesList').innerHTML=window.PG_SEARCH_CATALOG_V2.officialServices.map(s=>`<div class="mini-row" style="background:#ffffff; border:1px solid var(--line); font-size:10px; margin-bottom:4px;"><span>${esc(s.name)}</span><small style="color:var(--muted)">${esc(floorLabel(s.locations?.[0]?.floor || 'unknown'))}</small></div>`).join('');
    qs('#rulesList').innerHTML=DATA.rules.map(r=>`<div class="mini-row" style="background:#ffffff; border:1px solid var(--line); font-size:10px; margin-bottom:4px; display:block;"><b>${esc(r.title)}</b><br><small style="color:var(--muted)">${esc(r.text)}</small></div>`).join('');
    renderNotes(); renderCustomPlaces(); renderFailedSearches();
    const c=DATA.contact;
    qs('#contactCard').innerHTML=`<b>Palácio do Gelo Shopping</b><p style="font-size:11px; margin:4px 0 0; line-height:1.5">${esc(c.address)}<br><a href="tel:${esc(c.phone.replace(/\s/g,''))}">${esc(c.phone)}</a> · <a href="tel:${esc(c.mobile.replace(/\s/g,''))}">${esc(c.mobile)}</a><br><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>`;
    qs('#sourcesList').innerHTML=DATA.sources.map(s=>`<a href="${esc(s.url)}" class="select-lite" style="height:32px; padding:0 8px; font-size:10px; display:inline-flex; align-items:center; text-decoration:none;" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join('');
    qs('#dataNote').textContent=DATA.dataNote;
  }

  function renderCustomPlaces(){
    const el=qs('#customPlacesList');
    el.innerHTML=saved.customPlaces.length?saved.customPlaces.map(p=>`<button class="mini-row" style="background:#ffffff; border:1px solid var(--line); margin-bottom:4px; width:100%" data-place-id="${esc(p.id)}" type="button"><span>${esc(p.name)}</span><small>${esc(floorLabel(p.floor))}${p.unit?` · ${esc(p.unit)}`:''}</small></button>`).join(''):'<p class="muted-note" style="margin:8px 0 0; color:var(--muted)">Nenhum ponto personalizado.</p>';
  }

  function renderFailedSearches() {
    const el = qs('#failedSearchesList');
    if (!el) return;
    const list = Object.values(saved.failedSearches || {}).sort((a,b) => b.count - a.count);
    el.innerHTML = list.length
      ? list.map(item => `
          <div class="mini-row" style="background:#ffffff; border:1px solid var(--line); margin-bottom:4px;">
            <span><b>${esc(item.original)}</b><br><small style="color:var(--muted)">Normalizado: ${esc(item.term)} · Tentativas: ${item.count}</small></span>
            <small style="color:var(--muted)">Última: ${new Date(item.lastSeen).toLocaleDateString()}</small>
          </div>
        `).join('')
      : '<p class="muted-note" style="margin:8px 0 0; color:var(--muted)">Nenhuma pesquisa sem correspondência.</p>';
  }

  function renderDashboard() {
    const notesCount = Object.values(saved.notes).filter(Boolean).length;
    qs('#dbNotas').textContent = notesCount;

    const favCount = saved.favorites.length;
    qs('#dbFavoritos').textContent = favCount;

    const customCount = saved.customPlaces.length;
    qs('#dbPersonalizados').textContent = customCount;

    const key = patrolKey();
    const patrolFloors = saved.patrol[key] || [];
    const patrolPct = Math.round((patrolFloors.length / 7) * 100);
    
    qs('#dbRondas').textContent = `${patrolFloors.length}/7`;
    const dbRondasTools = qs('#dbRondasTools');
    if (dbRondasTools) dbRondasTools.textContent = `${patrolFloors.length}/7`;
    
    qs('#dbProgressPct').textContent = `${patrolPct}%`;
    qs('#dbProgressFill').style.width = `${patrolPct}%`;

    const noteEl = qs('#homeNotice');
    const noteTextEl = qs('#homeNoticeText');
    const radioNote = saved.notes['radio'] || noteTemplates.radio;
    if (noteTextEl) {
      if (radioNote && radioNote !== noteTemplates.radio) {
        noteTextEl.textContent = `Nota de rádio atual: "${radioNote}"`;
        if (noteEl) noteEl.style.display = 'flex';
      } else {
        noteTextEl.textContent = 'Nenhuma ocorrência de rádio gravada. Edite em Ferramentas.';
      }
    }
  }

  function initDynamicCounts() {
    const catalog = window.PG_SEARCH_CATALOG_V2;
    const customCount = saved.customPlaces.length;
    const storeRecords = catalog.scope.storeRecords;
    const officialServiceRecords = catalog.scope.officialServiceRecords;

    const totalStores = storeRecords + customCount;
    const totalServices = officialServiceRecords;

    qs('#metricStores').textContent = totalStores;
    qs('#metricServices').textContent = totalServices;
    
    const catalogCheckedCount = catalog.stores.filter(s => s.evidenceLevel === 'official_brand_catalog_checked').length;
    qs('#metricCatalog').textContent = catalogCheckedCount;

    qs('#homeStatCount').textContent = totalStores + totalServices;
    qs('#homeStatLabel').textContent = 'locais e serviços indexados';

    qs('#directoryHeaderCount').textContent = `${totalStores} LOJAS + ${totalServices} SERVIÇOS`;
  }

  function renderAll(){
    renderFavorites();renderHours();renderMap();renderDirectory();renderReferences();renderTrainingScore();renderPatrol();renderMore();renderDashboard();
    initDynamicCounts();
  }

  function exportData(){
    const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),data:saved},null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`pg-guia-copia-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast('Cópia exportada.');
  }

  function bindEvents(){
    qsa('.mobile-nav button, #desktopNav button').forEach(btn=>btn.addEventListener('click',()=>navTo(btn.dataset.nav || btn.dataset.view)));
    qsa('[data-nav-target]').forEach(btn=>btn.addEventListener('click',()=>navTo(btn.dataset.navTarget)));
    
    const homeSearch = qs('#homeSearch');
    const homeSearchResults = qs('#homeSearchResults');
    if (homeSearch && homeSearchResults) {
      wireSearch(homeSearch, homeSearchResults);
    }

    on('#favoritesList', 'click', handleCardListClick);
    on('#floorPlaces', 'click', handleCardListClick);
    on('#directoryGrid', 'click', handleCardListClick);

    ['input','change'].forEach(ev=>{
      on('#directorySearch', ev, renderDirectory);
      on('#floorFilter', ev, renderDirectory);
      on('#categoryFilter', ev, renderDirectory);
      on('#verifiedFilter', ev, renderDirectory);
    });

    const clearFilters = qs('#clearFilters');
    if (clearFilters) {
      clearFilters.onclick=()=>{qs('#directorySearch').value='';qs('#floorFilter').value='all';qs('#categoryFilter').value='all';qs('#verifiedFilter').checked=false;directoryFavoritesOnly=false;renderDirectory();};
    }

    const dirFavOnly = qs('#directoryFavoritesOnly');
    if (dirFavOnly) {
      dirFavOnly.onclick=()=>{directoryFavoritesOnly=!directoryFavoritesOnly;renderDirectory();};
    }

    qsa('.compass-point').forEach(btn=>btn.onclick=()=>{const d=DATA.orientation[btn.dataset.direction];toast(`${d.label}: ${d.reference}.`);});
    qsa('[data-action="open-floor"]').forEach(btn=>btn.onclick=()=>{selectedFloor=btn.dataset.floor;navTo('map');});
    qsa('[data-action="find-place"]').forEach(btn=>btn.onclick=()=>{
      const p=allPlaces().find(x=>norm(x.name)===norm(btn.dataset.place));
      if(p) openPlace(p.id);
    });

    const openStatusBtn = qs('#openStatusBtn');
    const showAllHours = qs('#showAllHours');
    if (openStatusBtn) openStatusBtn.onclick = () => qs('#hoursDialog').showModal();
    if (showAllHours) showAllHours.onclick = () => qs('#hoursDialog').showModal();

    const zoomInBtn = qs('#zoomInBtn');
    const zoomOutBtn = qs('#zoomOutBtn');
    const resetZoomBtn = qs('#resetZoomBtn');
    if (zoomInBtn) zoomInBtn.onclick=()=>{mapScale=Math.min(2.2,mapScale+.2);renderMap();};
    if (zoomOutBtn) zoomOutBtn.onclick=()=>{mapScale=Math.max(.8,mapScale-.2);renderMap();};
    if (resetZoomBtn) resetZoomBtn.onclick=()=>{mapScale=1;renderMap();};

    const markModeBtn = qs('#markModeBtn');
    if (markModeBtn) {
      markModeBtn.onclick=()=>{markMode=!markMode;markModeBtn.classList.toggle('active',markMode);markModeBtn.textContent=markMode?'Toque no mapa…':'+ Marcar ponto';toast(markMode?'Toque no local exato do mapa.':'Modo de marcação cancelado.');};
    }

    const mapViewport = qs('#mapViewport');
    if (mapViewport) {
      mapViewport.addEventListener('click',e=>{
        if(!markMode||selectedFloor!=='0'||e.target.closest('.map-marker'))return;
        const img=qs('#floorMapImage');const r=img.getBoundingClientRect();const x=((e.clientX-r.left)/r.width*100).toFixed(1);const y=((e.clientY-r.top)/r.height*100).toFixed(1);
        markMode=false;if (markModeBtn) { markModeBtn.classList.remove('active'); markModeBtn.textContent='+ Marcar ponto'; } openCustomForm(null,{x,y});
      });
    }

    const addCustomPlaceBtn = qs('#addCustomPlaceBtn');
    if (addCustomPlaceBtn) addCustomPlaceBtn.onclick=()=>openCustomForm();

    qsa('[data-close-dialog]').forEach(btn=>btn.onclick=()=>qs(`#${btn.dataset.closeDialog}`).close());
    
    const customPlaceForm = qs('#customPlaceForm');
    if (customPlaceForm) {
      customPlaceForm.addEventListener('submit',e=>{
        e.preventDefault();const form=e.currentTarget;const fd=new FormData(form);const obj=Object.fromEntries(fd.entries());
        if(form.dataset.mode==='store'){
          saved.overrides[form.dataset.id]={floor:obj.floor,unit:obj.unit,direction:obj.direction,note:obj.note};toast('Correção guardada neste dispositivo.');
        }else if(form.dataset.mode==='custom-edit'){
          const p=getCustom(form.dataset.id);if(p)Object.assign(p,{name:obj.name,floor:obj.floor,unit:obj.unit,direction:obj.direction,note:obj.note,x:obj.x,y:obj.y});toast('Local atualizado.');
        }else{
          saved.customPlaces.push({id:`custom-${Date.now()}`,name:obj.name,floor:obj.floor,unit:obj.unit,direction:obj.direction,note:obj.note,x:obj.x,y:obj.y});toast('Local adicionado.');
        }
        saveState();qs('#formDialog').close();renderAll();
      });
    }

    const quizAnswers = qs('#quizAnswers');
    if (quizAnswers) {
      quizAnswers.onclick=e=>{const b=e.target.closest('[data-answer]');if(b&&!b.disabled)answerQuestion(b.dataset.answer);};
    }
    const nextQuestionBtn = qs('#nextQuestionBtn');
    if (nextQuestionBtn) nextQuestionBtn.onclick=nextQuestion;

    qsa('[data-training-mode]').forEach(btn=>btn.onclick=()=>{trainingMode=btn.dataset.trainingMode;qsa('[data-training-mode]').forEach(x=>x.classList.toggle('active',x===btn));nextQuestion();});
    
    const patrolChecklist = qs('#patrolChecklist');
    if (patrolChecklist) {
      patrolChecklist.onchange=e=>{const cb=e.target.closest('[data-patrol-floor]');if(!cb)return;const key=patrolKey();const set=new Set(saved.patrol[key]||[]);cb.checked?set.add(cb.dataset.patrolFloor):set.delete(cb.dataset.patrolFloor);saved.patrol[key]=[...set];saveState();renderAll();};
    }
    const resetPatrolBtn = qs('#resetPatrolBtn');
    if (resetPatrolBtn) resetPatrolBtn.onclick=()=>{saved.patrol[patrolKey()]=[];saveState();renderAll();};
    
    const opsNotes = qs('#operationalNotes');
    if (opsNotes) {
      opsNotes.addEventListener('input',e=>{const area=e.target.closest('[data-note-id]');if(!area)return;saved.notes[area.dataset.noteId]=area.value;saveState();renderDashboard();});
      opsNotes.addEventListener('click',e=>{const btn=e.target.closest('[data-copy-note]');if(btn)copyOperationalNote(btn.dataset.copyNote);});
    }

    const customPlacesList = qs('#customPlacesList');
    if (customPlacesList) {
      customPlacesList.onclick=e=>{const id=e.target.closest('[data-place-id]')?.dataset.placeId;if(id)openPlace(id);};
    }

    const exportDataBtn = qs('#exportDataBtn');
    const importDataBtn = qs('#importDataBtn');
    const importDataInput = qs('#importDataInput');
    if (exportDataBtn) exportDataBtn.onclick=exportData;
    if (importDataBtn) importDataBtn.onclick=()=>importDataInput?.click();
    if (importDataInput) {
      importDataInput.onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const parsed=JSON.parse(await f.text());saved={...defaultState,...(parsed.data||parsed)};saveState();renderAll();toast('Cópia importada.');}catch{toast('Não foi possível importar este ficheiro.');}};
    }

    const clearFailedSearchesBtn = qs('#clearFailedSearchesBtn');
    const exportFailedSearchesBtn = qs('#exportFailedSearchesBtn');
    if (clearFailedSearchesBtn) {
      clearFailedSearchesBtn.onclick = () => {
        if (confirm('Limpar histórico de pesquisas sem correspondência?')) {
          saved.failedSearches = {}; saveState(); renderFailedSearches();
        }
      };
    }
    if (exportFailedSearchesBtn) {
      exportFailedSearchesBtn.onclick = () => {
        const blob = new Blob([JSON.stringify(saved.failedSearches || {}, null, 2)],{type:'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `pg-pesquisas-falhadas-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast('Cópia de pesquisas exportada.');
      };
    }

    const installBtn = qs('#installBtn');
    const voiceSearchBtn = qs('#voiceSearchBtn');
    if (voiceSearchBtn) voiceSearchBtn.onclick=startVoiceSearch;

    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;if(installBtn)installBtn.classList.remove('hidden');});
    if (installBtn) {
      installBtn.onclick=async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;installBtn.classList.add('hidden');};
    }
  }

  function startVoiceSearch(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){toast('Pesquisa por voz não está disponível neste navegador.');return;}
    const r=new SR();r.lang='pt-PT';r.interimResults=false;r.maxAlternatives=1;
    qs('#voiceSearchBtn').textContent='…';
    r.onresult=e=>{const text=e.results[0][0].transcript;qs('#homeSearch').value=text;qs('#homeSearch').dispatchEvent(new Event('input'));};
    r.onerror=()=>toast('Não foi possível ouvir. Tente novamente.');
    r.onend=()=>qs('#voiceSearchBtn').textContent='◉';r.start();
  }

  function initFilters(){
    const categories=[...new Set(window.PG_SEARCH_CATALOG_V2.stores.flatMap(s=>s.categories))].sort((a,b)=>a.localeCompare(b,'pt'));
    const catFilter = qs('#categoryFilter');
    if (catFilter) {
      catFilter.innerHTML='<option value="all">Todas as categorias</option>'+categories.map(c=>`<option>${esc(c)}</option>`).join('');
    }
  }

  function bindPositionAndSOS() {
    const sosBtn = qs('#sosBtn');
    if (sosBtn) sosBtn.onclick = () => qs('#sosDialog').showModal();

    qsa('.chip-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const searchInput = qs('#homeSearch');
        if (searchInput) {
          searchInput.value = btn.dataset.search;
          renderSearchResults(searchInput.value, qs('#homeSearchResults'));
          searchInput.focus();
        }
      };
    });

    let isCompassActive = false;
    const centerBtn = qs('.compass-center');

    if (centerBtn) {
      centerBtn.onclick = async () => {
        if (isCompassActive) {
          window.removeEventListener('deviceorientation', handleOrientation);
          isCompassActive = false;
          const compassCard = qs('.compass-card');
          if (compassCard) compassCard.style.transform = 'rotate(0deg)';
          centerBtn.classList.remove('active');
          toast('Bússola real desativada.');
          return;
        }

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
              startCompass();
            } else {
              toast('Permissão de giroscópio recusada.');
            }
          } catch (err) {
            toast('Erro ao solicitar giroscópio.');
          }
        } else {
          startCompass();
        }
      };
    }

    function startCompass() {
      window.addEventListener('deviceorientation', handleOrientation, true);
      isCompassActive = true;
      if (centerBtn) centerBtn.classList.add('active');
      toast('Bússola giroscópica ativada!');
    }

    function handleOrientation(e) {
      let heading = 0;
      if (e.webkitCompassHeading) {
        heading = e.webkitCompassHeading;
      } else if (e.alpha) {
        heading = 360 - e.alpha;
      } else {
        return;
      }
      const compassCard = qs('.compass-card');
      if (compassCard) {
        compassCard.style.transform = `rotate(${-heading}deg)`;
        compassCard.style.transition = 'transform 0.1s ease-out';
      }
    }

    const floorSelect = qs('#userCurrentFloor');
    const dirSelect = qs('#userCurrentDir');

    if (floorSelect) {
      floorSelect.value = saved.userFloor || '0';
      floorSelect.addEventListener('change', e => {
        saved.userFloor = e.target.value;
        saveState();
        renderAll();
      });
    }
    if (dirSelect) {
      dirSelect.value = saved.userDir || '';
      dirSelect.addEventListener('change', e => {
        saved.userDir = e.target.value;
        saveState();
        renderAll();
      });
    }
  }

  function migrateNotes() {
    const oldKeys = ['Central, aqui', 'Criança [encontrada/perdida]', 'Objeto [encontrado/perdido]', 'Central, emergência'];
    for (const [id, value] of Object.entries(saved.notes)) {
      if (oldKeys.some(ok => String(value).includes(ok))) {
        saved.notes[id] = noteTemplates[id];
      }
    }
    if (!saved.notes.limaEco) {
      saved.notes.limaEco = noteTemplates.limaEco;
    }
    saveState();
  }

  function init(){
    window.pgSearch = window.PG_SEARCH_V2.makeSearchEngine(window.PG_SEARCH_CATALOG_V2);
    migrateNotes();
    initFilters();bindEvents();bindPositionAndSOS();renderAll();
    setInterval(renderHours,60000);
    if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js?v=1.3.1').catch(()=>{});
  }
  document.addEventListener('DOMContentLoaded',init);
})();
