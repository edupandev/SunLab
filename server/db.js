import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sunlab.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Create Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT,
      description TEXT,
      story TEXT,
      price REAL NOT NULL,
      original_price REAL,
      category TEXT NOT NULL,
      category_label TEXT NOT NULL,
      rating REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      in_stock INTEGER NOT NULL DEFAULT 1,
      lead_time TEXT DEFAULT '2 a 3 dias úteis',
      featured INTEGER DEFAULT 0,
      bestseller INTEGER DEFAULT 0,
      new_arrival INTEGER DEFAULT 0,
      images_json TEXT NOT NULL,
      colors_json TEXT NOT NULL,
      sizes_json TEXT,
      specs_json TEXT NOT NULL,
      highlights_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pendente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure default admin user
  const adminStmt = db.prepare('SELECT id FROM users WHERE email = ?');
  const existingAdmin = adminStmt.get('admin@sunlab.com.br');
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('usr-admin-1', 'Administrador SunLab', 'admin@sunlab.com.br', 'sunlab2026', 'admin');
    console.log('[DB] Created default admin user: admin@sunlab.com.br / sunlab2026');
  }

  // Products table starts completely empty as requested
  // Initial seed is disabled so the store remains clean until new products are created via /admin


  // Check if orders exist; if not, seed initial sample orders (E-commerce 2.5 style)
  const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  if (ordersCount.count === 0) {
    seedInitialOrders();
  }
}

export function seedInitialOrders() {
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_name, customer_email, customer_phone,
      shipping_address, payment_method, items_json, total_amount, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrder.run(
    'ord-101',
    'SLB-942817',
    'Lucas Moreira Mendes',
    'lucas.mendes@email.com',
    '(11) 98765-4321',
    'Av. Paulista, 1578, Ap 12B — Bela Vista, São Paulo/SP',
    'Pix Instantâneo',
    JSON.stringify([
      { name: 'Vaso Paramétrico Waveform', color: 'Terracota Basáltico', size: 'Grande (26cm)', quantity: 1, unitPrice: 189.90 },
      { name: 'Dock Station Modular MagSafe', color: 'Branco Giz Mineral', quantity: 1, unitPrice: 149.90 }
    ]),
    339.80,
    'Em Produção 3D'
  );

  insertOrder.run(
    'ord-102',
    'SLB-718294',
    'Fernanda Vasconcelos',
    'fernanda.vasconcelos@design.br',
    '(21) 99123-8877',
    'Rua Visconde de Pirajá, 305 — Ipanema, Rio de Janeiro/RJ',
    'Cartão de Crédito (3x)',
    JSON.stringify([
      { name: 'Luminária Pendente Voronoi Shade', color: 'Areia Natural', quantity: 2, unitPrice: 249.90 }
    ]),
    499.80,
    'Pendente'
  );

  console.log('[DB] Seeded initial customer orders into SQLite orders table.');
}

export function seedInitialProducts() {
  const insertStmt = db.prepare(`
    INSERT INTO products (
      id, slug, name, tagline, description, story, price, original_price,
      category, category_label, rating, reviews_count, in_stock, lead_time,
      featured, bestseller, new_arrival, images_json, colors_json, sizes_json,
      specs_json, highlights_json
    ) VALUES (
      @id, @slug, @name, @tagline, @description, @story, @price, @original_price,
      @category, @category_label, @rating, @reviews_count, @in_stock, @lead_time,
      @featured, @bestseller, @new_arrival, @images_json, @colors_json, @sizes_json,
      @specs_json, @highlights_json
    )
  `);

  const initialProducts = [
    {
      id: 'prt-01',
      slug: 'vaso-parametrico-waveform',
      name: 'Vaso Paramétrico Waveform',
      tagline: 'Geometria algorítmica inspirada na oscilação acústica da matéria.',
      description: 'Vaso escultural de design autoral criado através de computação generativa. A textura em camadas onduladas captura luz e sombras de forma dinâmica ao longo do dia. Cada peça é impressa em polímero biodegradável mineral com acabamento mate acetinado.',
      story: 'Concebido a partir de equações de ondas senoidais, o Waveform traduz som em forma física. Um objeto contemporâneo que valoriza arranjos botânicos secos ou frescos com sofisticação atemporal.',
      price: 149.00,
      original_price: 189.00,
      category: 'decor',
      category_label: 'Decoração',
      rating: 4.9,
      reviews_count: 38,
      in_stock: 1,
      lead_time: '2 a 3 dias úteis',
      featured: 1,
      bestseller: 1,
      new_arrival: 0,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Matte Onyx Black', hex: '#121214' },
        { name: 'Chalk White', hex: '#EBEAE5' },
        { name: 'Terracotta Mineral', hex: '#A85D47' },
        { name: 'Sage Green', hex: '#5B7065' }
      ]),
      sizes_json: JSON.stringify(['Padrão (22cm)', 'Grande (30cm)']),
      specs_json: JSON.stringify({
        material: 'PLA Mineral Bio-composto',
        layerHeight: '0.12 mm (Ultra-alta definição)',
        dimensions: '140 x 140 x 220 mm',
        weight: '340g',
        infill: '25% Gyroid Estrutural',
        finish: 'Acetinado mate com selagem impermeável interna'
      }),
      highlights_json: JSON.stringify([
        'Modelagem paramétrica exclusiva SunLab Studio',
        'Impermeabilização interna para flores naturais com água',
        'Zero desperdício de matéria-prima durante a fabricação',
        'Compatível com qualquer estilo arquitetônico contemporâneo'
      ])
    },
    {
      id: 'prt-02',
      slug: 'luminaria-voronoi-eclipse',
      name: 'Luminária Voronoi Eclipse',
      tagline: 'Luz difusa e sombras orgânicas inspiradas em células biológicas.',
      description: 'Luminária de mesa escultórica com padrão Voronoi tridimensional. Em repouso, destaca-se como escultura geométrica abstrata; ao ser acesa, projeta uma constelação de sombras suaves e relaxantes no ambiente.',
      story: 'O padrão Voronoi replica as estruturas de distribuição celular da natureza. A cúpula é confeccionada em material translúcido de alta difusão óptica, suavizando a luminosidade sem criar pontos cegos.',
      price: 289.00,
      original_price: 329.00,
      category: 'decor',
      category_label: 'Decoração',
      rating: 5.0,
      reviews_count: 24,
      in_stock: 1,
      lead_time: '3 a 4 dias úteis',
      featured: 1,
      bestseller: 1,
      new_arrival: 0,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Pure White Satin', hex: '#F5F5F3' },
        { name: 'Obsidian Black', hex: '#1C1C1E' },
        { name: 'Warm Sand', hex: '#D8CAB8' }
      ]),
      sizes_json: JSON.stringify(['Compacta (20cm)', 'Statement (32cm)']),
      specs_json: JSON.stringify({
        material: 'PETG Difusor Óptico & Base em Alumínio anodizado',
        layerHeight: '0.14 mm',
        dimensions: '180 x 180 x 260 mm',
        weight: '520g',
        infill: '100% Casca Sólida',
        finish: 'Bocal E27 latonado e cabo têxtil trançado de 1.8m com interruptor'
      }),
      highlights_json: JSON.stringify([
        'Projeção luminosa ambiente de 360 graus',
        'Acompanha lâmpada LED dimerizável de temperatura quente (2400K)',
        'Estrutura resistente a impactos leves e calor dissipado',
        'Montagem manual com componentes elétricos certificados INMETRO'
      ])
    },
    {
      id: 'prt-03',
      slug: 'suporte-headphone-gravity-arc',
      name: 'Suporte de Headphone Gravity Arc',
      tagline: 'Linhas puras que equilibram forma, peso e precisão para seu setup.',
      description: 'Suporte para fones de ouvido over-ear com curvatura anatômica calculada para apoiar a tiara sem marcar a espuma ou couro. A base possui câmara interna preenchida com lastro de alta densidade para estabilidade inabalável ao retirar o fone.',
      story: 'Desenvolvido para audiófilos e entusiastas de setups minimalistas. A silhueta fluida complementa fones como Apple AirPods Max, Sony WH-1000XM5 e Sennheiser, unindo funcionalidade e presença estética.',
      price: 169.00,
      original_price: 199.00,
      category: 'tech',
      category_label: 'Tecnologia',
      rating: 4.8,
      reviews_count: 52,
      in_stock: 1,
      lead_time: '1 a 2 dias úteis',
      featured: 1,
      bestseller: 1,
      new_arrival: 0,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Stealth Black', hex: '#18181B' },
        { name: 'Lunar Titanium', hex: '#8E8E93' },
        { name: 'Ceramic White', hex: '#F2F2F7' }
      ]),
      sizes_json: null,
      specs_json: JSON.stringify({
        material: 'PLA Pro de Alta Rigidez com Núcleo Ponderado',
        layerHeight: '0.16 mm',
        dimensions: '120 x 140 x 275 mm',
        weight: '620g (Base anti-tombamento)',
        infill: '40% Tri-Hexagonal denso',
        finish: 'Pés emborrachados de silicone antiderrapante integrados'
      }),
      highlights_json: JSON.stringify([
        'Curvatura anatômica de 65mm para tiaras largas',
        'Base pesada com lastro para não se deslocar na mesa',
        'Pés de borracha que não riscam superfícies de madeira ou vidro',
        'Canaleta oculta na base para acomodar o cabo quando não estiver em uso'
      ])
    },
    {
      id: 'prt-04',
      slug: 'dock-station-modular-hex',
      name: 'Dock Station Modular Hex 4-em-1',
      tagline: 'Sistema magnético expansível para organização e recarga de alta precisão.',
      description: 'Sistema de organização de mesa modular interligado por ímãs de neodímio. Inclui berço para carregador sem fio MagSafe, suporte para Apple Watch / Galaxy Watch, porta-canetas técnico e bandeja de apoio para chaves e acessórios.',
      story: 'Projetado com base na geometria hexagonal para criar configurações customizadas que se adaptam exatamente ao seu espaço e rotina de trabalho.',
      price: 189.00,
      original_price: 220.00,
      category: 'utility',
      category_label: 'Utilitários',
      rating: 4.9,
      reviews_count: 41,
      in_stock: 1,
      lead_time: '2 a 3 dias úteis',
      featured: 1,
      bestseller: 0,
      new_arrival: 1,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Space Grey Matte', hex: '#3A3A3C' },
        { name: 'Sandstone Beige', hex: '#D1C7BD' },
        { name: 'Deep Forest', hex: '#2C3E35' }
      ]),
      sizes_json: null,
      specs_json: JSON.stringify({
        material: 'PETG Carbon Fiber & Ímãs de Neodímio N52',
        layerHeight: '0.12 mm',
        dimensions: '280 x 110 x 85 mm',
        weight: '410g',
        infill: '30% Honeycomb',
        finish: 'Textura mate texturizada resistente a riscos'
      }),
      highlights_json: JSON.stringify([
        'Conexões magnéticas de encaixe tátil audível',
        'Encaixe milimétrico para cabos originais MagSafe e Qi',
        'Módulos intercambiáveis: alterne a disposição conforme sua preferência',
        'Base estável com proteção contra micro-arranhões na escrivaninha'
      ])
    },
    {
      id: 'prt-05',
      slug: 'organizador-isometrico-grid',
      name: 'Organizador Isométrico Grid-3D',
      tagline: 'Arquitetura modular em escala micrométrica para o seu espaço criativo.',
      description: 'Organizador com divisórias escalonadas e nichos angulados a 45 graus que mantêm canetas, ferramentas de desenho, réguas, tesouras e adaptadores à vista e sempre ao alcance da mão.',
      story: 'Inspirado na precisão dos grids isométricos do desenho arquitetônico, o Grid-3D une beleza geométrica pura com utilidade funcional diária.',
      price: 129.00,
      original_price: 159.00,
      category: 'utility',
      category_label: 'Utilitários',
      rating: 4.7,
      reviews_count: 19,
      in_stock: 1,
      lead_time: '2 a 3 dias úteis',
      featured: 0,
      bestseller: 0,
      new_arrival: 1,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Onyx Black', hex: '#1C1C1E' },
        { name: 'Alabaster White', hex: '#F5F5F7' },
        { name: 'Terracotta Matte', hex: '#B26247' }
      ]),
      sizes_json: null,
      specs_json: JSON.stringify({
        material: 'PLA Premium Reciclado',
        layerHeight: '0.14 mm',
        dimensions: '180 x 120 x 95 mm',
        weight: '290g',
        infill: '20% Grid',
        finish: 'Superfície acetinada aveludada'
      }),
      highlights_json: JSON.stringify([
        'Ângulos de 45° que facilitam a remoção ágil de canetas',
        'Gaveta oculta deslizante para clipes e pendrives',
        'Design compacto que maximiza o aproveitamento da mesa',
        'Fabricado com plástico vegetal renovável'
      ])
    },
    {
      id: 'prt-06',
      slug: 'suporte-duplo-gamepad-apex',
      name: 'Suporte Gamer Dual Apex',
      tagline: 'Engenharia de apoio vertical e gerenciamento de cabos para seus controles.',
      description: 'Suporte vertical minimalista projetado para sustentar dois controles (PS5 DualSense, Xbox Series ou Nintendo Switch Pro Controller) de maneira flutuante e segura, ocupando o mínimo de espaço.',
      story: 'Adeus aos controles jogados pela estante. O Dual Apex transforma seus joysticks em peças de exibição escultural, com rota de cabos traseira integrada para recarga simultânea.',
      price: 119.00,
      original_price: 139.00,
      category: 'tech',
      category_label: 'Tecnologia',
      rating: 4.9,
      reviews_count: 68,
      in_stock: 1,
      lead_time: '1 a 2 dias úteis',
      featured: 1,
      bestseller: 1,
      new_arrival: 0,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Dark Cyberpunk', hex: '#16161A' },
        { name: 'Snow Frost White', hex: '#F0F0F2' },
        { name: 'Neon Electric Orange', hex: '#FF5C00' }
      ]),
      sizes_json: null,
      specs_json: JSON.stringify({
        material: 'PETG de Alta Resiliência Mecânica',
        layerHeight: '0.16 mm',
        dimensions: '110 x 140 x 240 mm',
        weight: '360g',
        infill: '35% Cubic',
        finish: 'Bordas de proteção chanfradas'
      }),
      highlights_json: JSON.stringify([
        'Compatibilidade universal (PS5, Xbox, Pro Controller, 8BitDo)',
        'Apoios acolchoados em EVA para não riscar o plástico dos gatilhos',
        'Centro de gravidade rebaixado para evitar tombamento acidental',
        'Design com passagem invisível de cabos USB-C'
      ])
    },
    {
      id: 'prt-07',
      slug: 'luminaria-lunar-lunasphere',
      name: 'Luminária Litofania LunaSphere',
      tagline: 'Topografia lunar da NASA revelada em resolução micrométrica de camadas.',
      description: 'Esfera lunar impressa com a técnica milenar de litofania combinada com manufatura aditiva 3D de 0.08mm. A variação milimétrica de espessura da parede plástica faz com que a luz interna revele crateras e mares lunares com fidelidade astronômica.',
      story: 'Baseada na malha topográfica oficial da Lunar Reconnaissance Orbiter da NASA. Uma peça emocionante que encanta os amantes de astronomia, exploração espacial e poesia luminosa.',
      price: 219.00,
      original_price: 259.00,
      category: 'gifts',
      category_label: 'Presentes',
      rating: 5.0,
      reviews_count: 77,
      in_stock: 1,
      lead_time: '2 a 3 dias úteis',
      featured: 1,
      bestseller: 1,
      new_arrival: 0,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Lunar White (Luz Quente / Fria)', hex: '#FBFBFA' }
      ]),
      sizes_json: JSON.stringify(['Diâmetro 15cm', 'Diâmetro 20cm']),
      specs_json: JSON.stringify({
        material: 'PLA Transparente Fosco UV Estabilizado',
        layerHeight: '0.08 mm (Micrométrica)',
        dimensions: 'Diâmetro 150 mm ou 200 mm',
        weight: '310g',
        infill: 'Casca Variável 0.4mm a 3.2mm',
        finish: 'Base tripé em madeira de reflorestamento e LED dimerizável recarregável USB'
      }),
      highlights_json: JSON.stringify([
        'Mapeamento topográfico certificado com crateras reais da Lua',
        'LED com 3 temperaturas de cor (Âmbar 2700K, Neutro 4000K, Branco Frio 6000K)',
        'Bateria interna recarregável de até 12 horas de autonomia contínua',
        'Controle por toque sensível na base metálica inferior'
      ])
    },
    {
      id: 'prt-08',
      slug: 'escultura-cinetica-mobius-loop',
      name: 'Escultura Contemplativa Möbius Loop',
      tagline: 'Uma superfície contínua que desafia o espaço tridimensional com fluidez.',
      description: 'A fita de Möbius é o clássico enigma topológico de uma superfície com apenas um lado e uma única borda. Impressa em um fluxo contínuo sem emendas aparentes sobre um eixo com rolamento cerâmico que permite giro silencioso ao toque.',
      story: 'Perfeita para mesas de diretoria, estúdios criativos e ambientes de relaxamento. Ao interagir com a peça, seu movimento suave induz foco e descompressão mental.',
      price: 179.00,
      original_price: 210.00,
      category: 'decor',
      category_label: 'Decoração',
      rating: 4.8,
      reviews_count: 16,
      in_stock: 1,
      lead_time: '3 a 4 dias úteis',
      featured: 0,
      bestseller: 0,
      new_arrival: 1,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Brushed Copper Silk', hex: '#B87333' },
        { name: 'Onyx Silk', hex: '#1C1C1E' },
        { name: 'Silver Platinum', hex: '#E5E4E2' }
      ]),
      sizes_json: null,
      specs_json: JSON.stringify({
        material: 'PLA Silk com Partículas Reflectivas & Rolamento Cerâmico Si3N4',
        layerHeight: '0.10 mm',
        dimensions: '190 x 110 x 210 mm',
        weight: '430g',
        infill: '50% Concéntrico para inércia de rotação',
        finish: 'Polimento superficial e base em compósito de alta densidade'
      }),
      highlights_json: JSON.stringify([
        'Giro silencioso com inércia contínua por mais de 2 minutos',
        'Superfície sem costura de camada externa (spiral vase contínuo)',
        'Embalagem para presente com certificado de autenticidade numerado',
        'Excelente presente para arquitetos, matemáticos e designers'
      ])
    },
    {
      id: 'prt-09',
      slug: 'suporte-notebook-aeroflow',
      name: 'Suporte Elevador de Laptop AeroFlow',
      tagline: 'Arquitetura biônica ultraleve que dissipa calor e aprimora a postura.',
      description: 'Par de elevadores angulados de perfil aerodinâmico para notebooks de 13 a 16 polegadas. Eleva a tela em 15 graus para ergonomia cervical ideal e liberta todo o fluxo de ar da ventoinha inferior.',
      story: 'Inspirado na estrutura óssea oca dos pássaros: máxima rigidez com peso pluma. Cabe na bolsa de laptop sem ocupar volume perceptível.',
      price: 99.00,
      original_price: 129.00,
      category: 'utility',
      category_label: 'Utilitários',
      rating: 4.8,
      reviews_count: 33,
      in_stock: 1,
      lead_time: '1 a 2 dias úteis',
      featured: 0,
      bestseller: 0,
      new_arrival: 0,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Graphite Black', hex: '#242426' },
        { name: 'Space Silver', hex: '#A1A1A6' },
        { name: 'Industrial Orange', hex: '#FF6B00' }
      ]),
      sizes_json: null,
      specs_json: JSON.stringify({
        material: 'PETG Reforçado com Fibra de Vidro Curta',
        layerHeight: '0.16 mm',
        dimensions: '210 x 42 x 65 mm (par compacto)',
        weight: '95g (conjunto)',
        infill: '100% Sólido Estrutural nas tensões',
        finish: 'Fita de silicone termomoldada para retenção e proteção do chassi'
      }),
      highlights_json: JSON.stringify([
        'Redução comprovada de até 9°C na temperatura do processador',
        'Estrutura biônica testada para suportar até 25kg de pressão estática',
        'Pesa menos de 100g para transporte diário na mochila',
        'Ângulo de digitação ergonômico recomendado por fisioterapeutas do trabalho'
      ])
    },
    {
      id: 'prt-10',
      slug: 'kit-esculturas-lowpoly-fauna',
      name: 'Trio Esculturas Facetadas Fauna',
      tagline: 'Minimalismo poligonal que celebra a beleza selvagem em escala de mesa.',
      description: 'Conjunto de três peças esculturais em estilo low-poly geométrico (Lobo Nórdico, Cervo das Montanhas e Urso Pardo). As arestas precisas criam reflexões facetadas de luz que transformam prateleiras e aparadores.',
      story: 'Um exercício estético de redução visual: transmitir a essência e o movimento do reino animal através de polígonos matemáticos calculados.',
      price: 139.00,
      original_price: 169.00,
      category: 'gifts',
      category_label: 'Presentes',
      rating: 4.9,
      reviews_count: 45,
      in_stock: 1,
      lead_time: '2 a 3 dias úteis',
      featured: 0,
      bestseller: 0,
      new_arrival: 0,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Trio Monocromático (Preto, Grafite, Branco)', hex: '#2C2C2E' },
        { name: 'Bronze & Cobre Metal', hex: '#8C6239' },
        { name: 'Terra & Areia Escandinava', hex: '#C2B280' }
      ]),
      sizes_json: null,
      specs_json: JSON.stringify({
        material: 'PLA Fosco de Alta Definição',
        layerHeight: '0.12 mm',
        dimensions: 'Alturas de 12cm a 16cm',
        weight: '260g (trio)',
        infill: '20% Triângulos',
        finish: 'Arestas facetadas agudas com base polida'
      }),
      highlights_json: JSON.stringify([
        'Arestas afiadas sem deformação térmica de cantos',
        'Embalagem artesanal com palha ecológica ideal para presentear',
        'Perfeito para nichos de estante, home offices e livings',
        'Peças numeradas com gravação discreta sob a base'
      ])
    },
    {
      id: 'prt-11',
      slug: 'projeto-sob-medida-atelier',
      name: 'Projeto Exclusivo Sob Medida (Atelier SunLab)',
      tagline: 'Da sua ideia ou arquivo 3D para um produto físico de alta precisão.',
      description: 'Desenvolvimento e manufatura personalizada para arquitetura, prototipagem ágil, brindes corporativos de luxo ou reposição de componentes de engenharia. Acompanhamento por designers industriais especializados.',
      story: 'Transformamos rascunhos, sketches ou modelos 3D (.STL, .OBJ, .STEP) em produtos finais acabados, com curadoria de polímeros avançados, resinas de alta resolução e pós-processamento artesanal.',
      price: 0,
      original_price: null,
      category: 'custom',
      category_label: 'Personalizados',
      rating: 5.0,
      reviews_count: 88,
      in_stock: 1,
      lead_time: 'A partir de 3 dias úteis',
      featured: 1,
      bestseller: 0,
      new_arrival: 0,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1000&q=80'
      ]),
      colors_json: JSON.stringify([
        { name: 'Paleta Completa & Cores Especiais', hex: '#2563EB' }
      ]),
      sizes_json: null,
      specs_json: JSON.stringify({
        material: 'PLA, PETG, ABS, ASA, Nylon Carbon, Resina 8K UV, TPU Flexível',
        layerHeight: '0.05 mm a 0.20 mm conforme aplicação',
        dimensions: 'Volume de impressão até 300 x 300 x 350 mm (peça única)',
        weight: 'Sob cálculo volumétrico',
        infill: '10% a 100% customizado por esforço mecânico',
        finish: 'Lixamento fino, pintura automotiva fosca, inserções metálicas rosqueadas M3/M4'
      }),
      highlights_json: JSON.stringify([
        'Consultoria técnica de espessura de parede e otimização topológica',
        'Envio de amostras ou protótipo funcional pré-lote',
        'Garantia de confidencialidade (NDA disponível)',
        'Descontos progressivos para pequenas séries de 10 a 500 unidades'
      ])
    }
  ];

  const transaction = db.transaction((products) => {
    for (const p of products) {
      insertStmt.run(p);
    }
  });

  transaction(initialProducts);
  console.log(`[DB] Successfully seeded ${initialProducts.length} products into SQLite database.`);
}

export default db;
