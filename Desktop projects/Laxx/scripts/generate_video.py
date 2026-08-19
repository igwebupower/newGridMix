"""
Runway API Video Generator -- Generate ambient visual clips via API.

Connects to Runway's API to generate short video clips for each video
in the pipeline, which are then looped to full duration.

Setup:
    1. Sign up at https://dev.runwayml.com/ and get your API secret
    2. pip install runwayml
    3. Set environment variable: set RUNWAYML_API_SECRET=your_secret_here
       Or create a .env file with: RUNWAYML_API_SECRET=your_secret_here

Usage:
    python generate_video.py V01                       # Generate video clip for V01
    python generate_video.py V01 --model gen3a_turbo    # Use specific model
    python generate_video.py V01 --duration 10         # 10-second clip
    python generate_video.py --batch "Batch 1"         # Generate all Batch 1 clips
"""

import argparse
import json
import os
import sys
import time
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
PIPELINE_FILE = os.path.join(PROJECT_DIR, "tracker", "pipeline.json")
VIDEO_DIR = os.path.join(PROJECT_DIR, "assets", "video")

VISUAL_SUFFIX = (
    "Cinematic quality, 4K resolution, slow smooth camera movement, "
    "moody atmospheric lighting, dark color palette, "
    "seamless loop-friendly, ambient and calming mood."
)


def load_env():
    """Load environment variables from .env file."""
    env_file = os.path.join(PROJECT_DIR, ".env")
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    key, value = line.split("=", 1)
                    value = value.strip().strip('"').strip("'")
                    if key.strip() not in os.environ:
                        os.environ[key.strip()] = value


def check_runway_sdk():
    """Check if Runway SDK is installed."""
    try:
        import runwayml
        return True
    except ImportError:
        print("ERROR: runwayml SDK not installed.")
        print("  Install with: pip install runwayml")
        return False


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


def download_file(url, output_path):
    """Download a file from URL."""
    print(f"  Downloading to {output_path}...")
    urllib.request.urlretrieve(url, output_path)
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  Downloaded: {size_mb:.1f} MB")


def generate_clip(video, model="gen3a_turbo", clip_duration=10):
    """Generate a video clip using Runway API."""
    from runwayml import RunwayML, TaskFailedError

    vid_id = video["id"]
    prompt = video.get("visual_prompt")

    if not prompt:
        print(f"  {vid_id}: No visual prompt defined (black screen video).")
        print(f"  Skipping -- use --black-screen with assemble.py instead.")
        return None

    # Enhance the prompt
    full_prompt = f"{prompt} {VISUAL_SUFFIX}"

    print(f"\n  Generating clip for {vid_id}")
    print(f"  Model: {model}")
    print(f"  Duration: {clip_duration}s")
    print(f"  Prompt: {full_prompt[:100]}...")

    client = RunwayML()

    try:
        # Create text-to-video task
        task = client.text_to_video.create(
            model=model,
            prompt_text=full_prompt,
            ratio="1280:720",
            duration=clip_duration,
        )

        print(f"  Task submitted: {task.id}")
        print(f"  Waiting for generation...")

        # Poll for completion
        result = task.wait_for_task_output()

        print(f"  Generation complete!")

        # Extract video URL from result
        video_url = None
        if hasattr(result, "output") and result.output:
            if isinstance(result.output, list) and result.output:
                video_url = result.output[0]
            elif isinstance(result.output, str):
                video_url = result.output
        elif hasattr(result, "artifacts") and result.artifacts:
            video_url = result.artifacts[0].get("url") or result.artifacts[0].get("uri")

        if not video_url:
            print(f"  Could not extract video URL from result.")
            print(f"  Result: {result}")
            return None

        # Download the clip
        os.makedirs(VIDEO_DIR, exist_ok=True)
        output_filename = f"{vid_id}_clip.mp4"
        output_path = os.path.join(VIDEO_DIR, output_filename)
        download_file(video_url, output_path)

        return output_path

    except TaskFailedError as e:
        print(f"  Generation failed: {e}")
        if hasattr(e, "task_details"):
            print(f"  Details: {e.task_details}")
        return None
    except Exception as e:
        print(f"  Unexpected error: {e}")
        return None


def estimate_cost(videos, model, clip_duration):
    """Estimate credit cost for generation."""
    credits_per_second = {
        "gen3a_turbo": 5,
        "gen4.5": 12,
        "veo3": 40,
        "veo3.1": 40,
        "veo3.1_fast": 20,
    }
    cps = credits_per_second.get(model, 5)
    total_credits = len(videos) * clip_duration * cps
    total_cost = total_credits * 0.01  # $0.01 per credit
    return total_credits, total_cost


def main():
    parser = argparse.ArgumentParser(description="Generate video clips for Laxx Meditate via Runway API.")
    parser.add_argument("video_id", nargs="?", help="Video ID (e.g., V01)")
    parser.add_argument("--model", default="gen3a_turbo", help="Runway model (default: gen3a_turbo)")
    parser.add_argument("--duration", type=int, default=10, help="Clip duration in seconds (default: 10)")
    parser.add_argument("--batch", help="Generate for all videos in a batch (e.g., 'Batch 1')")
    parser.add_argument("--dry-run", action="store_true", help="Show cost estimate without generating")

    args = parser.parse_args()

    load_env()

    if not args.dry_run and not check_runway_sdk():
        sys.exit(1)

    if not args.dry_run and not os.environ.get("RUNWAYML_API_SECRET"):
        print("ERROR: RUNWAYML_API_SECRET not set.")
        print("  Option 1: set RUNWAYML_API_SECRET=your_secret_here")
        print("  Option 2: Add to .env file: RUNWAYML_API_SECRET=your_secret_here")
        print("  Get your key at: https://dev.runwayml.com/")
        sys.exit(1)

    data = load_pipeline()
    videos_to_process = []

    if args.batch:
        videos_to_process = [
            v for v in data["videos"]
            if v.get("batch") == args.batch
            and v.get("visual_prompt")  # Skip black-screen videos
            and v["status"] in ("planned", "audio_done")
        ]
    elif args.video_id:
        video = get_video(data, args.video_id)
        if not video:
            print(f"ERROR: Video '{args.video_id}' not found.")
            sys.exit(1)
        videos_to_process = [video]
    else:
        parser.print_help()
        return

    if not videos_to_process:
        print("No videos to process.")
        return

    # Cost estimate
    total_credits, total_cost = estimate_cost(videos_to_process, args.model, args.duration)

    print(f"{'='*60}")
    print(f"RUNWAY VIDEO GENERATION")
    print(f"Videos: {len(videos_to_process)}")
    print(f"Model: {args.model}")
    print(f"Clip duration: {args.duration}s each")
    print(f"Estimated cost: {total_credits} credits (${total_cost:.2f})")
    print(f"{'='*60}")

    if args.dry_run:
        for v in videos_to_process:
            prompt = v.get("visual_prompt", "No prompt")
            has_prompt = "YES" if v.get("visual_prompt") else "NO (black screen)"
            print(f"\n  {v['id']}: {v['title']}")
            print(f"  Visual: {has_prompt}")
            if v.get("visual_prompt"):
                print(f"  Prompt: {prompt[:80]}...")
        print(f"\n  Total estimated: {total_credits} credits (${total_cost:.2f})")
        print(f"  (Dry run -- no API calls made)")
        return

    results = []
    for video in videos_to_process:
        clip_path = generate_clip(video, args.model, args.duration)

        if clip_path:
            video["video_file"] = clip_path
            if video["status"] == "audio_done":
                video["status"] = "visual_done"
            from datetime import datetime
            video["last_updated"] = datetime.now().isoformat()
            save_pipeline(data)
            results.append((video["id"], "SUCCESS", clip_path))
        else:
            results.append((video["id"], "FAILED/SKIPPED", None))

        # Brief pause between generations
        if len(videos_to_process) > 1:
            time.sleep(5)

    print(f"\n{'='*60}")
    print(f"RESULTS")
    print(f"{'='*60}")
    for vid_id, status, path in results:
        print(f"  {vid_id}: {status}" + (f" -> {path}" if path else ""))

    success = sum(1 for _, s, _ in results if s == "SUCCESS")
    print(f"\n  {success}/{len(results)} clips generated.")

    if success > 0:
        print(f"\n  Next step: Run batch_produce.py to loop clips and assemble final videos.")


if __name__ == "__main__":
    main()
