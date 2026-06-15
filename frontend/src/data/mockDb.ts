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
  description?: string;
  providerPrice?: number;
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
      "Harinas",
      "Granos",
      "Enlatados",
      "Aceites"
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
    "name": "TOMATES PERITA X KG",
    "price": 3.49,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/tomates_perita.png",
    "unit": "1 Kg",
    "labels": [
      "Nuevo"
    ],
    "stock": 69,
    "warehouseStock": 229,
    "providerPrice": 2.10,
    "description": "Tomates Perita de calidad seleccionada, perfectos para ensaladas y guisos."
  },
  {
    "id": "p2",
    "name": "Cebolla Blanca X KG",
    "price": 2.1,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/cebolla_blanca.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 26,
    "warehouseStock": 198,
    "providerPrice": 1.25,
    "description": "Cebolla blanca fresca y crujiente, ideal para sazonar tus comidas cotidianas."
  },
  {
    "id": "p3",
    "name": "PAPAS X KG",
    "price": 2.95,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/papa_lavada.png",
    "unit": "1 Kg",
    "labels": [
      "Nuevo"
    ],
    "stock": 74,
    "warehouseStock": 130
  },
  {
    "id": "p4",
    "name": "ZANAHORIAS X KG",
    "price": 2.89,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/zanahoria.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 42,
    "warehouseStock": 360
  },
  {
    "id": "p5",
    "name": "PIMENTON VERDE X KG",
    "price": 3.75,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/pimenton_verde.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 95,
    "warehouseStock": 404
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
    "stock": 19,
    "warehouseStock": 348
  },
  {
    "id": "p7",
    "name": "PLATANO X KG",
    "price": 2.79,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/platano_maduro.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 49,
    "warehouseStock": 189
  },
  {
    "id": "p8",
    "name": "CAMBUR X KG",
    "price": 1.35,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/cambur.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 16,
    "warehouseStock": 181
  },
  {
    "id": "p9",
    "name": "MANZANA ROYAL GALA X KG",
    "price": 5.25,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/manzana_gala.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 92,
    "warehouseStock": 306
  },
  {
    "id": "p10",
    "name": "NARANJAS PARA JUGO X KG",
    "price": 2.5,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/naranja.png",
    "unit": "1 Kg",
    "labels": [
      "Oferta"
    ],
    "stock": 68,
    "warehouseStock": 241
  },
  {
    "id": "p11",
    "name": "LECHOSA X KG",
    "price": 1.75,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/lechosa.png",
    "unit": "1 Kg",
    "labels": [
      "Nuevo"
    ],
    "stock": 94,
    "warehouseStock": 324
  },
  {
    "id": "p12",
    "name": "LIMONES X KG",
    "price": 4.19,
    "category": "frutas-vegetales",
    "subcategory": "Frescos",
    "image": "/Ananas/images/products/limones.png",
    "unit": "1 Kg",
    "labels": [
      "Nuevo"
    ],
    "stock": 92,
    "warehouseStock": 250
  },
  {
    "id": "p13",
    "name": "PIÑA X UN",
    "price": 2.55,
    "category": "frutas-vegetales",
    "subcategory": "Enteras",
    "image": "/Ananas/images/products/pina.png",
    "unit": "1 Unidad",
    "labels": [],
    "stock": 96,
    "warehouseStock": 124
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
    "stock": 84,
    "warehouseStock": 173
  },
  {
    "id": "p15",
    "name": "PATILLA ROJA X KG",
    "price": 1.19,
    "category": "frutas-vegetales",
    "subcategory": "Picadas",
    "image": "/Ananas/images/products/frutas_picadas.png",
    "unit": "500g",
    "labels": [],
    "stock": 96,
    "warehouseStock": 359
  },
  {
    "id": "p16",
    "name": "CARNE MOLIDA SV",
    "price": 9.95,
    "category": "refrigerados-congelados",
    "subcategory": "Carnes",
    "image": "/Ananas/images/products/carne_molida.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 33,
    "warehouseStock": 64
  },
  {
    "id": "p17",
    "name": "Bistec de Ganso",
    "price": 11.5,
    "category": "refrigerados-congelados",
    "subcategory": "Carnes",
    "image": "/Ananas/images/products/bistec_ganso.png",
    "unit": "1 Kg",
    "labels": [
      "Nuevo"
    ],
    "stock": 20,
    "warehouseStock": 148
  },
  {
    "id": "p18",
    "name": "COSTILLAS DE CERDO BBQ PREPARADOS PLAZAS CONGELADO X KG",
    "price": 21.95,
    "category": "refrigerados-congelados",
    "subcategory": "Carnes",
    "image": "/Ananas/images/products/costilla_res.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 89,
    "warehouseStock": 145
  },
  {
    "id": "p19",
    "name": "PECHUGA DE POLLO MOLIDA X KG",
    "price": 11.45,
    "category": "refrigerados-congelados",
    "subcategory": "Pollos",
    "image": "/Ananas/images/products/pechuga_pollo.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 82,
    "warehouseStock": 71
  },
  {
    "id": "p20",
    "name": "Pollo Entero X KG",
    "price": 4.5,
    "category": "refrigerados-congelados",
    "subcategory": "Pollos",
    "image": "/Ananas/images/products/pollo_entero.png",
    "unit": "1 Kg",
    "labels": [
      "Nuevo"
    ],
    "stock": 42,
    "warehouseStock": 55
  },
  {
    "id": "p21",
    "name": "MUSLOS DE POLLO X KG",
    "price": 4.25,
    "category": "refrigerados-congelados",
    "subcategory": "Pollos",
    "image": "/Ananas/images/products/muslos_pollo.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 50,
    "warehouseStock": 77
  },
  {
    "id": "p22",
    "name": "Alitas de Pollo X KG",
    "price": 6.0,
    "category": "refrigerados-congelados",
    "subcategory": "Pollos",
    "image": "/Ananas/images/products/alitas_pollo.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 32,
    "warehouseStock": 298
  },
  {
    "id": "p23",
    "name": "JAMON ENDIABLADO PLUMROSE 60G",
    "price": 2.15,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/jamon_cocido.png",
    "unit": "500g",
    "labels": [],
    "stock": 93,
    "warehouseStock": 323
  },
  {
    "id": "p24",
    "name": "QUESO AMARILLO MAJU X KG",
    "price": 27.29,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/queso_amarillo.png",
    "unit": "500g",
    "labels": [],
    "stock": 98,
    "warehouseStock": 460
  },
  {
    "id": "p25",
    "name": "QUESO BLANCO MERIDEÑO X KG",
    "price": 10.99,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/queso_blanco.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 84,
    "warehouseStock": 282
  },
  {
    "id": "p26",
    "name": "SALCHICHAS FRANKFURT PLUMROSE DE 350G",
    "price": 9.89,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/salchichas.png",
    "unit": "1 Paquete",
    "labels": [],
    "stock": 59,
    "warehouseStock": 430
  },
  {
    "id": "p27",
    "name": "Tocino Ahumado Plumrose 250G",
    "price": 4.8,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/tocino.png",
    "unit": "250g",
    "labels": [],
    "stock": 39,
    "warehouseStock": 155
  },
  {
    "id": "p28",
    "name": "CHORIZO MONTSERRATINA TIPO VELA X KG",
    "price": 52.88,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/chorizo.png",
    "unit": "500g",
    "labels": [],
    "stock": 55,
    "warehouseStock": 170
  },
  {
    "id": "p29",
    "name": "QUESO GUAYANES X KG",
    "price": 8.19,
    "category": "refrigerados-congelados",
    "subcategory": "Embutidos",
    "image": "/Ananas/images/products/queso_guayanes.png",
    "unit": "500g",
    "labels": [],
    "stock": 89,
    "warehouseStock": 496
  },
  {
    "id": "p30",
    "name": "NUGGETS DE POLLO PLAZAS CONGELADOS X KG",
    "price": 13.44,
    "category": "refrigerados-congelados",
    "subcategory": "Pollos",
    "image": "/Ananas/images/products/nuggets.png",
    "unit": "1 Paquete",
    "labels": [],
    "stock": 37,
    "warehouseStock": 322
  },
  {
    "id": "p31",
    "name": "COCA COLA SIN AZUCAR 2L",
    "price": 1.44,
    "category": "viveres",
    "subcategory": "Refrescos",
    "image": "/Ananas/images/products/coca_cola.png",
    "unit": "2 L",
    "labels": [],
    "stock": 78,
    "warehouseStock": 225
  },
  {
    "id": "p32",
    "name": "PEPSI COLA 2L",
    "price": 1.45,
    "category": "viveres",
    "subcategory": "Refrescos",
    "image": "/Ananas/images/products/pepsi.png",
    "unit": "2 L",
    "labels": [],
    "stock": 40,
    "warehouseStock": 182
  },
  {
    "id": "p33",
    "name": "CHINOTTO SIN CALORIAS 355CC",
    "price": 0.79,
    "category": "viveres",
    "subcategory": "Refrescos",
    "image": "/Ananas/images/products/chinotto.png",
    "unit": "2 L",
    "labels": [],
    "stock": 11,
    "warehouseStock": 173
  },
  {
    "id": "p34",
    "name": "FRESCOLITA SIN CALORIAS 2L",
    "price": 1.44,
    "category": "viveres",
    "subcategory": "Refrescos",
    "image": "/Ananas/images/products/frescolita.png",
    "unit": "2 L",
    "labels": [],
    "stock": 35,
    "warehouseStock": 279
  },
  {
    "id": "p35",
    "name": "MALTA MALTIN POLAR 1.5L",
    "price": 1.93,
    "category": "viveres",
    "subcategory": "Refrescos",
    "image": "/Ananas/images/products/maltin.png",
    "unit": "1.5 L",
    "labels": [
      "Oferta"
    ],
    "stock": 53,
    "warehouseStock": 482
  },
  {
    "id": "p36",
    "name": "ARROZ MARY DORADO 800G",
    "price": 1.75,
    "category": "viveres",
    "subcategory": "Arroz",
    "image": "/Ananas/images/products/arroz_blanco.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 94,
    "warehouseStock": 443
  },
  {
    "id": "p37",
    "name": "ARROZ PRIMOR TRADICIONAL 900G",
    "price": 1.5,
    "category": "viveres",
    "subcategory": "Arroz",
    "image": "/Ananas/images/products/arroz_primor.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 82,
    "warehouseStock": 429
  },
  {
    "id": "p38",
    "name": "PASTA CAPRI CANELONES 250G",
    "price": 1.49,
    "category": "viveres",
    "subcategory": "Pasta",
    "image": "/Ananas/images/products/pasta_capri.png",
    "unit": "1 Kg",
    "labels": [],
    "stock": 19,
    "warehouseStock": 327
  },
  {
    "id": "p39",
    "name": "HARINA PAN MAIZ BLANCO GLUTEN FREE 2KG",
    "price": 2.45,
    "category": "viveres",
    "subcategory": "Harinas",
    "image": "/Ananas/images/products/harina_pan.png",
    "unit": "1 Kg",
    "labels": [
      "Nuevo"
    ],
    "stock": 28,
    "warehouseStock": 331
  },
  {
    "id": "p40",
    "name": "CARAOTAS BLANCAS MARY 500G",
    "price": 3.4,
    "category": "viveres",
    "subcategory": "Granos",
    "image": "/Ananas/images/products/caraotas.png",
    "unit": "500g",
    "labels": [],
    "stock": 82,
    "warehouseStock": 461
  },
  {
    "id": "p41",
    "name": "LENTEJAS MARY 400G",
    "price": 1.8,
    "category": "viveres",
    "subcategory": "Granos",
    "image": "/Ananas/images/products/lentejas.png",
    "unit": "500g",
    "labels": [],
    "stock": 37,
    "warehouseStock": 174
  },
  {
    "id": "p42",
    "name": "ATUN MARGARITA EN ACEITE VEGETAL 140G",
    "price": 3.35,
    "category": "viveres",
    "subcategory": "Enlatados",
    "image": "/Ananas/images/products/atun_aceite.png",
    "unit": "140g",
    "labels": [],
    "stock": 100,
    "warehouseStock": 220
  },
  {
    "id": "p43",
    "name": "ATUN MARGARITA AL NATURAL 140G",
    "price": 3.0,
    "category": "viveres",
    "subcategory": "Enlatados",
    "image": "/Ananas/images/products/atun_agua.png",
    "unit": "140g",
    "labels": [],
    "stock": 46,
    "warehouseStock": 218
  },
  {
    "id": "p44",
    "name": "MAIZ DULCE CAUJARAL 4UN",
    "price": 7.9,
    "category": "viveres",
    "subcategory": "Enlatados",
    "image": "/Ananas/images/products/maiz_lata.png",
    "unit": "300g",
    "labels": [],
    "stock": 37,
    "warehouseStock": 249
  },
  {
    "id": "p45",
    "name": "ACEITE MAZEITE DE MAIZ 1L",
    "price": 5.8,
    "category": "viveres",
    "subcategory": "Aceites",
    "image": "/Ananas/images/products/aceite_maiz.png",
    "unit": "1 Litro",
    "labels": [],
    "stock": 90,
    "warehouseStock": 193
  },
  {
    "id": "p46",
    "name": "JABON LIQUIDO PROTEX DE AVENA 221ML",
    "price": 6.5,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/jabon_protex.png",
    "unit": "3 Unidades",
    "labels": [],
    "stock": 59,
    "warehouseStock": 82
  },
  {
    "id": "p47",
    "name": "DESODORANTE ROLL ON DOVE DERMOACLARANTE 50ML",
    "price": 4.85,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/desodorante.png",
    "unit": "50ml",
    "labels": [],
    "stock": 29,
    "warehouseStock": 236
  },
  {
    "id": "p48",
    "name": "CEPILLO DENTAL COLGATE 360 MEDIO",
    "price": 4.74,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/crema_dental.png",
    "unit": "100g",
    "labels": [],
    "stock": 14,
    "warehouseStock": 284
  },
  {
    "id": "p49",
    "name": "ACONDICIONADOR PANTENE RESTAURACION 400ML",
    "price": 11.34,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/shampoo.png",
    "unit": "400ml",
    "labels": [
      "Oferta"
    ],
    "stock": 56,
    "warehouseStock": 492
  },
  {
    "id": "p50",
    "name": "PAPEL HIGIENICO SCOTT PREMIUM 4 ROLLOS",
    "price": 6.89,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/papel_higienico.png",
    "unit": "4 Rollos",
    "labels": [],
    "stock": 77,
    "warehouseStock": 192
  },
  {
    "id": "p51",
    "name": "TOALLAS SANITARIAS ALWAYS ACTIVE NOCTURNAS 8UN",
    "price": 3.55,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/toallas_sanitarias.png",
    "unit": "10 Unidades",
    "labels": [],
    "stock": 41,
    "warehouseStock": 361
  },
  {
    "id": "p52",
    "name": "CARTUCHO GILLETTE VENUS SKIN COMFORT4UND",
    "price": 16.48,
    "category": "cuidado-personal-salud",
    "subcategory": "Aseo",
    "image": "/Ananas/images/products/maquina_afeitar.png",
    "unit": "2 Unidades",
    "labels": [],
    "stock": 24,
    "warehouseStock": 401
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
    "stock": 77,
    "warehouseStock": 72
  },
  {
    "id": "p54",
    "name": "ALGODON ALGOBAP HIDROFILO 100G",
    "price": 5.68,
    "category": "cuidado-personal-salud",
    "subcategory": "Farmacia",
    "image": "/Ananas/images/products/algodon.png",
    "unit": "100g",
    "labels": [],
    "stock": 94,
    "warehouseStock": 349
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
    "stock": 35,
    "warehouseStock": 500
  },
  {
    "id": "p56",
    "name": "ALCOHOL DE QUEMAR OPIN 900ML",
    "price": 7.98,
    "category": "cuidado-personal-salud",
    "subcategory": "Farmacia",
    "image": "/Ananas/images/products/alcohol.png",
    "unit": "250ml",
    "labels": [],
    "stock": 36,
    "warehouseStock": 346
  },
  {
    "id": "p57",
    "name": "AGUA OXIGENADA EL GUARDIAN 500ML",
    "price": 2.85,
    "category": "cuidado-personal-salud",
    "subcategory": "Farmacia",
    "image": "/Ananas/images/products/agua_oxigenada.png",
    "unit": "100ml",
    "labels": [],
    "stock": 83,
    "warehouseStock": 257
  },
  {
    "id": "p58",
    "name": "CURITAS BRIUTCARE TRANSP X20 UN",
    "price": 4.29,
    "category": "cuidado-personal-salud",
    "subcategory": "Farmacia",
    "image": "/Ananas/images/products/curitas.png",
    "unit": "Caja",
    "labels": [],
    "stock": 71,
    "warehouseStock": 319
  },
  {
    "id": "p59",
    "name": "DETERG LIQ ARIEL REVITACOLOR 1,8L",
    "price": 23.0,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/detergente_liquido.png",
    "unit": "2 L",
    "labels": [],
    "stock": 84,
    "warehouseStock": 446
  },
  {
    "id": "p60",
    "name": "POLVO PARA HORNEAR OLYMPIA 120G",
    "price": 3.75,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/detergente_polvo.png",
    "unit": "1 Kg",
    "labels": [
      "Oferta"
    ],
    "stock": 27,
    "warehouseStock": 155
  },
  {
    "id": "p61",
    "name": "SUAVITEL COMPLETE FRESCA PRIMAVERA 1,3L",
    "price": 11.02,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/suavizante.png",
    "unit": "1 L",
    "labels": [],
    "stock": 65,
    "warehouseStock": 460
  },
  {
    "id": "p62",
    "name": "DETERGENTE LAS LLAVES FLORAL POLVO 900G",
    "price": 4.34,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/lavaplatos_liquido.png",
    "unit": "500ml",
    "labels": [],
    "stock": 68,
    "warehouseStock": 284
  },
  {
    "id": "p63",
    "name": "LAVAPLATOS CREMA AXION BICAR 7 EN 1 450G",
    "price": 5.12,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/lavaplatos_crema.png",
    "unit": "250g",
    "labels": [],
    "stock": 89,
    "warehouseStock": 499
  },
  {
    "id": "p64",
    "name": "CLORO BONCLOR SUPER CLORO 4,5% 1L",
    "price": 2.15,
    "category": "limpieza",
    "subcategory": "Detergentes",
    "image": "/Ananas/images/products/cloro.png",
    "unit": "1 L",
    "labels": [
      "Nuevo"
    ],
    "stock": 42,
    "warehouseStock": 50
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
    "stock": 55,
    "warehouseStock": 271
  },
  {
    "id": "p66",
    "name": "ESPONJA ETERNA DOBLE USO 2UN",
    "price": 2.75,
    "category": "limpieza",
    "subcategory": "Accesorios",
    "image": "/Ananas/images/products/esponja.png",
    "unit": "3 Unidades",
    "labels": [
      "Oferta"
    ],
    "stock": 92,
    "warehouseStock": 148
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
    "stock": 70,
    "warehouseStock": 472
  },
  {
    "id": "p68",
    "name": "ESCOBA EL EGIPCIO PRECEIN",
    "price": 3.21,
    "category": "limpieza",
    "subcategory": "Accesorios",
    "image": "/Ananas/images/products/escoba.png",
    "unit": "1 Unidad",
    "labels": [],
    "stock": 37,
    "warehouseStock": 455
  },
  {
    "id": "p69",
    "name": "COLETO ALGODON CLARA",
    "price": 4.34,
    "category": "limpieza",
    "subcategory": "Accesorios",
    "image": "/Ananas/images/products/coleto.png",
    "unit": "1 Unidad",
    "labels": [],
    "stock": 93,
    "warehouseStock": 297
  },
  {
    "id": "p70",
    "name": "BOLSAS GRANCO PARA BASURA EXTRA RESISTENTES 60L X 6UN",
    "price": 2.42,
    "category": "limpieza",
    "subcategory": "Accesorios",
    "image": "/Ananas/images/products/bolsas_basura.png",
    "unit": "10 Unidades",
    "labels": [],
    "stock": 67,
    "warehouseStock": 125
  },
  {
    "id": "p71",
    "name": "CERVEZA POLAR PILSEN LATA DE 250ML",
    "price": 0.99,
    "category": "licores",
    "subcategory": "Cervezas",
    "image": "/Ananas/images/products/cerveza_pilsen.png",
    "unit": "Caja 36",
    "labels": [],
    "stock": 56,
    "warehouseStock": 256
  },
  {
    "id": "p72",
    "name": "CERVEZA POLAR LIGHT LATA SLEEK DE 355ML",
    "price": 1.06,
    "category": "licores",
    "subcategory": "Cervezas",
    "image": "/Ananas/images/products/cerveza_light.png",
    "unit": "Caja 36",
    "labels": [],
    "stock": 26,
    "warehouseStock": 495
  },
  {
    "id": "p73",
    "name": "CERVEZA SOLERA LATA DE 250ML",
    "price": 0.99,
    "category": "licores",
    "subcategory": "Cervezas",
    "image": "/Ananas/images/products/cerveza_solera.png",
    "unit": "6 Pack",
    "labels": [],
    "stock": 43,
    "warehouseStock": 298
  },
  {
    "id": "p74",
    "name": "Cerveza Zulia 6 Pack",
    "price": 6.0,
    "category": "licores",
    "subcategory": "Cervezas",
    "image": "/Ananas/images/products/cerveza_zulia.png",
    "unit": "6 Pack",
    "labels": [],
    "stock": 100,
    "warehouseStock": 78
  },
  {
    "id": "p75",
    "name": "Ron Santa Teresa Linaje 750ML",
    "price": 18.0,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/ron_teresa.png",
    "unit": "750ml",
    "labels": [],
    "stock": 86,
    "warehouseStock": 304
  },
  {
    "id": "p76",
    "name": "RON CACIQUE 500 NUEVA IMAGEN 0,75L",
    "price": 15.51,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/ron_cacique.png",
    "unit": "750ml",
    "labels": [
      "Nuevo"
    ],
    "stock": 89,
    "warehouseStock": 128
  },
  {
    "id": "p77",
    "name": "Ron Pampero Aniversario 750ML",
    "price": 22.0,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/ron_pampero.png",
    "unit": "750ml",
    "labels": [
      "Nuevo"
    ],
    "stock": 100,
    "warehouseStock": 338
  },
  {
    "id": "p78",
    "name": "RON CARUPANO RESERVA EXCLUSIVA 0,70L",
    "price": 19.01,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/ron_diplomatico.png",
    "unit": "750ml",
    "labels": [],
    "stock": 33,
    "warehouseStock": 444
  },
  {
    "id": "p79",
    "name": "WHISKY BUCHANANS DE LUXE 0,70 L",
    "price": 49.46,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/whisky_buchanans.png",
    "unit": "750ml",
    "labels": [],
    "stock": 61,
    "warehouseStock": 370
  },
  {
    "id": "p80",
    "name": "WHISKY OLD PARR SILVER 0,75L",
    "price": 32.16,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/whisky_parr.png",
    "unit": "750ml",
    "labels": [
      "Nuevo"
    ],
    "stock": 16,
    "warehouseStock": 393
  },
  {
    "id": "p81",
    "name": "VODKA GORDONS MANDARINA 0,70L",
    "price": 11.96,
    "category": "licores",
    "subcategory": "Destilados",
    "image": "/Ananas/images/products/vodka.png",
    "unit": "750ml",
    "labels": [
      "Nuevo"
    ],
    "stock": 35,
    "warehouseStock": 484
  },
  {
    "id": "p82",
    "name": "Vino Tinto Casillero del Diablo 750ML",
    "price": 12.5,
    "category": "licores",
    "subcategory": "Vinos",
    "image": "/Ananas/images/products/vino_tinto.png",
    "unit": "750ml",
    "labels": [],
    "stock": 26,
    "warehouseStock": 253
  },
  {
    "id": "p83",
    "name": "Vino Blanco Santa Helena 750ML",
    "price": 8.5,
    "category": "licores",
    "subcategory": "Vinos",
    "image": "/Ananas/images/products/vino_blanco.png",
    "unit": "750ml",
    "labels": [],
    "stock": 13,
    "warehouseStock": 106
  }
];

export const zones = ['San Luis El Cafetal'];
