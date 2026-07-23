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
  const catalogKeywords = {
    // Malas / Carteiras / Acessórios
    'malas': ['cavalinho', 'parfois', 'primark', 'seaside', 'vilanova', 'aldo', 'calcado-guimaraes', 'h-m', 'c-a', 'lacoste', 'quebramar', 'cortefiel', 'benetton', 'auchan', 'tous', 'desigual', 'lion-of-porches', 'mango', 'springfield', 'salsa-jeans', 'sacoor-blue', 'upstyle', 'natura-selection', 'deichmann'],
    'mala': ['cavalinho', 'parfois', 'primark', 'seaside', 'vilanova', 'aldo', 'calcado-guimaraes', 'h-m', 'c-a', 'lacoste', 'quebramar', 'cortefiel', 'benetton', 'auchan', 'tous', 'desigual', 'lion-of-porches', 'mango', 'springfield', 'salsa-jeans', 'sacoor-blue', 'upstyle', 'natura-selection', 'deichmann'],
    'carteiras': ['cavalinho', 'parfois', 'primark', 'seaside', 'vilanova', 'aldo', 'calcado-guimaraes', 'h-m', 'c-a', 'sacoor-blue', 'lacoste', 'quebramar', 'cortefiel', 'benetton', 'auchan', 'tous', 'ourivesaria-pereirinha', 'desigual', 'lion-of-porches', 'mango', 'springfield', 'salsa-jeans', 'upstyle', 'natura-selection'],
    'carteira': ['cavalinho', 'parfois', 'primark', 'seaside', 'vilanova', 'aldo', 'calcado-guimaraes', 'h-m', 'c-a', 'sacoor-blue', 'lacoste', 'quebramar', 'cortefiel', 'benetton', 'auchan', 'tous', 'ourivesaria-pereirinha', 'desigual', 'lion-of-porches', 'mango', 'springfield', 'salsa-jeans', 'upstyle', 'natura-selection'],
    'viagem': ['agencia-abreu', 'auchan', 'primark', 'parfois', 'seaside'],
    'maletas': ['cavalinho', 'parfois', 'primark', 'seaside', 'aldo', 'calcado-guimaraes', 'auchan'],

    // Óculos / Lentes / Oftalmologia
    'oculos': ['fabrica-dos-oculos', 'multiopticas', 'omb-grupo-optico', 'wells', 'hawkers', 'farmacia-pinto-de-campos'],
    'óculos': ['fabrica-dos-oculos', 'multiopticas', 'omb-grupo-optico', 'wells', 'hawkers', 'farmacia-pinto-de-campos'],
    'lentes': ['fabrica-dos-oculos', 'multiopticas', 'omb-grupo-optico', 'wells', 'hawkers'],
    'oftalmologia': ['fabrica-dos-oculos', 'multiopticas', 'omb-grupo-optico', 'wells'],
    'consultas': ['fabrica-dos-oculos', 'multiopticas', 'omb-grupo-optico', 'wells', 'unilabs', 'widex'],
    'exames': ['fabrica-dos-oculos', 'multiopticas', 'omb-grupo-optico', 'wells'],

    // Relógios / Joias / Bateria de Relógio e Reparação
    'relogios': ['bluebird', 'tous', 'ourivesaria-pereirinha', 'primark', 'auchan'],
    'relogio': ['bluebird', 'tous', 'ourivesaria-pereirinha', 'primark', 'auchan'],
    'relógio': ['bluebird', 'tous', 'ourivesaria-pereirinha', 'primark', 'auchan'],
    'joias': ['tous', 'ourivesaria-pereirinha', 'bluebird', 'primark', 'auchan'],
    'ouro': ['ourivesaria-pereirinha', 'tous', 'bluebird'],
    'prata': ['ourivesaria-pereirinha', 'tous', 'bluebird', 'parfois'],
    'alianças': ['ourivesaria-pereirinha', 'tous', 'bluebird'],
    'brincos': ['bluebird', 'tous', 'ourivesaria-pereirinha', 'parfois', 'primark'],
    'bateria relógio': ['ourivesaria-pereirinha', 'bluebird', 'tous', 'mister-minit'],
    'consertar relógio': ['ourivesaria-pereirinha', 'bluebird', 'tous', 'mister-minit'],
    'consertar relogio': ['ourivesaria-pereirinha', 'bluebird', 'tous', 'mister-minit'],
    'reparar relogio': ['ourivesaria-pereirinha', 'bluebird', 'tous', 'mister-minit'],
    'reparar relógio': ['ourivesaria-pereirinha', 'bluebird', 'tous', 'mister-minit'],
    'pilha relógio': ['ourivesaria-pereirinha', 'bluebird', 'tous', 'mister-minit'],
    'pilha relogio': ['ourivesaria-pereirinha', 'bluebird', 'tous', 'mister-minit'],
    'bracelete': ['ourivesaria-pereirinha', 'bluebird', 'tous', 'mister-minit'],
    'furar orelha': ['bluebird', 'tous', 'ourivesaria-pereirinha'],
    'furar orelhas': ['bluebird', 'tous', 'ourivesaria-pereirinha'],
    'furo orelha': ['bluebird', 'tous', 'ourivesaria-pereirinha'],
    'piercing': ['bluebird', 'tous', 'ourivesaria-pereirinha'],

    // Telemóveis / Reparações / Tecnologia
    'telemovel': ['meo', 'vodafone', 'nos', 'iservices', 'la-casa-de-las-carcasas', 'worten', 'worten-mobile', 'mi-store-xiaomi', 'pc-speed', 'fnac', 'auchan'],
    'telemóvel': ['meo', 'vodafone', 'nos', 'iservices', 'la-casa-de-las-carcasas', 'worten', 'worten-mobile', 'mi-store-xiaomi', 'pc-speed', 'fnac', 'auchan'],
    'smartphones': ['meo', 'vodafone', 'nos', 'iservices', 'la-casa-de-las-carcasas', 'worten', 'worten-mobile', 'mi-store-xiaomi', 'pc-speed', 'fnac', 'auchan'],
    'reparacao': ['iservices', 'pc-speed', 'worten', 'fnac', 'mister-minit', 'mundicor'],
    'reparação': ['iservices', 'pc-speed', 'worten', 'fnac', 'mister-minit', 'mundicor'],
    'conserto': ['iservices', 'pc-speed', 'worten', 'fnac', 'mister-minit', 'mundicor'],
    'arranjar': ['iservices', 'pc-speed', 'worten', 'fnac', 'mister-minit', 'mundicor'],
    'capas': ['la-casa-de-las-carcasas', 'iservices', 'fnac', 'worten', 'mi-store-xiaomi', 'worten-mobile'],
    'película': ['la-casa-de-las-carcasas', 'iservices', 'fnac', 'worten', 'mi-store-xiaomi', 'worten-mobile'],
    'tablet': ['fnac', 'worten', 'mi-store-xiaomi', 'radio-popular', 'meo', 'vodafone', 'nos'],
    'computador': ['fnac', 'worten', 'radio-popular', 'pc-speed'],
    'portatil': ['fnac', 'worten', 'radio-popular', 'pc-speed'],
    'portátil': ['fnac', 'worten', 'radio-popular', 'pc-speed'],
    'televisores': ['worten', 'radio-popular', 'fnac', 'mi-store-xiaomi'],
    'tv': ['worten', 'radio-popular', 'fnac', 'mi-store-xiaomi'],
    'eletrodomésticos': ['worten', 'radio-popular', 'auchan'],
    'frigorifico': ['worten', 'radio-popular', 'auchan'],
    'chaves': ['mister-minit'],
    'costura': ['mundicor'],

    // Dinheiro / Bancos / Câmbios
    'dinheiro': ['multibanco', 'millennium-bcp', 'unicambio'],
    'levantamento': ['multibanco', 'millennium-bcp'],
    'banco': ['millennium-bcp'],
    'câmbio': ['unicambio'],
    'cambio': ['unicambio'],
    'dolares': ['unicambio'],
    'trocar dinheiro': ['unicambio'],

    // Correios / CTT / Pagamento de Contas (Payshop)
    'ctt': ['press-center-cigarette'],
    'correio': ['press-center-cigarette'],
    'cartas': ['press-center-cigarette'],
    'encomendas': ['press-center-cigarette'],
    'selos': ['press-center-cigarette'],
    'postais': ['press-center-cigarette'],
    'payshop': ['press-center-cigarette', 'multibanco'],
    'pagar contas': ['press-center-cigarette', 'multibanco'],
    'carregar passe': ['press-center-cigarette', 'multibanco'],
    'portagens': ['press-center-cigarette', 'multibanco'],
    'pagamentos': ['press-center-cigarette', 'multibanco'],

    // Fotocópias / Impressões / Revelar Fotos
    'imprimir': ['press-center-cigarette', 'fnac'],
    'fotocopias': ['press-center-cigarette', 'fnac'],
    'fotocópias': ['press-center-cigarette', 'fnac'],
    'copias': ['press-center-cigarette', 'fnac'],
    'digitalizar': ['press-center-cigarette', 'fnac'],
    'impressão': ['press-center-cigarette', 'fnac'],
    'pdf': ['press-center-cigarette', 'fnac'],
    'fotografia': ['fnac'],
    'foto passe': ['fnac'],
    'revelar fotos': ['fnac'],

    // Serviços Automóveis
    'lavagem auto': ['eco-car-wash'],
    'aspirar carro': ['eco-car-wash'],
    'limpeza carro': ['eco-car-wash'],
    'lavar carro': ['eco-car-wash'],

    // Livros / Tabaco
    'livros': ['fnac', 'press-center-cigarette', 'auchan'],
    'livro': ['fnac', 'press-center-cigarette', 'auchan'],
    'revistas': ['press-center-cigarette', 'auchan'],
    'jornais': ['press-center-cigarette', 'auchan'],
    'tabaco': ['press-center-cigarette'],
    'cigarros': ['press-center-cigarette'],
    'raspadinhas': ['press-center-cigarette'],
    'euromilhões': ['press-center-cigarette'],

    // Brinquedos / Jogos
    'brinquedos': ['centroxogo', 'polar-brincar', 'fnac', 'primark', 'auchan', 'normal', 'flying-tiger-copenhagen', 'tuttocars', 'zippy', 'chicco'],
    'jogos': ['fnac', 'worten', 'radio-popular', 'centroxogo', 'polar-brincar', 'bowling-play-center'],
    'consola': ['fnac', 'worten', 'radio-popular', 'centroxogo'],
    'playstation': ['fnac', 'worten', 'radio-popular', 'centroxogo'],
    'nintendo': ['fnac', 'worten', 'radio-popular', 'centroxogo'],

    // Perfumaria / Cosmética / Cuidado
    'perfumes': ['druni', 'douglas', 'perfumes-companhia', 'o-boticario', 'pluricosmetica', 'flormar', 'wells', 'auchan', 'normal'],
    'perfume': ['druni', 'douglas', 'perfumes-companhia', 'o-boticario', 'pluricosmetica', 'flormar', 'wells', 'auchan', 'normal'],
    'maquilhagem': ['druni', 'douglas', 'perfumes-companhia', 'o-boticario', 'pluricosmetica', 'flormar', 'wells', 'auchan', 'normal', 'primark'],
    'cosmetica': ['druni', 'douglas', 'perfumes-companhia', 'o-boticario', 'pluricosmetica', 'flormar', 'wells', 'auchan', 'normal'],
    'cremes': ['druni', 'douglas', 'perfumes-companhia', 'o-boticario', 'pluricosmetica', 'flormar', 'wells', 'auchan', 'normal', 'farmacia-pinto-de-campos'],
    'cabeleireiro': ['forlife-cabeleireiro-estetica', 'pluricosmetica'],
    'estetica': ['forlife-cabeleireiro-estetica', 'pluricosmetica', 'wells'],
    'estética': ['forlife-cabeleireiro-estetica', 'pluricosmetica', 'wells'],

    // Café / Doces
    'cafe': ['nespresso', 'auchan', 'quiosque-buondi', 'quiosque-delta-onda', 'quiosque-delta-onda-2', 'o-meu-cafe-auchan', 'ola', 'alicarius', 'gen-vcrep', 'jotacake'],
    'café': ['nespresso', 'auchan', 'quiosque-buondi', 'quiosque-delta-onda', 'quiosque-delta-onda-2', 'o-meu-cafe-auchan', 'ola', 'alicarius', 'gen-vcrep', 'jotacake'],
    'capsulas': ['nespresso', 'auchan', 'fnac', 'worten'],
    'cápsulas': ['nespresso', 'auchan', 'fnac', 'worten'],
    'crepes': ['gen-vcrep', 'o-dreams'],
    'gelados': ['ola'],
    'doces': ['jotacake', 'alicarius', 'ola', 'o-dreams', 'normal'],

    // Bebé / Criança
    'bebe': ['zippy', 'chicco', 'mayoral', 'h-m', 'c-a', 'primark', 'benetton', 'auchan', 'minimingos', 'bleem', 'sergent-major', 'polar-brincar', 'tuttocars', 'espaco-kids', 'farmacia-pinto-de-campos', 'wells'],
    'bebé': ['zippy', 'chicco', 'mayoral', 'h-m', 'c-a', 'primark', 'benetton', 'auchan', 'minimingos', 'bleem', 'sergent-major', 'polar-brincar', 'tuttocars', 'espaco-kids', 'farmacia-pinto-de-campos', 'wells'],
    'crianca': ['zippy', 'chicco', 'mayoral', 'h-m', 'c-a', 'primark', 'benetton', 'auchan', 'minimingos', 'bleem', 'sergent-major', 'polar-brincar', 'tuttocars', 'espaco-kids'],
    'criança': ['zippy', 'chicco', 'mayoral', 'h-m', 'c-a', 'primark', 'benetton', 'auchan', 'minimingos', 'bleem', 'sergent-major', 'polar-brincar', 'tuttocars', 'espaco-kids'],

    // Calçado / Sapatilhas
    'sapatos': ['seaside', 'aldo', 'calcado-guimaraes', 'deichmann', 'jd-sports', 'sport-zone', 'xtreme', 'fuxia', 'primark', 'auchan', 'cavalinho', 'parfois', 'lacoste', 'vilanova', 'inside'],
    'sapatilhas': ['jd-sports', 'sport-zone', 'xtreme', 'fuxia', 'seaside', 'calcado-guimaraes', 'deichmann', 'primark', 'auchan', 'lacoste', 'vilanova', 'inside'],
    'tenis': ['jd-sports', 'sport-zone', 'xtreme', 'fuxia', 'seaside', 'calcado-guimaraes', 'deichmann', 'primark', 'auchan'],
    'ténis': ['jd-sports', 'sport-zone', 'xtreme', 'fuxia', 'seaside', 'calcado-guimaraes', 'deichmann', 'primark', 'auchan'],
    'sapataria': ['seaside', 'aldo', 'calcado-guimaraes', 'deichmann', 'cavalinho'],

    // Roupa / Moda
    'roupa': ['benetton', 'bleem', 'c-a', 'calzedonia', 'cortefiel', 'decenio', 'desigual', 'fuxia', 'h-m', 'inside', 'intimissimi', 'lacoste', 'levi-s', 'lion-of-porches', 'mango', 'mayoral', 'minimingos', 'mo', 'mr-blue', 'natura-selection', 'parfois', 'piantella', 'primark', 'punt-roma', 'quebramar', 'sacoor-blue', 'salsa-jeans', 'sergent-major', 'springfield', 'suits-inc', 'tezenis', 'tiffosi', 'vilanova', 'women-secret', 'zippy', 'chicco', 'academico-de-viseu', 'sport-zone', 'jd-sports', 'xtreme', 'auchan'],
    'vestuário': ['benetton', 'bleem', 'c-a', 'calzedonia', 'cortefiel', 'decenio', 'desigual', 'fuxia', 'h-m', 'inside', 'intimissimi', 'lacoste', 'levi-s', 'lion-of-porches', 'mango', 'mayoral', 'minimingos', 'mo', 'mr-blue', 'natura-selection', 'parfois', 'piantella', 'primark', 'punt-roma', 'quebramar', 'sacoor-blue', 'salsa-jeans', 'sergent-major', 'springfield', 'suits-inc', 'tezenis', 'tiffosi', 'vilanova', 'women-secret', 'zippy', 'chicco', 'academico-de-viseu', 'sport-zone', 'jd-sports', 'xtreme', 'auchan'],
    'moda': ['benetton', 'bleem', 'c-a', 'calzedonia', 'cortefiel', 'decenio', 'desigual', 'fuxia', 'h-m', 'inside', 'intimissimi', 'lacoste', 'levi-s', 'lion-of-porches', 'mango', 'mayoral', 'minimingos', 'mo', 'mr-blue', 'natura-selection', 'parfois', 'piantella', 'primark', 'punt-roma', 'quebramar', 'sacoor-blue', 'salsa-jeans', 'sergent-major', 'springfield', 'suits-inc', 'tezenis', 'tiffosi', 'vilanova', 'women-secret', 'zippy', 'chicco', 'academico-de-viseu', 'sport-zone', 'jd-sports', 'xtreme', 'auchan', 'upstyle', 'cavalinho', 'aldo', 'calcado-guimaraes', 'deichmann', 'seaside'],
    'fatos': ['suits-inc', 'giovanni-galli', 'cortefiel'],

    // Desporto / Lazer
    'desporto': ['sport-zone', 'jd-sports', 'xtreme', 'fuxia', 'academico-de-viseu', 'forlife-ginasio-e-piscinas', 'auchan', 'pista-de-gelo'],
    'ginasio': ['forlife-ginasio-e-piscinas'],
    'ginásio': ['forlife-ginasio-e-piscinas'],
    'piscina': ['forlife-ginasio-e-piscinas'],
    'patinagem': ['pista-de-gelo'],

    // Animais
    'pet': ['companhia-de-4-patas', 'auchan-o-meu-pet', 'auchan'],
    'animais': ['companhia-de-4-patas', 'auchan-o-meu-pet', 'auchan'],
    'cao': ['companhia-de-4-patas', 'auchan-o-meu-pet', 'auchan'],
    'cão': ['companhia-de-4-patas', 'auchan-o-meu-pet', 'auchan'],
    'gato': ['companhia-de-4-patas', 'auchan-o-meu-pet', 'auchan'],

    // Supermercado / Comida
    'supermercado': ['auchan'],
    'comida': ['auchan', 'kfc', 'mcdonald-s', 'pizza-hut', 'subway', 'telepizza', 'h3', 'pans-company', 'chef-china', 'sushi-tokyo', 'rodizio-do-gelo', 'santa-grelha', 'soupa', 'vitaminas', 'troppo-squisito', 'a-gula-do-prego', 'o-dreams', 'casa-da-cevada', 'alicarius', 'gen-vcrep', 'jotacake', 'ola'],
    'restaurante': ['kfc', 'mcdonald-s', 'pizza-hut', 'subway', 'telepizza', 'h3', 'pans-company', 'chef-china', 'sushi-tokyo', 'rodizio-do-gelo', 'santa-grelha', 'soupa', 'vitaminas', 'troppo-squisito', 'a-gula-do-prego', 'o-dreams', 'casa-da-cevada', 'alicarius', 'gen-vcrep', 'jotacake', 'ola'],

    // Casa / Decoração
    'decoracao': ['gato-preto', 'ikea', 'normal', 'flying-tiger-copenhagen', 'vista-alegre-atlantis', 'colchaonet', 'mob-cozinhas', 'auchan', 'h-m', 'primark'],
    'decoração': ['gato-preto', 'ikea', 'normal', 'flying-tiger-copenhagen', 'vista-alegre-atlantis', 'colchaonet', 'mob-cozinhas', 'auchan', 'h-m', 'primark'],
    'moveis': ['ikea', 'gato-preto', 'mob-cozinhas'],
    'móveis': ['ikea', 'gato-preto', 'mob-cozinhas'],
    'colchão': ['colchaonet']
  };

  function enrichSearchText() {
    DATA.stores.forEach(store => {
      const tags = [];
      for (const [keyword, ids] of Object.entries(catalogKeywords)) {
        if (ids.includes(store.id)) tags.push(keyword);
      }
      if (tags.length) {
        store.searchText = `${store.searchText || ''} ${tags.join(' ')}`.trim();
      }
    });
  }
  const floorLabel = f => f === 'P0' ? 'Parque P0' : (f === 'unknown' || f === 'Por confirmar') ? 'Por confirmar' : f === 'Shopping' ? 'Todo o shopping' : f === 'Parque' ? 'Parque' : `Piso ${f}`;
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];
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
      return { ...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
    } catch {
      return structuredClone(defaultState);
    }
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }
  function toast(message) {
    const el = qs('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function getStore(id) { return DATA.stores.find(s => s.id === id); }
  function getCustom(id) { return saved.customPlaces.find(p => p.id === id); }
  function isFavorite(id) { return saved.favorites.includes(id); }
  function toggleFavorite(id) {
    saved.favorites = isFavorite(id) ? saved.favorites.filter(x => x !== id) : [...saved.favorites, id];
    saveState();
    renderFavorites(); renderDirectory(); renderFloorPlaces();
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
    const standard = DATA.stores.map(store => ({ type:'store', id:store.id, name:store.name, categories:store.categories, locations:effectiveLocations(store), source:store }));
    const custom = saved.customPlaces.map(p => ({ type:'custom', id:p.id, name:p.name, categories:['Personalizado'], locations:[{floor:p.floor, unit:p.unit || '', direction:p.direction || '', map0:p.x !== '' && p.y !== '' ? [Number(p.x), Number(p.y)] : undefined, note:p.note, verified:true}], source:p }));
    return [...standard, ...custom];
  }

  function primaryLocation(place) { return place.locations?.[0] || null; }

  function searchPlaces(query, limit = 12) {
    const q = norm(query);
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return allPlaces().map(place => {
      const locText = (place.locations || []).map(l => `${floorLabel(l.floor)} ${l.unit || ''}`).join(' ');
      const sourceText = place.type === 'store' ? place.source.searchText : `${place.name} ${place.categories.join(' ')} ${locText} ${place.source.note || ''}`;
      const hay = norm(`${sourceText} ${locText}`);
      let score = tokens.reduce((sum,t) => sum + (hay.includes(t) ? 1 : 0), 0);
      if (norm(place.name).startsWith(q)) score += 3;
      if (norm(place.name) === q) score += 6;
      return { place, score };
    }).filter(x => x.score > 0).sort((a,b) => b.score - a.score || a.place.name.localeCompare(b.place.name, 'pt')).slice(0, limit).map(x => x.place);
  }

  function navTo(screen) {
    activeScreen = screen;
    qsa('.screen').forEach(el => el.classList.toggle('active', el.dataset.screen === screen));
    qsa('.bottom-nav button').forEach(btn => btn.classList.toggle('active', btn.dataset.nav === screen));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (screen === 'map') renderMap();
    if (screen === 'directory') renderDirectory();
    if (screen === 'training' && !currentQuestion) nextQuestion();
    if (screen === 'more') renderMore();
  }

  function placeFloorText(place) {
    if (!place.locations?.length) return 'Piso por confirmar';
    return place.locations.map(l => `${floorLabel(l.floor)}${l.unit ? ` · ${l.unit}` : ''}`).join(' / ');
  }

  function resultButton(place) {
    return `<button class="search-result" type="button" data-place-id="${esc(place.id)}">
      ${placeVisual(place, 'small')}
      <span><b>${esc(place.name)}</b><small>${esc(placeFloorText(place))}</small></span>
    </button>`;
  }

  function wireSearch(input, resultsEl) {
    input.addEventListener('input', () => {
      const results = searchPlaces(input.value, 9);
      resultsEl.innerHTML = results.map(resultButton).join('');
      resultsEl.classList.toggle('hidden', !input.value || !results.length);
    });
    resultsEl.addEventListener('click', e => {
      const btn = e.target.closest('[data-place-id]');
      if (!btn) return;
      resultsEl.classList.add('hidden');
      input.value = '';
      openPlace(btn.dataset.placeId);
    });
    document.addEventListener('click', e => {
      if (!resultsEl.contains(e.target) && e.target !== input) resultsEl.classList.add('hidden');
    });
  }

  function openPlace(id) {
    const place = allPlaces().find(p => p.id === id);
    if (!place) return;
    selectedPlaceId = id;
    const locations = place.locations || [];
    const source = place.source;
    const categories = place.categories || [];
    const verified = place.type === 'custom' || (source.verified !== false && locations.every(l => l.verified !== false));
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

    qs('#placeDialogContent').innerHTML = `
      <div class="place-hero">
        ${placeVisual(place, 'large')}
        <div><span class="micro-label">${esc(categories[0] || 'LOCAL')}</span><h2>${esc(place.name)}</h2></div>
      </div>
      <div class="detail-meta">
        ${categories.slice(0,3).map(c => `<span class="meta-chip">${esc(c)}</span>`).join('')}
        <span class="meta-chip">${verified ? '✓ Confirmado' : '△ Confirmar'}</span>
      </div>
      <div class="detail-locations">${locHtml}</div>
      ${note ? `<p class="muted-note">${esc(note)}</p>` : ''}
      <div class="detail-actions">
        <button type="button" data-dialog-action="favorite">${isFavorite(id) ? '★ Remover favorito' : '☆ Favorito'}</button>
        <button type="button" data-dialog-action="map">⌖ Mostrar no mapa</button>
        ${place.type === 'store' ? '<button type="button" data-dialog-action="edit">✎ Corrigir dados</button>' : '<button type="button" data-dialog-action="edit-custom">✎ Editar</button>'}
        ${place.type === 'custom' ? '<button type="button" data-dialog-action="delete-custom">Eliminar</button>' : '<button type="button" data-dialog-action="source">Ver diretório</button>'}
      </div>`;
    const dialog = qs('#placeDialog');
    dialog.showModal();
    qs('#placeDialogContent').onclick = e => {
      const action = e.target.closest('[data-dialog-action]')?.dataset.dialogAction;
      if (!action) return;
      if (action === 'favorite') { toggleFavorite(id); dialog.close(); openPlace(id); }
      if (action === 'map') {
        const loc = primaryLocation(place);
        if (loc && floors.includes(loc.floor)) selectedFloor = loc.floor;
        dialog.close(); navTo('map'); renderMap(id);
      }
      if (action === 'edit') { dialog.close(); openStoreEdit(place); }
      if (action === 'edit-custom') { dialog.close(); openCustomForm(source); }
      if (action === 'delete-custom') {
        if (confirm(`Eliminar “${place.name}”?`)) {
          saved.customPlaces = saved.customPlaces.filter(p => p.id !== id); saveState(); dialog.close(); renderAll(); toast('Local personalizado eliminado.');
        }
      }
      if (action === 'source') { dialog.close(); navTo('more'); setTimeout(() => qs('.directory-photo')?.scrollIntoView({behavior:'smooth'}), 180); }
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
    if (!favs.length) { el.className = 'horizontal-list empty-state'; el.textContent = 'Ainda não marcou favoritos.'; return; }
    el.className = 'horizontal-list';
    el.innerHTML = favs.map(p => `<button class="favorite-chip" data-place-id="${esc(p.id)}">${placeVisual(p, 'small')}<span><b>${esc(p.name)}</b><small>${esc(placeFloorText(p))}</small></span></button>`).join('');
    el.onclick = e => { const id = e.target.closest('[data-place-id]')?.dataset.placeId; if (id) openPlace(id); };
  }

  function renderFloorTabs() {
    const el = qs('#floorTabs');
    el.innerHTML = floors.map(f => `<button type="button" class="${f === selectedFloor ? 'active' : ''}" data-floor="${f}">${f}</button>`).join('');
    el.onclick = e => { const b=e.target.closest('[data-floor]'); if (!b) return; selectedFloor=b.dataset.floor; selectedPlaceId=null; mapScale=1; renderMap(); };
  }

  function renderMap(highlightId = selectedPlaceId) {
    renderFloorTabs();
    qs('#mapTitle').textContent = floorLabel(selectedFloor);
    qs('#markModeBtn').classList.toggle('hidden', selectedFloor !== '0');
    const image = qs('#floorMapImage');
    image.src = DATA.floorImages[selectedFloor];
    image.alt = `Mapa do ${floorLabel(selectedFloor)}`;
    image.style.transform = `scale(${mapScale})`;
    const layer = qs('#markerLayer');
    layer.style.transform = `scale(${mapScale})`;
    layer.innerHTML = '';
    if (selectedFloor === '0') {
      allPlaces().forEach(place => {
        if (place.type !== 'custom' && place.id !== highlightId) return;
        place.locations.forEach(loc => {
          if (loc.floor !== '0' || !loc.map0) return;
          const [x,y] = loc.map0;
          const marker=document.createElement('button');
          marker.type='button'; marker.className=`map-marker ${place.type==='custom'?'custom':''} ${place.id===highlightId?'selected':''}`;
          marker.style.left=`${x}%`; marker.style.top=`${y}%`; marker.dataset.placeId=place.id; marker.title=place.name;
          layer.appendChild(marker);
        });
      });
    }
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
    qs('#floorCount').textContent = `${list.length} locais`;
    qs('#floorPlaces').innerHTML = list.length ? list.map(placeCard).join('') : '<div class="empty-state">Nenhum local cadastrado neste piso.</div>';
  }

  function placeCard(place) {
    const loc = place.locations.find(l => l.floor === selectedFloor) || primaryLocation(place);
    const dir = directionFor(place.name, loc);
    return `<article class="place-card" data-place-id="${esc(place.id)}">
      ${placeVisual(place)}
      <span class="place-copy"><b>${esc(place.name)}</b><small>${loc ? esc(floorLabel(loc.floor)) : 'Piso por confirmar'}${loc?.unit ? ` · Unidade ${esc(loc.unit)}` : ''}${dir ? ` · ${esc(dir)}` : ''}</small></span>
      <button class="favorite-btn ${isFavorite(place.id)?'active':''}" data-favorite-id="${esc(place.id)}" type="button">${isFavorite(place.id)?'★':'☆'}</button>
    </article>`;
  }

  function renderDirectory() {
    const query=norm(qs('#directorySearch').value);
    const floor=qs('#floorFilter').value;
    const category=qs('#categoryFilter').value;
    const verified=qs('#verifiedFilter').checked;
    let list=allPlaces();
    if(query) list=list.filter(p=>norm(`${p.name} ${p.categories.join(' ')} ${placeFloorText(p)}`).includes(query));
    if(floor!=='all') list=list.filter(p=>floor==='unknown' ? !p.locations.length : p.locations.some(l=>l.floor===floor));
    if(category!=='all') list=list.filter(p=>p.categories.includes(category));
    if(verified) list=list.filter(p=>p.locations.length && p.locations.every(l=>l.verified!==false));
    if(directoryFavoritesOnly) list=list.filter(p=>isFavorite(p.id));
    list.sort((a,b)=>a.name.localeCompare(b.name,'pt'));
    qs('#directoryCount').textContent=`${list.length} resultado${list.length===1?'':'s'}`;
    qs('#directoryList').innerHTML=list.length?list.map(placeCard).join(''):'<div class="empty-state">Nenhum local encontrado com estes filtros.</div>';
    qs('#directoryFavoritesOnly').classList.toggle('active',directoryFavoritesOnly);
  }

  function handleCardListClick(e) {
    const fav=e.target.closest('[data-favorite-id]');
    if(fav){ e.stopPropagation(); toggleFavorite(fav.dataset.favoriteId); return; }
    const card=e.target.closest('[data-place-id]'); if(card) openPlace(card.dataset.placeId);
  }

  function portugalNow() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Lisbon',weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
    const dayMap={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
    return { day:dayMap[parts.weekday], year:+parts.year, month:+parts.month, date:+parts.day, minutes:+parts.hour*60 + +parts.minute, md:`${parts.month}-${parts.day}` };
  }
  const toMinutes=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
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
    qs('#openStatusDot').className=`status-dot ${shopping?.isOpen?'open':'closed'}`;
    qs('#openStatusText').textContent=shopping?.isOpen?'Shopping aberto':'Shopping fechado';
    const unique=[]; rows.forEach(r=>{if(!unique.some(x=>x.name===r.name)) unique.push(r);});
    qs('#hoursStrip').innerHTML=unique.slice(0,4).map(hourCard).join('');
    qs('#hoursDialogList').innerHTML=unique.map(r=>`<div class="mini-row"><span><b>${esc(r.name)}</b><br><small>${r.isOpen?'Aberto agora':'Fechado agora'}</small></span><small>${esc(r.open)}–${esc(r.close)}</small></div>`).join('');
  }
  function hourCard(r){return `<div class="hour-card"><span class="state" style="color:${r.isOpen?'var(--success)':'var(--danger)'}">● ${r.isOpen?'Aberto':'Fechado'}</span><b>${esc(r.name)}</b><small>${esc(r.open)}–${esc(r.close)}</small></div>`;}

  function renderReferences() {
    qs('#referenceCards').innerHTML = Object.values(DATA.orientation).map(x=>`<div class="reference-card"><strong>${esc(x.label)}</strong><small>${esc(x.reference)}</small></div>`).join('');
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
    const candidates=DATA.stores.filter(s=>effectiveLocations(s).some(l=>floors.includes(l.floor)&&l.verified!==false));
    const store=randomItem(candidates); const loc=randomItem(effectiveLocations(store).filter(l=>floors.includes(l.floor)));
    const choices=new Set([loc.floor]); while(choices.size<4) choices.add(randomItem(floors));
    return {type:'PISO',question:`Em que piso fica ${store.name}?`,correct:loc.floor,answers:shuffle([...choices]),explain:`${store.name}: ${floorLabel(loc.floor)}${loc.unit?`, unidade ${loc.unit}`:''}.`};
  }
  function nextQuestion(){
    currentQuestion = trainingMode==='compass'?makeCompassQuestion():trainingMode==='floors'?makeFloorQuestion():(Math.random()<.5?makeCompassQuestion():makeFloorQuestion());
    qs('#quizType').textContent=currentQuestion.type; qs('#quizQuestion').textContent=currentQuestion.question;
    qs('#quizAnswers').innerHTML=currentQuestion.answers.map(a=>`<button class="answer-btn" type="button" data-answer="${esc(a)}">${currentQuestion.type==='PISO'?esc(floorLabel(a)):esc(a)}</button>`).join('');
    qs('#quizFeedback').classList.add('hidden'); qs('#nextQuestionBtn').classList.add('hidden');
    renderTrainingScore();
  }
  function answerQuestion(answer){
    const ok=answer===currentQuestion.correct; saved.quiz.total++; if(ok)saved.quiz.correct++; saveState();
    qsa('.answer-btn',qs('#quizAnswers')).forEach(btn=>{btn.disabled=true;if(btn.dataset.answer===currentQuestion.correct)btn.classList.add('correct');else if(btn.dataset.answer===answer)btn.classList.add('wrong');});
    const feedback=qs('#quizFeedback'); feedback.textContent=`${ok?'Certo!':'Ainda não.'} ${currentQuestion.explain}`; feedback.classList.remove('hidden');
    qs('#nextQuestionBtn').classList.remove('hidden'); renderTrainingScore();
  }
  function renderTrainingScore(){qs('#trainingScore').textContent=`${saved.quiz.correct} / ${saved.quiz.total}`;}

  function patrolKey(){const n=portugalNow();return `${n.year}-${String(n.month).padStart(2,'0')}-${String(n.date).padStart(2,'0')}`;}
  function renderPatrol(){
    const key=patrolKey(); const done=saved.patrol[key]||[];
    qs('#patrolChecklist').innerHTML=floors.map(f=>`<label class="patrol-item"><input type="checkbox" data-patrol-floor="${f}" ${done.includes(f)?'checked':''}/><span><b>${floorLabel(f)}</b><br><small class="muted-note">Confirmar referências e pontos essenciais</small></span></label>`).join('');
  }

  const noteTemplates = {
    radio: 'Central, aqui [nome/posição]. Tenho uma ocorrência no piso [X], junto a [loja/referência]. Trata-se de [descrição breve]. Preciso de [apoio solicitado].',
    crianca: 'Criança [encontrada/perdida] no piso [X], junto a [referência]. Descrição: [roupa e idade aproximada]. Estou num ponto seguro e aguardo apoio da Central.',
    objeto: 'Objeto [encontrado/perdido] no piso [X], junto a [referência], às [hora]. Descrição: [detalhes]. Encaminhado para [destino/responsável].',
    emergencia: 'Central, emergência no piso [X], junto a [referência]. Ocorrência: [tipo]. Há [riscos visíveis]. Solicito [apoio] com prioridade.',
  };
  function renderNotes(){
    const labels={
      radio:{title:'Comunicação por rádio',hint:'Mensagem curta e objetiva'},
      crianca:{title:'Criança perdida',hint:'Primeiro contacto com a Central'},
      objeto:{title:'Objeto perdido',hint:'Registo e encaminhamento'},
      emergencia:{title:'Emergência',hint:'Comunicação prioritária'},
    };
    qs('#operationalNotes').innerHTML=Object.entries(labels).map(([id,item])=>`<article class="note-editor">
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
    qs('#servicesList').innerHTML=DATA.services.map(s=>`<div class="mini-row"><span>${esc(s.name)}</span><small>${esc(floorLabel(s.floor))}</small></div>`).join('');
    qs('#rulesList').innerHTML=DATA.rules.map(r=>`<div class="mini-row"><span><b>${esc(r.title)}</b><br>${esc(r.text)}</span></div>`).join('');
    renderNotes(); renderCustomPlaces();
    const c=DATA.contact;
    qs('#contactCard').innerHTML=`<b>Palácio do Gelo Shopping</b><p>${esc(c.address)}<br><a href="tel:${esc(c.phone.replace(/\s/g,''))}">${esc(c.phone)}</a> · <a href="tel:${esc(c.mobile.replace(/\s/g,''))}">${esc(c.mobile)}</a><br><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>`;
    qs('#sourcesList').innerHTML=DATA.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join('');
    qs('#dataNote').textContent=DATA.dataNote;
  }
  function renderCustomPlaces(){
    const el=qs('#customPlacesList');
    el.innerHTML=saved.customPlaces.length?saved.customPlaces.map(p=>`<button class="mini-row" data-place-id="${esc(p.id)}" type="button"><span>${esc(p.name)}</span><small>${esc(floorLabel(p.floor))}${p.unit?` · ${esc(p.unit)}`:''}</small></button>`).join(''):'<p class="muted-note">Nenhum ponto personalizado.</p>';
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
    qs('#dbProgressPct').textContent = `${patrolPct}%`;
    qs('#dbProgressFill').style.width = `${patrolPct}%`;
  }

  function renderAll(){renderFavorites();renderHours();renderMap();renderDirectory();renderReferences();renderTrainingScore();renderPatrol();renderMore();renderDashboard();}

  function exportData(){
    const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),data:saved},null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`pg-guia-copia-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast('Cópia exportada.');
  }

  function bindEvents(){
    qsa('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>navTo(btn.dataset.nav)));
    qsa('[data-nav-target]').forEach(btn=>btn.addEventListener('click',()=>navTo(btn.dataset.navTarget)));
    wireSearch(qs('#homeSearch'),qs('#homeSearchResults'));
    qs('#floorPlaces').addEventListener('click',handleCardListClick);
    qs('#directoryList').addEventListener('click',handleCardListClick);
    ['input','change'].forEach(ev=>{qs('#directorySearch').addEventListener(ev,renderDirectory);qs('#floorFilter').addEventListener(ev,renderDirectory);qs('#categoryFilter').addEventListener(ev,renderDirectory);qs('#verifiedFilter').addEventListener(ev,renderDirectory);});
    qs('#clearFilters').onclick=()=>{qs('#directorySearch').value='';qs('#floorFilter').value='all';qs('#categoryFilter').value='all';qs('#verifiedFilter').checked=false;directoryFavoritesOnly=false;renderDirectory();};
    qs('#directoryFavoritesOnly').onclick=()=>{directoryFavoritesOnly=!directoryFavoritesOnly;renderDirectory();};
    qsa('.compass-point').forEach(btn=>btn.onclick=()=>{const d=DATA.orientation[btn.dataset.direction];toast(`${d.label}: ${d.reference}.`);});
    qsa('[data-action="open-floor"]').forEach(btn=>btn.onclick=()=>{selectedFloor=btn.dataset.floor;navTo('map');});
    qsa('[data-action="find-place"]').forEach(btn=>btn.onclick=()=>{const p=allPlaces().find(x=>norm(x.name)===norm(btn.dataset.place));if(p)openPlace(p.id);});
    qs('[data-action="open-radio"]').onclick=()=>{navTo('more');qs('#operationalNotesAccordion').open=true;setTimeout(()=>qs('[data-note-id="radio"]')?.scrollIntoView({behavior:'smooth',block:'center'}),180);};
    qs('#openStatusBtn').onclick=qs('#showAllHours').onclick=()=>qs('#hoursDialog').showModal();
    qs('#zoomInBtn').onclick=()=>{mapScale=Math.min(2.2,mapScale+.2);renderMap();};
    qs('#zoomOutBtn').onclick=()=>{mapScale=Math.max(.8,mapScale-.2);renderMap();};
    qs('#resetZoomBtn').onclick=()=>{mapScale=1;renderMap();};
    qs('#markModeBtn').onclick=()=>{markMode=!markMode;qs('#markModeBtn').classList.toggle('active',markMode);qs('#markModeBtn').textContent=markMode?'Toque no mapa…':'+ Marcar ponto';toast(markMode?'Toque no local exato do mapa.':'Modo de marcação cancelado.');};
    qs('#mapViewport').addEventListener('click',e=>{
      if(!markMode||selectedFloor!=='0'||e.target.closest('.map-marker'))return;
      const img=qs('#floorMapImage');const r=img.getBoundingClientRect();const x=((e.clientX-r.left)/r.width*100).toFixed(1);const y=((e.clientY-r.top)/r.height*100).toFixed(1);
      markMode=false;qs('#markModeBtn').classList.remove('active');qs('#markModeBtn').textContent='+ Marcar ponto';openCustomForm(null,{x,y});
    });
    qs('#addCustomPlaceBtn').onclick=()=>openCustomForm();
    qsa('[data-close-dialog]').forEach(btn=>btn.onclick=()=>qs(`#${btn.dataset.closeDialog}`).close());
    qs('#customPlaceForm').addEventListener('submit',e=>{
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
    qs('#quizAnswers').onclick=e=>{const b=e.target.closest('[data-answer]');if(b&&!b.disabled)answerQuestion(b.dataset.answer);};
    qs('#nextQuestionBtn').onclick=nextQuestion;
    qsa('[data-training-mode]').forEach(btn=>btn.onclick=()=>{trainingMode=btn.dataset.trainingMode;qsa('[data-training-mode]').forEach(x=>x.classList.toggle('active',x===btn));nextQuestion();});
    qs('#patrolChecklist').onchange=e=>{const cb=e.target.closest('[data-patrol-floor]');if(!cb)return;const key=patrolKey();const set=new Set(saved.patrol[key]||[]);cb.checked?set.add(cb.dataset.patrolFloor):set.delete(cb.dataset.patrolFloor);saved.patrol[key]=[...set];saveState();renderAll();};
    qs('#resetPatrolBtn').onclick=()=>{saved.patrol[patrolKey()]=[];saveState();renderAll();};
    qs('#operationalNotes').addEventListener('input',e=>{const area=e.target.closest('[data-note-id]');if(!area)return;saved.notes[area.dataset.noteId]=area.value;saveState();renderDashboard();});
    qs('#operationalNotes').addEventListener('click',e=>{const btn=e.target.closest('[data-copy-note]');if(btn)copyOperationalNote(btn.dataset.copyNote);});
    qs('#customPlacesList').onclick=e=>{const id=e.target.closest('[data-place-id]')?.dataset.placeId;if(id)openPlace(id);};
    qs('#exportDataBtn').onclick=exportData;
    qs('#importDataBtn').onclick=()=>qs('#importDataInput').click();
    qs('#importDataInput').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const parsed=JSON.parse(await f.text());saved={...defaultState,...(parsed.data||parsed)};saveState();renderAll();toast('Cópia importada.');}catch{toast('Não foi possível importar este ficheiro.');}};
    qs('#voiceSearchBtn').onclick=startVoiceSearch;
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;qs('#installBtn').classList.remove('hidden');});
    qs('#installBtn').onclick=async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;qs('#installBtn').classList.add('hidden');};
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
    const categories=[...new Set(DATA.stores.flatMap(s=>s.categories))].sort((a,b)=>a.localeCompare(b,'pt'));
    qs('#categoryFilter').innerHTML='<option value="all">Todas as categorias</option>'+categories.map(c=>`<option>${esc(c)}</option>`).join('');
  }

  function bindPositionAndSOS() {
    qs('#sosBtn').onclick = () => qs('#sosDialog').showModal();

    // Quick search chips Click bindings
    qsa('.chip-btn').forEach(btn => {
      btn.onclick = () => {
        const searchInput = qs('#homeSearch');
        searchInput.value = btn.dataset.search;
        searchInput.dispatchEvent(new Event('input'));
      };
    });

    // Device orientation gyroscope compass
    let isCompassActive = false;
    const centerBtn = qs('.compass-center');

    centerBtn.onclick = async () => {
      if (isCompassActive) {
        window.removeEventListener('deviceorientation', handleOrientation);
        isCompassActive = false;
        qs('.compass-card').style.transform = 'rotate(0deg)';
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

    function startCompass() {
      window.addEventListener('deviceorientation', handleOrientation, true);
      isCompassActive = true;
      centerBtn.classList.add('active');
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

    // Position selectors
    const floorSelect = qs('#userCurrentFloor');
    const dirSelect = qs('#userCurrentDir');

    floorSelect.value = saved.userFloor || '0';
    dirSelect.value = saved.userDir || '';

    floorSelect.addEventListener('change', e => {
      saved.userFloor = e.target.value;
      saveState();
      renderAll();
    });
    dirSelect.addEventListener('change', e => {
      saved.userDir = e.target.value;
      saveState();
      renderAll();
    });
  }

  function init(){
    enrichSearchText();
    initFilters();bindEvents();bindPositionAndSOS();renderAll();
    setInterval(renderHours,60000);
    if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js?v=1.2.5').catch(()=>{});
  }
  document.addEventListener('DOMContentLoaded',init);
})();
