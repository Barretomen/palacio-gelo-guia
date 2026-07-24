import json, re, unicodedata, pathlib, copy, zipfile, os
from collections import Counter, defaultdict

ROOT = pathlib.Path('/mnt/data/palacio_app')
OUT = pathlib.Path('/mnt/data/palacio_app_audit')
OUT.mkdir(exist_ok=True)
base = json.loads((OUT/'stores-original.json').read_text(encoding='utf-8'))
stores = base['stores']

# Official Palácio page slugs recovered from the captured official directory.
html = (ROOT/'capture-ultra-2026-07-23T13-41-03-406Z/responses/00001_palaciodogelo.pt_pt_lojas.txt').read_text(encoding='utf-8', errors='ignore')
slug_by_name = {}
for m in re.finditer(r'data-shop="([^"]+)"[^>]*data-url=[\'\"]([^\'\"]+)[\'\"][^>]*>.*?(?:alt="([^"]+)"|title="([^"]+)")', html, re.S|re.I):
    slug, rel, n1, n2 = m.groups()
    name = (n1 or n2 or '').strip()
    if name:
        slug_by_name[name.casefold()] = (slug, rel)
# More reliable pass from each card's data-sort.
for m in re.finditer(r'data-sort="([^"]+)".*?<a[^>]+data-shop="([^"]+)"[^>]+data-url=[\'\"]([^\'\"]+)[\'\"]', html, re.S|re.I):
    name, slug, rel = m.groups()
    slug_by_name[name.strip().casefold()] = (slug, rel)

OFFICIAL_ITEMS = []
for m in re.finditer(r'data-sort="([^"]+)".*?<a[^>]+data-shop="([^"]+)"[^>]+data-url=[\'\"]([^\'\"]+)[\'\"]', html, re.S|re.I):
    oname, oslug, orel = m.groups()
    OFFICIAL_ITEMS.append({'name':oname.strip(),'slug':oslug,'rel':orel})

def simple_norm(value):
    value = unicodedata.normalize('NFKD', str(value)).encode('ascii','ignore').decode('ascii').lower()
    value = value.replace('&',' e ').replace("'",'').replace('’','').replace('‘','')
    return re.sub(r'[^a-z0-9]+',' ',value).strip()

OFFICIAL_NAME_OVERRIDE = {
 'forlife-ginasio-e-piscinas':['FORLIFE'],
 'radio-estacao-diaria':['ESTAÇÃO DIÁRIA'],
 'mi-store-xiaomi':['Xiaomi Store Portugal'],
 'oakberry':['Oak Berry'],
 'ourivesaria-pereirinha':['OURIVESARIA PEREIRINHA 2','Pereirinha Ourivesaria 1'],
 'press-center-cigarette':['PRESS CENTER CIGARRETTE'],
 'restaurante-serra-da-estrela':['SERRA DA ESTRELA'],
 'salsa-jeans':['SALSA'],
 'sport-zone':['SPORTZONE'],
 'vista-alegre-atlantis':['VISTA ALEGRE'],
 'widex':['WIDEX – Especialistas em Audição'],
}

PALACIO_STORES = 'https://palaciodogelo.pt/pt/lojas'
PALACIO_SERVICES = 'https://palaciodogelo.pt/pt/servicos'

# Conservative low-confidence discovery vocabulary. These are category hints, not stock claims.
CATEGORY_DISCOVERY = {
    'Restaurantes': ['restaurante','comida','refeição','almoço','jantar','take away','comer'],
    'Cafés, pastelarias e geladarias': ['café','pastelaria','geladaria','lanche','sobremesa','bebida','comer'],
    'Moda feminina': ['roupa de senhora','moda feminina','vestuário feminino'],
    'Moda masculina': ['roupa de homem','moda masculina','vestuário masculino'],
    'Moda infantil': ['roupa de criança','moda infantil','vestuário infantil','roupa de bebé'],
    'Roupa interior': ['roupa interior','lingerie','pijama','meias'],
    'Sapataria': ['calçado','sapatos','sapataria'],
    'Acessórios de moda': ['acessórios de moda','mala','carteira'],
    'Beleza e saúde': ['beleza','saúde','cuidados pessoais'],
    'Eletrónica e telecomunicações': ['eletrónica','tecnologia','telecomunicações'],
    'Casa, decoração e bricolage': ['casa','decoração','bricolage'],
    'Brinquedos e prendas': ['brinquedos','presentes','prendas'],
    'Desporto': ['desporto','artigos desportivos'],
    'Cultura e lazer': ['cultura','lazer','entretenimento'],
    'Ourivesaria, joalharia e relojoaria': ['joias','ourivesaria','relojoaria','relógios'],
    'Animais, plantas e flores': ['animais','plantas','flores'],
    'Hipermercado': ['supermercado','hipermercado','mercearia','compras do dia a dia'],
    'Papelaria e tabacaria': ['papelaria','tabacaria','jornais','revistas'],
    'Serviços': ['serviço','atendimento'],
}

# Common aliases / phrases people actually type.
GLOBAL_SYNONYMS = {
  'telemóvel': ['celular','smartphone','telefone móvel','iphone','android'],
  'computador': ['pc','portátil','laptop','notebook','desktop'],
  'auscultadores': ['fone','fones','headphones','earbuds','auriculares'],
  'carregador': ['cabo usb','cabo type c','usb c','lightning','adaptador de tomada','fonte'],
  'capa de telemóvel': ['capinha','capa iphone','capa smartphone','case'],
  'película de telemóvel': ['película','vidro temperado','proteção de ecrã'],
  'televisão': ['tv','smart tv'],
  'consola': ['playstation','ps5','xbox','nintendo switch','videojogo'],
  'máquina fotográfica': ['câmara','camera','fotografia'],
  'livro': ['livros','romance','banda desenhada','manga','manual escolar'],
  'brinquedo': ['brinquedos','boneca','peluche','lego','jogo infantil'],
  'perfume': ['fragrância','eau de parfum','colónia'],
  'maquilhagem': ['maquiagem','batom','base','rímel','máscara de pestanas','corretor'],
  'protetor solar': ['protecção solar','protecao solar','creme solar','fps'],
  'champô': ['shampoo','cuidado capilar'],
  'verniz': ['verniz de unhas','esmalte'],
  'óculos': ['oculos','armação','óculos graduados'],
  'óculos de sol': ['oculos escuros','sunglasses'],
  'lentes de contacto': ['lentes de contato','lentes'],
  'aparelho auditivo': ['prótese auditiva','audífono'],
  'medicamento': ['remédio','farmácia','medicação','medicamentos sem receita'],
  'suplemento': ['vitaminas','suplementos alimentares'],
  'fralda': ['fraldas','fralda bebé','fralda adulto'],
  'biberão': ['mamadeira','biberões'],
  'carrinho de bebé': ['carrinho bebê','carrinho criança','stroller'],
  'roupa de bebé': ['roupa bebe','body bebé','babygrow'],
  'ténis': ['sapatilhas','sneakers'],
  'chinelo': ['chinelos','slides'],
  'bota': ['botas','botim','botins'],
  'sandália': ['sandálias'],
  'camisola': ['blusa','sweatshirt','suéter','pullover'],
  't-shirt': ['tshirt','camiseta','t shirt'],
  'calças': ['calça','pantalonas'],
  'calças de ganga': ['jeans','denim'],
  'casaco': ['jaqueta','blusão','sobretudo'],
  'vestido': ['vestidos'],
  'fato': ['terno','fato de homem','blazer e calças'],
  'cuecas': ['roupa interior','boxers','slips'],
  'sutiã': ['sutia',' soutien','lingerie'],
  'mala': ['bolsa','malas'],
  'carteira': ['porta moedas','porta-cartões','wallet'],
  'mochila': ['mochilas'],
  'relógio': ['relogio','smartwatch'],
  'anel': ['anéis','aneis'],
  'colar': ['colares','fio'],
  'brinco': ['brincos'],
  'pulseira': ['pulseiras'],
  'colchão': ['colchao','colchões','colchoes'],
  'almofada': ['almofadas','travesseiro'],
  'lençol': ['lençóis','lencois','roupa de cama'],
  'toalha': ['toalhas','têxteis de banho'],
  'panela': ['panelas','tachos','frigideira'],
  'louça': ['loiça','pratos','copos','talheres','serviço de jantar'],
  'móvel': ['moveis','móveis','mobília'],
  'lâmpada': ['lampada','iluminação'],
  'flores': ['flor','ramo','bouquet'],
  'ração': ['comida para cão','comida para gato','alimentação animal'],
  'cápsula de café': ['capsulas','nespresso','café em cápsula'],
  'hambúrguer': ['hamburger','burger'],
  'batatas fritas': ['batata frita','french fries'],
  'frango frito': ['fried chicken'],
  'pizza': ['pizzas'],
  'sushi': ['sashimi','nigiri','maki'],
  'sandes': ['sanduíche','sandwich','sanduiche'],
  'gelado': ['sorvete','gelados'],
  'açaí': ['acai','bowl de açaí'],
  'sumo': ['suco','sumos naturais'],
  'viagem': ['férias','pacote turístico','hotel','voo','cruzeiro'],
  'câmbio': ['cambio','trocar moeda','moeda estrangeira'],
  'multibanco': ['atm','caixa automático','levantar dinheiro'],
  'casa de banho': ['wc','toilette','banheiro'],
  'fraldário': ['trocar fralda','muda fraldas'],
  'cadeira de rodas': ['mobilidade reduzida','wheelchair'],
  'carregamento elétrico': ['carregar carro elétrico','carregador veículo elétrico','ev charger'],
  'levantamento de encomendas': ['recolha de encomenda','pickup','click and collect'],
  'perdidos e achados': ['objeto perdido','perdi','encontrados'],
  'primeiros socorros': ['dae','desfibrilhador','emergência médica'],
  'wi-fi': ['wifi','internet grátis','wireless'],
}

# Product families confirmed by a brand's normal official assortment or by an explicit local service.
# They are category-level statements; exact model/size/colour/local stock is intentionally not guaranteed.
CONFIRMED = {
'a-gula-do-prego':['prego no pão','sandes','refeições rápidas'],
'academico-de-viseu':['artigos do Académico de Viseu','merchandising do clube','camisolas do clube','cachecóis do clube'],
'agencia-abreu':['viagens','pacotes de férias','voos','hotéis','cruzeiros','circuitos turísticos'],
'aldo':['sapatos de senhora','sapatos de homem','ténis','sandálias','botas','malas','carteiras','acessórios'],
'ali-baba-kebab-haus':['kebab','durum','sandes kebab','refeições rápidas'],
'auchan':['mercearia','fruta','legumes','carne','peixe','padaria','bebidas','produtos de limpeza','higiene','bebé','brinquedos','papelaria','eletrodomésticos','tecnologia','têxteis para casa','cozinha','jardim','automóvel'],
'auchan-o-meu-pet':['ração para cão','ração para gato','snacks para animais','areia para gato','brinquedos para animais','acessórios para animais'],
'benetton':['roupa de senhora','roupa de homem','roupa de criança','t-shirts','camisolas','calças','vestidos','casacos','acessórios'],
'bluebird':['relógios','joias','anéis','brincos','colares','pulseiras'],
'bowling-play-center':['bowling','bilhar','jogos arcade','entretenimento'],
'c-a':['roupa de senhora','roupa de homem','roupa de criança','roupa de bebé','vestidos','calças','calças de ganga','camisolas','casacos','roupa interior','pijamas','acessórios'],
'calzedonia':['meias','collants','leggings','roupa de banho','biquínis','fatos de banho'],
'calcado-guimaraes':['sapatos','ténis','botas','sandálias','chinelos'],
'casa-da-cevada':['café','pastelaria','cerveja','bebidas','snacks'],
'cavalinho':['malas','carteiras','mochilas','cintos','acessórios em pele'],
'centroxogo':['brinquedos','jogos de tabuleiro','puzzles','bonecas','figuras de ação','peluches','brinquedos educativos'],
'cervejaria-antartida':['cerveja','petiscos','refeições'],
'chef-china':['comida chinesa','arroz','massa chinesa','refeições asiáticas'],
'chicco':['roupa de bebé','roupa de criança','calçado infantil','carrinhos de bebé','cadeiras auto','biberões','chupetas','brinquedos de bebé','puericultura'],
'cinemas-nos':['bilhetes de cinema','filmes','pipocas','snacks de cinema'],
'cocktail-flower':['flores','ramos de flores','plantas','arranjos florais','presentes florais'],
'colchaonet':['colchões','almofadas','estrados','bases de cama','acessórios de descanso'],
'companhia-de-4-patas':['ração para animais','snacks para animais','brinquedos para animais','trelas','coleiras','higiene animal','acessórios para cão','acessórios para gato'],
'cortefiel':['roupa de senhora','roupa de homem','camisas','calças','vestidos','casacos','malhas','acessórios'],
'decenio':['roupa de senhora','vestidos','blusas','calças','casacos','malhas','acessórios'],
'deichmann':['sapatos','ténis','botas','sandálias','chinelos','calçado infantil','malas'],
'desigual':['roupa de senhora','roupa de homem','vestidos','casacos','t-shirts','malas','acessórios'],
'douglas':['perfumes','maquilhagem','cuidados de rosto','cuidados de corpo','cuidados de cabelo','produtos para barba','protetor solar','acessórios de beleza'],
'druni':['perfumes','maquilhagem','cuidados de rosto','cuidados de corpo','champô','produtos capilares','higiene','protetor solar','acessórios de beleza'],
'eco-car-wash':['lavagem automóvel','limpeza interior do carro','limpeza exterior do carro'],
'farmacia-pinto-de-campos':['medicamentos','medicamentos sem receita','produtos de saúde','dermocosmética','higiene','produtos para bebé','suplementos'],
'flormar':['maquilhagem','batom','base','rímel','corretor','verniz de unhas','pincéis de maquilhagem'],
'flying-tiger-copenhagen':['decoração','utensílios de cozinha','papelaria','brinquedos','jogos','artigos para festas','presentes','organização','acessórios'],
'fnac':['livros','manga','banda desenhada','música','filmes','videojogos','consolas','computadores','tablets','telemóveis','televisões','áudio','auscultadores','máquinas fotográficas','brinquedos','merchandising','papelaria'],
'forlife-cabeleireiro-estetica':['corte de cabelo','penteado','coloração de cabelo','barbearia','estética','manicure','depilação'],
'forlife-ginasio-e-piscinas':['ginásio','musculação','aulas de grupo','piscina','natação','treino'],
'fuxia':['sapatos','ténis','botas','sandálias','malas'],
'fabrica-dos-oculos':['óculos graduados','óculos de sol','armações','lentes oftálmicas','lentes de contacto'],
'gato-preto':['decoração','móveis','têxteis para casa','louça','copos','talheres','utensílios de cozinha','velas','iluminação','presentes'],
'gen-vcrep':['crepes','waffles','gelados','café','sobremesas'],
'giovanni-galli':['roupa de homem','fatos','blazers','camisas','calças','gravatas','casacos','malhas'],
'greens':['saladas','refeições saudáveis','bowls','sopas'],
'h-m':['roupa de senhora','roupa de homem','roupa de criança','roupa de bebé','vestidos','t-shirts','camisolas','calças','calças de ganga','casacos','roupa interior','pijamas','acessórios'],
'h3':['hambúrgueres','arroz','batatas fritas','saladas','refeições'],
'hawkers':['óculos de sol','óculos com filtro de luz azul','acessórios para óculos'],
'ikea':['móveis','sofás','camas','colchões','mesas','cadeiras','arrumação','decoração','iluminação','têxteis para casa','utensílios de cozinha','louça'],
'inside':['roupa de senhora','roupa de homem','t-shirts','camisolas','calças','calças de ganga','casacos','acessórios'],
'intimissimi':['lingerie','sutiãs','cuecas','roupa interior','pijamas','camisolas interiores','roupa de seda'],
'iservices':['reparação de telemóveis','reparação de computadores','reparação de tablets','baterias de telemóvel','ecrãs de telemóvel','capas de telemóvel','películas de telemóvel','cabos','carregadores','acessórios Apple'],
'jd-sports':['ténis','roupa desportiva','fatos de treino','t-shirts desportivas','sweatshirts','calçado desportivo','acessórios desportivos'],
'jotacake':['bolos','fatias de bolo','cupcakes','sobremesas','café'],
'kfc':['frango frito','hambúrgueres de frango','wraps','batatas fritas','menus'],
'la-casa-de-las-carcasas':['capas de telemóvel','películas de telemóvel','cabos','carregadores','suportes de telemóvel','acessórios para telemóvel','auriculares'],
'lacoste':['polos','t-shirts','camisolas','casacos','calças','roupa de senhora','roupa de homem','roupa de criança','ténis','malas','acessórios'],
'levi-s':['calças de ganga','jeans','casacos de ganga','t-shirts','camisas','calças','roupa de senhora','roupa de homem'],
'lion-of-porches':['roupa de senhora','roupa de homem','roupa de criança','polos','camisas','calças','casacos','malhas','acessórios'],
'mango':['roupa de senhora','vestidos','blusas','calças','calças de ganga','casacos','malhas','malas','sapatos','acessórios'],
'mayoral':['roupa de bebé','roupa de criança','vestidos infantis','calças infantis','casacos infantis','calçado infantil','acessórios infantis'],
'mcdonald-s':['hambúrgueres','nuggets','batatas fritas','menus','gelados','café','pequeno-almoço'],
'meo':['telemóveis','cartões SIM','tarifários móveis','internet','televisão por subscrição','telefone fixo','routers','acessórios para telemóvel'],
'mi-store-xiaomi':['telemóveis Xiaomi','smartwatches','pulseiras inteligentes','auscultadores','tablets','trotinetes elétricas','aspiradores robot','televisões','câmaras de segurança','carregadores','acessórios Xiaomi'],
'millennium-bcp':['conta bancária','cartões bancários','crédito','serviços bancários','multibanco'],
'mister-minit':['cópia de chaves','reparação de calçado','gravações','carimbos','pilhas de relógio','reparação de relógios'],
'mo':['roupa de senhora','roupa de homem','roupa de criança','roupa de bebé','t-shirts','camisolas','calças','vestidos','casacos','pijamas','roupa interior'],
'mob-cozinhas':['cozinhas por medida','móveis de cozinha','projeto de cozinha','remodelação de cozinha'],
'mr-blue':['roupa de homem','fatos','blazers','camisas','calças','gravatas','casacos','malhas'],
'multiopticas':['óculos graduados','óculos de sol','armações','lentes oftálmicas','lentes de contacto','exame visual'],
'natura-selection':['roupa de senhora','vestidos','túnicas','malas','bijuteria','acessórios','decoração','presentes'],
'nespresso':['cápsulas de café','máquinas de café','café','acessórios para café','reciclagem de cápsulas'],
'normal':['higiene','cosmética','maquilhagem','cuidados de pele','cuidados de cabelo','produtos de limpeza','snacks','artigos para casa'],
'nos':['telemóveis','cartões SIM','tarifários móveis','internet','televisão por subscrição','telefone fixo','routers','acessórios para telemóvel'],
'o-boticario':['perfumes','maquilhagem','cuidados de rosto','cuidados de corpo','cremes hidratantes','produtos capilares','desodorizantes','presentes de beleza'],
'o-meu-cafe-auchan':['café','pastelaria','sandes','snacks','bebidas'],
'o-dreams':['donuts','dónutes','café','bebidas','sobremesas'],
'oakberry':['açaí','bowls de açaí','smoothies','toppings'],
'ola':['gelados','sundaes','sobremesas geladas'],
'omb-grupo-optico':['óculos graduados','óculos de sol','armações','lentes oftálmicas','lentes de contacto'],
'ourivesaria-pereirinha':['joias','relógios','anéis','brincos','colares','pulseiras','alianças'],
'pans-company':['sandes','baguetes','menus','saladas','batatas fritas'],
'parfois':['malas','carteiras','mochilas','sapatos','sandálias','bijuteria','brincos','colares','pulseiras','relógios','lenços','acessórios','roupa de senhora'],
'pc-speed':['computadores','portáteis','componentes de computador','periféricos','impressoras','tinteiros','reparação de computadores','assistência informática','cabos','carregadores'],
'perfumes-companhia':['perfumes','maquilhagem','cuidados de rosto','cuidados de corpo','produtos capilares','cosmética'],
'piantella':['pizza','massa italiana','refeições italianas'],
'pizza-hut':['pizza','menus de pizza','massa','entradas','sobremesas'],
'pluricosmetica':['produtos de cabelo','champô','máscaras capilares','tintas de cabelo','produtos de unhas','verniz','manicure','pedicure','equipamento de cabeleireiro','acessórios de beleza'],
'polar-brincar':['parque infantil','diversão infantil','brincadeiras para crianças'],
'portugalia-balcao':['bife','prego','carne','refeições portuguesas'],
'press-center-cigarette':['jornais','revistas','tabaco','papelaria','raspadinhas','lotaria'],
'primark':['roupa de senhora','roupa de homem','roupa de criança','roupa de bebé','vestidos','t-shirts','camisolas','calças','calças de ganga','casacos','roupa interior','pijamas','sapatos','malas','acessórios','beleza','artigos para casa'],
'punt-roma':['roupa de senhora','vestidos','blusas','calças','casacos','malhas','acessórios'],
'quebramar':['roupa de senhora','roupa de homem','polos','camisas','t-shirts','calças','casacos','malhas','acessórios'],
'quiosque-buondi':['café','bebidas','snacks'],
'quiosque-delta-onda':['café Delta','bebidas','snacks'],
'quiosque-delta-onda-2':['café Delta','bebidas','snacks'],
'radio-popular':['televisões','computadores','telemóveis','tablets','eletrodomésticos','áudio','auscultadores','gaming','consolas','máquinas fotográficas','acessórios eletrónicos'],
'restaurante-serra-da-estrela':['comida portuguesa','pratos tradicionais','refeições'],
'rodizio-do-gelo':['rodízio','carne grelhada','refeições'],
'sacoor-blue':['roupa de senhora','roupa de homem','camisas','polos','calças','casacos','malhas','acessórios'],
'salsa-jeans':['calças de ganga','jeans','roupa de senhora','roupa de homem','t-shirts','camisas','casacos','calças'],
'santa-grelha':['carne grelhada','grelhados','refeições'],
'seaside':['sapatos','ténis','botas','sandálias','chinelos','calçado infantil','malas'],
'sergent-major':['roupa de bebé','roupa de criança','vestidos infantis','calças infantis','casacos infantis','acessórios infantis'],
'soupa':['sopas','saladas','refeições leves'],
'sport-zone':['ténis','roupa desportiva','calçado desportivo','equipamento de fitness','bolas','mochilas','acessórios desportivos'],
'springfield':['roupa de senhora','roupa de homem','t-shirts','camisas','calças','calças de ganga','casacos','malhas','acessórios'],
'subway':['sandes','baguetes','wraps','saladas','menus'],
'suits-inc':['fatos de homem','blazers','camisas','calças','gravatas','sapatos formais','acessórios de cerimónia'],
'sushi-tokyo':['sushi','sashimi','maki','nigiri','refeições japonesas'],
'telepizza':['pizza','menus de pizza','entradas','sobremesas'],
'tezenis':['roupa interior','sutiãs','cuecas','boxers','pijamas','meias','leggings','roupa de banho'],
'tiffosi':['calças de ganga','jeans','roupa de senhora','roupa de homem','roupa de criança','t-shirts','camisas','casacos','calças'],
'tous':['joias','anéis','brincos','colares','pulseiras','relógios','malas','carteiras','acessórios'],
'troppo-squisito':['gelado italiano','gelados','sobremesas','café'],
'unicambio':['câmbio de moeda','moeda estrangeira','transferências de dinheiro','tax free'],
'unilabs':['análises clínicas','colheitas de sangue','testes laboratoriais'],
'upstyle':['roupa de senhora','roupa de homem','sapatos','ténis','malas','acessórios'],
'vilanova':['roupa de senhora','vestidos','blusas','calças','casacos','malas','acessórios'],
'vista-alegre-atlantis':['louça','porcelana','cristal','copos','pratos','talheres','serviços de jantar','decoração','presentes'],
'vitaminas':['saladas','sopas','wraps','sumos naturais','refeições saudáveis'],
'vodafone':['telemóveis','cartões SIM','tarifários móveis','internet','televisão por subscrição','routers','acessórios para telemóvel'],
'wells':['dermocosmética','maquilhagem','cuidados de rosto','cuidados de corpo','higiene oral','suplementos','produtos para bebé','óculos','lentes de contacto','produtos de saúde','protetor solar'],
'widex':['aparelhos auditivos','pilhas para aparelhos auditivos','acessórios auditivos','avaliação auditiva'],
'women-secret':['lingerie','sutiãs','cuecas','pijamas','roupa de dormir','roupa de banho','chinelos','acessórios'],
'worten':['telemóveis','computadores','tablets','televisões','eletrodomésticos','gaming','consolas','videojogos','áudio','auscultadores','máquinas fotográficas','smartwatches','cabos','carregadores','reparação de equipamentos'],
'worten-mobile':['telemóveis','smartwatches','auscultadores','capas de telemóvel','películas de telemóvel','cabos','carregadores','acessórios para telemóvel'],
'xtreme':['ténis','roupa desportiva','calçado desportivo','skate','acessórios desportivos'],
'zippy':['roupa de bebé','roupa de criança','calçado infantil','pijamas infantis','roupa interior infantil','acessórios infantis','puericultura'],
}

# Extra aliases for store names / common misspellings.
STORE_ALIASES = {
 'a-gula-do-prego':['gula do prego'], 'academico-de-viseu':['académico','academico','clube académico'],
 'agencia-abreu':['abreu','viagens abreu'], 'auchan-o-meu-pet':['o meu pet','pet auchan'],
 'balcao-de-informacoes':['informações','informacao','apoio ao cliente'], 'bluebird':['blue bird'],
 'c-a':['c&a','cea'], 'calcado-guimaraes':['calçado guimarães','guimarães calçado'],
 'cinemas-nos':['cinema','nos cinemas'], 'companhia-de-4-patas':['4 patas','quatro patas'],
 'desfibrilador-e-primeiros-socorros':['dae','desfibrilhador','primeiros socorros'],
 'espaco-kids':['kids','espaço criança'], 'fabrica-dos-oculos':['fábrica dos óculos','fabrica oculos'],
 'forlife-ginasio-e-piscinas':['forlife ginásio','for life ginásio','piscinas forlife'],
 'forlife-cabeleireiro-estetica':['forlife cabeleireiro','for life estética'], 'h-m':['h&m','hm'],
 'iservices':['i services'], 'la-casa-de-las-carcasas':['casa das capas','carcasas'],
 'mcdonald-s':['mcdonalds','macdonalds','mc donalds'], 'mi-store-xiaomi':['xiaomi','mi store'],
 'o-boticario':['boticário','boticario'], 'o-dreams':['odreams','o dreams'],
 'perdidos-e-achados':['achados e perdidos'], 'press-center-cigarette':['press center','tabacaria'],
 'radio-popular':['rádio popular'], 'radio-estacao-diaria':['rádio estação diária','estação diária'],
 'women-secret':['womensecret','women secret'], 'wc-acessivel':['wc deficientes','casa de banho acessível'],
}

# Direct official catalog sources that were explicitly checked during this audit.
CHECKED_BRAND_SOURCES = {
 'fnac':['https://www.fnac.pt/'],
 'worten':['https://www.worten.pt/'], 'worten-mobile':['https://www.worten.pt/'],
 'auchan':['https://www.auchan.pt/pt/homepage'], 'auchan-o-meu-pet':['https://www.auchan.pt/pt/animais/'],
 'wells':['https://wells.pt/'], 'primark':['https://www.primark.com/pt-pt'],
 'h-m':['https://www2.hm.com/pt_pt/index.html'], 'parfois':['https://www.parfois.com/pt/pt/home/'],
 'douglas':['https://www.douglas.pt/'], 'druni':['https://www.druni.pt/'],
 'pluricosmetica':['https://www.pluricosmetica.com/'], 'o-boticario':['https://www.oboticario.pt/'],
 'aldo':['https://aldoshoes.pt/'], 'benetton':['https://pt.benetton.com/'],
 'calzedonia':['https://www.calzedonia.com/pt/'], 'c-a':['https://www.c-and-a.com/stores/pt-pt/index.html'],
 'cortefiel':['https://cortefiel.com/pt/pt'], 'deichmann':['https://www.deichmann.com/pt-pt/'],
 'desigual':['https://www.desigual.com/pt_PT/'], 'intimissimi':['https://www.intimissimi.com/pt/'],
 'mango':['https://shop.mango.com/pt/pt'], 'mayoral':['https://www.mayoral.com/pt/pt/'],
 'women-secret':['https://womensecret.com/pt/pt'], 'chicco':['https://www.chicco.pt/'],
 'jd-sports':['https://www.jdsports.pt/'], 'centroxogo':['https://www.centroxogo.pt/'],
}

# Official services advertised by Palácio do Gelo. Services that are fulfilled by a store point to that store.
SERVICES = [
 {'id':'balcao-informacoes','name':'Balcão de Informações','aliases':['informações','apoio ao cliente','informação do shopping'],'providerStoreIds':['balcao-de-informacoes'],'locations':[{'floor':'-2','detail':'Balcão de Informações'}], 'confirmed':True},
 {'id':'diretorios-lojas','name':'Diretórios de lojas','aliases':['mapa das lojas','diretório','onde fica uma loja'],'providerStoreIds':['balcao-de-informacoes'],'locations':[], 'confirmed':True},
 {'id':'perdidos-achados','name':'Perdidos e achados','aliases':['objeto perdido','perdi uma coisa','perdi','esqueci','achei um objeto','achados e perdidos'],'providerStoreIds':['perdidos-e-achados','balcao-de-informacoes'],'locations':[{'floor':'-2','detail':'Balcão de Informações'}], 'confirmed':True},
 {'id':'cheques-prenda','name':'Cheques-prenda','aliases':['vale presente','voucher presente','cartão presente'],'providerStoreIds':['cheque-prenda','balcao-de-informacoes'],'locations':[{'floor':'-2','detail':'Balcão de Informações'}], 'confirmed':True, 'details':['valores oficiais indicados: 5 €, 10 €, 15 €, 20 € e 50 €']},
 {'id':'cadeiras-rodas','name':'Empréstimo de cadeiras de rodas','aliases':['cadeira de rodas','mobilidade reduzida'],'providerStoreIds':['balcao-de-informacoes'],'locations':[{'floor':'-2','detail':'Solicitar no Balcão de Informações'}], 'confirmed':True},
 {'id':'carrinhos-bebe','name':'Empréstimo de carrinhos de bebé','aliases':['carrinho bebé','carrinho para criança'],'providerStoreIds':['balcao-de-informacoes'],'locations':[{'floor':'-2','detail':'Solicitar no Balcão de Informações'}], 'confirmed':True},
 {'id':'espaco-kids','name':'Espaço Kids','aliases':['zona infantil','espaço criança','microondas para bebé','aquecedor de biberão','amamentação'],'providerStoreIds':['espaco-kids'],'locations':[{'floor':'3','detail':'Zona poente da restauração, junto à Pista de Gelo'}], 'confirmed':True},
 {'id':'cadeiras-bebe-restauracao','name':'Cadeiras de bebé na restauração','aliases':['cadeira alta bebé','cadeirinha bebé'],'providerStoreIds':['espaco-kids'],'locations':[{'floor':'3','detail':'Zona de restauração'}], 'confirmed':True},
 {'id':'zona-refeicoes-familias','name':'Zona de refeições para famílias','aliases':['comer com crianças','zona familiar'],'providerStoreIds':['espaco-kids'],'locations':[{'floor':'3','detail':'Zona de restauração'}], 'confirmed':True},
 {'id':'parque-infantil','name':'Parque infantil','aliases':['parquinho','brincar crianças'],'providerStoreIds':['polar-brincar','espaco-kids'],'locations':[], 'confirmed':True},
 {'id':'fraldarios','name':'Fraldários e WC infantil','aliases':['fraldário','muda fraldas','trocar fralda','wc criança'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'coworking-usb','name':'Espaço de coworking e tomadas USB','aliases':['trabalhar no shopping','tomada usb','carregar portátil','coworking'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'diretorios-restauracao','name':'Diretórios de restauração','aliases':['mapa restaurantes','onde comer'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'wc-acessivel','name':'WC acessível','aliases':['casa de banho acessível','wc mobilidade reduzida','wc deficientes'],'providerStoreIds':['wc-acessivel'],'locations':[], 'confirmed':True},
 {'id':'zona-repouso','name':'Zona de repouso','aliases':['descansar','sentar','zona descanso'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'minimingos','name':'Minimingos','aliases':['espaço minimingos'],'providerStoreIds':['minimingos'],'locations':[], 'confirmed':True},
 {'id':'carrinhos-compras','name':'Carrinhos de compras','aliases':['carrinho supermercado','carrinho compras'],'providerStoreIds':['auchan'],'locations':[], 'confirmed':True},
 {'id':'multibanco','name':'Multibanco','aliases':['atm','levantar dinheiro','caixa automático'],'providerStoreIds':['multibanco','millennium-bcp'],'locations':[
   {'floor':'-2','detail':'junto à Jotacake e ao Bowling'}, {'floor':'-1','detail':'junto ao Auchan e elevadores'},
   {'floor':'P0','detail':'junto aos elevadores/tapetes'}, {'floor':'0','detail':'junto à C&A e zona Millennium/florista'},
   {'floor':'3','detail':'junto ao H3 e Cervejaria Antártida'}], 'confirmed':True},
 {'id':'bookcrossing','name':'Bookcrossing','aliases':['troca de livros','livros grátis','deixar livro'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'cinema','name':'Cinema','aliases':['ver filme','sessões de cinema','bilhetes cinema'],'providerStoreIds':['cinemas-nos'],'locations':[], 'confirmed':True},
 {'id':'papelaria-tabacaria','name':'Papelaria e tabacaria','aliases':['jornais','revistas','tabaco'],'providerStoreIds':['press-center-cigarette'],'locations':[], 'confirmed':True},
 {'id':'sapateiro-chaves','name':'Sapateiro e cópia de chaves','aliases':['arranjar sapatos','duplicar chave','fazer chave'],'providerStoreIds':['mister-minit'],'locations':[], 'confirmed':True},
 {'id':'tax-free-cambios','name':'Tax Free e câmbios','aliases':['trocar moeda','cambio','moeda estrangeira','taxfree'],'providerStoreIds':['unicambio'],'locations':[], 'confirmed':True},
 {'id':'cabeleireiro-beleza','name':'Cabeleireiro e estética','aliases':['cortar cabelo','manicure','estética'],'providerStoreIds':['forlife-cabeleireiro-estetica'],'locations':[], 'confirmed':True},
 {'id':'farmacia','name':'Farmácia','aliases':['medicamentos','remédios'],'providerStoreIds':['farmacia-pinto-de-campos'],'locations':[], 'confirmed':True},
 {'id':'florista','name':'Florista','aliases':['flores','ramo de flores'],'providerStoreIds':['cocktail-flower'],'locations':[], 'confirmed':True},
 {'id':'laboratorio','name':'Laboratório de análises clínicas','aliases':['análises ao sangue','colheitas'],'providerStoreIds':['unilabs'],'locations':[], 'confirmed':True},
 {'id':'lavagem-automovel','name':'Lavagem automóvel','aliases':['lavar carro','car wash'],'providerStoreIds':['eco-car-wash'],'locations':[], 'confirmed':True},
 {'id':'booster-arranque','name':'Booster de arranque automóvel','aliases':['bateria do carro descarregada','ajuda arrancar carro'],'providerStoreIds':['balcao-de-informacoes'],'locations':[], 'confirmed':True},
 {'id':'carregamento-eletrico','name':'Carregamento de veículos elétricos','aliases':['carregar carro elétrico','ev charger','posto elétrico'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'estacionamento','name':'Estacionamento','aliases':['parque de estacionamento','estacionar carro'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'levantamento-encomendas','name':'Levantamento de encomendas','aliases':['recolher encomenda','pickup','click and collect'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'primeiros-socorros','name':'Desfibrilhador e primeiros socorros','aliases':['dae','desfibrilhador','emergência médica'],'providerStoreIds':['desfibrilador-e-primeiros-socorros','balcao-de-informacoes'],'locations':[], 'confirmed':True},
 {'id':'reciclagem-pilhas-lampadas','name':'Recolha de pilhas e lâmpadas usadas','aliases':['pilhão','reciclar pilhas','reciclar lâmpadas'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'marco-correio','name':'Marco de correio','aliases':['caixa de correio','enviar carta','correio'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'telefones-publicos','name':'Telefones públicos','aliases':['telefone público','cabine telefone'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'wifi','name':'Wi-Fi gratuito','aliases':['wifi','internet grátis','wireless'],'providerStoreIds':[],'locations':[], 'confirmed':True},
 {'id':'pista-gelo','name':'Pista de Gelo','aliases':['patinagem no gelo','patinar'],'providerStoreIds':['pista-de-gelo'],'locations':[{'floor':'3','detail':'Pista de Gelo'}], 'confirmed':True},
 {'id':'ponto-taxi','name':'Ponto de Táxi','aliases':['taxi','táxi'],'providerStoreIds':['ponto-de-taxi'],'locations':[], 'confirmed':False, 'note':'Existe no app, mas a localização deve ser confirmada no terreno ou com o Balcão de Informações.'},
]

# Sources checked explicitly during audit. The Palácio source confirms local presence/service; brand sources confirm catalogue family.
SOURCE_REGISTRY = {
 'palacio-stores': {'label':'Diretório oficial de lojas do Palácio do Gelo','url':PALACIO_STORES,'type':'official_center_directory'},
 'palacio-services': {'label':'Serviços oficiais do Palácio do Gelo','url':PALACIO_SERVICES,'type':'official_center_services'},
 'fnac': {'label':'FNAC Portugal','url':'https://www.fnac.pt/','type':'official_brand_catalog'},
 'worten': {'label':'Worten Portugal','url':'https://www.worten.pt/','type':'official_brand_catalog'},
 'auchan': {'label':'Auchan Portugal','url':'https://www.auchan.pt/pt/homepage','type':'official_brand_catalog'},
 'wells': {'label':'Wells Portugal','url':'https://wells.pt/','type':'official_brand_catalog'},
 'primark': {'label':'Primark Portugal','url':'https://www.primark.com/pt-pt','type':'official_brand_catalog'},
 'hm': {'label':'H&M Portugal','url':'https://www2.hm.com/pt_pt/index.html','type':'official_brand_catalog'},
 'parfois': {'label':'Parfois Portugal','url':'https://www.parfois.com/pt/pt/home/','type':'official_brand_catalog'},
 'douglas': {'label':'Douglas Portugal','url':'https://www.douglas.pt/','type':'official_brand_catalog'},
 'druni': {'label':'Druni Portugal','url':'https://www.druni.pt/','type':'official_brand_catalog'},
 'pluricosmetica': {'label':'Pluricosmética','url':'https://www.pluricosmetica.com/','type':'official_brand_catalog'},
 'oboticario': {'label':'O Boticário Portugal','url':'https://www.oboticario.pt/','type':'official_brand_catalog'},
 'aldo': {'label':'ALDO Portugal','url':'https://aldoshoes.pt/','type':'official_brand_catalog'},
 'benetton': {'label':'Benetton Portugal','url':'https://pt.benetton.com/','type':'official_brand_catalog'},
 'calzedonia': {'label':'Calzedonia Portugal','url':'https://www.calzedonia.com/pt/','type':'official_brand_catalog'},
 'ca': {'label':'C&A Portugal','url':'https://www.c-and-a.com/stores/pt-pt/index.html','type':'official_brand_catalog'},
 'cortefiel': {'label':'Cortefiel Portugal','url':'https://cortefiel.com/pt/pt','type':'official_brand_catalog'},
 'deichmann': {'label':'Deichmann Portugal','url':'https://www.deichmann.com/pt-pt/','type':'official_brand_catalog'},
 'desigual': {'label':'Desigual Portugal','url':'https://www.desigual.com/pt_PT/','type':'official_brand_catalog'},
 'intimissimi': {'label':'Intimissimi Portugal','url':'https://www.intimissimi.com/pt/','type':'official_brand_catalog'},
 'mango': {'label':'Mango Portugal','url':'https://shop.mango.com/pt/pt','type':'official_brand_catalog'},
 'mayoral': {'label':'Mayoral Portugal','url':'https://www.mayoral.com/pt/pt/','type':'official_brand_catalog'},
 'womensecret': {'label':"Women'secret Portugal",'url':'https://womensecret.com/pt/pt','type':'official_brand_catalog'},
 'chicco': {'label':'Chicco Portugal','url':'https://www.chicco.pt/','type':'official_brand_catalog'},
 'jdsports': {'label':'JD Sports Portugal','url':'https://www.jdsports.pt/','type':'official_brand_catalog'},
 'centroxogo': {'label':'Centroxogo Portugal','url':'https://www.centroxogo.pt/','type':'official_brand_catalog'},
}
SOURCE_KEY = {'fnac':'fnac','worten':'worten','worten-mobile':'worten','auchan':'auchan','auchan-o-meu-pet':'auchan','wells':'wells','primark':'primark','h-m':'hm','parfois':'parfois','douglas':'douglas','druni':'druni','pluricosmetica':'pluricosmetica','o-boticario':'oboticario','aldo':'aldo','benetton':'benetton','calzedonia':'calzedonia','c-a':'ca','cortefiel':'cortefiel','deichmann':'deichmann','desigual':'desigual','intimissimi':'intimissimi','mango':'mango','mayoral':'mayoral','women-secret':'womensecret','chicco':'chicco','jd-sports':'jdsports','centroxogo':'centroxogo'}

STOPWORDS = ['onde','vende','vendem','tem','têm','ter','comprar','compro','encontro','encontrar','preciso','quero','queria','procuro','há','ha','alguma','algum','uma','um','de','do','da','dos','das','no','na','nos','nas','para','por','favor','loja','shopping','palácio','palacio','gelo']

def norm(s):
    s = unicodedata.normalize('NFKD', str(s)).encode('ascii','ignore').decode('ascii').lower()
    s = s.replace("'",'').replace('’','').replace('‘','')
    s = re.sub(r'[^a-z0-9]+',' ',s)
    return re.sub(r'\s+',' ',s).strip()

def dedupe(items):
    seen=set(); out=[]
    for x in items:
        x=str(x).strip()
        k=norm(x)
        if x and k and k not in seen:
            seen.add(k); out.append(x)
    return out

catalog_stores=[]
for s in stores:
    sid=s['id']; name=s['name']
    discovery=[]
    for c in s.get('categories',[]): discovery += CATEGORY_DISCOVERY.get(c,[])
    discovery += s.get('aliases',[]) + STORE_ALIASES.get(sid,[])
    confirmed=CONFIRMED.get(sid,[])
    target_names = OFFICIAL_NAME_OVERRIDE.get(sid,[name])
    official_matches=[]
    for item in OFFICIAL_ITEMS:
        if any(simple_norm(item['name']) == simple_norm(t) for t in target_names):
            official_matches.append(item)
    source_urls=[]
    source_ids=[]
    official_center_urls=[]
    for item in official_matches:
        url='https://palaciodogelo.pt/'+item['rel'].lstrip('/')
        official_center_urls.append(url); source_urls.append(url)
    if official_matches:
        source_ids.append('palacio-stores')
    if sid in SOURCE_KEY:
        source_ids.append(SOURCE_KEY[sid]); source_urls += CHECKED_BRAND_SOURCES.get(sid,[])
    # Terms from the existing local text remain useful for floor/unit/name matching, but not product claims.
    location_terms=[]
    for loc in s.get('locations',[]):
        if loc.get('floor') is not None: location_terms += [f"piso {loc['floor']}"]
        if loc.get('unit'): location_terms += [f"loja {loc['unit']}"]
    # Evidence is explicit and machine-readable.
    if sid in SOURCE_KEY:
        evidence='official_brand_catalog_checked'
    elif confirmed:
        evidence='brand_assortment_or_explicit_service_curated'
    else:
        evidence='palacio_business_category_only'
    catalog_stores.append({
      'id':sid,'name':name,'kind':'store_or_local_point','categories':s.get('categories',[]),
      'aliases':dedupe(s.get('aliases',[])+STORE_ALIASES.get(sid,[])),
      'locations':s.get('locations',[]),
      'appVerifiedFlag':bool(s.get('verified')),
      'currentOfficialDirectoryMatch':bool(official_matches),
      'currentOfficialDirectoryNames':[x['name'] for x in official_matches],
      'officialCenterUrl':official_center_urls[0] if official_center_urls else None,
      'officialCenterUrls':official_center_urls,
      'confirmedProductFamilies':dedupe(confirmed),
      'discoveryOnlyTerms':dedupe(discovery),
      'locationTerms':dedupe(location_terms),
      'evidenceLevel':evidence,
      'sourceIds':dedupe(source_ids),'sourceUrls':dedupe(source_urls),
      'localInventoryGuaranteed':False,
      'availabilityMessage':'Categoria/serviço compatível. Confirme modelo, tamanho, cor e stock diretamente com a loja antes de se deslocar.',
      'lastVerified':'2026-07-24',
      'note':s.get('note','')
    })

catalog = {
 'schemaVersion':'2.0.0','generatedAt':'2026-07-24T00:00:00+01:00','language':'pt-PT',
 'scope':{'shoppingCenter':'Palácio do Gelo Shopping','storeRecords':len(catalog_stores),'officialServiceRecords':len(SERVICES)},
 'truthPolicy':{
   'neverClaimLocalStockWithoutLocalStockEvidence':True,
   'resultLabels':{
      'official_local':'Confirmado no Palácio do Gelo',
      'official_brand_catalog_checked':'Categoria confirmada no catálogo oficial da marca; stock local por confirmar',
      'brand_assortment_or_explicit_service_curated':'Categoria conhecida da marca/serviço; confirmar na loja',
      'palacio_business_category_only':'Correspondência por categoria do diretório; confirmar antes de se deslocar'
   },
   'stockDisclaimer':'Os sites públicos mostram o catálogo/atividade da marca, não o stock físico atual da loja de Viseu. O app não deve afirmar “tem em stock” sem integração local ou confirmação recente da loja.'
 },
 'searchConfiguration':{
   'stopwords':STOPWORDS,'minimumMeaningfulTokenLength':2,'minimumCoverage':0.67,
   'weights':{'exactStoreName':120,'storeAlias':100,'exactConfirmedPhrase':90,'confirmedProductToken':55,'officialService':90,'synonym':48,'category':24,'discoveryOnly':12,'location':8,'typoPenaltyPerEdit':-8},
   'maxTypoDistance':1,'maxResults':12
 },
 'synonyms':GLOBAL_SYNONYMS,
 'sources':SOURCE_REGISTRY,
 'stores':catalog_stores,
 'officialServices':SERVICES,
}

(OUT/'catalogo-pesquisa-v2.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
# JS wrapper for direct static use.
(OUT/'catalogo-pesquisa-v2.js').write_text('window.PG_SEARCH_CATALOG_V2 = '+json.dumps(catalog,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')

# Coverage report CSV
rows=['id;nome;presenca_palacio;familias_confirmadas;termos_descoberta;nivel_evidencia;url_oficial_centro']
for s in catalog_stores:
    vals=[s['id'],s['name'],'sim' if s['currentOfficialDirectoryMatch'] else 'não',str(len(s['confirmedProductFamilies'])),str(len(s['discoveryOnlyTerms'])),s['evidenceLevel'],s['officialCenterUrl'] or '']
    rows.append(';'.join(v.replace(';',',') for v in vals))
(OUT/'cobertura-lojas.csv').write_text('\ufeff'+'\n'.join(rows),encoding='utf-8')

stats={
 'stores':len(catalog_stores),
 'services':len(SERVICES),
 'stores_with_confirmed_families':sum(bool(x['confirmedProductFamilies']) for x in catalog_stores),
 'stores_without_confirmed_families':[x['name'] for x in catalog_stores if not x['confirmedProductFamilies']],
 'official_brand_catalog_checked':sum(x['evidenceLevel']=='official_brand_catalog_checked' for x in catalog_stores),
 'official_brand_sources':sum(x.get('type')=='official_brand_catalog' for x in SOURCE_REGISTRY.values()),
 'official_center_page_mapped':sum(bool(x['officialCenterUrls']) for x in catalog_stores),
 'total_confirmed_terms':sum(len(x['confirmedProductFamilies']) for x in catalog_stores),
 'total_discovery_terms':sum(len(x['discoveryOnlyTerms']) for x in catalog_stores),
}
(OUT/'estatisticas.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(stats,ensure_ascii=False,indent=2))
