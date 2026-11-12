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
    "description": "Composição de decoração natalina exclusiva e elegante. Apresenta base integrada para velas tealight (LED ou tradicional), silhueta estilizada de renas e pinheiro com belas texturas facetadas. Ideal para ceias de Natal, aparadores e mesas de centro.",
    "story": "Projetado com todo carinho para criar uma iluminação aconchegante e contemporânea no seu fim de ano.",
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
    "colors": [],
    "sizes": [],
    "specs": {
      "material": "Material Premium de Alta Qualidade",
      "layerHeight": "Alta Definição",
      "dimensions": "24 x 12 x 16 cm",
      "weight": "210g",
      "infill": "Estrutura Reforçada",
      "finish": "Fosco Mate Aveludado"
    },
    "highlights": [
      "Acomoda velas tealight padrão de até 40mm",
      "Toque suave e acabamento refinado",
      "Material de alta qualidade e resistência",
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
    "name": "Presépio Sagrada Família Minimalista",
    "tagline": "Composição escultural da Sagrada Família com geometria suave e acabamento refinado.",
    "description": "Presépio contemporâneo com figuras estilizadas de Maria, José, o Menino Jesus e a estrela guia. As linhas minimalistas valorizam a serenidade da cena, proporcionando um toque de arte sofisticada para a decoração da sua casa no fim de ano.",
    "story": "Uma reinterpretação artística das clássicas representações da Sagrada Família, com formas harmoniosas para enriquecer a sua decoração natalina.",
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
    "colors": [],
    "sizes": [],
    "specs": {
      "material": "Material Nobre com Toque Acetinado",
      "layerHeight": "Alta Definição",
      "dimensions": "28 x 14 x 18 cm",
      "weight": "340g",
      "infill": "Estrutura Sólida",
      "finish": "Toque Cerâmico Fosco Suave"
    },
    "highlights": [
      "Toque sedoso com acabamento acetinado",
      "Estabilidade balanceada com base estável",
      "Alta durabilidade e resistência",
      "Peça atemporal para colecionar e decorar"
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
    "tagline": "Árvore de Natal escultural com lettering vazado Feliz Natal e base de apoio.",
    "description": "Árvore decorativa de mesa com tipografia integrada Feliz Natal. Fácil de montar e desmontar, possui base estável e detalhes elegantes que valorizam a luz ambiente.",
    "story": "Desenvolvido para compor escritórios, setups, mesas de jantar e recepções corporativas que buscam elegância festiva.",
    "price": 74.9,
    "originalPrice": 99.9,
    "category": "decor",
    "categoryLabel": "Decoração Natalina",
    "rating": 4.9,
    "reviewsCount": 29,
    "inStock": true,
    "leadTime": "Pronta Entrega",
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
    "colors": [],
    "sizes": [],
    "specs": {
      "material": "Polímero Premium de Alta Durabilidade",
      "layerHeight": "Alta Definição",
      "dimensions": "20 x 14 x 6 cm",
      "weight": "160g",
      "infill": "Estrutura Firme",
      "finish": "Fosco Satin"
    },
    "highlights": [
      "Design autoral modular com montagem em 2 passos",
      "Encaixe firme sem necessidade de cola",
      "Perfeito para setups e mesas de escritório",
      "Acompanha base oficial SunLab"
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
    "name": "Kit 6 Enfeites Flocos de Neve Exclusivos",
    "tagline": "Coleção com 6 flocos de neve rendados exclusivos para pendurar na árvore ou guirlandas.",
    "description": "Conjunto com 6 ornamentos de flocos de neve, cada um com padrão geométrico único inspirado em cristais de gelo naturais. Extremamente leves, duráveis e acompanhados de cordão rústico em fio dourado para pendurar.",
    "story": "Coleção delicada inspirada na beleza única dos cristais de gelo para decorar sua árvore com sofisticação.",
    "price": 59.9,
    "originalPrice": 79.9,
    "category": "gifts",
    "categoryLabel": "Enfeites de Árvore",
    "rating": 5,
    "reviewsCount": 64,
    "inStock": true,
    "leadTime": "Pronta Entrega",
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
    "colors": [],
    "sizes": [],
    "specs": {
      "material": "Material Leve de Alta Durabilidade",
      "layerHeight": "Alta Definição",
      "dimensions": "8 x 8 x 0.3 cm cada",
      "weight": "12g por peça (72g total)",
      "infill": "Estrutura Sólida",
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
    "tagline": "Enfeites suspensos em dupla cor permanente (vermelho escarlate e branco puro).",
    "description": "Kit com enfeites natalinos bicolores exclusivos. Relevos nítidos de sinos natalinos, botas de Papai Noel e estrelas com contraste marcante entre o vermelho vivo e o branco fosco.",
    "story": "Cores vivas e permanentes que não desbotam nem descascam, permanecendo lindas por muitas festas.",
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
    "colors": [],
    "sizes": [],
    "specs": {
      "material": "Polímero Bicolor de Alta Qualidade",
      "layerHeight": "Alta Definição",
      "dimensions": "9 x 7 x 0.4 cm cada",
      "weight": "18g por peça",
      "infill": "Estrutura Sólida",
      "finish": "Relevo Bicolor de Alto Contraste"
    },
    "highlights": [
      "Cores permanentes e duradouras",
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
