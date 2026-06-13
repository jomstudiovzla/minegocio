import csv
import random

def get_img(key):
    # Now all images are local!
    return f"/images/products/{key}.png"

categories = [
  {
    'id': 'frutas-vegetales',
    'subcategories': ['Enteras', 'Picadas', 'Jugos', 'Frescos', 'Empacados'],
    'products': [
      {'name': 'Tomates Perita', 'sub': 'Frescos', 'unit': '1 Kg', 'price': 3.49, 'img': get_img('tomates_perita')},
      {'name': 'Cebolla Blanca', 'sub': 'Frescos', 'unit': '1 Kg', 'price': 2.10, 'img': get_img('cebolla_blanca')},
      {'name': 'Papa Lavada', 'sub': 'Frescos', 'unit': '1 Kg', 'price': 1.80, 'img': get_img('papa_lavada')},
      {'name': 'Zanahoria', 'sub': 'Frescos', 'unit': '1 Kg', 'price': 1.50, 'img': get_img('zanahoria')},
      {'name': 'Pimenton Verde', 'sub': 'Frescos', 'unit': '1 Kg', 'price': 4.20, 'img': get_img('pimenton_verde')},
      {'name': 'Lechuga Romana', 'sub': 'Frescos', 'unit': '1 Unidad', 'price': 1.20, 'img': get_img('lechuga_romana')},
      {'name': 'Platano Maduro', 'sub': 'Enteras', 'unit': '1 Kg', 'price': 1.90, 'img': get_img('platano_maduro')},
      {'name': 'Cambur', 'sub': 'Enteras', 'unit': '1 Kg', 'price': 1.10, 'img': get_img('cambur')},
      {'name': 'Manzana Gala', 'sub': 'Enteras', 'unit': '1 Kg', 'price': 5.50, 'img': get_img('manzana_gala')},
      {'name': 'Naranja para Jugo', 'sub': 'Enteras', 'unit': '1 Kg', 'price': 1.60, 'img': get_img('naranja')},
      {'name': 'Lechosa', 'sub': 'Enteras', 'unit': '1 Kg', 'price': 1.75, 'img': get_img('lechosa')},
      {'name': 'Limones', 'sub': 'Frescos', 'unit': '1 Kg', 'price': 4.19, 'img': get_img('limones')},
      {'name': 'Pina', 'sub': 'Enteras', 'unit': '1 Unidad', 'price': 2.55, 'img': get_img('pina')},
      {'name': 'Aguacate', 'sub': 'Frescos', 'unit': '1 Kg', 'price': 5.20, 'img': get_img('aguacate')},
      {'name': 'Frutas Picadas Mixtas', 'sub': 'Picadas', 'unit': '500g', 'price': 3.00, 'img': get_img('frutas_picadas')},
    ]
  },
  {
    'id': 'refrigerados-congelados',
    'subcategories': ['Carnes', 'Pollos', 'Embutidos'],
    'products': [
      {'name': 'Carne Molida SV', 'sub': 'Carnes', 'unit': '1 Kg', 'price': 9.95, 'img': get_img('carne_molida')},
      {'name': 'Bistec de Ganso', 'sub': 'Carnes', 'unit': '1 Kg', 'price': 11.50, 'img': get_img('bistec_ganso')},
      {'name': 'Costilla de Res', 'sub': 'Carnes', 'unit': '1 Kg', 'price': 7.80, 'img': get_img('costilla_res')},
      {'name': 'Pechuga de Pollo', 'sub': 'Pollos', 'unit': '1 Kg', 'price': 8.45, 'img': get_img('pechuga_pollo')},
      {'name': 'Pollo Entero', 'sub': 'Pollos', 'unit': '1 Kg', 'price': 4.50, 'img': get_img('pollo_entero')},
      {'name': 'Muslos de Pollo', 'sub': 'Pollos', 'unit': '1 Kg', 'price': 5.20, 'img': get_img('muslos_pollo')},
      {'name': 'Alitas de Pollo', 'sub': 'Pollos', 'unit': '1 Kg', 'price': 6.00, 'img': get_img('alitas_pollo')},
      {'name': 'Jamon Cocido Plumrose', 'sub': 'Embutidos', 'unit': '500g', 'price': 6.50, 'img': get_img('jamon_cocido')},
      {'name': 'Queso Amarillo Paisa', 'sub': 'Embutidos', 'unit': '500g', 'price': 7.20, 'img': get_img('queso_amarillo')},
      {'name': 'Queso Blanco Duro', 'sub': 'Embutidos', 'unit': '1 Kg', 'price': 6.80, 'img': get_img('queso_blanco')},
      {'name': 'Salchichas Plumrose', 'sub': 'Embutidos', 'unit': '1 Paquete', 'price': 4.50, 'img': get_img('salchichas')},
      {'name': 'Tocino Ahumado', 'sub': 'Embutidos', 'unit': '250g', 'price': 4.80, 'img': get_img('tocino')},
      {'name': 'Chorizo Carupanero', 'sub': 'Embutidos', 'unit': '500g', 'price': 5.50, 'img': get_img('chorizo')},
      {'name': 'Queso Guayanes', 'sub': 'Embutidos', 'unit': '500g', 'price': 4.50, 'img': get_img('queso_guayanes')},
      {'name': 'Nuggets Congelados', 'sub': 'Pollos', 'unit': '1 Paquete', 'price': 5.99, 'img': get_img('nuggets')},
    ]
  },
  {
    'id': 'viveres',
    'subcategories': ['Arroz', 'Pasta', 'Enlatados', 'Refrescos'],
    'products': [
      {'name': 'Coca Cola Original', 'sub': 'Refrescos', 'unit': '2 L', 'price': 2.50, 'img': get_img('coca_cola')},
      {'name': 'Pepsi Cola', 'sub': 'Refrescos', 'unit': '2 L', 'price': 2.20, 'img': get_img('pepsi')},
      {'name': 'Chinotto', 'sub': 'Refrescos', 'unit': '2 L', 'price': 2.20, 'img': get_img('chinotto')},
      {'name': 'Frescolita', 'sub': 'Refrescos', 'unit': '2 L', 'price': 2.20, 'img': get_img('frescolita')},
      {'name': 'Maltin Polar', 'sub': 'Refrescos', 'unit': '1.5 L', 'price': 2.00, 'img': get_img('maltin')},
      {'name': 'Arroz Blanco Mary', 'sub': 'Arroz', 'unit': '1 Kg', 'price': 1.20, 'img': get_img('arroz_blanco')},
      {'name': 'Arroz Primor', 'sub': 'Arroz', 'unit': '1 Kg', 'price': 1.30, 'img': get_img('arroz_primor')},
      {'name': 'Pasta Capri Espagueti', 'sub': 'Pasta', 'unit': '1 Kg', 'price': 1.60, 'img': get_img('pasta_capri')},
      {'name': 'Harina PAN', 'sub': 'Arroz', 'unit': '1 Kg', 'price': 1.15, 'img': get_img('harina_pan')},
      {'name': 'Caraotas Negras Mary', 'sub': 'Enlatados', 'unit': '500g', 'price': 1.80, 'img': get_img('caraotas')},
      {'name': 'Lentejas', 'sub': 'Enlatados', 'unit': '500g', 'price': 2.10, 'img': get_img('lentejas')},
      {'name': 'Atun Margarita en Aceite', 'sub': 'Enlatados', 'unit': '140g', 'price': 2.50, 'img': get_img('atun_aceite')},
      {'name': 'Atun Margarita en Agua', 'sub': 'Enlatados', 'unit': '140g', 'price': 2.50, 'img': get_img('atun_agua')},
      {'name': 'Maiz Dulce en Lata', 'sub': 'Enlatados', 'unit': '300g', 'price': 1.50, 'img': get_img('maiz_lata')},
      {'name': 'Aceite de Maiz Mazeite', 'sub': 'Arroz', 'unit': '1 Litro', 'price': 3.50, 'img': get_img('aceite_maiz')},
    ]
  },
  {
    'id': 'cuidado-personal-salud',
    'subcategories': ['Aseo', 'Farmacia'],
    'products': [
      {'name': 'Jabon Protex', 'sub': 'Aseo', 'unit': '3 Unidades', 'price': 3.50, 'img': get_img('jabon_protex')},
      {'name': 'Desodorante Dove', 'sub': 'Aseo', 'unit': '50ml', 'price': 4.20, 'img': get_img('desodorante')},
      {'name': 'Crema Dental Colgate', 'sub': 'Aseo', 'unit': '100g', 'price': 2.80, 'img': get_img('crema_dental')},
      {'name': 'Shampoo Pantene', 'sub': 'Aseo', 'unit': '400ml', 'price': 6.50, 'img': get_img('shampoo')},
      {'name': 'Papel Higienico Scott', 'sub': 'Aseo', 'unit': '4 Rollos', 'price': 3.80, 'img': get_img('papel_higienico')},
      {'name': 'Toallas Sanitarias Always', 'sub': 'Aseo', 'unit': '10 Unidades', 'price': 2.90, 'img': get_img('toallas_sanitarias')},
      {'name': 'Maquina de Afeitar Gillette', 'sub': 'Aseo', 'unit': '2 Unidades', 'price': 3.00, 'img': get_img('maquina_afeitar')},
      {'name': 'Crema Corporal Lubriderm', 'sub': 'Aseo', 'unit': '400ml', 'price': 8.50, 'img': get_img('crema_corporal')},
      {'name': 'Algodon en Motas', 'sub': 'Farmacia', 'unit': '100g', 'price': 1.50, 'img': get_img('algodon')},
      {'name': 'Hisopos Q-Tips', 'sub': 'Farmacia', 'unit': '100 Unidades', 'price': 1.80, 'img': get_img('hisopos')},
      {'name': 'Alcohol Isopropilico', 'sub': 'Farmacia', 'unit': '250ml', 'price': 2.20, 'img': get_img('alcohol')},
      {'name': 'Agua Oxigenada', 'sub': 'Farmacia', 'unit': '100ml', 'price': 1.00, 'img': get_img('agua_oxigenada')},
      {'name': 'Curitas Band-Aid', 'sub': 'Farmacia', 'unit': 'Caja', 'price': 3.00, 'img': get_img('curitas')},
    ]
  },
  {
    'id': 'limpieza',
    'subcategories': ['Detergentes', 'Accesorios'],
    'products': [
      {'name': 'Detergente Liquido Ariel', 'sub': 'Detergentes', 'unit': '2 L', 'price': 8.50, 'img': get_img('detergente_liquido')},
      {'name': 'Detergente en Polvo ACE', 'sub': 'Detergentes', 'unit': '1 Kg', 'price': 4.50, 'img': get_img('detergente_polvo')},
      {'name': 'Suavizante Suavitel', 'sub': 'Detergentes', 'unit': '1 L', 'price': 3.80, 'img': get_img('suavizante')},
      {'name': 'Lavaplatos Liquido Las Llaves', 'sub': 'Detergentes', 'unit': '500ml', 'price': 2.50, 'img': get_img('lavaplatos_liquido')},
      {'name': 'Lavaplatos en Crema Axion', 'sub': 'Detergentes', 'unit': '250g', 'price': 1.80, 'img': get_img('lavaplatos_crema')},
      {'name': 'Cloro Nevex', 'sub': 'Detergentes', 'unit': '1 L', 'price': 1.50, 'img': get_img('cloro')},
      {'name': 'Desinfectante Mistolin', 'sub': 'Detergentes', 'unit': '1 L', 'price': 2.20, 'img': get_img('desinfectante')},
      {'name': 'Esponja Scotch-Brite', 'sub': 'Accesorios', 'unit': '3 Unidades', 'price': 3.50, 'img': get_img('esponja')},
      {'name': 'Mopa de Algodon', 'sub': 'Accesorios', 'unit': '1 Unidad', 'price': 5.00, 'img': get_img('mopa')},
      {'name': 'Escoba con Mango', 'sub': 'Accesorios', 'unit': '1 Unidad', 'price': 4.50, 'img': get_img('escoba')},
      {'name': 'Coleto Tradicional', 'sub': 'Accesorios', 'unit': '1 Unidad', 'price': 2.00, 'img': get_img('coleto')},
      {'name': 'Bolsas de Basura Grandes', 'sub': 'Accesorios', 'unit': '10 Unidades', 'price': 3.20, 'img': get_img('bolsas_basura')},
    ]
  },
  {
    'id': 'licores',
    'subcategories': ['Vinos', 'Cervezas', 'Destilados'],
    'products': [
      {'name': 'Cerveza Polar Pilsen', 'sub': 'Cervezas', 'unit': 'Caja 36', 'price': 25.00, 'img': get_img('cerveza_pilsen')},
      {'name': 'Cerveza Polar Light', 'sub': 'Cervezas', 'unit': 'Caja 36', 'price': 25.00, 'img': get_img('cerveza_light')},
      {'name': 'Cerveza Solera Verde', 'sub': 'Cervezas', 'unit': '6 Pack', 'price': 6.50, 'img': get_img('cerveza_solera')},
      {'name': 'Cerveza Zulia', 'sub': 'Cervezas', 'unit': '6 Pack', 'price': 6.00, 'img': get_img('cerveza_zulia')},
      {'name': 'Ron Santa Teresa Linaje', 'sub': 'Destilados', 'unit': '750ml', 'price': 18.00, 'img': get_img('ron_teresa')},
      {'name': 'Ron Cacique Anejo', 'sub': 'Destilados', 'unit': '750ml', 'price': 12.00, 'img': get_img('ron_cacique')},
      {'name': 'Ron Pampero Aniversario', 'sub': 'Destilados', 'unit': '750ml', 'price': 22.00, 'img': get_img('ron_pampero')},
      {'name': 'Ron Diplomatico Reserva Exclusiva', 'sub': 'Destilados', 'unit': '750ml', 'price': 35.00, 'img': get_img('ron_diplomatico')},
      {'name': 'Whisky Buchanan\'s 12 Anos', 'sub': 'Destilados', 'unit': '750ml', 'price': 42.00, 'img': get_img('whisky_buchanans')},
      {'name': 'Whisky Old Parr 12 Anos', 'sub': 'Destilados', 'unit': '750ml', 'price': 38.00, 'img': get_img('whisky_parr')},
      {'name': 'Vodka Gordon\'s', 'sub': 'Destilados', 'unit': '750ml', 'price': 10.00, 'img': get_img('vodka')},
      {'name': 'Vino Tinto Casillero del Diablo', 'sub': 'Vinos', 'unit': '750ml', 'price': 12.50, 'img': get_img('vino_tinto')},
      {'name': 'Vino Blanco Santa Helena', 'sub': 'Vinos', 'unit': '750ml', 'price': 8.50, 'img': get_img('vino_blanco')},
    ]
  }
]

import json
json_data = json.dumps(categories, indent=2)

ts_content = f"""export interface Product {{
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
}}

export interface Category {{
  id: string;
  name: string;
  icon: string;
  color: string;
}}

export const categories: Category[] = [
  {{ id: 'frutas-vegetales', name: 'Frutas y Vegetales', icon: '🍎', color: 'bg-red-100 text-red-600' }},
  {{ id: 'refrigerados-congelados', name: 'Refrigerados', icon: '❄️', color: 'bg-blue-100 text-blue-600' }},
  {{ id: 'viveres', name: 'Víveres', icon: '🥫', color: 'bg-orange-100 text-orange-600' }},
  {{ id: 'cuidado-personal-salud', name: 'Cuidado Personal', icon: '🧴', color: 'bg-teal-100 text-teal-600' }},
  {{ id: 'limpieza', name: 'Limpieza', icon: '🧽', color: 'bg-cyan-100 text-cyan-600' }},
  {{ id: 'licores', name: 'Licores', icon: '🍷', color: 'bg-purple-100 text-purple-600' }},
];

export const allProducts: Product[] = [];

// Seed the products list from Python data
const rawData = {json_data};

let globalId = 1;
for (const cat of rawData) {{
  for (const p of cat.products) {{
    const r = Math.random();
    let labels: string[] | undefined = undefined;
    if (r > 0.9) labels = ['Nuevo'];
    else if (r > 0.8) labels = ['Oferta'];

    allProducts.push({{
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
    }});
    globalId++;
  }}
}}
"""

with open('src/data/mockDb.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print('mockDb.ts actualizado con imagenes 100% locales.')

with open('public/data/productos_plantilla.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'name', 'price', 'category', 'subcategory', 'image', 'unit', 'labels', 'stock', 'warehouseStock'])
    
    id_counter = 1
    for cat in categories:
        for prod in cat['products']:
            stock = random.randint(10, 100)
            warehouse_stock = random.randint(50, 500)
            
            label = ''
            r = random.random()
            if r > 0.9:
                label = 'Nuevo'
            elif r > 0.8:
                label = 'Oferta'
                
            writer.writerow([f'p{id_counter}', prod['name'], f'{prod["price"]:.2f}', cat['id'], prod['sub'], prod['img'], prod['unit'], label, stock, warehouse_stock])
            id_counter += 1

print('CSV generado.')
