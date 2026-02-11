"""
YouTube Metadata Generator -- Creates optimized titles, descriptions, and tags.

Generates search-optimized metadata for each video category with proper
keyword targeting for the ambient/relaxation niche.

Usage:
    python metadata.py --category brown_noise --title "Brown Noise for Sleep" --duration 10
    python metadata.py --list-categories
    python metadata.py --batch pipeline.json --output-dir ../tracker/metadata/
"""

import argparse
import json
import os
import sys
from datetime import datetime

# ============================================================
# CATEGORY DEFINITIONS
# ============================================================

CATEGORIES = {
    "brown_noise": {
        "label": "Brown Noise",
        "primary_tags": [
            "brown noise", "brown noise for sleep", "brown noise for studying",
            "brown noise 10 hours", "deep brown noise", "brown noise focus",
            "brown noise for babies", "brown noise ADHD", "smooth brown noise",
            "dark brown noise", "brown noise no music"
        ],
        "secondary_tags": [
            "noise for sleeping", "study noise", "focus sounds", "deep sleep sounds",
            "noise blocker", "concentration noise", "ambient noise", "sleep sounds"
        ],
        "description_keywords": [
            "deep sleep", "focus", "concentration", "studying",
            "block distractions", "ADHD", "relaxation", "stress relief"
        ],
        "hashtags": ["#BrownNoise", "#DeepSleep", "#StudyNoise", "#FocusSounds", "#SleepSounds"]
    },
    "white_noise": {
        "label": "White Noise",
        "primary_tags": [
            "white noise", "white noise for sleeping", "white noise 10 hours",
            "white noise baby", "white noise fan", "white noise for studying",
            "white noise black screen", "static noise", "white noise machine"
        ],
        "secondary_tags": [
            "sleep noise", "baby sleep sounds", "fan noise", "static sound",
            "noise machine", "ambient noise for sleep", "background noise"
        ],
        "description_keywords": [
            "sleep", "baby sleep", "block noise", "fan sound",
            "soothing", "calming", "restful night"
        ],
        "hashtags": ["#WhiteNoise", "#SleepSounds", "#BabySleep", "#NoiseForSleeping", "#Ambient"]
    },
    "pink_noise": {
        "label": "Pink Noise",
        "primary_tags": [
            "pink noise", "pink noise for sleep", "pink noise 10 hours",
            "pink noise baby", "pink noise for studying", "pink noise for focus",
            "soft pink noise", "gentle noise for sleeping"
        ],
        "secondary_tags": [
            "gentle noise", "soft ambient noise", "sleep noise", "baby sleep",
            "calming sounds", "noise for concentration"
        ],
        "description_keywords": [
            "gentle", "soft", "balanced", "natural sounding",
            "deep sleep", "baby", "calming"
        ],
        "hashtags": ["#PinkNoise", "#SleepSounds", "#GentleNoise", "#BabySleep", "#Relaxation"]
    },
    "nature": {
        "label": "Nature Ambience",
        "primary_tags": [
            "nature sounds", "rain sounds", "ocean waves", "thunderstorm",
            "forest sounds", "bird sounds", "river sounds", "rain for sleeping",
            "ocean sounds for sleep", "nature ambience", "rain and thunder"
        ],
        "secondary_tags": [
            "relaxing nature", "natural sounds for sleep", "rain on window",
            "heavy rain", "gentle rain", "waves crashing", "stream sounds",
            "cricket sounds", "wind sounds", "water sounds"
        ],
        "description_keywords": [
            "nature", "natural", "rain", "ocean", "forest",
            "peaceful", "serene", "tranquil", "immersive"
        ],
        "hashtags": ["#NatureSounds", "#RainSounds", "#OceanWaves", "#Relaxation", "#SleepSounds"]
    },
    "cozy": {
        "label": "Cozy Environments",
        "primary_tags": [
            "fireplace sounds", "cozy ambience", "cabin rain",
            "coffee shop ambience", "library ambience", "crackling fire",
            "fireplace 10 hours", "cozy rain", "warm ambience"
        ],
        "secondary_tags": [
            "cozy atmosphere", "warm sounds", "indoor ambience", "rainy cabin",
            "fireplace crackling", "study ambience", "reading ambience",
            "cafe sounds", "background ambience"
        ],
        "description_keywords": [
            "cozy", "warm", "comfort", "cabin", "fireplace",
            "indoor", "reading", "studying", "relaxing evening"
        ],
        "hashtags": ["#CozyAmbience", "#Fireplace", "#CabinRain", "#StudyAmbience", "#Relaxation"]
    },
    "scifi": {
        "label": "Sci-Fi Ambience",
        "primary_tags": [
            "space ambience", "spaceship sounds", "space station",
            "sci-fi ambience", "space white noise", "starship sounds",
            "spacecraft hum", "space engine noise", "futuristic ambience"
        ],
        "secondary_tags": [
            "deep space", "space sleep sounds", "spaceship hum",
            "engine room", "space station ambience", "cosmic sounds"
        ],
        "description_keywords": [
            "space", "spaceship", "futuristic", "cosmic",
            "deep space", "interstellar", "immersive"
        ],
        "hashtags": ["#SpaceAmbience", "#SciFi", "#SpaceshipSounds", "#DeepSpace", "#Ambient"]
    },
    "frequencies": {
        "label": "Healing Frequencies",
        "primary_tags": [
            "432Hz", "528Hz", "healing frequency", "binaural beats",
            "solfeggio frequencies", "theta waves", "delta waves",
            "healing music", "frequency meditation", "432Hz sleep"
        ],
        "secondary_tags": [
            "sound healing", "deep healing", "meditation frequency",
            "sleep frequency", "brainwave entrainment", "relaxation tones"
        ],
        "description_keywords": [
            "healing", "frequency", "vibration", "deep relaxation",
            "meditation", "cellular repair", "harmony"
        ],
        "hashtags": ["#HealingFrequency", "#432Hz", "#528Hz", "#SoundHealing", "#Meditation"]
    },
    "signature": {
        "label": "Laxx Signature",
        "primary_tags": [
            "Laxx Meditate", "Laxx deep brown", "Laxx nightfall",
            "smooth brown noise blend", "premium ambient noise",
            "ultra smooth noise", "ambient blend for sleep"
        ],
        "secondary_tags": [
            "brown noise blend", "mixed ambient noise", "layered noise",
            "premium sleep sounds", "curated ambient", "noise mix"
        ],
        "description_keywords": [
            "signature blend", "carefully crafted", "premium",
            "layered", "smooth", "immersive"
        ],
        "hashtags": ["#LaxxMeditate", "#PremiumAmbient", "#DeepBrown", "#SleepBlend", "#Ambient"]
    }
}


def generate_description(title, category, duration_hours, custom_text=None):
    """Generate an optimized YouTube description."""
    cat = CATEGORIES[category]
    keywords = cat["description_keywords"]
    hashtags = " ".join(cat["hashtags"][:5])
    duration_str = f"{int(duration_hours)} hours" if duration_hours >= 1 else f"{int(duration_hours * 60)} minutes"

    # Build use cases from keywords
    use_cases = []
    sleep_keywords = ["sleep", "deep sleep", "baby sleep", "restful night"]
    focus_keywords = ["focus", "concentration", "studying", "ADHD"]
    relax_keywords = ["relaxation", "calming", "peaceful", "stress relief"]

    if any(k in keywords for k in sleep_keywords):
        use_cases.append("sleeping")
    if any(k in keywords for k in focus_keywords):
        use_cases.append("studying and focus")
    if any(k in keywords for k in relax_keywords):
        use_cases.append("relaxation")

    if not use_cases:
        use_cases = ["sleeping", "relaxation", "focus"]

    use_case_str = ", ".join(use_cases[:-1]) + f", and {use_cases[-1]}" if len(use_cases) > 1 else use_cases[0]

    description = f"""{title}

{duration_str} of {cat['label'].lower()} designed to help you with {use_case_str}. This carefully crafted audio blocks out distracting background noise and creates a calm, immersive environment.

Perfect for:
- Falling asleep and staying asleep through the night
- Deep focus during study or work sessions
- Meditation and mindfulness practice
- Calming a restless mind or reducing anxiety
- Background ambience for reading or relaxing

{custom_text or ''}

Subscribe to Laxx Meditate for new ambient soundscapes every week. Turn on notifications so you never miss a new release.

{hashtags}

---
Laxx Meditate -- Deep ambient soundscapes for sleep, focus, and relaxation."""

    return description.strip()


def generate_tags(category, title_words=None):
    """Generate a list of optimized tags (max 500 chars for YouTube)."""
    cat = CATEGORIES[category]
    tags = list(cat["primary_tags"])
    tags.extend(cat["secondary_tags"])

    # Add common cross-category tags
    tags.extend([
        "Laxx Meditate", "sleep sounds", "ambient sounds",
        "relaxation", "meditation", "background noise"
    ])

    # Add title-derived tags
    if title_words:
        clean_words = [w.lower() for w in title_words if len(w) > 3]
        for word in clean_words:
            if word not in " ".join(tags).lower():
                tags.append(word)

    # Deduplicate while preserving order
    seen = set()
    unique_tags = []
    for tag in tags:
        lower = tag.lower()
        if lower not in seen:
            seen.add(lower)
            unique_tags.append(tag)

    # YouTube has a 500 character limit for tags
    result = []
    total_chars = 0
    for tag in unique_tags:
        if total_chars + len(tag) + 1 > 490:
            break
        result.append(tag)
        total_chars += len(tag) + 1

    return result


def generate_metadata(title, category, duration_hours, custom_text=None):
    """Generate complete metadata package for a video."""
    title_words = title.split()

    return {
        "title": title,
        "description": generate_description(title, category, duration_hours, custom_text),
        "tags": generate_tags(category, title_words),
        "category_id": "10",  # YouTube category: Music
        "default_language": "en",
        "privacy_status": "public",
        "made_for_kids": False,
        "contains_synthetic_content": True,
        "hashtags": CATEGORIES[category]["hashtags"]
    }


def batch_generate(pipeline_path, output_dir):
    """Generate metadata for all videos in a pipeline JSON file."""
    with open(pipeline_path) as f:
        pipeline = json.load(f)

    os.makedirs(output_dir, exist_ok=True)

    for video in pipeline.get("videos", []):
        vid_id = video.get("id", "unknown")
        meta = generate_metadata(
            title=video["title"],
            category=video["category"],
            duration_hours=video["duration_hours"],
            custom_text=video.get("custom_description")
        )

        output_path = os.path.join(output_dir, f"{vid_id}_metadata.json")
        with open(output_path, "w") as f:
            json.dump(meta, f, indent=2)

        print(f"Generated: {output_path} -- {video['title']}")

    print(f"\nDone! Generated metadata for {len(pipeline['videos'])} videos.")


def main():
    parser = argparse.ArgumentParser(description="Generate YouTube metadata for Laxx Meditate videos.")

    subparsers = parser.add_subparsers(dest="command")

    # Single video
    single = subparsers.add_parser("single", help="Generate metadata for a single video")
    single.add_argument("--title", "-t", required=True, help="Video title")
    single.add_argument("--category", "-c", required=True, choices=CATEGORIES.keys(), help="Video category")
    single.add_argument("--duration", "-d", type=float, required=True, help="Duration in hours")
    single.add_argument("--output", "-o", default=None, help="Output JSON file")

    # Batch mode
    batch = subparsers.add_parser("batch", help="Generate metadata for all videos in pipeline")
    batch.add_argument("--pipeline", "-p", required=True, help="Pipeline JSON file")
    batch.add_argument("--output-dir", "-o", default="./metadata", help="Output directory")

    # List categories
    subparsers.add_parser("categories", help="List available categories")

    args = parser.parse_args()

    if args.command == "categories":
        print("Available categories:")
        for key, cat in CATEGORIES.items():
            print(f"  {key:15s} -- {cat['label']}")
            print(f"                    Tags: {', '.join(cat['primary_tags'][:5])}...")
            print()
        return

    if args.command == "single":
        meta = generate_metadata(args.title, args.category, args.duration)

        if args.output:
            with open(args.output, "w") as f:
                json.dump(meta, f, indent=2)
            print(f"Saved to: {args.output}")
        else:
            print(json.dumps(meta, indent=2))
        return

    if args.command == "batch":
        batch_generate(args.pipeline, args.output_dir)
        return

    parser.print_help()


if __name__ == "__main__":
    main()
