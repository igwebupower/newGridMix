"""
Full Automated Pipeline -- Generate, assemble, and upload in one command.

End-to-end automation: Suno AI audio -> Runway video clip -> loop & assemble -> upload to YouTube.

Setup:
    1. Create .env file with SUNO_API_KEY and RUNWAYML_API_SECRET
    2. Place client_secrets.json for YouTube API
    3. pip install runwayml google-auth google-auth-oauthlib google-api-python-client Pillow

Usage:
    python full_pipeline.py V01                    # Full pipeline for V01
    python full_pipeline.py V01 --skip-upload      # Generate + assemble only
    python full_pipeline.py V01 --skip-video       # Audio + black screen only
    python full_pipeline.py --batch "Batch 1"      # Process entire batch
    python full_pipeline.py --dry-run V01          # Show what would happen
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


def load_pipeline():
    with open(PIPELINE_FILE) as f:
        return json.load(f)


def get_video(data, video_id):
    for v in data["videos"]:
        if v["id"] == video_id.upper():
            return v
    return None


def run_script(name, args_list):
    """Run a pipeline script and return success status."""
    script = os.path.join(SCRIPT_DIR, name)
    cmd = [sys.executable, script] + args_list
    result = subprocess.run(cmd, cwd=SCRIPT_DIR)
    return result.returncode == 0


def run_full_pipeline(video_id, skip_video=False, skip_upload=False, privacy="unlisted"):
    """Run the complete pipeline for a single video."""
    data = load_pipeline()
    video = get_video(data, video_id)

    if not video:
        print(f"ERROR: Video '{video_id}' not found.")
        return False

    vid_id = video["id"]
    title = video["title"]

    print(f"\n{'#'*70}")
    print(f"#  FULL PIPELINE: {vid_id} -- {title}")
    print(f"{'#'*70}\n")

    audio_dir = os.path.join(PROJECT_DIR, "assets", "audio")
    video_dir = os.path.join(PROJECT_DIR, "assets", "video")

    # ---- STEP 1: Generate Audio ----
    audio_file = None
    for ext in (".mp3", ".wav"):
        candidate = os.path.join(audio_dir, f"{vid_id}_{video['category']}{ext}")
        if os.path.exists(candidate):
            audio_file = candidate
            break

    if audio_file:
        print(f"[1/5] Audio already exists: {audio_file}")
    else:
        print(f"[1/5] Generating audio via Suno AI...")
        success = run_script("generate_audio.py", [vid_id])
        if not success:
            print(f"  FAILED: Audio generation failed for {vid_id}")
            return False

        # Find the generated file
        for ext in (".mp3", ".wav"):
            candidate = os.path.join(audio_dir, f"{vid_id}_{video['category']}{ext}")
            if os.path.exists(candidate):
                audio_file = candidate
                break

        if not audio_file:
            print(f"  FAILED: No audio file found after generation.")
            return False

    # ---- STEP 2: Generate Video Clip ----
    video_clip = None
    if not skip_video and video.get("visual_prompt"):
        clip_path = os.path.join(video_dir, f"{vid_id}_clip.mp4")

        if os.path.exists(clip_path):
            print(f"[2/5] Video clip already exists: {clip_path}")
            video_clip = clip_path
        else:
            print(f"[2/5] Generating video clip via Runway...")
            success = run_script("generate_video.py", [vid_id])
            if success and os.path.exists(clip_path):
                video_clip = clip_path
            else:
                print(f"  WARNING: Video generation failed, falling back to black screen.")
    else:
        print(f"[2/5] Skipping video generation (black screen mode)")

    # ---- STEP 3: Assemble ----
    print(f"[3/5] Assembling final video...")
    assemble_args = [vid_id, "--audio", audio_file]
    if video_clip:
        assemble_args.extend(["--video", video_clip])
    else:
        assemble_args.append("--black-screen")

    success = run_script("batch_produce.py", assemble_args)
    if not success:
        print(f"  FAILED: Assembly failed for {vid_id}")
        return False

    # ---- STEP 4: Generate Thumbnail ----
    print(f"[4/5] Generating thumbnail...")
    thumb_title = video.get("thumbnail_title", title.split(" -- ")[0])
    dur = video["duration_hours"]
    dur_text = f"{int(dur)} HOURS" if dur >= 1 else f"{int(dur * 60)} MIN"

    run_script("thumbnail.py", [
        "single",
        "--title", thumb_title,
        "--duration", dur_text,
        "--category", video["category"],
        "--output", os.path.join(PROJECT_DIR, "assets", "thumbnails", f"{vid_id}_thumbnail.jpg")
    ])

    # ---- STEP 5: Upload ----
    if skip_upload:
        print(f"[5/5] Skipping upload (--skip-upload)")
    else:
        print(f"[5/5] Uploading to YouTube...")
        upload_args = [vid_id]
        if privacy == "private":
            upload_args.append("--private")
        elif privacy == "unlisted":
            upload_args.append("--unlisted")

        success = run_script("upload_youtube.py", upload_args)
        if not success:
            print(f"  WARNING: Upload failed. Video is assembled and ready for manual upload.")

    print(f"\n{'#'*70}")
    print(f"#  PIPELINE COMPLETE: {vid_id}")
    print(f"{'#'*70}\n")
    return True


def main():
    parser = argparse.ArgumentParser(description="Full automated pipeline for Laxx Meditate.")
    parser.add_argument("video_id", nargs="?", help="Video ID (e.g., V01)")
    parser.add_argument("--batch", help="Process all planned videos in a batch")
    parser.add_argument("--skip-video", action="store_true", help="Skip video generation (black screen)")
    parser.add_argument("--skip-upload", action="store_true", help="Skip YouTube upload")
    parser.add_argument("--privacy", default="unlisted", choices=["public", "private", "unlisted"],
                        help="Upload privacy (default: unlisted for review)")
    parser.add_argument("--dry-run", action="store_true", help="Show pipeline steps without executing")

    args = parser.parse_args()

    data = load_pipeline()
    videos = []

    if args.batch:
        videos = [v for v in data["videos"] if v.get("batch") == args.batch and v["status"] == "planned"]
    elif args.video_id:
        video = get_video(data, args.video_id)
        if video:
            videos = [video]
        else:
            print(f"ERROR: Video '{args.video_id}' not found.")
            sys.exit(1)
    else:
        parser.print_help()
        return

    if not videos:
        print("No planned videos found to process.")
        return

    if args.dry_run:
        print(f"{'='*60}")
        print(f"DRY RUN -- Full Pipeline")
        print(f"{'='*60}")
        for v in videos:
            has_visual = "Runway clip" if v.get("visual_prompt") and not args.skip_video else "Black screen"
            print(f"\n  {v['id']}: {v['title']}")
            print(f"    1. Audio: Suno AI ({v['category']})")
            print(f"    2. Video: {has_visual}")
            print(f"    3. Assemble: loop + combine -> {v['duration_hours']}h")
            print(f"    4. Thumbnail: auto-generated")
            print(f"    5. Upload: {'Skip' if args.skip_upload else args.privacy}")
        print(f"\n  (No actions taken)")
        return

    results = []
    for video in videos:
        success = run_full_pipeline(
            video["id"],
            skip_video=args.skip_video,
            skip_upload=args.skip_upload,
            privacy=args.privacy
        )
        results.append((video["id"], success))

    print(f"\n{'='*60}")
    print(f"PIPELINE SUMMARY")
    print(f"{'='*60}")
    for vid_id, success in results:
        status = "SUCCESS" if success else "FAILED"
        print(f"  {vid_id}: {status}")

    success_count = sum(1 for _, s in results if s)
    print(f"\n  {success_count}/{len(results)} completed successfully.")


if __name__ == "__main__":
    main()
