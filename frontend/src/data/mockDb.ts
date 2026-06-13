export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  image: string;
  labels?: string[]; // e.g. "Oferta", "Nuevo"
  unit?: string;     // e.g. "1 Kg", "500g"
  stock?: number;
  warehouseStock?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { id: 'frutas-vegetales', name: 'Frutas y Vegetales', icon: '🍎', color: 'bg-red-100 text-red-600' },
  { id: 'refrigerados-congelados', name: 'Refrigerados', icon: '❄️', color: 'bg-blue-100 text-blue-600' },
  { id: 'viveres', name: 'Víveres', icon: '🥫', color: 'bg-orange-100 text-orange-600' },
  { id: 'cuidado-personal-salud', name: 'Cuidado Personal', icon: '🧴', color: 'bg-teal-100 text-teal-600' },
  { id: 'limpieza', name: 'Limpieza', icon: '🧽', color: 'bg-cyan-100 text-cyan-600' },
  { id: 'licores', name: 'Licores', icon: '🍷', color: 'bg-purple-100 text-purple-600' },
];

export const allProducts: Product[] = [];

// Seed the products list from Python data
const rawData = [
  {
    "id": "frutas-vegetales",
    "subcategories": [
      "Enteras",
      "Picadas",
      "Jugos",
      "Frescos",
      "Empacados"
    ],
    "products": [
      {
        "name": "Tomates Perita",
        "sub": "Frescos",
        "unit": "1 Kg",
        "price": 3.49,
        "img": "/images/products/tomates_perita.png"
      },
      {
        "name": "Cebolla Blanca",
        "sub": "Frescos",
        "unit": "1 Kg",
        "price": 2.1,
        "img": "/images/products/cebolla_blanca.png"
      },
      {
        "name": "Papa Lavada",
        "sub": "Frescos",
        "unit": "1 Kg",
        "price": 1.8,
        "img": "/images/products/papa_lavada.png"
      },
      {
        "name": "Zanahoria",
        "sub": "Frescos",
        "unit": "1 Kg",
        "price": 1.5,
        "img": "/images/products/zanahoria.png"
      },
      {
        "name": "Pimenton Verde",
        "sub": "Frescos",
        "unit": "1 Kg",
        "price": 4.2,
        "img": "/images/products/pimenton_verde.png"
      },
      {
        "name": "Lechuga Romana",
        "sub": "Frescos",
        "unit": "1 Unidad",
        "price": 1.2,
        "img": "/images/products/lechuga_romana.png"
      },
      {
        "name": "Platano Maduro",
        "sub": "Enteras",
        "unit": "1 Kg",
        "price": 1.9,
        "img": "/images/products/platano_maduro.png"
      },
      {
        "name": "Cambur",
        "sub": "Enteras",
        "unit": "1 Kg",
        "price": 1.1,
        "img": "/images/products/cambur.png"
      },
      {
        "name": "Manzana Gala",
        "sub": "Enteras",
        "unit": "1 Kg",
        "price": 5.5,
        "img": "/images/products/manzana_gala.png"
      },
      {
        "name": "Naranja para Jugo",
        "sub": "Enteras",
        "unit": "1 Kg",
        "price": 1.6,
        "img": "/images/products/naranja.png"
      },
      {
        "name": "Lechosa",
        "sub": "Enteras",
        "unit": "1 Kg",
        "price": 1.75,
        "img": "/images/products/lechosa.png"
      },
      {
        "name": "Limones",
        "sub": "Frescos",
        "unit": "1 Kg",
        "price": 4.19,
        "img": "/images/products/limones.png"
      },
      {
        "name": "Pina",
        "sub": "Enteras",
        "unit": "1 Unidad",
        "price": 2.55,
        "img": "/images/products/pina.png"
      },
      {
        "name": "Aguacate",
        "sub": "Frescos",
        "unit": "1 Kg",
        "price": 5.2,
        "img": "/images/products/aguacate.png"
      },
      {
        "name": "Frutas Picadas Mixtas",
        "sub": "Picadas",
        "unit": "500g",
        "price": 3.0,
        "img": "/images/products/frutas_picadas.png"
      }
    ]
  },
  {
    "id": "refrigerados-congelados",
    "subcategories": [
      "Carnes",
      "Pollos",
      "Embutidos"
    ],
    "products": [
      {
        "name": "Carne Molida SV",
        "sub": "Carnes",
        "unit": "1 Kg",
        "price": 9.95,
        "img": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400"
      },
      {
        "name": "Bistec de Ganso",
        "sub": "Carnes",
        "unit": "1 Kg",
        "price": 11.5,
        "img": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400"
      },
      {
        "name": "Costilla de Res",
        "sub": "Carnes",
        "unit": "1 Kg",
        "price": 7.8,
        "img": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400"
      },
      {
        "name": "Pechuga de Pollo",
        "sub": "Pollos",
        "unit": "1 Kg",
        "price": 8.45,
        "img": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400"
      },
      {
        "name": "Pollo Entero",
        "sub": "Pollos",
        "unit": "1 Kg",
        "price": 4.5,
        "img": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400"
      },
      {
        "name": "Muslos de Pollo",
        "sub": "Pollos",
        "unit": "1 Kg",
        "price": 5.2,
        "img": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400"
      },
      {
        "name": "Alitas de Pollo",
        "sub": "Pollos",
        "unit": "1 Kg",
        "price": 6.0,
        "img": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400"
      },
      {
        "name": "Jamon Cocido Plumrose",
        "sub": "Embutidos",
        "unit": "500g",
        "price": 6.5,
        "img": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400"
      },
      {
        "name": "Queso Amarillo Paisa",
        "sub": "Embutidos",
        "unit": "500g",
        "price": 7.2,
        "img": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400"
      },
      {
        "name": "Queso Blanco Duro",
        "sub": "Embutidos",
        "unit": "1 Kg",
        "price": 6.8,
        "img": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400"
      },
      {
        "name": "Salchichas Plumrose",
        "sub": "Embutidos",
        "unit": "1 Paquete",
        "price": 4.5,
        "img": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400"
      },
      {
        "name": "Tocino Ahumado",
        "sub": "Embutidos",
        "unit": "250g",
        "price": 4.8,
        "img": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400"
      },
      {
        "name": "Chorizo Carupanero",
        "sub": "Embutidos",
        "unit": "500g",
        "price": 5.5,
        "img": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400"
      },
      {
        "name": "Queso Guayanes",
        "sub": "Embutidos",
        "unit": "500g",
        "price": 4.5,
        "img": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400"
      },
      {
        "name": "Nuggets Congelados",
        "sub": "Pollos",
        "unit": "1 Paquete",
        "price": 5.99,
        "img": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400"
      }
    ]
  },
  {
    "id": "viveres",
    "subcategories": [
      "Arroz",
      "Pasta",
      "Enlatados",
      "Refrescos"
    ],
    "products": [
      {
        "name": "Coca Cola Original",
        "sub": "Refrescos",
        "unit": "2 L",
        "price": 2.5,
        "img": "https://images.unsplash.com/photo-1622483767028-fd16712341cb?w=400"
      },
      {
        "name": "Pepsi Cola",
        "sub": "Refrescos",
        "unit": "2 L",
        "price": 2.2,
        "img": "https://images.unsplash.com/photo-1629203851288-7ece11431c8e?w=400"
      },
      {
        "name": "Chinotto",
        "sub": "Refrescos",
        "unit": "2 L",
        "price": 2.2,
        "img": "https://images.unsplash.com/photo-1622483767028-fd16712341cb?w=400"
      },
      {
        "name": "Frescolita",
        "sub": "Refrescos",
        "unit": "2 L",
        "price": 2.2,
        "img": "https://images.unsplash.com/photo-1622483767028-fd16712341cb?w=400"
      },
      {
        "name": "Maltin Polar",
        "sub": "Refrescos",
        "unit": "1.5 L",
        "price": 2.0,
        "img": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400"
      },
      {
        "name": "Arroz Blanco Mary",
        "sub": "Arroz",
        "unit": "1 Kg",
        "price": 1.2,
        "img": "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400"
      },
      {
        "name": "Arroz Primor",
        "sub": "Arroz",
        "unit": "1 Kg",
        "price": 1.3,
        "img": "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400"
      },
      {
        "name": "Pasta Capri Espagueti",
        "sub": "Pasta",
        "unit": "1 Kg",
        "price": 1.6,
        "img": "https://images.unsplash.com/photo-1612965607446-25e1332775ae?w=400"
      },
      {
        "name": "Harina PAN",
        "sub": "Arroz",
        "unit": "1 Kg",
        "price": 1.15,
        "img": "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400"
      },
      {
        "name": "Caraotas Negras Mary",
        "sub": "Enlatados",
        "unit": "500g",
        "price": 1.8,
        "img": "https://images.unsplash.com/photo-1599813188597-900f6b3dbf15?w=400"
      },
      {
        "name": "Lentejas",
        "sub": "Enlatados",
        "unit": "500g",
        "price": 2.1,
        "img": "https://images.unsplash.com/photo-1599813188597-900f6b3dbf15?w=400"
      },
      {
        "name": "Atun Margarita en Aceite",
        "sub": "Enlatados",
        "unit": "140g",
        "price": 2.5,
        "img": "https://images.unsplash.com/photo-1599813188597-900f6b3dbf15?w=400"
      },
      {
        "name": "Atun Margarita en Agua",
        "sub": "Enlatados",
        "unit": "140g",
        "price": 2.5,
        "img": "https://images.unsplash.com/photo-1599813188597-900f6b3dbf15?w=400"
      },
      {
        "name": "Maiz Dulce en Lata",
        "sub": "Enlatados",
        "unit": "300g",
        "price": 1.5,
        "img": "https://images.unsplash.com/photo-1599813188597-900f6b3dbf15?w=400"
      },
      {
        "name": "Aceite de Maiz Mazeite",
        "sub": "Arroz",
        "unit": "1 Litro",
        "price": 3.5,
        "img": "https://images.unsplash.com/photo-1474979266404-7eaacba8a6ed?w=400"
      }
    ]
  },
  {
    "id": "cuidado-personal-salud",
    "subcategories": [
      "Aseo",
      "Farmacia"
    ],
    "products": [
      {
        "name": "Jabon Protex",
        "sub": "Aseo",
        "unit": "3 Unidades",
        "price": 3.5,
        "img": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400"
      },
      {
        "name": "Desodorante Dove",
        "sub": "Aseo",
        "unit": "50ml",
        "price": 4.2,
        "img": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400"
      },
      {
        "name": "Crema Dental Colgate",
        "sub": "Aseo",
        "unit": "100g",
        "price": 2.8,
        "img": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400"
      },
      {
        "name": "Shampoo Pantene",
        "sub": "Aseo",
        "unit": "400ml",
        "price": 6.5,
        "img": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400"
      },
      {
        "name": "Papel Higienico Scott",
        "sub": "Aseo",
        "unit": "4 Rollos",
        "price": 3.8,
        "img": "https://images.unsplash.com/photo-1584308666744-24d5e4a77918?w=400"
      },
      {
        "name": "Toallas Sanitarias Always",
        "sub": "Aseo",
        "unit": "10 Unidades",
        "price": 2.9,
        "img": "https://images.unsplash.com/photo-1584308666744-24d5e4a77918?w=400"
      },
      {
        "name": "Maquina de Afeitar Gillette",
        "sub": "Aseo",
        "unit": "2 Unidades",
        "price": 3.0,
        "img": "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=400"
      },
      {
        "name": "Crema Corporal Lubriderm",
        "sub": "Aseo",
        "unit": "400ml",
        "price": 8.5,
        "img": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400"
      },
      {
        "name": "Algodon en Motas",
        "sub": "Farmacia",
        "unit": "100g",
        "price": 1.5,
        "img": "https://images.unsplash.com/photo-1584308666744-24d5e4a77918?w=400"
      },
      {
        "name": "Hisopos Q-Tips",
        "sub": "Farmacia",
        "unit": "100 Unidades",
        "price": 1.8,
        "img": "https://images.unsplash.com/photo-1584308666744-24d5e4a77918?w=400"
      },
      {
        "name": "Alcohol Isopropilico",
        "sub": "Farmacia",
        "unit": "250ml",
        "price": 2.2,
        "img": "https://images.unsplash.com/photo-1584308666744-24d5e4a77918?w=400"
      },
      {
        "name": "Agua Oxigenada",
        "sub": "Farmacia",
        "unit": "100ml",
        "price": 1.0,
        "img": "https://images.unsplash.com/photo-1584308666744-24d5e4a77918?w=400"
      },
      {
        "name": "Curitas Band-Aid",
        "sub": "Farmacia",
        "unit": "Caja",
        "price": 3.0,
        "img": "https://images.unsplash.com/photo-1584308666744-24d5e4a77918?w=400"
      }
    ]
  },
  {
    "id": "limpieza",
    "subcategories": [
      "Detergentes",
      "Accesorios"
    ],
    "products": [
      {
        "name": "Detergente Liquido Ariel",
        "sub": "Detergentes",
        "unit": "2 L",
        "price": 8.5,
        "img": "https://images.unsplash.com/photo-1585834057864-15f5cc1145ea?w=400"
      },
      {
        "name": "Detergente en Polvo ACE",
        "sub": "Detergentes",
        "unit": "1 Kg",
        "price": 4.5,
        "img": "https://images.unsplash.com/photo-1585834057864-15f5cc1145ea?w=400"
      },
      {
        "name": "Suavizante Suavitel",
        "sub": "Detergentes",
        "unit": "1 L",
        "price": 3.8,
        "img": "https://images.unsplash.com/photo-1585834057864-15f5cc1145ea?w=400"
      },
      {
        "name": "Lavaplatos Liquido Las Llaves",
        "sub": "Detergentes",
        "unit": "500ml",
        "price": 2.5,
        "img": "https://images.unsplash.com/photo-1585834057864-15f5cc1145ea?w=400"
      },
      {
        "name": "Lavaplatos en Crema Axion",
        "sub": "Detergentes",
        "unit": "250g",
        "price": 1.8,
        "img": "https://images.unsplash.com/photo-1585834057864-15f5cc1145ea?w=400"
      },
      {
        "name": "Cloro Nevex",
        "sub": "Detergentes",
        "unit": "1 L",
        "price": 1.5,
        "img": "https://images.unsplash.com/photo-1585834057864-15f5cc1145ea?w=400"
      },
      {
        "name": "Desinfectante Mistolin",
        "sub": "Detergentes",
        "unit": "1 L",
        "price": 2.2,
        "img": "https://images.unsplash.com/photo-1585834057864-15f5cc1145ea?w=400"
      },
      {
        "name": "Esponja Scotch-Brite",
        "sub": "Accesorios",
        "unit": "3 Unidades",
        "price": 3.5,
        "img": "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=400"
      },
      {
        "name": "Mopa de Algodon",
        "sub": "Accesorios",
        "unit": "1 Unidad",
        "price": 5.0,
        "img": "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=400"
      },
      {
        "name": "Escoba con Mango",
        "sub": "Accesorios",
        "unit": "1 Unidad",
        "price": 4.5,
        "img": "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=400"
      },
      {
        "name": "Coleto Tradicional",
        "sub": "Accesorios",
        "unit": "1 Unidad",
        "price": 2.0,
        "img": "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=400"
      },
      {
        "name": "Bolsas de Basura Grandes",
        "sub": "Accesorios",
        "unit": "10 Unidades",
        "price": 3.2,
        "img": "https://images.unsplash.com/photo-1584308666744-24d5e4a77918?w=400"
      }
    ]
  },
  {
    "id": "licores",
    "subcategories": [
      "Vinos",
      "Cervezas",
      "Destilados"
    ],
    "products": [
      {
        "name": "Cerveza Polar Pilsen",
        "sub": "Cervezas",
        "unit": "Caja 36",
        "price": 25.0,
        "img": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400"
      },
      {
        "name": "Cerveza Polar Light",
        "sub": "Cervezas",
        "unit": "Caja 36",
        "price": 25.0,
        "img": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400"
      },
      {
        "name": "Cerveza Solera Verde",
        "sub": "Cervezas",
        "unit": "6 Pack",
        "price": 6.5,
        "img": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400"
      },
      {
        "name": "Cerveza Zulia",
        "sub": "Cervezas",
        "unit": "6 Pack",
        "price": 6.0,
        "img": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400"
      },
      {
        "name": "Ron Santa Teresa Linaje",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 18.0,
        "img": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"
      },
      {
        "name": "Ron Cacique Anejo",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 12.0,
        "img": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"
      },
      {
        "name": "Ron Pampero Aniversario",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 22.0,
        "img": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"
      },
      {
        "name": "Ron Diplomatico Reserva Exclusiva",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 35.0,
        "img": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"
      },
      {
        "name": "Whisky Buchanan's 12 Anos",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 42.0,
        "img": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"
      },
      {
        "name": "Whisky Old Parr 12 Anos",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 38.0,
        "img": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"
      },
      {
        "name": "Vodka Gordon's",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 10.0,
        "img": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"
      },
      {
        "name": "Vino Tinto Casillero del Diablo",
        "sub": "Vinos",
        "unit": "750ml",
        "price": 12.5,
        "img": "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=400"
      },
      {
        "name": "Vino Blanco Santa Helena",
        "sub": "Vinos",
        "unit": "750ml",
        "price": 8.5,
        "img": "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=400"
      }
    ]
  }
];

let globalId = 1;
for (const cat of rawData) {
  for (const p of cat.products) {
    // Random labels
    const r = Math.random();
    let labels: string[] | undefined = undefined;
    if (r > 0.9) labels = ['Nuevo'];
    else if (r > 0.8) labels = ['Oferta'];

    allProducts.push({
      id: 'p' + globalId,
      name: p.name,
      price: p.price,
      category: cat.id,
      subcategory: p.sub,
      image: p.img,
      unit: p.unit,
      labels: labels,
      stock: Math.floor(Math.random() * 90) + 10,
      warehouseStock: Math.floor(Math.random() * 450) + 50
    });
    globalId++;
  }
}
