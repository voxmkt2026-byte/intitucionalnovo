import os
import sys
import re
from PIL import Image

def strip_metadata_raster(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
        return False, "Formato nao raster"
    
    try:
        with Image.open(file_path) as img:
            mode = img.mode
            size = img.size
            format_name = img.format or ext.replace('.', '').upper()
            
            # Converter P com transparencia ou manter RGBA/RGB
            if mode in ('P', 'PA'):
                img = img.convert('RGBA')
                mode = 'RGBA'
                
            # Criar nova imagem limpa contendo apenas os dados brutos de pixel
            clean_img = Image.new(mode, size)
            clean_img.paste(img)
            
            # Salvar sobrescrevendo o arquivo sem nenhuma info EXIF/IPTC/XMP
            if ext in ['.jpg', '.jpeg']:
                clean_img = clean_img.convert('RGB')
                clean_img.save(file_path, 'JPEG', quality=95, optimize=True)
            elif ext == '.png':
                clean_img.save(file_path, 'PNG', optimize=True)
            elif ext == '.webp':
                clean_img.save(file_path, 'WEBP', quality=95, lossless=(mode in ['RGBA', 'LA']))
            elif ext == '.gif':
                clean_img.save(file_path, 'GIF')
            
            return True, "OK"
    except Exception as e:
        return False, f"Erro: {str(e)}"

def strip_metadata_svg(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        clean_content = re.sub(r'<metadata[\s\S]*?</metadata>', '', content, flags=re.IGNORECASE)
        clean_content = re.sub(r'<!--[\s\S]*?-->', '', clean_content)
        clean_content = re.sub(r'\s+(inkscape|sodipodi|illustrator|sketch):[a-zA-Z0-9_-]+="[^"]*"', '', clean_content)
        
        if clean_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(clean_content)
            return True, "OK (SVG sanitizado)"
        return True, "OK (SVG sem metadados)"
    except Exception as e:
        return False, f"Erro SVG: {str(e)}"

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    print(f"=== Iniciando varredura de metadados em: {root_dir} ===")
    
    supported_extensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']
    total_found = 0
    total_processed = 0
    total_errors = 0
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if 'node_modules' in dirpath or '.git' in dirpath or '.next' in dirpath:
            continue
        
        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()
            if ext in supported_extensions:
                file_path = os.path.join(dirpath, filename)
                total_found += 1
                
                if ext == '.svg':
                    success, msg = strip_metadata_svg(file_path)
                else:
                    success, msg = strip_metadata_raster(file_path)
                
                if success:
                    total_processed += 1
                else:
                    total_errors += 1
                    print(f"[ERRO] {filename}: {msg}")
    
    print("\n==========================================")
    print("=== Varredura concluida ===")
    print(f"Total de imagens encontradas: {total_found}")
    print(f"Imagens higienizadas: {total_processed}")
    print(f"Erros: {total_errors}")
    print("==========================================\n")

if __name__ == '__main__':
    main()
