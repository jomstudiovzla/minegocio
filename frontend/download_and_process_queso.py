import os
import requests
from PIL import Image
from rembg import remove

def main():
    image_url = "https://vallearriba.elplazas.com/media/catalog/product/2/0/20097kg_1_1.jpg"
    dest_path = "public/images/products/queso_amarillo.png"
    
    print(f"Descargando imagen desde {image_url}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(image_url, headers=headers, timeout=15)
        if response.status_code == 200:
            temp_path = "temp_queso.jpg"
            with open(temp_path, "wb") as f:
                f.write(response.content)
            print("Imagen descargada con éxito. Procesando remoción de fondo...")
            
            # Open and clean background
            img = Image.open(temp_path).convert("RGBA")
            no_bg = remove(img)
            
            # Create a solid white background
            white_bg = Image.new("RGBA", no_bg.size, (255, 255, 255, 255))
            combined = Image.alpha_composite(white_bg, no_bg)
            final = combined.convert("RGB")
            
            # Save final image
            final.save(dest_path, "PNG")
            print(f"Imagen procesada y guardada con fondo blanco en {dest_path}")
            
            # Clean up temp files
            if os.path.exists(temp_path):
                os.remove(temp_path)
        else:
            print(f"Error al descargar la imagen: Código de estado {response.status_code}")
    except Exception as e:
        print(f"Error durante la descarga o procesamiento: {e}")

if __name__ == "__main__":
    main()
