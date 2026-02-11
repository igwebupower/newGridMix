"""
AI Prompt Generator -- Generates ready-to-use prompts for Suno AI and Runway/Pika.

Outputs copy-paste prompts for generating audio and visuals for each video
in the pipeline.

Usage:
    python prompts.py V01              # Show prompts for video V01
    python prompts.py V01 --audio      # Audio prompt only
    python prompts.py V01 --visual     # Visual prompt only
    python prompts.py --all            # Show prompts for all planned videos
"""

import argparse
import json
import os
import sys

PIPELINE_FILE = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tracker", "pipeline.json")
)

# ============================================================
# SUNO AI AUDIO PROMPT TEMPLATES
# ============================================================

AUDIO_PROMPTS = {
    "brown_noise": {
        "style": "ambient, noise, drone",
        "template": (
            "Create a {duration}-minute deep brown noise ambient track. "
            "Low-frequency rumble, smooth and consistent without any melody or rhythm. "
            "No vocals, no instruments, no beats. Pure noise texture. "
            "Deep bass frequencies dominant, gentle and warm character. "
            "Suitable for sleep, focus, and relaxation. "
            "Seamless loop-friendly ending."
        ),
        "tags": "ambient, brown noise, drone, sleep, focus, no vocals, instrumental"
    },
    "white_noise": {
        "style": "ambient, noise, static",
        "template": (
            "Create a {duration}-minute white noise ambient track. "
            "Consistent broadband static noise, even frequency distribution. "
            "No vocals, no melody, no rhythm. Pure noise texture. "
            "Clean and neutral character. "
            "Suitable for sleep and blocking distractions. "
            "Seamless loop-friendly."
        ),
        "tags": "ambient, white noise, static, sleep, focus, no vocals"
    },
    "pink_noise": {
        "style": "ambient, noise, gentle",
        "template": (
            "Create a {duration}-minute pink noise ambient track. "
            "Gentle balanced noise with more bass than white noise. "
            "Soft, warm, natural-sounding character. "
            "No vocals, no instruments. Pure noise texture. "
            "Suitable for baby sleep and gentle relaxation. "
            "Seamless loop-friendly."
        ),
        "tags": "ambient, pink noise, gentle, baby sleep, soft, no vocals"
    },
    "nature": {
        "style": "ambient, nature, soundscape",
        "template": (
            "Create a {duration}-minute ambient nature soundscape. "
            "{nature_details} "
            "No vocals, no music, no beats. Pure natural sound environment. "
            "Immersive and realistic recording quality. "
            "Peaceful and calming atmosphere. "
            "Seamless loop-friendly ending."
        ),
        "tags": "ambient, nature, soundscape, relaxation, sleep, no vocals"
    },
    "cozy": {
        "style": "ambient, cozy, atmosphere",
        "template": (
            "Create a {duration}-minute cozy indoor ambient soundscape. "
            "{cozy_details} "
            "No vocals, no obvious music. Environmental sounds only. "
            "Warm, comfortable, immersive atmosphere. "
            "Seamless loop-friendly."
        ),
        "tags": "ambient, cozy, atmosphere, indoor, relaxation, no vocals"
    },
    "scifi": {
        "style": "ambient, sci-fi, space",
        "template": (
            "Create a {duration}-minute sci-fi ambient soundscape. "
            "Deep space station hum, subtle electronic ambience, distant mechanical sounds. "
            "Low-frequency drone with occasional soft electronic tones. "
            "No vocals, no melody. Environmental atmosphere only. "
            "Immersive and futuristic. "
            "Seamless loop-friendly."
        ),
        "tags": "ambient, sci-fi, space, drone, futuristic, no vocals"
    },
    "frequencies": {
        "style": "ambient, healing, meditation",
        "template": (
            "Create a {duration}-minute meditation track tuned to {frequency}. "
            "Gentle sustained tones with subtle harmonic overtones. "
            "No vocals, no beats. Slow, meditative pace. "
            "Healing and deeply relaxing character. "
            "Binaural-friendly mix. "
            "Seamless loop-friendly ending."
        ),
        "tags": "ambient, healing, meditation, frequency, binaural, no vocals"
    },
    "signature": {
        "style": "ambient, premium, layered",
        "template": (
            "Create a {duration}-minute premium ambient noise blend. "
            "{signature_details} "
            "No vocals, no obvious melody. Textural and immersive. "
            "Professional, polished sound design. "
            "Ultra-smooth character with depth and warmth. "
            "Seamless loop-friendly."
        ),
        "tags": "ambient, premium, layered, smooth, sleep, no vocals"
    }
}

# ============================================================
# VISUAL PROMPT ENHANCEMENT
# ============================================================

VISUAL_SUFFIX = (
    "Cinematic quality, 4K resolution, slow smooth camera movement, "
    "moody atmospheric lighting, dark color palette, "
    "seamless loop-friendly, ambient and calming mood."
)


def get_suno_prompt(video):
    """Generate a Suno AI prompt for a video."""
    category = video["category"]
    prompt_data = AUDIO_PROMPTS.get(category, AUDIO_PROMPTS["brown_noise"])

    # Use 30 min as base (will be looped later)
    duration = min(30, video["duration_hours"] * 60)

    prompt = prompt_data["template"].format(
        duration=int(duration),
        nature_details=video.get("audio_source", ""),
        cozy_details=video.get("audio_source", ""),
        frequency=next((k for k in video.get("seo_keywords", []) if "Hz" in k), "432Hz"),
        signature_details=video.get("audio_source", "")
    )

    return {
        "prompt": prompt,
        "style": prompt_data["style"],
        "tags": prompt_data["tags"],
        "duration_suggestion": f"{int(duration)} minutes (then loop to {video['duration_hours']}h)"
    }


def get_visual_prompt(video):
    """Generate a Runway/Pika prompt for a video."""
    base_prompt = video.get("visual_prompt")
    if not base_prompt:
        return {
            "prompt": None,
            "note": video.get("visual_notes", "Black screen -- no visual generation needed")
        }

    enhanced = f"{base_prompt} {VISUAL_SUFFIX}"

    return {
        "prompt": enhanced,
        "tip": "Generate 10-30 second clips. They will be looped to full duration."
    }


def display_prompts(video, show_audio=True, show_visual=True):
    """Display formatted prompts for a video."""
    print(f"\n{'='*70}")
    print(f"  {video['id']} -- {video['title']}")
    print(f"  Category: {video['category']} | Duration: {video['duration_hours']}h")
    print(f"{'='*70}")

    if show_audio:
        suno = get_suno_prompt(video)
        print(f"\n--- SUNO AI PROMPT ---")
        print(f"\nStyle/Genre: {suno['style']}")
        print(f"Tags: {suno['tags']}")
        print(f"Duration: {suno['duration_suggestion']}")
        print(f"\nPrompt (copy this):")
        print(f"{'~'*50}")
        print(suno["prompt"])
        print(f"{'~'*50}")

    if show_visual:
        visual = get_visual_prompt(video)
        print(f"\n--- RUNWAY / PIKA PROMPT ---")
        if visual.get("prompt"):
            print(f"\nPrompt (copy this):")
            print(f"{'~'*50}")
            print(visual["prompt"])
            print(f"{'~'*50}")
            if visual.get("tip"):
                print(f"\nTip: {visual['tip']}")
        else:
            print(f"\n{visual.get('note', 'No visual needed')}")

    print()


def main():
    parser = argparse.ArgumentParser(description="Generate AI prompts for Laxx Meditate videos.")
    parser.add_argument("video_id", nargs="?", help="Video ID (e.g., V01)")
    parser.add_argument("--audio", action="store_true", help="Show audio prompt only")
    parser.add_argument("--visual", action="store_true", help="Show visual prompt only")
    parser.add_argument("--all", action="store_true", help="Show prompts for all planned videos")
    parser.add_argument("--batch", help="Show prompts for a specific batch (e.g., 'Batch 1')")

    args = parser.parse_args()

    with open(PIPELINE_FILE) as f:
        data = json.load(f)

    show_audio = not args.visual  # Show audio unless --visual only
    show_visual = not args.audio  # Show visual unless --audio only

    if args.all:
        for video in data["videos"]:
            if video["status"] == "planned":
                display_prompts(video, show_audio, show_visual)
        return

    if args.batch:
        for video in data["videos"]:
            if video.get("batch") == args.batch:
                display_prompts(video, show_audio, show_visual)
        return

    if not args.video_id:
        parser.print_help()
        return

    video = None
    for v in data["videos"]:
        if v["id"] == args.video_id.upper():
            video = v
            break

    if not video:
        print(f"ERROR: Video '{args.video_id}' not found.")
        sys.exit(1)

    display_prompts(video, show_audio, show_visual)


if __name__ == "__main__":
    main()
