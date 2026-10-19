import os
import zipfile

def make_zip(source_dir, output_zip):
    exclude_dirs = {'node_modules', '.git', 'dist', '.aistudio', '__pycache__', '.temp', 'dev-dist'}
    exclude_files = {'kabira-news.zip', '.DS_Store', '.env', '.env.local', '.env.production', '.env.development'}
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)
                
    print(f"Zip created successfully at {output_zip} (size: {os.path.getsize(output_zip)} bytes)")

# Create in public so it can be downloaded directly from browser
os.makedirs("public", exist_ok=True)
make_zip(".", "public/kabira-news.zip")
# Also create in root
make_zip(".", "kabira-news.zip")
