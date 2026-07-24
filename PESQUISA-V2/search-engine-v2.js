/*
 * Palácio do Gelo Search Engine v2
 * Drop-in, dependency-free search module for catalogo-pesquisa-v2.js.
 * Truth rule: this module never claims physical stock. It returns catalogue/service compatibility.
 */
(function (global) {
  'use strict';

  const DEFAULTS = {
    maxResults: 12,
    minimumCoverage: 0.67,
    maxTypoDistance: 1,
  };

  function normalizeText(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’‘']/g, '')
      .toLowerCase()
      .replace(/&/g, ' e ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function containsPhrase(haystack, phrase) {
    const h = normalizeText(haystack);
    const p = normalizeText(phrase);
    if (!h || !p) return false;
    return new RegExp(`(?:^|\\s)${escapeRegex(p)}(?:$|\\s)`).test(h);
  }

  function basicWordVariants(word) {
    const w = normalizeText(word);
    const variants = new Set([w]);
    if (w.length > 4 && w.endsWith('s')) variants.add(w.slice(0, -1));
    if (w.length > 5 && w.endsWith('es')) variants.add(w.slice(0, -2));
    if (w.endsWith('oes')) variants.add(`${w.slice(0, -3)}ao`);
    if (w.endsWith('ais')) variants.add(`${w.slice(0, -3)}al`);
    return variants;
  }

  function isSingleAdjacentTransposition(a, b) {
    a = normalizeText(a);
    b = normalizeText(b);
    if (a.length !== b.length || a === b) return false;
    const diffs = [];
    for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) diffs.push(i);
    return diffs.length === 2
      && diffs[1] === diffs[0] + 1
      && a[diffs[0]] === b[diffs[1]]
      && a[diffs[1]] === b[diffs[0]];
  }

  function levenshteinWithin(a, b, maxDistance) {
    a = normalizeText(a);
    b = normalizeText(b);
    if (a === b) return 0;
    if (!a || !b || Math.abs(a.length - b.length) > maxDistance) return Infinity;
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
      const current = [i];
      let rowMin = current[0];
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        current[j] = Math.min(
          current[j - 1] + 1,
          previous[j] + 1,
          previous[j - 1] + cost,
        );
        rowMin = Math.min(rowMin, current[j]);
      }
      if (rowMin > maxDistance) return Infinity;
      previous = current;
    }
    return previous[b.length] <= maxDistance ? previous[b.length] : Infinity;
  }

  function makeSearchEngine(catalog) {
    if (!catalog || !Array.isArray(catalog.stores)) {
      throw new Error('PG Search v2: catálogo inválido ou não carregado.');
    }

    const config = {
      ...DEFAULTS,
      ...(catalog.searchConfiguration || {}),
      weights: {
        exactStoreName: 120,
        storeAlias: 100,
        exactConfirmedPhrase: 90,
        confirmedProductToken: 55,
        officialService: 90,
        synonym: 48,
        category: 24,
        discoveryOnly: 12,
        location: 8,
        typoPenaltyPerEdit: -8,
        ...(catalog.searchConfiguration?.weights || {}),
      },
    };

    const stopwords = new Set((config.stopwords || []).map(normalizeText));
    const synonymEntries = Object.entries(catalog.synonyms || {}).map(([canonical, aliases]) => ({
      canonical,
      canonicalNorm: normalizeText(canonical),
      aliases: [canonical, ...(aliases || [])],
      aliasesNorm: [canonical, ...(aliases || [])].map(normalizeText),
    }));

    function meaningfulTokens(query) {
      return normalizeText(query)
        .split(' ')
        .filter(Boolean)
        .filter((token) => token.length >= (config.minimumMeaningfulTokenLength || 2))
        .filter((token) => !stopwords.has(token));
    }

    function expandQuery(query) {
      const normalized = normalizeText(query);
      const tokens = meaningfulTokens(query);
      const expandedPhrases = new Set();
      const expandedTokens = new Set(tokens);
      const matchedSynonyms = [];

      for (const entry of synonymEntries) {
        const canonicalTokens = meaningfulTokens(entry.canonicalNorm);
        const triggeredAliases = entry.aliasesNorm.filter((alias) => {
          const aliasTokens = meaningfulTokens(alias);
          if (!aliasTokens.length) return false;
          return containsPhrase(normalized, alias) || aliasTokens.every((token) => tokens.includes(token));
        });
        if (!triggeredAliases.length) continue;
        const aliasTokenUnion = new Set([
          ...canonicalTokens,
          ...triggeredAliases.flatMap((alias) => meaningfulTokens(alias)),
        ]);
        matchedSynonyms.push({
          canonical: entry.canonicalNorm,
          canonicalTokens,
          matchedAliases: triggeredAliases,
          aliasTokens: [...aliasTokenUnion],
          coversWholeQuery: tokens.length > 0 && tokens.every((token) => aliasTokenUnion.has(token)),
        });
        expandedPhrases.add(entry.canonicalNorm);
        for (const token of canonicalTokens) expandedTokens.add(token);
      }

      return {
        raw: query,
        normalized,
        tokens,
        expandedTokens: [...expandedTokens],
        expandedPhrases: [...expandedPhrases],
        matchedSynonyms,
        fullQuerySynonymPhrases: matchedSynonyms.filter((item) => item.coversWholeQuery).map((item) => item.canonical),
      };
    }

    function prepareRecord(record) {
      const confirmed = record.confirmedProductFamilies || [];
      const discovery = record.discoveryOnlyTerms || [];
      const categories = record.categories || [];
      const aliases = record.aliases || [];
      const locations = record.locationTerms || [];
      const allTerms = [record.name, ...aliases, ...confirmed, ...discovery, ...categories, ...locations];
      const tokenSet = new Set(allTerms.flatMap((term) => meaningfulTokens(term)));
      return {
        ...record,
        _nameNorm: normalizeText(record.name),
        _aliasNorms: aliases.map(normalizeText),
        _confirmedNorms: confirmed.map(normalizeText),
        _discoveryNorms: discovery.map(normalizeText),
        _categoryNorms: categories.map(normalizeText),
        _locationNorms: locations.map(normalizeText),
        _tokenSet: tokenSet,
        _variantSet: new Set([...tokenSet].flatMap((token) => [...basicWordVariants(token)])),
        _allTokenList: [...tokenSet],
      };
    }

    function prepareService(service) {
      const aliases = service.aliases || [];
      const details = service.details || [];
      const locations = (service.locations || []).flatMap((loc) => [loc.floor ? `piso ${loc.floor}` : '', loc.detail || '']);
      const terms = [service.name, ...aliases, ...details, ...locations].filter(Boolean);
      return {
        ...service,
        _nameNorm: normalizeText(service.name),
        _aliasNorms: aliases.map(normalizeText),
        _termNorms: terms.map(normalizeText),
        _tokenSet: new Set(terms.flatMap((term) => meaningfulTokens(term))),
        _variantSet: new Set(terms.flatMap((term) => meaningfulTokens(term)).flatMap((token) => [...basicWordVariants(token)])),
      };
    }

    const stores = catalog.stores.map(prepareRecord);
    const storesById = new Map(stores.map((store) => [store.id, store]));
    const services = (catalog.officialServices || []).map(prepareService);

    function tokenMatchesRecord(token, record, maxTypoDistance) {
      const variants = basicWordVariants(token);
      for (const variant of variants) {
        if (record._variantSet?.has(variant) || record._tokenSet.has(variant)) return { matched: true, distance: 0, term: variant };
      }
      if (token.length < 5 || maxTypoDistance < 1) return { matched: false };
      for (const candidate of record._allTokenList || record._tokenSet) {
        if (candidate.length < 5) continue;
        const distance = levenshteinWithin(token, candidate, maxTypoDistance);
        if (distance !== Infinity) return { matched: true, distance, term: candidate };
      }
      return { matched: false };
    }

    function scoreStore(store, query) {
      const w = config.weights;
      let score = 0;
      let highConfidence = false;
      const reasons = [];
      const matchedTokens = new Set();
      const matchedTerms = new Set();

      if (query.normalized === store._nameNorm) {
        score += w.exactStoreName;
        highConfidence = true;
        reasons.push('nome exato da loja');
      } else if (containsPhrase(store._nameNorm, query.normalized) || containsPhrase(query.normalized, store._nameNorm)) {
        score += Math.round(w.exactStoreName * 0.75);
        reasons.push('nome da loja');
      }

      for (const alias of store._aliasNorms) {
        if (query.normalized === alias || containsPhrase(query.normalized, alias)) {
          score += w.storeAlias;
          highConfidence = true;
          reasons.push('alias da loja');
          break;
        }
      }

      const phraseCandidates = new Set([query.normalized, ...query.fullQuerySynonymPhrases]);
      for (const phrase of phraseCandidates) {
        if (!phrase || phrase.length < 3) continue;
        const phraseTokens = meaningfulTokens(phrase);
        const confirmed = store._confirmedNorms.find((term) => {
          const termTokens = new Set(meaningfulTokens(term).flatMap((token) => [...basicWordVariants(token)]));
          return phraseTokens.length > 0
            && phraseTokens.every((token) => [...basicWordVariants(token)].some((variant) => termTokens.has(variant)));
        });
        if (confirmed) {
          score += w.exactConfirmedPhrase;
          highConfidence = true;
          matchedTerms.add(confirmed);
          reasons.push('produto/categoria confirmada');
        }
      }

      for (const token of query.tokens) {
        const direct = tokenMatchesRecord(token, store, 0);
        if (direct.matched) {
          matchedTokens.add(token);
          score += w.confirmedProductToken + (direct.distance * w.typoPenaltyPerEdit);
          if (direct.distance > 0) reasons.push(`correção aproximada: ${token} → ${direct.term}`);
        }
      }

      // Synonym bonus is capped once per record. This prevents broad telecom stores
      // from outranking a specialist just because one synonym expands to many words.
      let synonymMatched = false;
      let fullQuerySynonymMatched = false;
      for (const synonym of query.matchedSynonyms) {
        if (!synonym.canonicalTokens.length) continue;
        const allPresent = synonym.canonicalTokens.every((token) => tokenMatchesRecord(token, store, 0).matched);
        if (!allPresent) continue;
        synonymMatched = true;
        matchedTerms.add(synonym.canonical);
        if (synonym.coversWholeQuery) {
          fullQuerySynonymMatched = true;
          for (const token of query.tokens) matchedTokens.add(token);
        }
      }
      if (synonymMatched) {
        score += w.synonym;
        reasons.push('sinónimo de produto/serviço');
      }
      if (fullQuerySynonymMatched) highConfidence = true;

      for (const category of store._categoryNorms) {
        if (query.expandedPhrases.some((phrase) => containsPhrase(category, phrase)) || containsPhrase(category, query.normalized)) {
          score += w.category;
          reasons.push('categoria do diretório');
        }
      }
      for (const term of store._discoveryNorms) {
        if (query.expandedPhrases.some((phrase) => containsPhrase(term, phrase)) || containsPhrase(term, query.normalized)) {
          score += w.discoveryOnly;
          reasons.push('termo de descoberta');
          break;
        }
      }
      for (const location of store._locationNorms) {
        if (containsPhrase(query.normalized, location)) score += w.location;
      }

      const coverage = query.tokens.length ? matchedTokens.size / query.tokens.length : 0;
      const exactName = query.normalized === store._nameNorm || store._aliasNorms.includes(query.normalized);
      if (!exactName && !highConfidence && coverage < config.minimumCoverage) return null;
      if (score <= 0) return null;

      let confidence = 'low';
      let label = catalog.truthPolicy?.resultLabels?.palacio_business_category_only || 'Correspondência por categoria; confirmar';
      if (store.evidenceLevel === 'official_brand_catalog_checked' && (highConfidence || coverage >= 0.75)) {
        confidence = 'high';
        label = catalog.truthPolicy?.resultLabels?.official_brand_catalog_checked || 'Categoria oficial da marca; stock local por confirmar';
      } else if (store.evidenceLevel === 'brand_assortment_or_explicit_service_curated' && (highConfidence || coverage >= 0.75)) {
        confidence = 'medium';
        label = catalog.truthPolicy?.resultLabels?.brand_assortment_or_explicit_service_curated || 'Categoria conhecida; confirmar na loja';
      }
      if (!store.currentOfficialDirectoryMatch && store.kind !== 'service') {
        confidence = 'low';
        label = 'Registo não correspondido no diretório oficial atual; confirmar antes de indicar';
        score -= 40;
      }

      return {
        type: 'store',
        id: store.id,
        name: store.name,
        score,
        confidence,
        label,
        reasons: [...new Set(reasons)],
        matchedTerms: [...matchedTerms],
        matchedTokenCoverage: Number(coverage.toFixed(2)),
        locations: store.locations || [],
        categories: store.categories || [],
        officialCenterUrl: store.officialCenterUrl || null,
        currentOfficialDirectoryMatch: Boolean(store.currentOfficialDirectoryMatch),
        stockGuaranteed: false,
        availabilityMessage: store.availabilityMessage,
      };
    }

    function scoreService(service, query) {
      const w = config.weights;
      let score = 0;
      const matchedTokens = new Set();
      const reasons = [];

      if (query.normalized === service._nameNorm || containsPhrase(query.normalized, service._nameNorm)) {
        score += w.officialService + 30;
        reasons.push('nome exato do serviço');
      }
      if (service._aliasNorms.some((alias) => query.normalized === alias || containsPhrase(query.normalized, alias))) {
        score += w.officialService;
        reasons.push('alias oficial do serviço');
      }
      for (const token of query.tokens) {
        const match = tokenMatchesRecord(token, service, 0);
        if (match.matched) {
          matchedTokens.add(token);
          score += 45 + (match.distance * w.typoPenaltyPerEdit);
        }
      }
      for (const phrase of query.expandedPhrases) {
        if (service._termNorms.some((term) => containsPhrase(term, phrase) || containsPhrase(phrase, term))) {
          score += w.synonym;
        }
      }
      const coverage = query.tokens.length ? matchedTokens.size / query.tokens.length : 0;
      if (score <= 0 || (coverage < config.minimumCoverage && !reasons.length)) return null;

      const providers = (service.providerStoreIds || [])
        .map((id) => storesById.get(id))
        .filter(Boolean)
        .map((store) => ({ id: store.id, name: store.name, locations: store.locations || [] }));

      return {
        type: 'service',
        id: service.id,
        name: service.name,
        score: score + 10,
        confidence: service.confirmed ? 'high' : 'low',
        label: service.confirmed ? 'Serviço confirmado no site oficial do Palácio do Gelo' : 'Serviço presente na base, mas localização ainda por confirmar',
        reasons,
        providers,
        locations: service.locations || [],
        details: service.details || [],
        note: service.note || '',
        stockGuaranteed: null,
      };
    }

    function fuzzyStoreNameResults(query) {
      if (query.tokens.length !== 1 || query.tokens[0].length < 5) return [];
      const token = query.tokens[0];
      return stores.flatMap((store) => {
        const candidates = [store._nameNorm, ...store._aliasNorms]
          .flatMap((name) => name.split(' '))
          .filter((word) => word.length >= 5);
        let best = Infinity;
        let bestWord = null;
        for (const candidate of candidates) {
          const allowedDistance = token.length >= 6 ? Math.max(2, config.maxTypoDistance) : config.maxTypoDistance;
          const d = isSingleAdjacentTransposition(token, candidate)
            ? 1
            : levenshteinWithin(token, candidate, allowedDistance);
          if (d < best) { best = d; bestWord = candidate; }
        }
        if (best === Infinity) return [];
        const firstLastBonus = (bestWord && token[0] === bestWord[0] ? 5 : 0)
          + (bestWord && token.at(-1) === bestWord.at(-1) ? 5 : 0)
          + (bestWord && token.length === bestWord.length ? 8 : 0);
        return [{
          type: 'store', id: store.id, name: store.name,
          score: 60 + firstLastBonus + (best * config.weights.typoPenaltyPerEdit), confidence: 'low',
          label: `Possível correção do nome: ${token} → ${bestWord}`,
          reasons: ['correção aproximada do nome da loja'], matchedTerms: [bestWord],
          matchedTokenCoverage: 1, locations: store.locations || [], categories: store.categories || [],
          officialCenterUrl: store.officialCenterUrl || null,
          currentOfficialDirectoryMatch: Boolean(store.currentOfficialDirectoryMatch),
          stockGuaranteed: false, availabilityMessage: store.availabilityMessage,
        }];
      });
    }

    function search(rawQuery, options = {}) {
      const query = expandQuery(rawQuery);
      if (!query.tokens.length && !query.normalized) return [];
      const maxResults = options.maxResults || config.maxResults || DEFAULTS.maxResults;
      let results = [
        ...services.map((service) => scoreService(service, query)).filter(Boolean),
        ...stores.map((store) => scoreStore(store, query)).filter(Boolean),
      ];
      if (!results.length) results = fuzzyStoreNameResults(query);
      return results
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'pt'))
        .slice(0, maxResults);
    }

    return {
      search,
      normalizeText,
      meaningfulTokens,
      expandQuery,
      getStoreById: (id) => storesById.get(id) || null,
      getCatalog: () => catalog,
    };
  }

  const api = { makeSearchEngine, normalizeText };
  global.PG_SEARCH_V2 = api;
  if (global.PG_SEARCH_CATALOG_V2) {
    global.pgSearch = makeSearchEngine(global.PG_SEARCH_CATALOG_V2);
  }
})(typeof window !== 'undefined' ? window : globalThis);
