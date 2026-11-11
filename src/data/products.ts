export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  price: number;
  originalPrice?: number;
  category: 'decor' | 'utility' | 'tech' | 'gifts' | 'custom';
  categoryLabel: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  leadTime: string;
  featured: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  images: string[];
  colors: ProductColor[];
  sizes?: string[];
  specs: {
    material: string;
    layerHeight: string;
    dimensions: string;
    weight: string;
    infill: string;
    finish: string;
  };
  highlights: string[];
  sourceFolder?: string;
  destFolder?: string;
  files?: string[];
}

export const CATEGORIES = [
  { id: 'all', name: 'Todos os Produtos', label: 'Coleção Natalina SunLab', count: 5 },
  { id: 'decor', name: 'Decoração de Natal', label: 'Centros de Mesa & Esculturas', count: 3 },
  { id: 'gifts', name: 'Enfeites & Lembranças', label: 'Árvore, Guirlandas & Tags', count: 2 },
  { id: 'custom', name: 'Personalizados', label: 'Projetos Exclusivos em 3D', count: 1 },
] as const;

export const PRODUCTS: Product[] = [
  {
    "id": "prt-natal-01",
    "slug": "conjunto-natalino-vela-renas-pinheiro-3d",
    "name": "Conjunto Natalino Vela, Renas & Pinheiro 3D",
    "tagline": "Centro de mesa escultural com porta-vela, silhuetas de renas e pinheiro nórdico.",
    "description": "Composição de decoração natalina impressa em 3D de alta precisão. Apresenta base integrada para velas tealight (LED ou tradicional), silhueta elegante de renas e pinheiro estilizado com texturas facetadas. Ideal para ceias de Natal, aparadores e mesas de centro.",
    "story": "Projetado pelos designers da SunLab para criar uma iluminação aconchegante e contemporânea. As sombras projetadas pela chama criam um efeito mágico nas silhuetas das renas e do pinheiro.",
    "price": 89.9,
    "originalPrice": 119.9,
    "category": "decor",
    "categoryLabel": "Decoração Natalina",
    "rating": 5,
    "reviewsCount": 38,
    "inStock": true,
    "leadTime": "1 a 2 dias úteis",
    "featured": true,
    "bestseller": true,
    "newArrival": true,
    "sourceFolder": "01_Conjunto_Vela_Renas_Pinheiro",
    "destFolder": "01_vela_renas",
    "files": [
      "01_hero_estudio.jpg",
      "02_lifestyle_45graus.jpg",
      "03_macro_detalhe.jpg"
    ],
    "colors": [
      {
        "name": "Branco Neve Fosco",
        "hex": "#f8fafc"
      },
      {
        "name": "Ouro Real Metálico",
        "hex": "#d97706"
      },
      {
        "name": "Verde Pinheiro Nórdico",
        "hex": "#15803d"
      },
      {
        "name": "Vermelho Natalício",
        "hex": "#dc2626"
      }
    ],
    "sizes": [
      "Padrão Mesa (24cm x 12cm x 16cm)"
    ],
    "specs": {
      "material": "Bio-PLA Mineral Sustentável",
      "layerHeight": "0.12mm (Ultra Definição)",
      "dimensions": "24 x 12 x 16 cm",
      "weight": "210g",
      "infill": "20% Gyroid Antitorção",
      "finish": "Fosco Mate Aveludado"
    },
    "highlights": [
      "Acomoda velas tealight padrão de até 40mm",
      "Textura sem emendas nem marcas de suporte",
      "Material 100% ecológico e biodegradável",
      "Embalagem para presente com laço e papel kraft"
    ],
    "images": [
      "/products/natal/01_vela_renas/01_hero_estudio.jpg",
      "/products/natal/01_vela_renas/02_lifestyle_45graus.jpg",
      "/products/natal/01_vela_renas/03_macro_detalhe.jpg"
    ]
  },
  {
    "id": "prt-natal-02",
    "slug": "presepio-sagrada-familia-contemporaneo-3d",
    "name": "Presépio Sagrada Família Minimalista 3D",
    "tagline": "Composição escultural da Sagrada Família com geometria suave e acabamento cerâmico.",
    "description": "Presépio contemporâneo com figuras estilizadas de Maria, José, o Menino Jesus e a estrela guia. As linhas minimalistas valorizam a serenidade da cena, proporcionando um toque de arte sofisticada para a decoração da sua casa no fim de ano.",
    "story": "Uma reinterpretação artística das clássicas representações renascentistas da Sagrada Família, adaptada para a estética de design moderno através da modelagem digital paramétrica.",
    "price": 129.9,
    "originalPrice": 169.9,
    "category": "decor",
    "categoryLabel": "Arte & Fé",
    "rating": 5,
    "reviewsCount": 52,
    "inStock": true,
    "leadTime": "1 a 2 dias úteis",
    "featured": true,
    "bestseller": true,
    "newArrival": true,
    "sourceFolder": "02_Conjunto_Presepio_Sagrada_Familia",
    "destFolder": "02_presepio_familia",
    "files": [
      "01_hero_estudio.jpg",
      "02_lifestyle_sala.jpg",
      "03_macro_detalhe.jpg"
    ],
    "colors": [
      {
        "name": "Mármore Silk Acetinado",
        "hex": "#f1f5f9"
      },
      {
        "name": "Terracota Artesanal",
        "hex": "#ea580c"
      },
      {
        "name": "Branco Cerâmica Fosco",
        "hex": "#ffffff"
      }
    ],
    "sizes": [
      "Conjunto Completo (Base 28cm)"
    ],
    "specs": {
      "material": "PLA Silk Mineral com partículas cerâmicas",
      "layerHeight": "0.08mm (Qualidade Joalheria)",
      "dimensions": "28 x 14 x 18 cm",
      "weight": "340g",
      "infill": "25% Estrutural",
      "finish": "Toque Cerâmico Fosco Suave"
    },
    "highlights": [
      "Resolução de 0.08mm com toque ultra suave",
      "Estabilidade balanceada com base pesada",
      "Não quebra em caso de pequenas quedas acidentais",
      "Peça atemporal para colecionar por décadas"
    ],
    "images": [
      "/products/natal/02_presepio_familia/01_hero_estudio.jpg",
      "/products/natal/02_presepio_familia/02_lifestyle_sala.jpg",
      "/products/natal/02_presepio_familia/03_macro_detalhe.jpg"
    ]
  },
  {
    "id": "prt-natal-03",
    "slug": "pinheiro-escultural-feliz-natal-3d",
    "name": "Pinheiro Escultural \"Feliz Natal\" com Base",
    "tagline": "Árvore de Natal geométrica em camadas com lettering vazado e encaixe de precisão.",
    "description": "Árvore decorativa de mesa em camadas geométricas sobrepostas com tipografia integrada Feliz Natal. Fácil de montar e desmontar, possui base estável e detalhes de precisão milimétrica que capturam a luz ambiente.",
    "story": "Desenvolvido para compor escritórios, setups, mesas de jantar e recepções corporativas que buscam elegância festiva com zero excesso visual.",
    "price": 74.9,
    "originalPrice": 99.9,
    "category": "decor",
    "categoryLabel": "Decoração Natalina",
    "rating": 4.9,
    "reviewsCount": 29,
    "inStock": true,
    "leadTime": "Fabricação em 24h",
    "featured": true,
    "bestseller": false,
    "newArrival": true,
    "sourceFolder": "03_Conjunto_Pinheiro_Feliz_Natal",
    "destFolder": "03_pinheiro_natal",
    "files": [
      "01_hero_estudio.jpg",
      "02_lifestyle_mesa.jpg",
      "03_macro_detalhe.jpg"
    ],
    "colors": [
      {
        "name": "Verde Esmeralda Fosco",
        "hex": "#047857"
      },
      {
        "name": "Branco Neve Texturizado",
        "hex": "#ffffff"
      },
      {
        "name": "Dourado Champanhe",
        "hex": "#fbbf24"
      }
    ],
    "sizes": [
      "Médio (20cm altura)",
      "Grande (26cm altura)"
    ],
    "specs": {
      "material": "Bio-Polímero Eco-Friendly",
      "layerHeight": "0.12mm",
      "dimensions": "20 x 14 x 6 cm",
      "weight": "160g",
      "infill": "15% Honeycomb",
      "finish": "Fosco Satin"
    },
    "highlights": [
      "Design autoral modular com montagem em 2 passos",
      "Encaixe firme sem necessidade de cola",
      "Perfeito para setups e mesas de escritório",
      "Acompanha base com gravação oficial SunLab"
    ],
    "images": [
      "/products/natal/03_pinheiro_natal/01_hero_estudio.jpg",
      "/products/natal/03_pinheiro_natal/02_lifestyle_mesa.jpg",
      "/products/natal/03_pinheiro_natal/03_macro_detalhe.jpg"
    ]
  },
  {
    "id": "prt-natal-04",
    "slug": "kit-6-flocos-de-neve-ornamentos-arvore-3d",
    "name": "Kit 6 Enfeites Flocos de Neve Paramétricos",
    "tagline": "Coleção com 6 flocos de neve rendados exclusivos para pendurar na árvore ou guirlandas.",
    "description": "Conjunto com 6 ornamentos de flocos de neve, cada um com padrão geométrico fractal único inspirado em cristais de gelo naturais. Extremamente leves, duráveis e acompanhados de cordão rústico em fio dourado para pendurar.",
    "story": "Algoritmos generativos baseados na cristalografia natural de Wilson Bentley foram usados para criar 6 variações fractais distintas, impossíveis de reproduzir manualmente.",
    "price": 59.9,
    "originalPrice": 79.9,
    "category": "gifts",
    "categoryLabel": "Enfeites de Árvore",
    "rating": 5,
    "reviewsCount": 64,
    "inStock": true,
    "leadTime": "Fabricação em 24h",
    "featured": true,
    "bestseller": true,
    "newArrival": true,
    "sourceFolder": "04_Flocos_de_Neve_Ornamentos",
    "destFolder": "04_flocos_neve",
    "files": [
      "01_flatlay_conjunto.jpg",
      "02_lifestyle_arvore.jpg",
      "03_macro_textura.jpg"
    ],
    "colors": [
      {
        "name": "Branco Neve Cristalino",
        "hex": "#ffffff"
      },
      {
        "name": "Prata Lunar Metálico",
        "hex": "#94a3b8"
      },
      {
        "name": "Dourado Solar",
        "hex": "#f59e0b"
      }
    ],
    "sizes": [
      "Kit 6 Unidades (8cm cada)"
    ],
    "specs": {
      "material": "PLA de Alta Pureza",
      "layerHeight": "0.12mm",
      "dimensions": "8 x 8 x 0.3 cm cada",
      "weight": "12g por peça (72g total)",
      "infill": "100% Sólido",
      "finish": "Brilho Glacial Suave"
    },
    "highlights": [
      "Conjunto completo com 6 designs geométricos únicos",
      "Acompanha fios metalizados já prontos para pendurar",
      "Ultraleve: não pesa nem entorta os galhos da árvore",
      "Resistente a quedas (ideal para casas com pets e crianças)"
    ],
    "images": [
      "/products/natal/04_flocos_neve/01_flatlay_conjunto.jpg",
      "/products/natal/04_flocos_neve/02_lifestyle_arvore.jpg",
      "/products/natal/04_flocos_neve/03_macro_textura.jpg"
    ]
  },
  {
    "id": "prt-natal-05",
    "slug": "colecao-tags-enfeites-bicolores-natal-3d",
    "name": "Coleção Tags & Enfeites Bicolores de Natal (Sinos & Botas)",
    "tagline": "Enfeites suspensos em dupla camada colorida (vermelho escarlate e branco puro).",
    "description": "Kit com enfeites natalinos bicolores impressos com tecnologia de extrusão dupla sem pintura. Relevos nítidos de sinos natalinos, botas de Papai Noel e estrelas com contraste impecável entre o vermelho vivo e o branco fosco.",
    "story": "Produzido com troca precisa de filamento na camada exata para garantir que a cor nunca desbote, descasque ou rache, permanecendo viva por muitos anos.",
    "price": 49.9,
    "originalPrice": 69.9,
    "category": "gifts",
    "categoryLabel": "Lembranças & Árvore",
    "rating": 4.9,
    "reviewsCount": 41,
    "inStock": true,
    "leadTime": "Pronta Entrega",
    "featured": true,
    "bestseller": false,
    "newArrival": true,
    "sourceFolder": "05_Enfeites_Bicolores_Tags",
    "destFolder": "05_enfeites_bicolores",
    "files": [
      "01_flatlay_catalogo.jpg",
      "02_lifestyle_sino.jpg",
      "03_macro_relevo.jpg"
    ],
    "colors": [
      {
        "name": "Bicolor Vermelho & Branco",
        "hex": "#dc2626"
      },
      {
        "name": "Bicolor Verde & Dourado",
        "hex": "#16a34a"
      }
    ],
    "sizes": [
      "Kit 4 Peças Bicolores (9cm cada)"
    ],
    "specs": {
      "material": "Biopolímero Coextrudado",
      "layerHeight": "0.12mm",
      "dimensions": "9 x 7 x 0.4 cm cada",
      "weight": "18g por peça",
      "infill": "100% Sólido Coextrudado",
      "finish": "Relevo Bicolor Alto Brilho"
    },
    "highlights": [
      "Dupla cor permanente (não é pintado, é plástico fundido)",
      "Serve como ornamento de árvore ou tag de presente luxo",
      "Cordão encerado natalino incluso",
      "Alta nitidez de relevo tátil"
    ],
    "images": [
      "/products/natal/05_enfeites_bicolores/01_flatlay_catalogo.jpg",
      "/products/natal/05_enfeites_bicolores/02_lifestyle_sino.jpg",
      "/products/natal/05_enfeites_bicolores/03_macro_relevo.jpg"
    ]
  }
];

export interface Review {
  id: string;
  author: string;
  role: string;
  comment: string;
  rating: number;
  avatar: string;
}

export const REVIEWS: Review[] = [
  {
    id: 'rev-01',
    author: 'Mariana Duarte',
    role: 'Arquiteta de Interiores (São Paulo/SP)',
    comment: 'O conjunto de velas e renas ficou perfeito na minha mesa de Natal. O acabamento fosco sem nenhuma rebarba é nível joalheria!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'rev-02',
    author: 'Rodrigo Fontes',
    role: 'Designer & Criador de Setup',
    comment: 'O presépio minimalista e os flocos de neve têm uma precisão geométrica absurda. O atendimento e a qualidade de cada acabamento superaram todas as expectativas.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'rev-03',
    author: 'Camila Nogueira',
    role: 'Diretora de Arte',
    comment: 'As tags bicolores são lindas demais para colocar nos presentes da família. A embalagem kraft da SunLab veio impecável.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  }
];
