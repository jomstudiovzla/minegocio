import os
import time
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

images = {
    'costilla_res': 'beef,ribs',
    'pechuga_pollo': 'chicken,breast',
    'pollo_entero': 'whole,chicken',
    'muslos_pollo': 'raw,chicken,thigh',
    'alitas_pollo': 'raw,chicken,wings',
    'jamon_cocido': 'sliced,ham',
    'queso_amarillo': 'yellow,cheese',
    'queso_blanco': 'white,cheese',
    'salchichas': 'raw,sausage',
    'tocino': 'bacon',
    'chorizo': 'chorizo,meat',
    'queso_guayanes': 'fresh,mozzarella,cheese',
    'nuggets': 'chicken,nuggets',
    
    'coca_cola': 'coca,cola,bottle',
    'pepsi': 'pepsi,bottle',
    'chinotto': 'sprite,bottle',
    'frescolita': 'orange,soda,bottle',
    'maltin': 'malt,drink,bottle',
    'arroz_blanco': 'white,rice,bag',
    'arroz_primor': 'rice,bag',
    'pasta_capri': 'spaghetti,pasta',
    'harina_pan': 'cornmeal,bag',
    'caraotas': 'black,beans',
    'lentejas': 'lentils',
    'atun_aceite': 'canned,tuna',
    'atun_agua': 'canned,tuna',
    'maiz_lata': 'canned,corn',
    'aceite_maiz': 'corn,oil,bottle',

    'jabon_protex': 'bar,soap',
    'desodorante': 'deodorant',
    'crema_dental': 'toothpaste',
    'shampoo': 'shampoo,bottle',
    'papel_higienico': 'toilet,paper',
    'toallas_sanitarias': 'sanitary,pads',
    'maquina_afeitar': 'razor',
    'crema_corporal': 'body,lotion',
    'algodon': 'cotton,balls',
    'hisopos': 'cotton,swabs',
    'alcohol': 'rubbing,alcohol',
    'agua_oxigenada': 'hydrogen,peroxide',
    'curitas': 'bandaids',

    'detergente_liquido': 'laundry,detergent',
    'detergente_polvo': 'washing,powder',
    'suavizante': 'fabric,softener',
    'lavaplatos_liquido': 'dish,soap',
    'lavaplatos_crema': 'dish,soap',
    'cloro': 'bleach,bottle',
    'desinfectante': 'floor,cleaner',
    'esponja': 'cleaning,sponge',
    'mopa': 'cleaning,mop',
    'escoba': 'broom',
    'coleto': 'floor,cloth',
    'bolsas_basura': 'trash,bags',

    'cerveza_pilsen': 'pilsner,beer',
    'cerveza_light': 'light,beer',
    'cerveza_solera': 'green,beer,bottle',
    'cerveza_zulia': 'beer,bottle',
    'ron_teresa': 'rum,bottle',
    'ron_cacique': 'rum,bottle',
    'ron_pampero': 'dark,rum,bottle',
    'ron_diplomatico': 'premium,rum,bottle',
    'whisky_buchanans': 'whiskey,bottle',
    'whisky_parr': 'scotch,whiskey,bottle',
    'vodka': 'vodka,bottle',
    'vino_tinto': 'red,wine,bottle',
    'vino_blanco': 'white,wine,bottle'
}

os.makedirs('public/images/products', exist_ok=True)

for name, keywords in images.items():
    filepath = f"public/images/products/{name}.png"
    if not os.path.exists(filepath):
        url = f"https://loremflickr.com/400/400/{keywords}/all"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                with open(filepath, 'wb') as f:
                    f.write(response.read())
            print(f"Downloaded {name}.png")
        except Exception as e:
            print(f"Failed {name}: {e}")
        time.sleep(0.5)

print("Done downloading images.")
