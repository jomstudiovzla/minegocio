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
  subcategories?: string[];
}

export const categories: Category[] = [
  {
    "id": "frutas-vegetales",
    "name": "Frutas y Vegetales",
    "icon": "🍎",
    "color": "bg-red-100 text-red-600",
    "subcategories": [
      "Frescos",
      "Enteras",
      "Picadas"
    ]
  },
  {
    "id": "refrigerados-congelados",
    "name": "Refrigerados",
    "icon": "❄️",
    "color": "bg-blue-100 text-blue-600",
    "subcategories": [
      "Carnes",
      "Pollos",
      "Embutidos"
    ]
  },
  {
    "id": "viveres",
    "name": "Víveres",
    "icon": "🥫",
    "color": "bg-orange-100 text-orange-600",
    "subcategories": [
      "Refrescos",
      "Arroz",
      "Pasta",
      "Enlatados"
    ]
  },
  {
    "id": "cuidado-personal-salud",
    "name": "Cuidado Personal",
    "icon": "🧴",
    "color": "bg-teal-100 text-teal-600",
    "subcategories": [
      "Aseo",
      "Farmacia"
    ]
  },
  {
    "id": "limpieza",
    "name": "Limpieza",
    "icon": "🧽",
    "color": "bg-cyan-100 text-cyan-600",
    "subcategories": [
      "Detergentes",
      "Accesorios"
    ]
  },
  {
    "id": "licores",
    "name": "Licores",
    "icon": "🍷",
    "color": "bg-purple-100 text-purple-600",
    "subcategories": [
      "Cervezas",
      "Destilados",
      "Vinos"
    ]
  }
];

export const products: Product[] = [
  {
    "id": "p1",
    "name": "Tomates Perita",
    "price": 3.49,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/tomates_perita.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 49,
    "warehouseStock": 206
  },
  {
    "id": "p2",
    "name": "Cebolla Blanca",
    "price": 2.1,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/cebolla_blanca.png",
    "unit": "1 Kg",
    "labels": [
      "Oferta"
    ],
    "stock": 22,
    "warehouseStock": 454
  },
  {
    "id": "p3",
    "name": "Papa Lavada",
    "price": 1.8,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/papa_lavada.png",
    "unit": "1 Kg",
    "labels": [
      "Nuevo"
    ],
    "stock": 26,
    "warehouseStock": 350
  },
  {
    "id": "p4",
    "name": "Zanahoria",
    "price": 1.5,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/zanahoria.png",
    "unit": "1 Kg",
    "labels": [
      "Oferta"
    ],
    "stock": 56,
    "warehouseStock": 458
  },
  {
    "id": "p5",
    "name": "Pimenton Verde",
    "price": 4.2,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/pimenton_verde.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 78,
    "warehouseStock": 357
  },
  {
    "id": "p6",
    "name": "Lechuga Romana",
    "price": 1.2,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/lechuga_romana.png",
    "unit": "1 Unidad",
    "labels": [],
    "stock": 16,
    "warehouseStock": 306
  },
  {
    "id": "p7",
    "name": "Platano Maduro",
    "price": 1.9,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/platano_maduro.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 87,
    "warehouseStock": 189
  },
  {
    "id": "p8",
    "name": "Cambur",
    "price": 1.1,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/cambur.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 98,
    "warehouseStock": 498
  },
  {
    "id": "p9",
    "name": "Manzana Gala",
    "price": 5.5,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/manzana_gala.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 23,
    "warehouseStock": 284
  },
  {
    "id": "p10",
    "name": "Naranja para Jugo",
    "price": 1.6,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/naranja.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 45,
    "warehouseStock": 73
  },
  {
    "id": "p11",
    "name": "Lechosa",
    "price": 1.75,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/lechosa.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 31,
    "warehouseStock": 352
  },
  {
    "id": "p12",
    "name": "Limones",
    "price": 4.19,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/limones.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 45,
    "warehouseStock": 72
  },
  {
    "id": "p13",
    "name": "Pina",
    "price": 2.55,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/pina.png",
    "unit": "1 Unidad",
    "labels": [],
    "stock": 67,
    "warehouseStock": 128
  },
  {
    "id": "p14",
    "name": "Aguacate",
    "price": 5.2,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/aguacate.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 36,
    "warehouseStock": 410
  },
  {
    "id": "p15",
    "name": "Frutas Picadas Mixtas",
    "price": 3.0,
    "category": "frutas-vegetales",
    "subcategory": "Picadas",
    "image": "/Ananas/images/products/frutas_picadas.png",
    "unit": "500g",
    "labels": [],
    "stock": 62,
    "warehouseStock": 490
  },
  {
    "id": "p16",
    "name": "Carne Molida SV",
    "price": 9.95,
    "category": "refrigerados-congelados",
    "subcategory": "Carnes",
    "image": "/Ananas/images/products/carne_molida.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 85,
    "warehouseStock": 403
  },
  {
    "id": "p17",
    "name": "Bistec de Ganso",
    "price": 11.5,
    "category": "refrigerados-congelados",
    "subcategory": "Carnes",
    "image": "/Ananas/images/products/bistec_ganso.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 34,
    "warehouseStock": 120
  },
  {
    "id": "p18",
    "name": "Costilla de Res",
    "price": 7.8,
    "category": "refrigerados-congelados",
    "subcategory": "Carnes",
    "image": "/Ananas/images/products/costilla_res.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 86,
    "warehouseStock": 136
  },
  {
    "id": "p19",
    "name": "Pechuga de Pollo",
    "price": 8.45,
    "category": "refrigerados-congelados",
    "subcategory": "Pollos",
    "image": "/Ananas/images/products/pechuga_pollo.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 67,
    "warehouseStock": 71
  },
  {
    "id": "p20",
    "name": "Pollo Entero",
    "price": 4.5,
    "category": "refrigerados-congelados",
    "subcategory": "Pollos",
    "image": "/Ananas/images/products/pollo_entero.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 29,
    "warehouseStock": 496
  },
  {
    "id": "p21",
    "name": "Muslos de Pollo",
    "price": 5.2,
    "category": "refrigerados-congelados",
    "subcategory": "Pollos",
    "image": "/Ananas/images/products/muslos_pollo.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 41,
    "warehouseStock": 465
  },
  {
    "id": "p22",
    "name": "Alitas de Pollo",
    "price": 6.0,
    "category": "refrigerados-congelados",
    "subcategory": "Pollos",
    "image": "/Ananas/images/products/alitas_pollo.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 71,
    "warehouseStock": 287
  },
  {
    "id": "p23",
    "name": "Jamon Cocido Plumrose",
    "price": 6.5,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/jamon_cocido.png",
    "unit": "500g",
    "labels": [],
    "stock": 71,
    "warehouseStock": 265
  },
  {
    "id": "p24",
    "name": "Queso Amarillo Paisa",
    "price": 7.2,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/queso_amarillo.png",
    "unit": "500g",
    "labels": [
      "Oferta"
    ],
    "stock": 98,
    "warehouseStock": 442
  },
  {
    "id": "p25",
    "name": "Queso Blanco Duro",
    "price": 6.8,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/queso_blanco.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 15,
    "warehouseStock": 401
  },
  {
    "id": "p26",
    "name": "Salchichas Plumrose",
    "price": 4.5,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/salchichas.png",
    "unit": "1 Paquete",
    "labels": [],
    "stock": 27,
    "warehouseStock": 82
  },
  {
    "id": "p27",
    "name": "Tocino Ahumado",
    "price": 4.8,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/tocino.png",
    "unit": "250g",
    "labels": [
      "Oferta"
    ],
    "stock": 15,
    "warehouseStock": 387
  },
  {
    "id": "p28",
    "name": "Chorizo Carupanero",
    "price": 5.5,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/chorizo.png",
    "unit": "500g",
    "labels": [],
    "stock": 31,
    "warehouseStock": 434
  },
  {
    "id": "p29",
    "name": "Queso Guayanes",
    "price": 4.5,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/queso_guayanes.png",
    "unit": "500g",
    "labels": [],
    "stock": 63,
    "warehouseStock": 355
  },
  {
    "id": "p30",
    "name": "Nuggets Congelados",
    "price": 5.99,
    "category": "refrigerados-congelados",
    "subcategory": "Pollos",
    "image": "/Ananas/images/products/nuggets.png",
    "unit": "1 Paquete",
    "labels": [],
    "stock": 55,
    "warehouseStock": 215
  },
  {
    "id": "p31",
    "name": "Coca Cola Original",
    "price": 2.5,
    "category": "viveres",
    "subcategory": "Refrescos",
    "image": "/Ananas/images/products/coca_cola.png",
    "unit": "2 L",
    "labels": [],
    "stock": 16,
    "warehouseStock": 200
  },
  {
    "id": "p32",
    "name": "Pepsi Cola",
    "price": 2.2,
    "category": "viveres",
    "subcategory": "Refrescos",
    "image": "/Ananas/images/products/pepsi.png",
    "unit": "2 L",
    "labels": [],
    "stock": 33,
    "warehouseStock": 411
  },
  {
    "id": "p33",
    "name": "Chinotto",
    "price": 2.2,
    "category": "viveres",
    "subcategory": "Refrescos",
    "image": "/Ananas/images/products/chinotto.png",
    "unit": "2 L",
    "labels": [],
    "stock": 46,
    "warehouseStock": 429
  },
  {
    "id": "p34",
    "name": "Frescolita",
    "price": 2.2,
    "category": "viveres",
    "subcategory": "Refrescos",
    "image": "/Ananas/images/products/frescolita.png",
    "unit": "2 L",
    "labels": [],
    "stock": 84,
    "warehouseStock": 185
  },
  {
    "id": "p35",
    "name": "Maltin Polar",
    "price": 2.0,
    "category": "viveres",
    "subcategory": "Refrescos",
    "image": "/Ananas/images/products/maltin.png",
    "unit": "1.5 L",
    "labels": [],
    "stock": 27,
    "warehouseStock": 59
  },
  {
    "id": "p36",
    "name": "Arroz Blanco Mary",
    "price": 1.2,
    "category": "viveres",
    "subcategory": "Arroz",
    "image": "/Ananas/images/products/arroz_blanco.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 14,
    "warehouseStock": 158
  },
  {
    "id": "p37",
    "name": "Arroz Primor",
    "price": 1.3,
    "category": "viveres",
    "subcategory": "Arroz",
    "image": "/Ananas/images/products/arroz_primor.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 83,
    "warehouseStock": 430
  },
  {
    "id": "p38",
    "name": "Pasta Capri Espagueti",
    "price": 1.6,
    "category": "viveres",
    "subcategory": "Pasta",
    "image": "/Ananas/images/products/pasta_capri.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 78,
    "warehouseStock": 102
  },
  {
    "id": "p39",
    "name": "Harina PAN",
    "price": 1.15,
    "category": "viveres",
    "subcategory": "Arroz",
    "image": "/Ananas/images/products/harina_pan.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 81,
    "warehouseStock": 379
  },
  {
    "id": "p40",
    "name": "Caraotas Negras Mary",
    "price": 1.8,
    "category": "viveres",
    "subcategory": "Enlatados",
    "image": "/Ananas/images/products/caraotas.png",
    "unit": "500g",
    "labels": [],
    "stock": 33,
    "warehouseStock": 203
  },
  {
    "id": "p41",
    "name": "Lentejas",
    "price": 2.1,
    "category": "viveres",
    "subcategory": "Enlatados",
    "image": "/Ananas/images/products/lentejas.png",
    "unit": "500g",
    "labels": [],
    "stock": 34,
    "warehouseStock": 416
  },
  {
    "id": "p42",
    "name": "Atun Margarita en Aceite",
    "price": 2.5,
    "category": "viveres",
    "subcategory": "Enlatados",
    "image": "/Ananas/images/products/atun_aceite.png",
    "unit": "140g",
    "labels": [],
    "stock": 69,
    "warehouseStock": 225
  },
  {
    "id": "p43",
    "name": "Atun Margarita en Agua",
    "price": 2.5,
    "category": "viveres",
    "subcategory": "Enlatados",
    "image": "/Ananas/images/products/atun_agua.png",
    "unit": "140g",
    "labels": [],
    "stock": 34,
    "warehouseStock": 351
  },
  {
    "id": "p44",
    "name": "Maiz Dulce en Lata",
    "price": 1.5,
    "category": "viveres",
    "subcategory": "Enlatados",
    "image": "/Ananas/images/products/maiz_lata.png",
    "unit": "300g",
    "labels": [
      "Nuevo"
    ],
    "stock": 73,
    "warehouseStock": 204
  },
  {
    "id": "p45",
    "name": "Aceite de Maiz Mazeite",
    "price": 3.5,
    "category": "viveres",
    "subcategory": "Arroz",
    "image": "/Ananas/images/products/aceite_maiz.png",
    "unit": "1 Litro",
    "labels": [],
    "stock": 42,
    "warehouseStock": 307
  },
  {
    "id": "p46",
    "name": "Jabon Protex",
    "price": 3.5,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/jabon_protex.png",
    "unit": "3 Unidades",
    "labels": [],
    "stock": 16,
    "warehouseStock": 269
  },
  {
    "id": "p47",
    "name": "Desodorante Dove",
    "price": 4.2,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/desodorante.png",
    "unit": "50ml",
    "labels": [],
    "stock": 56,
    "warehouseStock": 242
  },
  {
    "id": "p48",
    "name": "Crema Dental Colgate",
    "price": 2.8,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/crema_dental.png",
    "unit": "100g",
    "labels": [
      "Oferta"
    ],
    "stock": 24,
    "warehouseStock": 133
  },
  {
    "id": "p49",
    "name": "Shampoo Pantene",
    "price": 6.5,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/shampoo.png",
    "unit": "400ml",
    "labels": [],
    "stock": 56,
    "warehouseStock": 437
  },
  {
    "id": "p50",
    "name": "Papel Higienico Scott",
    "price": 3.8,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/papel_higienico.png",
    "unit": "4 Rollos",
    "labels": [],
    "stock": 17,
    "warehouseStock": 450
  },
  {
    "id": "p51",
    "name": "Toallas Sanitarias Always",
    "price": 2.9,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/toallas_sanitarias.png",
    "unit": "10 Unidades",
    "labels": [],
    "stock": 70,
    "warehouseStock": 196
  },
  {
    "id": "p52",
    "name": "Maquina de Afeitar Gillette",
    "price": 3.0,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/maquina_afeitar.png",
    "unit": "2 Unidades",
    "labels": [],
    "stock": 89,
    "warehouseStock": 97
  },
  {
    "id": "p53",
    "name": "Crema Corporal Lubriderm",
    "price": 8.5,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/crema_corporal.png",
    "unit": "400ml",
    "labels": [],
    "stock": 22,
    "warehouseStock": 351
  },
  {
    "id": "p54",
    "name": "Algodon en Motas",
    "price": 1.5,
    "category": "cuidado-personal-salud",
    "subcategory": "Farmacia",
    "image": "/Ananas/images/products/algodon.png",
    "unit": "100g",
    "labels": [],
    "stock": 48,
    "warehouseStock": 192
  },
  {
    "id": "p55",
    "name": "Hisopos Q-Tips",
    "price": 1.8,
    "category": "cuidado-personal-salud",
    "subcategory": "Farmacia",
    "image": "/Ananas/images/products/hisopos.png",
    "unit": "100 Unidades",
    "labels": [],
    "stock": 34,
    "warehouseStock": 377
  },
  {
    "id": "p56",
    "name": "Alcohol Isopropilico",
    "price": 2.2,
    "category": "cuidado-personal-salud",
    "subcategory": "Farmacia",
    "image": "/Ananas/images/products/alcohol.png",
    "unit": "250ml",
    "labels": [],
    "stock": 70,
    "warehouseStock": 357
  },
  {
    "id": "p57",
    "name": "Agua Oxigenada",
    "price": 1.0,
    "category": "cuidado-personal-salud",
    "subcategory": "Farmacia",
    "image": "/Ananas/images/products/agua_oxigenada.png",
    "unit": "100ml",
    "labels": [
      "Oferta"
    ],
    "stock": 75,
    "warehouseStock": 380
  },
  {
    "id": "p58",
    "name": "Curitas Band-Aid",
    "price": 3.0,
    "category": "cuidado-personal-salud",
    "subcategory": "Farmacia",
    "image": "/Ananas/images/products/curitas.png",
    "unit": "Caja",
    "labels": [],
    "stock": 75,
    "warehouseStock": 387
  },
  {
    "id": "p59",
    "name": "Detergente Liquido Ariel",
    "price": 8.5,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/detergente_liquido.png",
    "unit": "2 L",
    "labels": [],
    "stock": 89,
    "warehouseStock": 135
  },
  {
    "id": "p60",
    "name": "Detergente en Polvo ACE",
    "price": 4.5,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/detergente_polvo.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 85,
    "warehouseStock": 83
  },
  {
    "id": "p61",
    "name": "Suavizante Suavitel",
    "price": 3.8,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/suavizante.png",
    "unit": "1 L",
    "labels": [
      "Nuevo"
    ],
    "stock": 77,
    "warehouseStock": 176
  },
  {
    "id": "p62",
    "name": "Lavaplatos Liquido Las Llaves",
    "price": 2.5,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/lavaplatos_liquido.png",
    "unit": "500ml",
    "labels": [],
    "stock": 29,
    "warehouseStock": 423
  },
  {
    "id": "p63",
    "name": "Lavaplatos en Crema Axion",
    "price": 1.8,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/lavaplatos_crema.png",
    "unit": "250g",
    "labels": [],
    "stock": 98,
    "warehouseStock": 327
  },
  {
    "id": "p64",
    "name": "Cloro Nevex",
    "price": 1.5,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/cloro.png",
    "unit": "1 L",
    "labels": [],
    "stock": 74,
    "warehouseStock": 277
  },
  {
    "id": "p65",
    "name": "Desinfectante Mistolin",
    "price": 2.2,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/desinfectante.png",
    "unit": "1 L",
    "labels": [],
    "stock": 20,
    "warehouseStock": 401
  },
  {
    "id": "p66",
    "name": "Esponja Scotch-Brite",
    "price": 3.5,
    "category": "limpieza",
    "subcategory": "Accesorios",
    "image": "/Ananas/images/products/esponja.png",
    "unit": "3 Unidades",
    "labels": [],
    "stock": 91,
    "warehouseStock": 300
  },
  {
    "id": "p67",
    "name": "Mopa de Algodon",
    "price": 5.0,
    "category": "limpieza",
    "subcategory": "Accesorios",
    "image": "/Ananas/images/products/mopa.png",
    "unit": "1 Unidad",
    "labels": [],
    "stock": 17,
    "warehouseStock": 422
  },
  {
    "id": "p68",
    "name": "Escoba con Mango",
    "price": 4.5,
    "category": "limpieza",
    "subcategory": "Accesorios",
    "image": "/Ananas/images/products/escoba.png",
    "unit": "1 Unidad",
    "labels": [],
    "stock": 49,
    "warehouseStock": 237
  },
  {
    "id": "p69",
    "name": "Coleto Tradicional",
    "price": 2.0,
    "category": "limpieza",
    "subcategory": "Accesorios",
    "image": "/Ananas/images/products/coleto.png",
    "unit": "1 Unidad",
    "labels": [
      "Oferta"
    ],
    "stock": 70,
    "warehouseStock": 255
  },
  {
    "id": "p70",
    "name": "Bolsas de Basura Grandes",
    "price": 3.2,
    "category": "limpieza",
    "subcategory": "Accesorios",
    "image": "/Ananas/images/products/bolsas_basura.png",
    "unit": "10 Unidades",
    "labels": [],
    "stock": 54,
    "warehouseStock": 402
  },
  {
    "id": "p71",
    "name": "Cerveza Polar Pilsen",
    "price": 25.0,
    "category": "licores",
    "subcategory": "Cervezas",
    "image": "/Ananas/images/products/cerveza_pilsen.png",
    "unit": "Caja 36",
    "labels": [],
    "stock": 60,
    "warehouseStock": 386
  },
  {
    "id": "p72",
    "name": "Cerveza Polar Light",
    "price": 25.0,
    "category": "licores",
    "subcategory": "Cervezas",
    "image": "/Ananas/images/products/cerveza_light.png",
    "unit": "Caja 36",
    "labels": [
      "Oferta"
    ],
    "stock": 13,
    "warehouseStock": 495
  },
  {
    "id": "p73",
    "name": "Cerveza Solera Verde",
    "price": 6.5,
    "category": "licores",
    "subcategory": "Cervezas",
    "image": "/Ananas/images/products/cerveza_solera.png",
    "unit": "6 Pack",
    "labels": [],
    "stock": 39,
    "warehouseStock": 497
  },
  {
    "id": "p74",
    "name": "Cerveza Zulia",
    "price": 6.0,
    "category": "licores",
    "subcategory": "Cervezas",
    "image": "/Ananas/images/products/cerveza_zulia.png",
    "unit": "6 Pack",
    "labels": [],
    "stock": 52,
    "warehouseStock": 168
  },
  {
    "id": "p75",
    "name": "Ron Santa Teresa Linaje",
    "price": 18.0,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/ron_teresa.png",
    "unit": "750ml",
    "labels": [
      "Nuevo"
    ],
    "stock": 89,
    "warehouseStock": 477
  },
  {
    "id": "p76",
    "name": "Ron Cacique Anejo",
    "price": 12.0,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/ron_cacique.png",
    "unit": "750ml",
    "labels": [],
    "stock": 23,
    "warehouseStock": 153
  },
  {
    "id": "p77",
    "name": "Ron Pampero Aniversario",
    "price": 22.0,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/ron_pampero.png",
    "unit": "750ml",
    "labels": [
      "Oferta"
    ],
    "stock": 77,
    "warehouseStock": 471
  },
  {
    "id": "p78",
    "name": "Ron Diplomatico Reserva Exclusiva",
    "price": 35.0,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/ron_diplomatico.png",
    "unit": "750ml",
    "labels": [],
    "stock": 16,
    "warehouseStock": 72
  },
  {
    "id": "p79",
    "name": "Whisky Buchanan's 12 Anos",
    "price": 42.0,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/whisky_buchanans.png",
    "unit": "750ml",
    "labels": [],
    "stock": 37,
    "warehouseStock": 169
  },
  {
    "id": "p80",
    "name": "Whisky Old Parr 12 Anos",
    "price": 38.0,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/whisky_parr.png",
    "unit": "750ml",
    "labels": [],
    "stock": 31,
    "warehouseStock": 229
  },
  {
    "id": "p81",
    "name": "Vodka Gordon's",
    "price": 10.0,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/vodka.png",
    "unit": "750ml",
    "labels": [],
    "stock": 53,
    "warehouseStock": 194
  },
  {
    "id": "p82",
    "name": "Vino Tinto Casillero del Diablo",
    "price": 12.5,
    "category": "licores",
    "subcategory": "Vinos",
    "image": "/Ananas/images/products/vino_tinto.png",
    "unit": "750ml",
    "labels": [],
    "stock": 88,
    "warehouseStock": 431
  },
  {
    "id": "p83",
    "name": "Vino Blanco Santa Helena",
    "price": 8.5,
    "category": "licores",
    "subcategory": "Vinos",
    "image": "/Ananas/images/products/vino_blanco.png",
    "unit": "750ml",
    "labels": [
      "Nuevo"
    ],
    "stock": 33,
    "warehouseStock": 149
  }
];

export const zones = ['San Luis El Cafetal'];
