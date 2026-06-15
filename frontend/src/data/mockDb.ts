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
  views?: number;
  sales?: number;
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
      "Frutas",
      "Verduras y hortalizas",
      "Tubérculos",
      "Verdes y hojas"
    ]
  },
  {
    "id": "refrigerados-congelados",
    "name": "Refrigerados",
    "icon": "❄️",
    "color": "bg-blue-100 text-blue-600",
    "subcategories": [
      "Carnes",
      "Pollo",
      "Charcutería",
      "Quesos",
      "Congelados listos"
    ]
  },
  {
    "id": "viveres",
    "name": "Víveres",
    "icon": "🥫",
    "color": "bg-orange-100 text-orange-600",
    "subcategories": [
      "Granos",
      "Arroz y pasta",
      "Enlatados",
      "Aceites y salsas",
      "Bebidas"
    ]
  },
  {
    "id": "cuidado-personal-salud",
    "name": "Cuidado Personal",
    "icon": "🧴",
    "color": "bg-teal-100 text-teal-600",
    "subcategories": [
      "Higiene personal",
      "Cuidado corporal",
      "Farmacia básica"
    ]
  },
  {
    "id": "limpieza",
    "name": "Limpieza",
    "icon": "🧽",
    "color": "bg-cyan-100 text-cyan-600",
    "subcategories": [
      "Ropa",
      "Cocina",
      "Baño",
      "Desinfección",
      "Accesorios de limpieza"
    ]
  },
  {
    "id": "licores",
    "name": "Licores",
    "icon": "🍷",
    "color": "bg-purple-100 text-purple-600",
    "subcategories": [
      "Cervezas",
      "Rones",
      "Whisky",
      "Vinos",
      "Otros destilados"
    ]
  }
];

export const products: Product[] = [
  {
    "id": "p-plazas-118573",
    "price": 2,
    "subcategory": "Cervezas",
    "image": "/Ananas/images/products/scraped/p-plazas-118573.jpg",
    "unit": "1 Unidad",
    "name": "HIELO EN BOLSA GRANDE POISO",
    "stock": 50,
    "providerPrice": 1.4,
    "category": "licores"
  },
  {
    "id": "p-plazas-119503",
    "stock": 50,
    "name": "HUEVOS CARTON X 30UN",
    "category": "refrigerados-congelados",
    "providerPrice": 4.8999999999999995,
    "subcategory": "Charcutería",
    "price": 7,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-119503.jpg"
  },
  {
    "id": "p-plazas-124224",
    "price": 7,
    "subcategory": "Congelados listos",
    "image": "/Ananas/images/products/scraped/p-plazas-124224.jpg",
    "unit": "1 Unidad",
    "name": "HELADO DE TORTA SUIZA EDMAR 946ML",
    "stock": 50,
    "providerPrice": 4.8999999999999995,
    "category": "refrigerados-congelados"
  },
  {
    "id": "p-plazas-125209",
    "name": "ESPARRAGOS VERDES VIMA CONGELADOS 450G",
    "stock": 50,
    "providerPrice": 8.399999999999999,
    "category": "frutas-vegetales",
    "price": 12,
    "subcategory": "Verduras y hortalizas",
    "image": "/Ananas/images/products/scraped/p-plazas-125209.jpg",
    "unit": "1 Unidad"
  },
  {
    "id": "p-plazas-125210",
    "subcategory": "Verduras y hortalizas",
    "price": 6,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-125210.jpg",
    "stock": 50,
    "name": "FLORES DE BROCOLI VIMA CONGELADAS 450G",
    "category": "frutas-vegetales",
    "providerPrice": 4.199999999999999
  },
  {
    "id": "p-plazas-125832",
    "price": 4,
    "subcategory": "Pollo",
    "image": "/Ananas/images/products/scraped/p-plazas-125832.jpg",
    "unit": "1 Unidad",
    "name": "ALAS DE POLLO X KG",
    "stock": 50,
    "providerPrice": 2.8,
    "category": "refrigerados-congelados"
  },
  {
    "id": "p-plazas-125858",
    "providerPrice": 5.6,
    "category": "refrigerados-congelados",
    "name": "PECHUGA DE POLLO SIN HUESO X KG",
    "stock": 50,
    "image": "/Ananas/images/products/scraped/p-plazas-125858.jpg",
    "unit": "1 Unidad",
    "price": 8,
    "subcategory": "Pollo"
  },
  {
    "id": "p-plazas-125914",
    "price": 9,
    "subcategory": "Carnes",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-125914.jpg",
    "stock": 50,
    "name": "CARNE PARA DESMECHAR SV",
    "category": "refrigerados-congelados",
    "providerPrice": 6.3
  },
  {
    "id": "p-plazas-125941",
    "subcategory": "Carnes",
    "price": 12,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-125941.jpg",
    "stock": 50,
    "name": "PULPA NEGRA SV",
    "category": "refrigerados-congelados",
    "providerPrice": 8.399999999999999
  },
  {
    "id": "p-plazas-125953",
    "name": "PUNTA TRASERA DE CERDO PLUMROSE",
    "stock": 50,
    "providerPrice": 9.799999999999999,
    "category": "refrigerados-congelados",
    "price": 14,
    "subcategory": "Carnes",
    "image": "/Ananas/images/products/scraped/p-plazas-125953.jpg",
    "unit": "1 Unidad"
  },
  {
    "id": "p-plazas-126060",
    "subcategory": "Verduras y hortalizas",
    "price": 1,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-126060.jpg",
    "stock": 50,
    "name": "CALABACINES X KG",
    "category": "frutas-vegetales",
    "providerPrice": 0.7
  },
  {
    "id": "p-plazas-126061",
    "subcategory": "Frutas",
    "price": 1,
    "image": "/Ananas/images/products/scraped/p-plazas-126061.jpg",
    "unit": "1 Unidad",
    "name": "CAMBUR X KG",
    "stock": 50,
    "providerPrice": 0.7,
    "category": "frutas-vegetales"
  },
  {
    "id": "p-plazas-126098",
    "providerPrice": 0.7,
    "category": "frutas-vegetales",
    "name": "LECHOSA X KG",
    "stock": 50,
    "image": "/Ananas/images/products/scraped/p-plazas-126098.jpg",
    "unit": "1 Unidad",
    "subcategory": "Frutas",
    "price": 1
  },
  {
    "id": "p-plazas-126100",
    "stock": 50,
    "name": "LIMONES X KG",
    "category": "frutas-vegetales",
    "providerPrice": 2.8,
    "price": 4,
    "subcategory": "Frutas",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-126100.jpg"
  },
  {
    "id": "p-plazas-126105",
    "subcategory": "Frutas",
    "price": 1,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-126105.jpg",
    "stock": 50,
    "name": "MANGO INJERTO X KG",
    "category": "frutas-vegetales",
    "providerPrice": 0.7
  },
  {
    "id": "p-plazas-126120",
    "image": "/Ananas/images/products/scraped/p-plazas-126120.jpg",
    "unit": "1 Unidad",
    "subcategory": "Tubérculos",
    "price": 3,
    "providerPrice": 2.0999999999999996,
    "category": "frutas-vegetales",
    "name": "PAPAS X KG",
    "stock": 50
  },
  {
    "id": "p-plazas-126127",
    "subcategory": "Verduras y hortalizas",
    "price": 1,
    "image": "/Ananas/images/products/scraped/p-plazas-126127.jpg",
    "unit": "1 Unidad",
    "name": "PEPINOS X KG",
    "stock": 50,
    "providerPrice": 0.7,
    "category": "frutas-vegetales"
  },
  {
    "id": "p-plazas-126132",
    "stock": 50,
    "name": "PIÑA X UN",
    "category": "frutas-vegetales",
    "providerPrice": 1.4,
    "price": 2,
    "subcategory": "Frutas",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-126132.jpg"
  },
  {
    "id": "p-plazas-126139",
    "subcategory": "Verdes y hojas",
    "price": 1,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-126139.jpg",
    "stock": 50,
    "name": "REPOLLO BLANCO X KG",
    "category": "frutas-vegetales",
    "providerPrice": 0.7
  },
  {
    "id": "p-plazas-126151",
    "price": 3,
    "subcategory": "Verduras y hortalizas",
    "image": "/Ananas/images/products/scraped/p-plazas-126151.jpg",
    "unit": "1 Unidad",
    "name": "TOMATES PERITA X KG",
    "stock": 50,
    "providerPrice": 2.0999999999999996,
    "category": "frutas-vegetales"
  },
  {
    "id": "p-plazas-126160",
    "price": 2,
    "subcategory": "Verduras y hortalizas",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-126160.jpg",
    "stock": 50,
    "name": "ZANAHORIAS X KG",
    "category": "frutas-vegetales",
    "providerPrice": 1.4
  },
  {
    "id": "p-plazas-129410",
    "name": "CREMA DENTAL COLGATE TRIPLE ACCION 100ML",
    "stock": 50,
    "providerPrice": 2.8,
    "category": "cuidado-personal-salud",
    "price": 4,
    "subcategory": "Higiene personal",
    "image": "/Ananas/images/products/scraped/p-plazas-129410.jpg",
    "unit": "1 Unidad"
  },
  {
    "id": "p-plazas-129411",
    "subcategory": "Higiene personal",
    "price": 3,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-129411.jpg",
    "stock": 50,
    "name": "CREMA DENTAL COLGATE TRIPLE ACCION 75ML",
    "category": "cuidado-personal-salud",
    "providerPrice": 2.0999999999999996
  },
  {
    "id": "p-plazas-129413",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-129413.jpg",
    "price": 4,
    "subcategory": "Higiene personal",
    "category": "cuidado-personal-salud",
    "providerPrice": 2.8,
    "stock": 50,
    "name": "CEPILLO DENTAL COLGATE 360 MEDIO"
  },
  {
    "id": "p-plazas-130013",
    "price": 14,
    "subcategory": "Higiene personal",
    "image": "/Ananas/images/products/scraped/p-plazas-130013.jpg",
    "unit": "1 Unidad",
    "name": "AFEITADORA GILLETTE SENSOR 3 SENSITVE 4UN",
    "stock": 50,
    "providerPrice": 9.799999999999999,
    "category": "cuidado-personal-salud"
  },
  {
    "id": "p-plazas-130493",
    "category": "cuidado-personal-salud",
    "providerPrice": 1.4,
    "stock": 50,
    "name": "AGUA OXIGENADA IGORA VITAL 30 VOL 50ML",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-130493.jpg",
    "subcategory": "Higiene personal",
    "price": 2
  },
  {
    "id": "p-plazas-130595",
    "price": 2,
    "subcategory": "Higiene personal",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-130595.jpg",
    "stock": 50,
    "name": "JABON EN BARRA EVERY NIGHT BIO NUTRIENTES AVENA 110G",
    "category": "cuidado-personal-salud",
    "providerPrice": 1.4
  },
  {
    "id": "p-plazas-132136",
    "subcategory": "Cervezas",
    "price": 1,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-132136.jpg",
    "stock": 50,
    "name": "CERVEZA POLAR LIGHT EN BOLETTA NO RETORNABLE DE 355ML",
    "category": "licores",
    "providerPrice": 0.7
  },
  {
    "id": "p-plazas-132421",
    "stock": 50,
    "name": "VODKA GORDONS MANDARINA 0,70L",
    "category": "licores",
    "providerPrice": 7.699999999999999,
    "subcategory": "Otros destilados",
    "price": 11,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-132421.jpg"
  },
  {
    "id": "p-plazas-132682",
    "subcategory": "Cervezas",
    "price": 1,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-132682.jpg",
    "stock": 50,
    "name": "CERVEZA POLAR PILSEN LATA DE 250ML",
    "category": "licores",
    "providerPrice": 0.7
  },
  {
    "id": "p-plazas-133154",
    "providerPrice": 0.7,
    "category": "licores",
    "name": "CERVEZA POLAR PILSEN SLEEK LATA DE 355ML",
    "stock": 50,
    "image": "/Ananas/images/products/scraped/p-plazas-133154.jpg",
    "unit": "1 Unidad",
    "subcategory": "Cervezas",
    "price": 1
  },
  {
    "id": "p-plazas-136158",
    "subcategory": "Congelados listos",
    "price": 3,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-136158.jpg",
    "stock": 50,
    "name": "YOGUR GRIEGO DE BANANA Y FRESA CAPRIGURT 135G",
    "category": "refrigerados-congelados",
    "providerPrice": 2.0999999999999996
  },
  {
    "id": "p-plazas-136433",
    "category": "refrigerados-congelados",
    "providerPrice": 2.8,
    "stock": 50,
    "name": "MUSLOS DE POLLO X KG",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-136433.jpg",
    "price": 4,
    "subcategory": "Pollo"
  },
  {
    "id": "p-plazas-136439",
    "category": "frutas-vegetales",
    "providerPrice": 1.4,
    "stock": 50,
    "name": "CEBOLLA CRIOLLA X KG",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-136439.jpg",
    "subcategory": "Verduras y hortalizas",
    "price": 2
  },
  {
    "id": "p-plazas-136583",
    "name": "SANGRIA CAROREÑA VERANO LATA DE 250ML",
    "stock": 50,
    "providerPrice": 0.7,
    "category": "licores",
    "subcategory": "Vinos",
    "price": 1,
    "image": "/Ananas/images/products/scraped/p-plazas-136583.jpg",
    "unit": "1 Unidad"
  },
  {
    "id": "p-plazas-137240",
    "category": "licores",
    "providerPrice": 0.7,
    "stock": 50,
    "name": "CERVEZA SOLERA LATA DE 250ML",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-137240.jpg",
    "subcategory": "Cervezas",
    "price": 1
  },
  {
    "id": "p-plazas-137534",
    "stock": 50,
    "name": "MAYONESA MAVESA 445G",
    "category": "viveres",
    "providerPrice": 2.8,
    "subcategory": "Aceites y salsas",
    "price": 4,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-137534.jpg"
  },
  {
    "id": "p-plazas-137536",
    "stock": 50,
    "name": "MARGARINA MAVESA 500G",
    "category": "viveres",
    "providerPrice": 2.0999999999999996,
    "price": 3,
    "subcategory": "Aceites y salsas",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-137536.jpg"
  },
  {
    "id": "p-plazas-137939",
    "providerPrice": 0.7,
    "category": "viveres",
    "name": "COCA COLA ORIGINAL CON MENOS CALORIAS 2L",
    "stock": 50,
    "image": "/Ananas/images/products/scraped/p-plazas-137939.jpg",
    "unit": "1 Unidad",
    "price": 1,
    "subcategory": "Bebidas"
  },
  {
    "id": "p-plazas-138840",
    "name": "MALTA MALTIN POLAR EN BOTELLA NO RETORNABLE 250ML",
    "stock": 50,
    "providerPrice": 1.393,
    "category": "viveres",
    "price": 1.99,
    "subcategory": "Bebidas",
    "image": "/Ananas/images/products/scraped/p-plazas-138840.jpg",
    "unit": "1 Unidad"
  },
  {
    "id": "p-plazas-139099",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-139099.jpg",
    "price": 5,
    "subcategory": "Granos",
    "category": "viveres",
    "providerPrice": 3.5,
    "stock": 50,
    "name": "MANI MEREY MIX COMETIN 190G"
  },
  {
    "id": "p-plazas-139787",
    "name": "AJONJOLI LA INTEGRAL CRUDO 300G",
    "stock": 50,
    "providerPrice": 2.8,
    "category": "viveres",
    "subcategory": "Granos",
    "price": 4,
    "image": "/Ananas/images/products/scraped/p-plazas-139787.jpg",
    "unit": "1 Unidad"
  },
  {
    "id": "p-plazas-139826",
    "providerPrice": 2.0999999999999996,
    "category": "viveres",
    "name": "AGUA MINERAL PERRIER GAS BOTELLA PLASTICA 500ML",
    "stock": 50,
    "image": "/Ananas/images/products/scraped/p-plazas-139826.jpg",
    "unit": "1 Unidad",
    "subcategory": "Bebidas",
    "price": 3
  },
  {
    "id": "p-plazas-140023",
    "subcategory": "Enlatados",
    "price": 1,
    "image": "/Ananas/images/products/scraped/p-plazas-140023.jpg",
    "unit": "1 Unidad",
    "name": "PUDIN DE FRESA ADDAS 85G",
    "stock": 50,
    "providerPrice": 0.7,
    "category": "viveres"
  },
  {
    "id": "p-plazas-142112",
    "subcategory": "Enlatados",
    "price": 1,
    "image": "/Ananas/images/products/scraped/p-plazas-142112.jpg",
    "unit": "1 Unidad",
    "name": "PAN HOLSUM BLANCO SUPER 420G",
    "stock": 50,
    "providerPrice": 0.7,
    "category": "viveres"
  },
  {
    "id": "p-plazas-142124",
    "subcategory": "Bebidas",
    "price": 2,
    "image": "/Ananas/images/products/scraped/p-plazas-142124.jpg",
    "unit": "1 Unidad",
    "name": "LECHE LIQUIDA DESCREMADA UHT LA PASTOREÑA 1L",
    "stock": 50,
    "providerPrice": 1.4,
    "category": "viveres"
  },
  {
    "id": "p-plazas-142125",
    "name": "LECHE COMPLETA LA PASTOREÑA 1L",
    "stock": 50,
    "providerPrice": 1.4,
    "category": "viveres",
    "subcategory": "Bebidas",
    "price": 2,
    "image": "/Ananas/images/products/scraped/p-plazas-142125.jpg",
    "unit": "1 Unidad"
  },
  {
    "id": "p-plazas-142173",
    "price": 4,
    "subcategory": "Aceites y salsas",
    "image": "/Ananas/images/products/scraped/p-plazas-142173.jpg",
    "unit": "1 Unidad",
    "name": "ACEITE VATEL VEGETAL 1L",
    "stock": 50,
    "providerPrice": 2.8,
    "category": "viveres"
  },
  {
    "id": "p-plazas-142720",
    "stock": 50,
    "name": "ARROZ MARY PREMIUM 900G",
    "category": "viveres",
    "providerPrice": 0.7,
    "price": 1,
    "subcategory": "Arroz y pasta",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-142720.jpg"
  },
  {
    "id": "p-plazas-142747",
    "subcategory": "Arroz y pasta",
    "price": 1,
    "image": "/Ananas/images/products/scraped/p-plazas-142747.jpg",
    "unit": "1 Unidad",
    "name": "ARROZ MARY ESMERALDA 100% 900G",
    "stock": 50,
    "providerPrice": 0.7,
    "category": "viveres"
  },
  {
    "id": "p-plazas-143142",
    "subcategory": "Otros destilados",
    "price": 18,
    "image": "/Ananas/images/products/scraped/p-plazas-143142.jpg",
    "unit": "1 Unidad",
    "name": "SAMBUCA SICILIANA 0,70L",
    "stock": 50,
    "providerPrice": 12.6,
    "category": "licores"
  },
  {
    "id": "p-plazas-144341",
    "category": "refrigerados-congelados",
    "providerPrice": 6.3,
    "stock": 50,
    "name": "CARNE DE RES PARA GUISAR SV",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-144341.jpg",
    "price": 9,
    "subcategory": "Carnes"
  },
  {
    "id": "p-plazas-144342",
    "category": "refrigerados-congelados",
    "providerPrice": 9.1,
    "stock": 50,
    "name": "SOLOMO DE CUERITO SV",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-144342.jpg",
    "subcategory": "Carnes",
    "price": 13
  },
  {
    "id": "p-plazas-144343",
    "stock": 50,
    "name": "CARNE MOLIDA SV",
    "category": "refrigerados-congelados",
    "providerPrice": 6.3,
    "price": 9,
    "subcategory": "Carnes",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-144343.jpg"
  },
  {
    "id": "p-plazas-144618",
    "providerPrice": 0.7,
    "category": "viveres",
    "name": "ARROZ MARY SUPERIOR TIPO I 900G",
    "stock": 50,
    "image": "/Ananas/images/products/scraped/p-plazas-144618.jpg",
    "unit": "1 Unidad",
    "price": 1,
    "subcategory": "Arroz y pasta"
  },
  {
    "id": "p-plazas-144820",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-144820.jpg",
    "price": 14,
    "subcategory": "Farmacia básica",
    "category": "cuidado-personal-salud",
    "providerPrice": 9.799999999999999,
    "stock": 50,
    "name": "TAPAZOL 5MG X 60 TABLETAS"
  },
  {
    "id": "p-plazas-144920",
    "category": "cuidado-personal-salud",
    "providerPrice": 10.5,
    "stock": 50,
    "name": "LETISAN GOTAS 100 MG X 20 ML",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-144920.jpg",
    "subcategory": "Farmacia básica",
    "price": 15
  },
  {
    "id": "p-plazas-145185",
    "name": "PANTOPRAZOL COLMED 40MG X 10 TABLETAS RECUBIERTAS ENTERICAS",
    "stock": 50,
    "providerPrice": 5.6,
    "category": "cuidado-personal-salud",
    "subcategory": "Farmacia básica",
    "price": 8,
    "image": "/Ananas/images/products/scraped/p-plazas-145185.jpg",
    "unit": "1 Unidad"
  },
  {
    "id": "p-plazas-145204",
    "stock": 50,
    "name": "NIFEDIPINA LATTAN MEDIC 20MG X 30 COMPRIMIDOS",
    "category": "cuidado-personal-salud",
    "providerPrice": 4.199999999999999,
    "price": 6,
    "subcategory": "Farmacia básica",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-145204.jpg"
  },
  {
    "id": "p-plazas-145304",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-145304.jpg",
    "subcategory": "Vinos",
    "price": 1,
    "category": "licores",
    "providerPrice": 0.7,
    "stock": 50,
    "name": "SANGRIA CARORENA VERANO BLANCA LATA DE 250ML"
  },
  {
    "id": "p-plazas-146542",
    "providerPrice": 26.599999999999998,
    "category": "refrigerados-congelados",
    "name": "SALMON SOTAVENTO AHUMADO 400G",
    "stock": 50,
    "image": "/Ananas/images/products/scraped/p-plazas-146542.jpg",
    "unit": "1 Unidad",
    "subcategory": "Carnes",
    "price": 38
  },
  {
    "id": "p-plazas-146926",
    "price": 9,
    "subcategory": "Higiene personal",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-146926.jpg",
    "stock": 50,
    "name": "CREMA DENTAL COLGATE NATURAL EXTRA CARBON 140G",
    "category": "cuidado-personal-salud",
    "providerPrice": 6.3
  },
  {
    "id": "p-plazas-146941",
    "price": 5,
    "subcategory": "Higiene personal",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-146941.jpg",
    "stock": 50,
    "name": "TINTE MYSTIC RUBIO CLARO PLATINADO 12.0 TUBO DE 60G",
    "category": "cuidado-personal-salud",
    "providerPrice": 3.5
  },
  {
    "id": "p-plazas-147236",
    "image": "/Ananas/images/products/scraped/p-plazas-147236.jpg",
    "unit": "1 Unidad",
    "price": 18,
    "subcategory": "Vinos",
    "providerPrice": 12.6,
    "category": "licores",
    "name": "VINO ROOT 1 PINOT NOIR 2022 0,75 L",
    "stock": 50
  },
  {
    "id": "p-plazas-147237",
    "category": "licores",
    "providerPrice": 12.6,
    "stock": 50,
    "name": "VINO ROOT 1 CARMENERE 2022 0,75 L",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-147237.jpg",
    "price": 18,
    "subcategory": "Vinos"
  },
  {
    "id": "p-plazas-147238",
    "stock": 50,
    "name": "VINO ROOT1 CABERNET SAUVIGNON 2022 0,75L",
    "category": "licores",
    "providerPrice": 12.6,
    "subcategory": "Vinos",
    "price": 18,
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-147238.jpg"
  },
  {
    "id": "p-plazas-147477",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-147477.jpg",
    "subcategory": "Higiene personal",
    "price": 2,
    "category": "cuidado-personal-salud",
    "providerPrice": 1.4,
    "stock": 50,
    "name": "PAPEL HIGIENICO PLAZAS X 4 ROLLOS 400 HOJAS DOBLES"
  },
  {
    "id": "p-plazas-147483",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-147483.jpg",
    "subcategory": "Congelados listos",
    "price": 5,
    "category": "refrigerados-congelados",
    "providerPrice": 3.5,
    "stock": 50,
    "name": "SANDWICH CACAO3 BROWNIE RELLENO DE MANTECADO 100G"
  },
  {
    "id": "p-plazas-149116",
    "providerPrice": 0.7,
    "category": "cuidado-personal-salud",
    "name": "PAPEL HIG PLAZAS X 4 ROLLOS 200 HOJ DOBL",
    "stock": 50,
    "image": "/Ananas/images/products/scraped/p-plazas-149116.jpg",
    "unit": "1 Unidad",
    "subcategory": "Higiene personal",
    "price": 1
  },
  {
    "id": "p-plazas-149286",
    "image": "/Ananas/images/products/scraped/p-plazas-149286.jpg",
    "unit": "1 Unidad",
    "price": 2,
    "subcategory": "Cervezas",
    "providerPrice": 1.4,
    "category": "licores",
    "name": "CARORENA VERANO MOJITO LATA 355ML",
    "stock": 50
  },
  {
    "id": "p-plazas-149644",
    "providerPrice": 3.5,
    "category": "frutas-vegetales",
    "name": "PIMENTON ROJO X KG",
    "stock": 50,
    "image": "/Ananas/images/products/scraped/p-plazas-149644.jpg",
    "unit": "1 Unidad",
    "subcategory": "Verduras y hortalizas",
    "price": 5
  },
  {
    "id": "p-plazas-150618",
    "image": "/Ananas/images/products/scraped/p-plazas-150618.jpg",
    "unit": "1 Unidad",
    "subcategory": "Cervezas",
    "price": 1,
    "providerPrice": 0.7,
    "category": "licores",
    "name": "CERVEZA CARDENAL LATA 250ML",
    "stock": 50
  },
  {
    "id": "p-plazas-151364",
    "category": "licores",
    "providerPrice": 0.7,
    "stock": 50,
    "name": "CERVEZA CARDENAL ULTRA LATA 250ML",
    "unit": "1 Unidad",
    "image": "/Ananas/images/products/scraped/p-plazas-151364.jpg",
    "subcategory": "Cervezas",
    "price": 1
  },
  {
    "id": "p-plazas-1781546914965984",
    "labels": [
      "Nuevo"
    ],
    "image": "/Ananas/images/products/scraped/p-plazas-1781546914965984.jpg",
    "unit": "1 Un",
    "price": 2.1,
    "subcategory": "Ropa",
    "description": "CLORO KRIS NATURAL 1L de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 1.47,
    "category": "limpieza",
    "warehouseStock": 206,
    "name": "CLORO KRIS NATURAL 1L",
    "stock": 58
  },
  {
    "id": "p-plazas-1781546915080477",
    "labels": [
      "Nuevo"
    ],
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-1781546915080477.jpg",
    "price": 3.33,
    "subcategory": "Ropa",
    "category": "limpieza",
    "description": "DETERG LAS LLAVES FLORAL LIMP ACTIV 900G de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 2.33,
    "warehouseStock": 96,
    "stock": 44,
    "name": "DETERG LAS LLAVES FLORAL LIMP ACTIV 900G"
  },
  {
    "id": "p-plazas-1781546915230773",
    "warehouseStock": 99,
    "name": "DETERGENTE LAS LLAVES FLORAL POLVO 900G",
    "stock": 36,
    "description": "DETERGENTE LAS LLAVES FLORAL POLVO 900G de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 3.04,
    "category": "limpieza",
    "price": 4.34,
    "subcategory": "Ropa",
    "labels": [
      "Nuevo"
    ],
    "image": "/Ananas/images/products/scraped/p-plazas-1781546915230773.jpg",
    "unit": "1 Un"
  },
  {
    "id": "p-plazas-178154691542597",
    "stock": 29,
    "name": "DETERG LAS LLAVES FLORAL LIMP ACTIV400G",
    "warehouseStock": 136,
    "category": "limpieza",
    "description": "DETERG LAS LLAVES FLORAL LIMP ACTIV400G de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 1.08,
    "subcategory": "Ropa",
    "price": 1.55,
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-178154691542597.jpg",
    "labels": [
      "Nuevo"
    ]
  },
  {
    "id": "p-plazas-1781546915471808",
    "labels": [
      "Nuevo"
    ],
    "image": "/Ananas/images/products/scraped/p-plazas-1781546915471808.jpg",
    "unit": "1 Un",
    "price": 1.19,
    "subcategory": "Ropa",
    "description": "JABON EN PANELA LAS LLAVES FRAGANCIA DE BEBE 160G de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 0.83,
    "category": "limpieza",
    "warehouseStock": 66,
    "name": "JABON EN PANELA LAS LLAVES FRAGANCIA DE BEBE 160G",
    "stock": 44
  },
  {
    "id": "p-plazas-1781546927632553",
    "subcategory": "Cocina",
    "price": 4,
    "image": "/Ananas/images/products/scraped/p-plazas-1781546927632553.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "name": "LAVAPLATOS LIQ KRIS 800 CC",
    "stock": 21,
    "warehouseStock": 115,
    "description": "LAVAPLATOS LIQ KRIS 800 CC de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 2.8,
    "category": "limpieza"
  },
  {
    "id": "p-plazas-178154692767962",
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-178154692767962.jpg",
    "labels": [
      "Nuevo"
    ],
    "subcategory": "Cocina",
    "price": 5.3,
    "category": "limpieza",
    "description": "LAVAPLATOS LIQUIDO PLAZAS 800ML de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 3.71,
    "stock": 44,
    "name": "LAVAPLATOS LIQUIDO PLAZAS 800ML",
    "warehouseStock": 154
  },
  {
    "id": "p-plazas-1781546927726900",
    "price": 6.15,
    "subcategory": "Cocina",
    "labels": [
      "Nuevo"
    ],
    "image": "/Ananas/images/products/scraped/p-plazas-1781546927726900.jpg",
    "unit": "1 Un",
    "warehouseStock": 177,
    "name": "LAVATODO FIT MANZANA 800CC",
    "stock": 41,
    "providerPrice": 4.3,
    "description": "LAVATODO FIT MANZANA 800CC de alta calidad, garantizado por Automercados Plazas.",
    "category": "limpieza"
  },
  {
    "id": "p-plazas-1781546927807565",
    "description": "LAVATODO FIT ULTRA OCEANICO 800CC de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 4.3,
    "category": "limpieza",
    "warehouseStock": 241,
    "name": "LAVATODO FIT ULTRA OCEANICO 800CC",
    "stock": 21,
    "labels": [
      "Nuevo"
    ],
    "image": "/Ananas/images/products/scraped/p-plazas-1781546927807565.jpg",
    "unit": "1 Un",
    "price": 6.15,
    "subcategory": "Cocina"
  },
  {
    "id": "p-plazas-1781546927890789",
    "category": "limpieza",
    "description": "LAVAPLATOS LIQUIDO BRISOL MULTIACCION 825ML de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 6.61,
    "stock": 11,
    "name": "LAVAPLATOS LIQUIDO BRISOL MULTIACCION 825ML",
    "warehouseStock": 230,
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-1781546927890789.jpg",
    "labels": [
      "Nuevo"
    ],
    "subcategory": "Cocina",
    "price": 9.44
  },
  {
    "id": "p-plazas-1781546937332485",
    "labels": [
      "Nuevo"
    ],
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-1781546937332485.jpg",
    "price": 1.15,
    "subcategory": "Accesorios de limpieza",
    "category": "limpieza",
    "providerPrice": 0.8,
    "description": "ESPONJA DE ACERO INOXIDABLE IZY CLEAN de alta calidad, garantizado por Automercados Plazas.",
    "warehouseStock": 175,
    "stock": 28,
    "name": "ESPONJA DE ACERO INOXIDABLE IZY CLEAN"
  },
  {
    "id": "p-plazas-1781546937418292",
    "subcategory": "Accesorios de limpieza",
    "price": 1.19,
    "image": "/Ananas/images/products/scraped/p-plazas-1781546937418292.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "name": "ESPONJA DOBLE USO IZY CLEAN 1UN",
    "stock": 47,
    "warehouseStock": 180,
    "description": "ESPONJA DOBLE USO IZY CLEAN 1UN de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 0.83,
    "category": "limpieza"
  },
  {
    "id": "p-plazas-1781546937578898",
    "category": "limpieza",
    "providerPrice": 1.3,
    "description": "ESPONJA MULTIUSO IZY CLEAN de alta calidad, garantizado por Automercados Plazas.",
    "stock": 30,
    "name": "ESPONJA MULTIUSO IZY CLEAN",
    "warehouseStock": 235,
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-1781546937578898.jpg",
    "labels": [
      "Nuevo"
    ],
    "subcategory": "Accesorios de limpieza",
    "price": 1.86
  },
  {
    "id": "p-plazas-1781546937737882",
    "warehouseStock": 162,
    "name": "ESPONJA IZY CLEAN SALVA UÑAS",
    "stock": 29,
    "providerPrice": 1.18,
    "description": "ESPONJA IZY CLEAN SALVA UÑAS de alta calidad, garantizado por Automercados Plazas.",
    "category": "limpieza",
    "price": 1.69,
    "subcategory": "Accesorios de limpieza",
    "labels": [
      "Nuevo"
    ],
    "image": "/Ananas/images/products/scraped/p-plazas-1781546937737882.jpg",
    "unit": "1 Un"
  },
  {
    "id": "p-plazas-1781546937824736",
    "category": "limpieza",
    "description": "ESPONJA JABONOSA IZY CLEAN 5UN de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 2.21,
    "stock": 59,
    "name": "ESPONJA JABONOSA IZY CLEAN 5UN",
    "warehouseStock": 220,
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-1781546937824736.jpg",
    "labels": [
      "Nuevo"
    ],
    "subcategory": "Accesorios de limpieza",
    "price": 3.16
  },
  {
    "id": "p-plazas-1781546946410806",
    "price": 10.52,
    "subcategory": "Rones",
    "labels": [
      "Nuevo"
    ],
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-1781546946410806.jpg",
    "warehouseStock": 153,
    "stock": 34,
    "name": "RON AÑEJO GRAN RESERVA 0,70L",
    "category": "licores",
    "providerPrice": 7.36,
    "description": "RON AÑEJO GRAN RESERVA 0,70L de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-1781546946458111",
    "labels": [
      "Nuevo"
    ],
    "image": "/Ananas/images/products/scraped/p-plazas-1781546946458111.jpg",
    "unit": "1 Un",
    "price": 5.14,
    "subcategory": "Rones",
    "providerPrice": 3.6,
    "description": "RON SANTA TERESA SUPERIOR 35 GL 1L de alta calidad, garantizado por Automercados Plazas.",
    "category": "licores",
    "warehouseStock": 236,
    "name": "RON SANTA TERESA SUPERIOR 35 GL 1L",
    "stock": 30
  },
  {
    "id": "p-plazas-1781546946505534",
    "price": 6,
    "subcategory": "Rones",
    "labels": [
      "Nuevo"
    ],
    "image": "/Ananas/images/products/scraped/p-plazas-1781546946505534.jpg",
    "unit": "1 Un",
    "warehouseStock": 82,
    "name": "RON CARTA ROJA 1L",
    "stock": 43,
    "description": "RON CARTA ROJA 1L de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 4.2,
    "category": "licores"
  },
  {
    "id": "p-plazas-1781546946552155",
    "category": "licores",
    "providerPrice": 4.12,
    "description": "LICOR SECO DE RON CINCO ESTRELLAS 1L de alta calidad, garantizado por Automercados Plazas.",
    "warehouseStock": 221,
    "stock": 57,
    "name": "LICOR SECO DE RON CINCO ESTRELLAS 1L",
    "labels": [
      "Nuevo"
    ],
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-1781546946552155.jpg",
    "price": 5.89,
    "subcategory": "Rones"
  },
  {
    "id": "p-plazas-1781546954346862",
    "labels": [
      "Nuevo"
    ],
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-1781546954346862.jpg",
    "price": 23.49,
    "subcategory": "Whisky",
    "category": "licores",
    "providerPrice": 16.44,
    "description": "WHISKY BLACK & WHITE 1L de alta calidad, garantizado por Automercados Plazas.",
    "warehouseStock": 149,
    "stock": 50,
    "name": "WHISKY BLACK & WHITE 1L"
  },
  {
    "id": "p-plazas-1781546954392650",
    "price": 19.51,
    "subcategory": "Whisky",
    "labels": [
      "Nuevo"
    ],
    "image": "/Ananas/images/products/scraped/p-plazas-1781546954392650.jpg",
    "unit": "1 Un",
    "warehouseStock": 117,
    "name": "WHISKY GRANTS STAND FOR TRIPLE WOOD 1L",
    "stock": 25,
    "description": "WHISKY GRANTS STAND FOR TRIPLE WOOD 1L de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 13.66,
    "category": "licores"
  },
  {
    "id": "p-plazas-1781546954438327",
    "description": "WHISKY OLD PARR 12 AÑOS 0,75L de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 30.49,
    "category": "licores",
    "name": "WHISKY OLD PARR 12 AÑOS 0,75L",
    "stock": 52,
    "warehouseStock": 72,
    "image": "/Ananas/images/products/scraped/p-plazas-1781546954438327.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "subcategory": "Whisky",
    "price": 43.56
  },
  {
    "id": "p-plazas-1781546954482535",
    "warehouseStock": 198,
    "stock": 13,
    "name": "WHISKY BUCHANANS DE LUXE 0,70 L",
    "category": "licores",
    "description": "WHISKY BUCHANANS DE LUXE 0,70 L de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 34.62,
    "price": 49.46,
    "subcategory": "Whisky",
    "labels": [
      "Nuevo"
    ],
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-1781546954482535.jpg"
  },
  {
    "id": "p-plazas-1781546954528998",
    "labels": [
      "Nuevo"
    ],
    "unit": "1 Un",
    "image": "/Ananas/images/products/scraped/p-plazas-1781546954528998.jpg",
    "price": 18.57,
    "subcategory": "Whisky",
    "category": "licores",
    "description": "WHISKY WHITE LABEL 0,75L de alta calidad, garantizado por Automercados Plazas.",
    "providerPrice": 13,
    "warehouseStock": 111,
    "stock": 40,
    "name": "WHISKY WHITE LABEL 0,75L"
  },
  {
    "id": "p-plazas-filled-1781546967313907",
    "name": "CARNE MOLIDA SV",
    "price": 9.95,
    "category": "refrigerados-congelados",
    "subcategory": "Quesos",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546967313907.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 28,
    "warehouseStock": 69,
    "providerPrice": 6.96,
    "description": "CARNE MOLIDA SV de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546967445375",
    "name": "PULPA NEGRA SV",
    "price": 12.45,
    "category": "refrigerados-congelados",
    "subcategory": "Quesos",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546967445375.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 12,
    "warehouseStock": 89,
    "providerPrice": 8.71,
    "description": "PULPA NEGRA SV de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546967498819",
    "name": "PECHUGA DE POLLO SIN HUESO X KG",
    "price": 8.45,
    "category": "refrigerados-congelados",
    "subcategory": "Quesos",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546967498819.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 38,
    "warehouseStock": 216,
    "providerPrice": 5.91,
    "description": "PECHUGA DE POLLO SIN HUESO X KG de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546967549861",
    "name": "CARNE PARA DESMECHAR SV",
    "price": 9.95,
    "category": "refrigerados-congelados",
    "subcategory": "Quesos",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546967549861.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 35,
    "warehouseStock": 108,
    "providerPrice": 6.96,
    "description": "CARNE PARA DESMECHAR SV de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546967603261",
    "name": "HUEVOS CARTON X 30UN",
    "price": 7.45,
    "category": "refrigerados-congelados",
    "subcategory": "Quesos",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546967603261.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 24,
    "warehouseStock": 195,
    "providerPrice": 5.21,
    "description": "HUEVOS CARTON X 30UN de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546975569720",
    "name": "PAPEL HIGIENICO PLAZAS X 4 ROLLOS 400 HOJAS DOBLES",
    "price": 2.39,
    "category": "cuidado-personal-salud",
    "subcategory": "Cuidado corporal",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546975569720.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 55,
    "warehouseStock": 186,
    "providerPrice": 1.67,
    "description": "PAPEL HIGIENICO PLAZAS X 4 ROLLOS 400 HOJAS DOBLES de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546975620407",
    "name": "CREMA DENTAL COLGATE TRIPLE ACCION 75ML",
    "price": 3.18,
    "category": "cuidado-personal-salud",
    "subcategory": "Cuidado corporal",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546975620407.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 35,
    "warehouseStock": 137,
    "providerPrice": 2.23,
    "description": "CREMA DENTAL COLGATE TRIPLE ACCION 75ML de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546975702116",
    "name": "PAPEL HIG PLAZAS X 4 ROLLOS 200 HOJ DOBL",
    "price": 1.45,
    "category": "cuidado-personal-salud",
    "subcategory": "Cuidado corporal",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546975702116.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 25,
    "warehouseStock": 242,
    "providerPrice": 1.01,
    "description": "PAPEL HIG PLAZAS X 4 ROLLOS 200 HOJ DOBL de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546975959807",
    "name": "CREMA DENTAL COLGATE TRIPLE ACCION 100ML",
    "price": 4.14,
    "category": "cuidado-personal-salud",
    "subcategory": "Cuidado corporal",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546975959807.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 41,
    "warehouseStock": 174,
    "providerPrice": 2.9,
    "description": "CREMA DENTAL COLGATE TRIPLE ACCION 100ML de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546976298466",
    "name": "JABON EN BARRA EVERY NIGHT BIO NUTRIENTES AVENA 110G",
    "price": 2.09,
    "category": "cuidado-personal-salud",
    "subcategory": "Cuidado corporal",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546976298466.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 56,
    "warehouseStock": 178,
    "providerPrice": 1.46,
    "description": "JABON EN BARRA EVERY NIGHT BIO NUTRIENTES AVENA 110G de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546985496739",
    "name": "CLORO KRIS NATURAL 1L",
    "price": 2.1,
    "category": "limpieza",
    "subcategory": "Baño",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546985496739.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 55,
    "warehouseStock": 63,
    "providerPrice": 1.47,
    "description": "CLORO KRIS NATURAL 1L de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546985782834",
    "name": "DETERG LAS LLAVES FLORAL LIMP ACTIV 900G",
    "price": 3.33,
    "category": "limpieza",
    "subcategory": "Baño",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546985782834.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 14,
    "warehouseStock": 120,
    "providerPrice": 2.33,
    "description": "DETERG LAS LLAVES FLORAL LIMP ACTIV 900G de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546986101952",
    "name": "DETERGENTE LAS LLAVES FLORAL POLVO 900G",
    "price": 4.34,
    "category": "limpieza",
    "subcategory": "Baño",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546986101952.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 27,
    "warehouseStock": 91,
    "providerPrice": 3.04,
    "description": "DETERGENTE LAS LLAVES FLORAL POLVO 900G de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546986198600",
    "name": "DETERG LAS LLAVES FLORAL LIMP ACTIV400G",
    "price": 1.55,
    "category": "limpieza",
    "subcategory": "Baño",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546986198600.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 13,
    "warehouseStock": 137,
    "providerPrice": 1.08,
    "description": "DETERG LAS LLAVES FLORAL LIMP ACTIV400G de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546986252879",
    "name": "JABON EN PANELA LAS LLAVES FRAGANCIA DE BEBE 160G",
    "price": 1.19,
    "category": "limpieza",
    "subcategory": "Baño",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546986252879.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 51,
    "warehouseStock": 247,
    "providerPrice": 0.83,
    "description": "JABON EN PANELA LAS LLAVES FRAGANCIA DE BEBE 160G de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546986326711",
    "name": "LAVAPLATOS LIQ KRIS 800 CC",
    "price": 4,
    "category": "limpieza",
    "subcategory": "Desinfección",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546986326711.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 26,
    "warehouseStock": 196,
    "providerPrice": 2.8,
    "description": "LAVAPLATOS LIQ KRIS 800 CC de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-178154698637976",
    "name": "DETERG LAS LLAVES CITRICA LIMP ACTIV400G",
    "price": 1.55,
    "category": "limpieza",
    "subcategory": "Desinfección",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-178154698637976.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 35,
    "warehouseStock": 85,
    "providerPrice": 1.08,
    "description": "DETERG LAS LLAVES CITRICA LIMP ACTIV400G de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546986429928",
    "name": "DETERGENTE ALIVE CON SUAVIZANTE 1KG",
    "price": 4.45,
    "category": "limpieza",
    "subcategory": "Desinfección",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546986429928.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 42,
    "warehouseStock": 200,
    "providerPrice": 3.11,
    "description": "DETERGENTE ALIVE CON SUAVIZANTE 1KG de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546986477453",
    "name": "CLORO JABONOSO PLAZAS 1L",
    "price": 2.05,
    "category": "limpieza",
    "subcategory": "Desinfección",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546986477453.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 50,
    "warehouseStock": 89,
    "providerPrice": 1.43,
    "description": "CLORO JABONOSO PLAZAS 1L de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546986525202",
    "name": "BOLSAS PLASTICAS SAMANTA 15LT X 8UN",
    "price": 2.29,
    "category": "limpieza",
    "subcategory": "Desinfección",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546986525202.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 52,
    "warehouseStock": 150,
    "providerPrice": 1.6,
    "description": "BOLSAS PLASTICAS SAMANTA 15LT X 8UN de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-17815469866929",
    "name": "AMBIENT GLADE AUT SPORT NITRO AP 7CC 60D",
    "price": 8.29,
    "category": "limpieza",
    "subcategory": "Accesorios de limpieza",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-17815469866929.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 47,
    "warehouseStock": 89,
    "providerPrice": 5.8,
    "description": "AMBIENT GLADE AUT SPORT NITRO AP 7CC 60D de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546986747539",
    "name": "ALMIDON FAULTLESS HEAVY LIMON EXTRA 567G",
    "price": 7.74,
    "category": "limpieza",
    "subcategory": "Accesorios de limpieza",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546986747539.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 38,
    "warehouseStock": 134,
    "providerPrice": 5.42,
    "description": "ALMIDON FAULTLESS HEAVY LIMON EXTRA 567G de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546986814903",
    "name": "BOLSA SAMANTA PLAST 30LT X8U X25P",
    "price": 2.48,
    "category": "limpieza",
    "subcategory": "Accesorios de limpieza",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546986814903.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 56,
    "warehouseStock": 116,
    "providerPrice": 1.74,
    "description": "BOLSA SAMANTA PLAST 30LT X8U X25P de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546988258106",
    "name": "CERVEZA POLAR PILSEN SLEEK LATA DE 355ML",
    "price": 1.33,
    "category": "licores",
    "subcategory": "Rones",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546988258106.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 34,
    "warehouseStock": 198,
    "providerPrice": 0.93,
    "description": "CERVEZA POLAR PILSEN SLEEK LATA DE 355ML de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-178154698830450",
    "name": "CERVEZA POLAR PILSEN LATA DE 250ML",
    "price": 1.14,
    "category": "licores",
    "subcategory": "Rones",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-178154698830450.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 43,
    "warehouseStock": 171,
    "providerPrice": 0.8,
    "description": "CERVEZA POLAR PILSEN LATA DE 250ML de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546988352985",
    "name": "CERVEZA SOLERA LATA DE 250ML",
    "price": 1.39,
    "category": "licores",
    "subcategory": "Rones",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546988352985.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 22,
    "warehouseStock": 167,
    "providerPrice": 0.97,
    "description": "CERVEZA SOLERA LATA DE 250ML de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-17815469883967",
    "name": "HIELO EN BOLSA GRANDE POISO",
    "price": 2.15,
    "category": "licores",
    "subcategory": "Rones",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-17815469883967.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 33,
    "warehouseStock": 51,
    "providerPrice": 1.5,
    "description": "HIELO EN BOLSA GRANDE POISO de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-178154698844221",
    "name": "CERVEZA CARDENAL LATA 250ML",
    "price": 1.07,
    "category": "licores",
    "subcategory": "Rones",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-178154698844221.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 59,
    "warehouseStock": 242,
    "providerPrice": 0.75,
    "description": "CERVEZA CARDENAL LATA 250ML de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546988487655",
    "name": "SANGRIA CAROREÑA VERANO LATA DE 250ML",
    "price": 1.66,
    "category": "licores",
    "subcategory": "Whisky",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546988487655.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 40,
    "warehouseStock": 75,
    "providerPrice": 1.16,
    "description": "SANGRIA CAROREÑA VERANO LATA DE 250ML de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546988535551",
    "name": "SANGRIA CARORENA VERANO BLANCA LATA DE 250ML",
    "price": 1.66,
    "category": "licores",
    "subcategory": "Whisky",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546988535551.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 21,
    "warehouseStock": 246,
    "providerPrice": 1.16,
    "description": "SANGRIA CARORENA VERANO BLANCA LATA DE 250ML de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546988581650",
    "name": "CERVEZA CARDENAL ULTRA LATA 250ML",
    "price": 1.07,
    "category": "licores",
    "subcategory": "Whisky",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546988581650.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 54,
    "warehouseStock": 195,
    "providerPrice": 0.75,
    "description": "CERVEZA CARDENAL ULTRA LATA 250ML de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546988630436",
    "name": "CARORENA VERANO MOJITO LATA 355ML",
    "price": 2.02,
    "category": "licores",
    "subcategory": "Whisky",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546988630436.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 26,
    "warehouseStock": 75,
    "providerPrice": 1.41,
    "description": "CARORENA VERANO MOJITO LATA 355ML de alta calidad, garantizado por Automercados Plazas."
  },
  {
    "id": "p-plazas-filled-1781546988692652",
    "name": "SAMBUCA SICILIANA 0,70L",
    "price": 18.76,
    "category": "licores",
    "subcategory": "Whisky",
    "image": "/Ananas/images/products/scraped/p-plazas-filled-1781546988692652.jpg",
    "unit": "1 Un",
    "labels": [
      "Nuevo"
    ],
    "stock": 39,
    "warehouseStock": 244,
    "providerPrice": 13.13,
    "description": "SAMBUCA SICILIANA 0,70L de alta calidad, garantizado por Automercados Plazas."
  }
];
