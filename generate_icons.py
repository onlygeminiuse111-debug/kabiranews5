import zlib
import struct
import os

def create_png(width, height, color_bg, draw_text="K"):
    # Generate an RGBA PNG with a rounded badge and stylized "क" / "K" shape
    pixels = bytearray()
    
    r_bg, g_bg, b_bg = color_bg
    
    center_x = width / 2.0
    center_y = height / 2.0
    radius = min(width, height) * 0.44
    
    for y in range(height):
        row = bytearray([0]) # Filter byte: 0 (None)
        for x in range(width):
            dx = x - center_x
            dy = y - center_y
            dist = (dx * dx + dy * dy) ** 0.5
            
            # Rounded rect or circle background
            if dist <= radius:
                # Inside badge
                # Add a subtle gradient or gold accent near bottom
                grad = 1.0 - (y / height) * 0.25
                # Outer ring check
                if abs(dist - radius) <= width * 0.03:
                    # Gold border
                    row.extend([245, 158, 11, 255])
                else:
                    # Check if inside central emblem area
                    # Draw a stylized Hindi "क" / newspaper symbol
                    nx = (x - (center_x - radius*0.5)) / (radius)
                    ny = (y - (center_y - radius*0.5)) / (radius)
                    
                    is_white = False
                    # Top horizontal line (shirorekha)
                    if 0.1 <= nx <= 0.9 and 0.18 <= ny <= 0.26:
                        is_white = True
                    # Vertical stem
                    elif 0.46 <= nx <= 0.54 and 0.20 <= ny <= 0.82:
                        is_white = True
                    # Left loop of "क"
                    elif (nx - 0.32)**2 + (ny - 0.45)**2 <= 0.025 and (nx - 0.32)**2 + (ny - 0.45)**2 >= 0.006:
                        is_white = True
                    # Right curve of "क"
                    elif 0.52 <= nx <= 0.78 and 0.35 <= ny <= 0.75:
                        # Arc shape on the right
                        right_dist = ((nx - 0.52)**2 + (ny - 0.55)**2)**0.5
                        if 0.12 <= right_dist <= 0.22 and nx >= 0.52 and ny >= 0.38:
                            is_white = True
                    
                    if is_white:
                        row.extend([255, 255, 255, 255])
                    else:
                        r = int(min(255, max(0, r_bg * grad)))
                        g = int(min(255, max(0, g_bg * grad)))
                        b = int(min(255, max(0, b_bg * grad)))
                        row.extend([r, g, b, 255])
            else:
                # Transparent outside
                row.extend([0, 0, 0, 0])
                
        pixels.extend(row)
        
    def chunk(tag, data):
        return struct.pack("!I", len(data)) + tag + data + struct.pack("!I", zlib.crc32(tag + data) & 0xffffffff)
        
    png_data = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack("!IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png_data += chunk(b"IHDR", ihdr)
    compressed = zlib.compress(pixels, 9)
    png_data += chunk(b"IDAT", compressed)
    png_data += chunk(b"IEND", b"")
    return png_data

os.makedirs("/public", exist_ok=True)

# Generate icons
for size in [192, 512]:
    data = create_png(size, size, (220, 38, 38))
    with open(f"/public/pwa-{size}x{size}.png", "wb") as f:
        f.write(data)

# Maskable icon (full bleed background with padding inside)
def create_maskable(size):
    pixels = bytearray()
    center_x = size / 2.0
    center_y = size / 2.0
    radius = size * 0.36 # 15% safe zone margin
    
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            dx = x - center_x
            dy = y - center_y
            dist = (dx * dx + dy * dy) ** 0.5
            
            # Emblem inside safe zone
            nx = (x - (center_x - radius*0.5)) / (radius)
            ny = (y - (center_y - radius*0.5)) / (radius)
            is_white = False
            if dist <= radius:
                if 0.1 <= nx <= 0.9 and 0.18 <= ny <= 0.26:
                    is_white = True
                elif 0.46 <= nx <= 0.54 and 0.20 <= ny <= 0.82:
                    is_white = True
                elif (nx - 0.32)**2 + (ny - 0.45)**2 <= 0.025 and (nx - 0.32)**2 + (ny - 0.45)**2 >= 0.006:
                    is_white = True
                elif 0.52 <= nx <= 0.78 and 0.35 <= ny <= 0.75:
                    right_dist = ((nx - 0.52)**2 + (ny - 0.55)**2)**0.5
                    if 0.12 <= right_dist <= 0.22 and nx >= 0.52 and ny >= 0.38:
                        is_white = True

            if is_white:
                row.extend([255, 255, 255, 255])
            else:
                # Solid red background full bleed
                row.extend([220, 38, 38, 255])
        pixels.extend(row)
        
    def chunk(tag, data):
        return struct.pack("!I", len(data)) + tag + data + struct.pack("!I", zlib.crc32(tag + data) & 0xffffffff)
        
    png_data = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack("!IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png_data += chunk(b"IHDR", ihdr)
    compressed = zlib.compress(pixels, 9)
    png_data += chunk(b"IDAT", compressed)
    png_data += chunk(b"IEND", b"")
    return png_data

with open("/public/pwa-maskable-512x512.png", "wb") as f:
    f.write(create_maskable(512))

# Apple touch icon 180x180
with open("/public/apple-touch-icon.png", "wb") as f:
    f.write(create_png(180, 180, (220, 38, 38)))

# Favicon PNG (64x64)
with open("/public/favicon.ico", "wb") as f:
    f.write(create_png(64, 64, (220, 38, 38)))

print("PWA icons generated successfully!")
