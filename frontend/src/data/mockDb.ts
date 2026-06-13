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
        "img": "/images/products/carne_molida.png"
      },
      {
        "name": "Bistec de Ganso",
        "sub": "Carnes",
        "unit": "1 Kg",
        "price": 11.5,
        "img": "/images/products/bistec_ganso.png"
      },
      {
        "name": "Costilla de Res",
        "sub": "Carnes",
        "unit": "1 Kg",
        "price": 7.8,
        "img": "/images/products/costilla_res.png"
      },
      {
        "name": "Pechuga de Pollo",
        "sub": "Pollos",
        "unit": "1 Kg",
        "price": 8.45,
        "img": "/images/products/pechuga_pollo.png"
      },
      {
        "name": "Pollo Entero",
        "sub": "Pollos",
        "unit": "1 Kg",
        "price": 4.5,
        "img": "/images/products/pollo_entero.png"
      },
      {
        "name": "Muslos de Pollo",
        "sub": "Pollos",
        "unit": "1 Kg",
        "price": 5.2,
        "img": "/images/products/muslos_pollo.png"
      },
      {
        "name": "Alitas de Pollo",
        "sub": "Pollos",
        "unit": "1 Kg",
        "price": 6.0,
        "img": "/images/products/alitas_pollo.png"
      },
      {
        "name": "Jamon Cocido Plumrose",
        "sub": "Embutidos",
        "unit": "500g",
        "price": 6.5,
        "img": "/images/products/jamon_cocido.png"
      },
      {
        "name": "Queso Amarillo Paisa",
        "sub": "Embutidos",
        "unit": "500g",
        "price": 7.2,
        "img": "/images/products/queso_amarillo.png"
      },
      {
        "name": "Queso Blanco Duro",
        "sub": "Embutidos",
        "unit": "1 Kg",
        "price": 6.8,
        "img": "/images/products/queso_blanco.png"
      },
      {
        "name": "Salchichas Plumrose",
        "sub": "Embutidos",
        "unit": "1 Paquete",
        "price": 4.5,
        "img": "/images/products/salchichas.png"
      },
      {
        "name": "Tocino Ahumado",
        "sub": "Embutidos",
        "unit": "250g",
        "price": 4.8,
        "img": "/images/products/tocino.png"
      },
      {
        "name": "Chorizo Carupanero",
        "sub": "Embutidos",
        "unit": "500g",
        "price": 5.5,
        "img": "/images/products/chorizo.png"
      },
      {
        "name": "Queso Guayanes",
        "sub": "Embutidos",
        "unit": "500g",
        "price": 4.5,
        "img": "/images/products/queso_guayanes.png"
      },
      {
        "name": "Nuggets Congelados",
        "sub": "Pollos",
        "unit": "1 Paquete",
        "price": 5.99,
        "img": "/images/products/nuggets.png"
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
        "img": "/images/products/coca_cola.png"
      },
      {
        "name": "Pepsi Cola",
        "sub": "Refrescos",
        "unit": "2 L",
        "price": 2.2,
        "img": "/images/products/pepsi.png"
      },
      {
        "name": "Chinotto",
        "sub": "Refrescos",
        "unit": "2 L",
        "price": 2.2,
        "img": "/images/products/chinotto.png"
      },
      {
        "name": "Frescolita",
        "sub": "Refrescos",
        "unit": "2 L",
        "price": 2.2,
        "img": "/images/products/frescolita.png"
      },
      {
        "name": "Maltin Polar",
        "sub": "Refrescos",
        "unit": "1.5 L",
        "price": 2.0,
        "img": "/images/products/maltin.png"
      },
      {
        "name": "Arroz Blanco Mary",
        "sub": "Arroz",
        "unit": "1 Kg",
        "price": 1.2,
        "img": "/images/products/arroz_blanco.png"
      },
      {
        "name": "Arroz Primor",
        "sub": "Arroz",
        "unit": "1 Kg",
        "price": 1.3,
        "img": "/images/products/arroz_primor.png"
      },
      {
        "name": "Pasta Capri Espagueti",
        "sub": "Pasta",
        "unit": "1 Kg",
        "price": 1.6,
        "img": "/images/products/pasta_capri.png"
      },
      {
        "name": "Harina PAN",
        "sub": "Arroz",
        "unit": "1 Kg",
        "price": 1.15,
        "img": "/images/products/harina_pan.png"
      },
      {
        "name": "Caraotas Negras Mary",
        "sub": "Enlatados",
        "unit": "500g",
        "price": 1.8,
        "img": "/images/products/caraotas.png"
      },
      {
        "name": "Lentejas",
        "sub": "Enlatados",
        "unit": "500g",
        "price": 2.1,
        "img": "/images/products/lentejas.png"
      },
      {
        "name": "Atun Margarita en Aceite",
        "sub": "Enlatados",
        "unit": "140g",
        "price": 2.5,
        "img": "/images/products/atun_aceite.png"
      },
      {
        "name": "Atun Margarita en Agua",
        "sub": "Enlatados",
        "unit": "140g",
        "price": 2.5,
        "img": "/images/products/atun_agua.png"
      },
      {
        "name": "Maiz Dulce en Lata",
        "sub": "Enlatados",
        "unit": "300g",
        "price": 1.5,
        "img": "/images/products/maiz_lata.png"
      },
      {
        "name": "Aceite de Maiz Mazeite",
        "sub": "Arroz",
        "unit": "1 Litro",
        "price": 3.5,
        "img": "/images/products/aceite_maiz.png"
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
        "img": "/images/products/jabon_protex.png"
      },
      {
        "name": "Desodorante Dove",
        "sub": "Aseo",
        "unit": "50ml",
        "price": 4.2,
        "img": "/images/products/desodorante.png"
      },
      {
        "name": "Crema Dental Colgate",
        "sub": "Aseo",
        "unit": "100g",
        "price": 2.8,
        "img": "/images/products/crema_dental.png"
      },
      {
        "name": "Shampoo Pantene",
        "sub": "Aseo",
        "unit": "400ml",
        "price": 6.5,
        "img": "/images/products/shampoo.png"
      },
      {
        "name": "Papel Higienico Scott",
        "sub": "Aseo",
        "unit": "4 Rollos",
        "price": 3.8,
        "img": "/images/products/papel_higienico.png"
      },
      {
        "name": "Toallas Sanitarias Always",
        "sub": "Aseo",
        "unit": "10 Unidades",
        "price": 2.9,
        "img": "/images/products/toallas_sanitarias.png"
      },
      {
        "name": "Maquina de Afeitar Gillette",
        "sub": "Aseo",
        "unit": "2 Unidades",
        "price": 3.0,
        "img": "/images/products/maquina_afeitar.png"
      },
      {
        "name": "Crema Corporal Lubriderm",
        "sub": "Aseo",
        "unit": "400ml",
        "price": 8.5,
        "img": "/images/products/crema_corporal.png"
      },
      {
        "name": "Algodon en Motas",
        "sub": "Farmacia",
        "unit": "100g",
        "price": 1.5,
        "img": "/images/products/algodon.png"
      },
      {
        "name": "Hisopos Q-Tips",
        "sub": "Farmacia",
        "unit": "100 Unidades",
        "price": 1.8,
        "img": "/images/products/hisopos.png"
      },
      {
        "name": "Alcohol Isopropilico",
        "sub": "Farmacia",
        "unit": "250ml",
        "price": 2.2,
        "img": "/images/products/alcohol.png"
      },
      {
        "name": "Agua Oxigenada",
        "sub": "Farmacia",
        "unit": "100ml",
        "price": 1.0,
        "img": "/images/products/agua_oxigenada.png"
      },
      {
        "name": "Curitas Band-Aid",
        "sub": "Farmacia",
        "unit": "Caja",
        "price": 3.0,
        "img": "/images/products/curitas.png"
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
        "img": "/images/products/detergente_liquido.png"
      },
      {
        "name": "Detergente en Polvo ACE",
        "sub": "Detergentes",
        "unit": "1 Kg",
        "price": 4.5,
        "img": "/images/products/detergente_polvo.png"
      },
      {
        "name": "Suavizante Suavitel",
        "sub": "Detergentes",
        "unit": "1 L",
        "price": 3.8,
        "img": "/images/products/suavizante.png"
      },
      {
        "name": "Lavaplatos Liquido Las Llaves",
        "sub": "Detergentes",
        "unit": "500ml",
        "price": 2.5,
        "img": "/images/products/lavaplatos_liquido.png"
      },
      {
        "name": "Lavaplatos en Crema Axion",
        "sub": "Detergentes",
        "unit": "250g",
        "price": 1.8,
        "img": "/images/products/lavaplatos_crema.png"
      },
      {
        "name": "Cloro Nevex",
        "sub": "Detergentes",
        "unit": "1 L",
        "price": 1.5,
        "img": "/images/products/cloro.png"
      },
      {
        "name": "Desinfectante Mistolin",
        "sub": "Detergentes",
        "unit": "1 L",
        "price": 2.2,
        "img": "/images/products/desinfectante.png"
      },
      {
        "name": "Esponja Scotch-Brite",
        "sub": "Accesorios",
        "unit": "3 Unidades",
        "price": 3.5,
        "img": "/images/products/esponja.png"
      },
      {
        "name": "Mopa de Algodon",
        "sub": "Accesorios",
        "unit": "1 Unidad",
        "price": 5.0,
        "img": "/images/products/mopa.png"
      },
      {
        "name": "Escoba con Mango",
        "sub": "Accesorios",
        "unit": "1 Unidad",
        "price": 4.5,
        "img": "/images/products/escoba.png"
      },
      {
        "name": "Coleto Tradicional",
        "sub": "Accesorios",
        "unit": "1 Unidad",
        "price": 2.0,
        "img": "/images/products/coleto.png"
      },
      {
        "name": "Bolsas de Basura Grandes",
        "sub": "Accesorios",
        "unit": "10 Unidades",
        "price": 3.2,
        "img": "/images/products/bolsas_basura.png"
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
        "img": "/images/products/cerveza_pilsen.png"
      },
      {
        "name": "Cerveza Polar Light",
        "sub": "Cervezas",
        "unit": "Caja 36",
        "price": 25.0,
        "img": "/images/products/cerveza_light.png"
      },
      {
        "name": "Cerveza Solera Verde",
        "sub": "Cervezas",
        "unit": "6 Pack",
        "price": 6.5,
        "img": "/images/products/cerveza_solera.png"
      },
      {
        "name": "Cerveza Zulia",
        "sub": "Cervezas",
        "unit": "6 Pack",
        "price": 6.0,
        "img": "/images/products/cerveza_zulia.png"
      },
      {
        "name": "Ron Santa Teresa Linaje",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 18.0,
        "img": "/images/products/ron_teresa.png"
      },
      {
        "name": "Ron Cacique Anejo",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 12.0,
        "img": "/images/products/ron_cacique.png"
      },
      {
        "name": "Ron Pampero Aniversario",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 22.0,
        "img": "/images/products/ron_pampero.png"
      },
      {
        "name": "Ron Diplomatico Reserva Exclusiva",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 35.0,
        "img": "/images/products/ron_diplomatico.png"
      },
      {
        "name": "Whisky Buchanan's 12 Anos",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 42.0,
        "img": "/images/products/whisky_buchanans.png"
      },
      {
        "name": "Whisky Old Parr 12 Anos",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 38.0,
        "img": "/images/products/whisky_parr.png"
      },
      {
        "name": "Vodka Gordon's",
        "sub": "Destilados",
        "unit": "750ml",
        "price": 10.0,
        "img": "/images/products/vodka.png"
      },
      {
        "name": "Vino Tinto Casillero del Diablo",
        "sub": "Vinos",
        "unit": "750ml",
        "price": 12.5,
        "img": "/images/products/vino_tinto.png"
      },
      {
        "name": "Vino Blanco Santa Helena",
        "sub": "Vinos",
        "unit": "750ml",
        "price": 8.5,
        "img": "/images/products/vino_blanco.png"
      }
    ]
  }
];

let globalId = 1;
for (const cat of rawData) {
  for (const p of cat.products) {
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
