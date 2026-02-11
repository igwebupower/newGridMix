"""
Thumbnail Generator -- Creates consistent dark-themed thumbnails for Laxx Meditate.

Generates YouTube thumbnails (1280x720) with:
- Dark moody background (gradient or from image)
- Category-specific color accent
- Duration badge
- Minimal text overlay
- Consistent Laxx Meditate branding

Usage:
    python thumbnail.py --title "Brown Noise" --duration "10 HOURS" --category brown_noise
    python thumbnail.py --title "Rain Sounds" --duration "10 HOURS" --category nature --background rain.jpg
    python thumbnail.py --batch pipeline.json --output-dir ../assets/thumbnails/
"""

import argparse
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("ERROR: Pillow is required. Install with: pip install Pillow")
    sys.exit(1)


# ============================================================
# THEME CONFIGURATION
# ============================================================

WIDTH = 1280
HEIGHT = 720

# Category color schemes (accent color, gradient start, gradient end)
CATEGORY_COLORS = {
    "brown_noise": {
        "accent": (139, 90, 43),      # Warm brown
        "grad_start": (20, 12, 8),     # Very dark brown
        "grad_end": (45, 28, 15),      # Dark brown
        "icon_text": "~"
    },
    "white_noise": {
        "accent": (180, 180, 195),     # Soft grey-blue
        "grad_start": (15, 15, 20),    # Near black
        "grad_end": (35, 35, 45),      # Dark grey
        "icon_text": "||"
    },
    "pink_noise": {
        "accent": (180, 100, 140),     # Muted pink
        "grad_start": (20, 10, 15),    # Dark pink-black
        "grad_end": (40, 20, 30),      # Deep rose
        "icon_text": "~"
    },
    "nature": {
        "accent": (60, 140, 90),       # Forest green
        "grad_start": (5, 18, 10),     # Very dark green
        "grad_end": (15, 40, 25),      # Dark forest
        "icon_text": "^"
    },
    "cozy": {
        "accent": (200, 130, 50),      # Warm amber
        "grad_start": (20, 12, 5),     # Dark warm
        "grad_end": (45, 30, 12),      # Amber dark
        "icon_text": "*"
    },
    "scifi": {
        "accent": (60, 100, 180),      # Space blue
        "grad_start": (3, 5, 15),      # Deep space
        "grad_end": (10, 18, 40),      # Dark blue
        "icon_text": "o"
    },
    "frequencies": {
        "accent": (140, 80, 180),      # Purple
        "grad_start": (12, 5, 18),     # Dark purple
        "grad_end": (28, 15, 40),      # Deep purple
        "icon_text": "~"
    },
    "signature": {
        "accent": (180, 140, 80),      # Gold
        "grad_start": (10, 8, 5),      # Near black warm
        "grad_end": (30, 25, 15),      # Dark gold
        "icon_text": "L"
    }
}


def create_gradient(width, height, start_color, end_color):
    """Create a vertical gradient image."""
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)

    for y in range(height):
        ratio = y / height
        r = int(start_color[0] + (end_color[0] - start_color[0]) * ratio)
        g = int(start_color[1] + (end_color[1] - start_color[1]) * ratio)
        b = int(start_color[2] + (end_color[2] - start_color[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    return img


def add_vignette(img, intensity=0.6):
    """Add a dark vignette effect around the edges."""
    width, height = img.size
    vignette = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(vignette)

    # Draw concentric ellipses from bright center to dark edges
    max_dim = max(width, height)
    for i in range(max_dim, 0, -2):
        ratio = i / max_dim
        brightness = int(255 * (ratio ** 1.5))
        x_offset = (width - int(width * ratio)) // 2
        y_offset = (height - int(height * ratio)) // 2
        draw.ellipse(
            [x_offset, y_offset, width - x_offset, height - y_offset],
            fill=brightness
        )

    vignette = vignette.filter(ImageFilter.GaussianBlur(80))

    # Composite: darken image where vignette is dark
    from PIL import ImageChops
    img_array = img.copy()
    # Blend with black based on vignette mask
    black = Image.new("RGB", (width, height), (0, 0, 0))
    result = Image.composite(img_array, black, vignette)
    return result


def get_font(size, bold=False):
    """Get the best available font."""
    # Try common system fonts
    font_names = [
        "arial.ttf", "Arial.ttf",
        "segoeui.ttf", "SegoeUI.ttf",
        "calibri.ttf", "Calibri.ttf",
        "helvetica.ttf", "Helvetica.ttf",
    ]
    if bold:
        font_names = [
            "arialbd.ttf", "Arial Bold.ttf",
            "segoeuib.ttf", "SegoeUI-Bold.ttf",
            "calibrib.ttf", "Calibri-Bold.ttf",
            "Helvetica-Bold.ttf",
        ] + font_names

    for font_name in font_names:
        try:
            return ImageFont.truetype(font_name, size)
        except (IOError, OSError):
            continue

    # Try Windows font directory
    win_font_dir = r"C:\Windows\Fonts"
    if os.path.isdir(win_font_dir):
        for font_name in font_names:
            font_path = os.path.join(win_font_dir, font_name)
            if os.path.exists(font_path):
                try:
                    return ImageFont.truetype(font_path, size)
                except (IOError, OSError):
                    continue

    # Fallback
    return ImageFont.load_default()


def draw_duration_badge(draw, duration_text, x, y, accent_color):
    """Draw a rounded duration badge."""
    font = get_font(28, bold=True)
    bbox = draw.textbbox((0, 0), duration_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    padding_x = 20
    padding_y = 10
    badge_width = text_width + padding_x * 2
    badge_height = text_height + padding_y * 2

    # Semi-transparent dark background with accent border
    badge_x = x
    badge_y = y

    # Draw badge background
    draw.rounded_rectangle(
        [badge_x, badge_y, badge_x + badge_width, badge_y + badge_height],
        radius=8,
        fill=(0, 0, 0),
        outline=accent_color,
        width=2
    )

    # Draw text centered in badge
    text_x = badge_x + (badge_width - text_width) // 2
    text_y = badge_y + (badge_height - text_height) // 2
    draw.text((text_x, text_y), duration_text, fill=(255, 255, 255), font=font)

    return badge_width, badge_height


def draw_waveform_decoration(draw, y_center, width, accent_color, num_bars=60):
    """Draw a subtle waveform/equalizer decoration."""
    import random
    random.seed(42)  # Consistent across thumbnails

    bar_width = 4
    gap = (width - 200) / num_bars
    start_x = 100

    for i in range(num_bars):
        # Create a wave-like height pattern
        import math
        base_height = 8 + 20 * abs(math.sin(i * 0.15))
        height = int(base_height + random.randint(-3, 3))

        x = int(start_x + i * gap)
        alpha = 0.3 + 0.2 * abs(math.sin(i * 0.1))
        color = tuple(int(c * alpha) for c in accent_color)

        draw.rectangle(
            [x, y_center - height, x + bar_width, y_center + height],
            fill=color
        )


def generate_thumbnail(
    title,
    duration_text,
    category,
    output_path,
    background_image=None
):
    """Generate a complete thumbnail."""
    colors = CATEGORY_COLORS.get(category, CATEGORY_COLORS["brown_noise"])

    # Create base image
    if background_image and os.path.exists(background_image):
        img = Image.open(background_image).convert("RGB")
        img = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
        # Darken the background significantly
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(0.3)
        img = add_vignette(img, 0.7)
    else:
        img = create_gradient(WIDTH, HEIGHT, colors["grad_start"], colors["grad_end"])
        img = add_vignette(img, 0.5)

    draw = ImageDraw.Draw(img)

    # Draw subtle waveform decoration in the middle area
    draw_waveform_decoration(draw, HEIGHT // 2 + 60, WIDTH, colors["accent"])

    # Draw main title
    title_font = get_font(72, bold=True)
    # Split title into lines if too long
    words = title.split()
    lines = []
    current_line = ""
    for word in words:
        test_line = f"{current_line} {word}".strip()
        bbox = draw.textbbox((0, 0), test_line, font=title_font)
        if bbox[2] - bbox[0] > WIDTH - 160:
            if current_line:
                lines.append(current_line)
            current_line = word
        else:
            current_line = test_line
    if current_line:
        lines.append(current_line)

    # Position title in upper-center area
    line_height = 85
    total_text_height = len(lines) * line_height
    y_start = (HEIGHT // 2 - total_text_height) // 2 + 30

    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=title_font)
        text_width = bbox[2] - bbox[0]
        x = (WIDTH - text_width) // 2

        # Draw text shadow
        shadow_offset = 3
        draw.text(
            (x + shadow_offset, y_start + i * line_height + shadow_offset),
            line, fill=(0, 0, 0), font=title_font
        )
        # Draw main text
        draw.text(
            (x, y_start + i * line_height),
            line, fill=(255, 255, 255), font=title_font
        )

    # Draw accent line under title
    line_y = y_start + len(lines) * line_height + 10
    line_width = 120
    draw.rectangle(
        [(WIDTH // 2 - line_width // 2, line_y),
         (WIDTH // 2 + line_width // 2, line_y + 3)],
        fill=colors["accent"]
    )

    # Draw duration badge in bottom-right corner
    if duration_text:
        badge_margin = 30
        draw_duration_badge(
            draw, duration_text,
            WIDTH - 220, HEIGHT - 70,
            colors["accent"]
        )

    # Draw "LAXX MEDITATE" branding in bottom-left
    brand_font = get_font(18, bold=False)
    brand_color = tuple(min(255, c + 60) for c in colors["accent"])
    draw.text((30, HEIGHT - 50), "LAXX MEDITATE", fill=brand_color, font=brand_font)

    # Save
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
    img.save(output_path, "JPEG", quality=95)
    print(f"Thumbnail saved: {output_path} ({WIDTH}x{HEIGHT})")


def batch_generate(pipeline_path, output_dir):
    """Generate thumbnails for all videos in pipeline."""
    import json

    with open(pipeline_path) as f:
        pipeline = json.load(f)

    os.makedirs(output_dir, exist_ok=True)

    for video in pipeline.get("videos", []):
        vid_id = video.get("id", "unknown")
        duration = video.get("duration_hours", 10)
        duration_text = f"{int(duration)} HOURS" if duration >= 1 else f"{int(duration * 60)} MIN"

        # Use short display title for thumbnail (not the full SEO title)
        display_title = video.get("thumbnail_title", video["title"])
        # Strip long SEO suffixes for cleaner thumbnail
        if " -- " in display_title:
            display_title = display_title.split(" -- ")[0]

        output_path = os.path.join(output_dir, f"{vid_id}_thumbnail.jpg")

        generate_thumbnail(
            title=display_title,
            duration_text=duration_text,
            category=video["category"],
            output_path=output_path,
            background_image=video.get("thumbnail_bg")
        )

    print(f"\nDone! Generated {len(pipeline['videos'])} thumbnails in {output_dir}")


def main():
    parser = argparse.ArgumentParser(description="Generate Laxx Meditate thumbnails.")

    subparsers = parser.add_subparsers(dest="command")

    # Single thumbnail
    single = subparsers.add_parser("single", help="Generate one thumbnail")
    single.add_argument("--title", "-t", required=True, help="Display title")
    single.add_argument("--duration", "-d", default="10 HOURS", help="Duration text for badge")
    single.add_argument("--category", "-c", default="brown_noise", choices=CATEGORY_COLORS.keys())
    single.add_argument("--background", "-b", default=None, help="Background image path")
    single.add_argument("--output", "-o", default="thumbnail.jpg", help="Output path")

    # Batch mode
    batch = subparsers.add_parser("batch", help="Generate thumbnails from pipeline")
    batch.add_argument("--pipeline", "-p", required=True, help="Pipeline JSON file")
    batch.add_argument("--output-dir", "-o", default="./thumbnails", help="Output directory")

    args = parser.parse_args()

    if args.command == "single":
        generate_thumbnail(
            title=args.title,
            duration_text=args.duration,
            category=args.category,
            output_path=args.output,
            background_image=args.background
        )
    elif args.command == "batch":
        batch_generate(args.pipeline, args.output_dir)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
