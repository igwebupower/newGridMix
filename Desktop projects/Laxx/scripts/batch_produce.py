"""
Batch Producer -- One-command video production for Laxx Meditate.

Wraps all pipeline steps into a single command:
  1. Loop audio to target duration
  2. Loop video to target duration (or generate black screen)
  3. Combine audio + video
  4. Generate thumbnail
  5. Generate upload metadata
  6. Update tracker status

Usage:
    python batch_produce.py V01 --audio ../assets/audio/v01_brown_noise.wav --video ../assets/video/v01_clip.mp4
    python batch_produce.py V03 --audio ../assets/audio/v03_white_noise.wav --black-screen
    python batch_produce.py V01 --audio-only ../assets/audio/v01_brown_noise.wav  # Just loop audio
"""

import argparse
import json
import os
import sys
import subprocess
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
PIPELINE_FILE = os.path.join(PROJECT_DIR, "tracker", "pipeline.json")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "output")
THUMBNAIL_DIR = os.path.join(PROJECT_DIR, "assets", "thumbnails")
METADATA_DIR = os.path.join(PROJECT_DIR, "tracker", "metadata")


def load_pipeline():
    with open(PIPELINE_FILE) as f:
        return json.load(f)


def save_pipeline(data):
    with open(PIPELINE_FILE, "w") as f:
        json.dump(data, f, indent=2)


def get_video(data, video_id):
    for v in data["videos"]:
        if v["id"] == video_id.upper():
            return v
    return None


def run_script(script_name, args_list):
    """Run another Python script with arguments."""
    script_path = os.path.join(SCRIPT_DIR, script_name)
    cmd = [sys.executable, script_path] + args_list
    print(f"  Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=SCRIPT_DIR)
    if result.returncode != 0:
        print(f"  ERROR: {script_name} failed!")
        return False
    return True


def produce(args):
    data = load_pipeline()
    video = get_video(data, args.video_id)

    if not video:
        print(f"ERROR: Video '{args.video_id}' not found in pipeline.")
        sys.exit(1)

    vid_id = video["id"]
    title = video["title"]
    duration = video["duration_hours"]
    category = video["category"]

    print(f"{'='*60}")
    print(f"PRODUCING: {vid_id} -- {title}")
    print(f"Duration: {duration}h | Category: {category}")
    print(f"{'='*60}\n")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(THUMBNAIL_DIR, exist_ok=True)
    os.makedirs(METADATA_DIR, exist_ok=True)

    # Step 1: Audio
    if args.audio:
        if not os.path.exists(args.audio):
            print(f"ERROR: Audio file not found: {args.audio}")
            sys.exit(1)

        looped_audio = os.path.join(OUTPUT_DIR, f"{vid_id}_audio_{int(duration)}h.wav")
        print(f"[1/5] Looping audio to {duration}h...")

        success = run_script("loop_audio.py", [
            args.audio,
            "--duration", str(duration),
            "--output", looped_audio
        ])
        if not success:
            sys.exit(1)

        # Update tracker
        video["status"] = "audio_done"
        video["last_updated"] = datetime.now().isoformat()
        save_pipeline(data)
        print(f"  Tracker updated: audio_done\n")
    elif args.audio_only:
        # Same as above but stop after audio
        if not os.path.exists(args.audio_only):
            print(f"ERROR: Audio file not found: {args.audio_only}")
            sys.exit(1)

        looped_audio = os.path.join(OUTPUT_DIR, f"{vid_id}_audio_{int(duration)}h.wav")
        print(f"[1/1] Looping audio to {duration}h...")

        success = run_script("loop_audio.py", [
            args.audio_only,
            "--duration", str(duration),
            "--output", looped_audio
        ])
        if success:
            video["status"] = "audio_done"
            video["last_updated"] = datetime.now().isoformat()
            save_pipeline(data)
            print(f"\nAudio-only mode complete. Tracker updated: audio_done")
        return
    else:
        looped_audio = os.path.join(OUTPUT_DIR, f"{vid_id}_audio_{int(duration)}h.wav")
        if not os.path.exists(looped_audio):
            print("ERROR: No audio provided and no pre-looped audio found.")
            print(f"  Expected: {looped_audio}")
            print(f"  Provide --audio <file> to loop source audio.")
            sys.exit(1)
        print(f"[1/5] Using existing looped audio: {looped_audio}\n")

    # Step 2: Video
    if args.black_screen or args.video is None:
        print(f"[2/5] Skipping video loop (will use black screen)...")
        looped_video = None
    elif args.video:
        if not os.path.exists(args.video):
            print(f"ERROR: Video file not found: {args.video}")
            sys.exit(1)

        looped_video = os.path.join(OUTPUT_DIR, f"{vid_id}_video_{int(duration)}h.mp4")
        print(f"[2/5] Looping video to {duration}h...")

        success = run_script("loop_video.py", [
            args.video,
            "--duration", str(duration),
            "--output", looped_video,
            "--simple"  # Use simple loop for speed on long videos
        ])
        if not success:
            sys.exit(1)

        video["status"] = "visual_done"
        video["last_updated"] = datetime.now().isoformat()
        save_pipeline(data)
        print(f"  Tracker updated: visual_done\n")
    else:
        looped_video = os.path.join(OUTPUT_DIR, f"{vid_id}_video_{int(duration)}h.mp4")
        if not os.path.exists(looped_video):
            looped_video = None

    # Step 3: Assemble
    final_output = os.path.join(OUTPUT_DIR, f"{vid_id}_{title.split(' --')[0].replace(' ', '_').lower()}.mp4")
    print(f"[3/5] Assembling final video...")

    assemble_args = [
        "--audio", looped_audio,
        "--title", f"{vid_id}_final",
        "--output-dir", OUTPUT_DIR,
        "--duration", str(duration),
        "--no-loop"  # Already looped
    ]

    if looped_video:
        assemble_args.extend(["--video", looped_video])
    else:
        assemble_args.append("--black-screen")

    success = run_script("assemble.py", assemble_args)
    if not success:
        sys.exit(1)

    video["status"] = "assembled"
    video["last_updated"] = datetime.now().isoformat()
    save_pipeline(data)
    print(f"  Tracker updated: assembled\n")

    # Step 4: Thumbnail
    thumbnail_output = os.path.join(THUMBNAIL_DIR, f"{vid_id}_thumbnail.jpg")
    display_title = video.get("thumbnail_title", title.split(" -- ")[0])
    dur_text = f"{int(duration)} HOURS" if duration >= 1 else f"{int(duration * 60)} MIN"

    print(f"[4/5] Generating thumbnail...")
    success = run_script("thumbnail.py", [
        "single",
        "--title", display_title,
        "--duration", dur_text,
        "--category", category,
        "--output", thumbnail_output
    ])
    if not success:
        print("  Thumbnail generation failed (non-critical, continuing...)")
    else:
        print()

    # Step 5: Metadata
    metadata_output = os.path.join(METADATA_DIR, f"{vid_id}_metadata.json")
    print(f"[5/5] Generating upload metadata...")
    success = run_script("metadata.py", [
        "single",
        "--title", title,
        "--category", category,
        "--duration", str(duration),
        "--output", metadata_output
    ])
    if not success:
        print("  Metadata generation failed (non-critical)")

    print(f"\n{'='*60}")
    print(f"PRODUCTION COMPLETE: {vid_id}")
    print(f"{'='*60}")
    print(f"  Final video: {OUTPUT_DIR}/{vid_id}_final.mp4")
    print(f"  Thumbnail:   {thumbnail_output}")
    print(f"  Metadata:    {metadata_output}")
    print(f"  Status:      assembled (ready for upload)")
    print(f"\n  After uploading, run:")
    print(f"    python tracker.py update {vid_id} uploaded --url \"https://youtu.be/...\"")


def main():
    parser = argparse.ArgumentParser(description="One-command video production for Laxx Meditate.")
    parser.add_argument("video_id", help="Video ID from pipeline (e.g., V01)")
    parser.add_argument("--audio", "-a", help="Source audio file to loop")
    parser.add_argument("--video", "-v", help="Source video clip to loop")
    parser.add_argument("--black-screen", action="store_true", help="Use black screen instead of video")
    parser.add_argument("--audio-only", help="Only loop audio (skip video assembly)")

    args = parser.parse_args()
    produce(args)


if __name__ == "__main__":
    main()
