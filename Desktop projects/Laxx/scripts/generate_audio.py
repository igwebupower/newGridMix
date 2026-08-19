"""
Suno AI Audio Generator -- Generate ambient audio via API.

Connects to Suno AI through a third-party API to generate instrumental
ambient tracks for each video in the pipeline.

Setup:
    1. Sign up at https://sunoapi.org/ and get your API key
    2. Set environment variable: set SUNO_API_KEY=your_key_here
       Or create a .env file in the Laxx root directory with: SUNO_API_KEY=your_key_here

Usage:
    python generate_audio.py V01                    # Generate audio for video V01
    python generate_audio.py V01 --model V4_5PLUS   # Use specific model
    python generate_audio.py --batch "Batch 1"      # Generate all Batch 1 audio
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
PIPELINE_FILE = os.path.join(PROJECT_DIR, "tracker", "pipeline.json")
AUDIO_DIR = os.path.join(PROJECT_DIR, "assets", "audio")

API_BASE = "https://api.sunoapi.org/api/v1"

# Style prompts by category for Suno's custom mode
CATEGORY_STYLES = {
    "brown_noise": "ambient, deep brown noise, drone, low frequency rumble, smooth, warm, no melody, no rhythm, sleep",
    "white_noise": "ambient, white noise, static, broadband, neutral, clean, consistent, sleep",
    "pink_noise": "ambient, pink noise, gentle, soft, warm, natural, balanced, baby sleep",
    "nature": "ambient, nature soundscape, environmental, immersive, natural, peaceful, no music",
    "cozy": "ambient, cozy atmosphere, indoor, warm, environmental sounds, comfortable, relaxing",
    "scifi": "ambient, sci-fi, space station hum, deep electronic drone, futuristic, mechanical, low frequency",
    "frequencies": "ambient, healing frequency, meditation, sustained tones, gentle harmonics, binaural, slow",
    "signature": "ambient, premium layered noise, smooth deep brown noise, warm texture, immersive, polished"
}


def load_api_key():
    """Load API key from environment or .env file."""
    key = os.environ.get("SUNO_API_KEY")
    if key:
        return key

    env_file = os.path.join(PROJECT_DIR, ".env")
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line.startswith("SUNO_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")

    print("ERROR: SUNO_API_KEY not found.")
    print("  Option 1: set SUNO_API_KEY=your_key_here")
    print("  Option 2: Create .env file in project root with SUNO_API_KEY=your_key_here")
    print("  Get your key at: https://sunoapi.org/api-key")
    sys.exit(1)


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


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
}


def api_request(endpoint, payload, api_key):
    """Make an API request to Suno API."""
    url = f"{API_BASE}/{endpoint}"
    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {api_key}")
    for k, v in HEADERS.items():
        req.add_header(k, v)

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        print(f"  API Error {e.code}: {body[:300]}")
        return None
    except urllib.error.URLError as e:
        print(f"  Connection error: {e.reason}")
        return None


def api_get(endpoint, api_key):
    """Make a GET request to Suno API."""
    url = f"{API_BASE}/{endpoint}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {api_key}")
    for k, v in HEADERS.items():
        req.add_header(k, v)

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        print(f"  API Error {e.code}: {body[:300]}")
        return None


def download_file(url, output_path):
    """Download a file from URL with proper headers."""
    print(f"  Downloading to {output_path}...")
    req = urllib.request.Request(url)
    for k, v in HEADERS.items():
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=300) as resp:
        with open(output_path, "wb") as f:
            while True:
                chunk = resp.read(1024 * 1024)  # 1MB chunks
                if not chunk:
                    break
                f.write(chunk)
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  Downloaded: {size_mb:.1f} MB")


def generate_audio(video, api_key, model="V4_5PLUS"):
    """Generate audio for a video using Suno API."""
    category = video["category"]
    vid_id = video["id"]
    title = video.get("thumbnail_title", video["title"].split(" -- ")[0])

    style = CATEGORY_STYLES.get(category, CATEGORY_STYLES["brown_noise"])

    # Build the generation payload
    # callBackUrl is required by the API but we poll instead
    payload = {
        "customMode": True,
        "instrumental": True,
        "style": style,
        "title": f"Laxx - {title}",
        "model": model,
        "callBackUrl": "https://httpbin.org/post"
    }

    print(f"\n  Generating audio for {vid_id}: {title}")
    print(f"  Model: {model}")
    print(f"  Style: {style[:80]}...")
    print(f"  Instrumental: True")
    print()

    # Submit generation request
    result = api_request("generate", payload, api_key)

    if not result:
        print("  ERROR: Generation request failed.")
        return None

    # Extract task ID from response
    if isinstance(result, dict) and result.get("code") == 200:
        resp_data = result.get("data", {})
    else:
        print(f"  Unexpected response: {json.dumps(result)[:300]}")
        resp_data = result.get("data", {})

    # The API returns a taskId for polling
    task_id = None
    if isinstance(resp_data, dict):
        task_id = resp_data.get("taskId") or resp_data.get("task_id") or resp_data.get("id")
    elif isinstance(resp_data, str):
        task_id = resp_data

    if not task_id:
        # Try extracting from top level
        task_id = result.get("taskId") or result.get("task_id")

    if not task_id:
        print(f"  Could not extract task ID from response.")
        print(f"  Full response: {json.dumps(result)[:500]}")
        return None

    print(f"  Submitted! Task ID: {task_id}")
    print(f"  Waiting for generation (typically 60-180 seconds)...")

    # Poll for completion using record-info endpoint
    audio_url = None
    for attempt in range(36):  # Up to 6 minutes
        time.sleep(10)
        print(f"  Polling... ({(attempt + 1) * 10}s)")

        status_result = api_get(f"generate/record-info?taskId={task_id}", api_key)

        if not status_result:
            continue

        status_data = status_result.get("data", {})
        if isinstance(status_data, str):
            continue

        state = ""
        if isinstance(status_data, dict):
            state = (status_data.get("status") or "").upper()

        if state == "SUCCESS":
            # Extract audio URL from response
            response = status_data.get("response", {})
            suno_data = response.get("sunoData", [])

            if isinstance(suno_data, list) and suno_data:
                audio_url = suno_data[0].get("audioUrl") or suno_data[0].get("audio_url")
                if audio_url:
                    duration = suno_data[0].get("duration", "?")
                    print(f"  Generation complete! Duration: {duration}s")
                    break
            else:
                # Try alternate response shapes
                audio_url = (
                    status_data.get("audioUrl") or
                    status_data.get("audio_url") or
                    response.get("audioUrl")
                )
                if audio_url:
                    print(f"  Generation complete!")
                    break

        elif state == "FIRST_SUCCESS":
            print(f"  First track ready, waiting for completion...")

        elif state in ("FAILED", "ERROR"):
            error_msg = status_data.get("errorMessage") or status_data.get("error") or "unknown"
            print(f"  Generation failed: {error_msg}")
            return None

    if not audio_url:
        print("  Timed out waiting for generation.")
        print(f"  Last status: {json.dumps(status_result)[:300] if status_result else 'none'}")
        return None

    # Download the audio file
    os.makedirs(AUDIO_DIR, exist_ok=True)
    output_filename = f"{vid_id}_{category}.mp3"
    output_path = os.path.join(AUDIO_DIR, output_filename)
    download_file(audio_url, output_path)

    return output_path


def main():
    parser = argparse.ArgumentParser(description="Generate audio for Laxx Meditate videos via Suno AI API.")
    parser.add_argument("video_id", nargs="?", help="Video ID (e.g., V01)")
    parser.add_argument("--model", default="V4_5PLUS", help="Suno model (default: V4_5PLUS)")
    parser.add_argument("--batch", help="Generate for all videos in a batch (e.g., 'Batch 1')")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated without calling API")

    args = parser.parse_args()
    api_key = load_api_key()
    data = load_pipeline()

    videos_to_process = []

    if args.batch:
        videos_to_process = [v for v in data["videos"] if v.get("batch") == args.batch and v["status"] == "planned"]
        if not videos_to_process:
            print(f"No planned videos found in {args.batch}.")
            return
    elif args.video_id:
        video = get_video(data, args.video_id)
        if not video:
            print(f"ERROR: Video '{args.video_id}' not found.")
            sys.exit(1)
        videos_to_process = [video]
    else:
        parser.print_help()
        return

    print(f"{'='*60}")
    print(f"SUNO AI AUDIO GENERATION")
    print(f"Videos to process: {len(videos_to_process)}")
    print(f"Model: {args.model}")
    print(f"{'='*60}")

    if args.dry_run:
        for v in videos_to_process:
            style = CATEGORY_STYLES.get(v["category"], "ambient")
            print(f"\n  {v['id']}: {v['title']}")
            print(f"  Style: {style[:80]}...")
        print("\n  (Dry run -- no API calls made)")
        return

    results = []
    for video in videos_to_process:
        audio_path = generate_audio(video, api_key, args.model)

        if audio_path:
            video["status"] = "audio_done"
            video["audio_file"] = audio_path
            from datetime import datetime
            video["last_updated"] = datetime.now().isoformat()
            save_pipeline(data)
            results.append((video["id"], "SUCCESS", audio_path))
            print(f"\n  {video['id']}: Audio saved to {audio_path}")
            print(f"  Tracker updated: audio_done")
        else:
            results.append((video["id"], "FAILED", None))

        # Rate limiting between videos
        if len(videos_to_process) > 1:
            print("\n  Waiting 15s before next generation...")
            time.sleep(15)

    print(f"\n{'='*60}")
    print(f"RESULTS")
    print(f"{'='*60}")
    for vid_id, status, path in results:
        print(f"  {vid_id}: {status}" + (f" -> {path}" if path else ""))

    success = sum(1 for _, s, _ in results if s == "SUCCESS")
    print(f"\n  {success}/{len(results)} generated successfully.")

    if success > 0:
        print(f"\n  Next step: Run loop_audio.py to extend to full duration, or use batch_produce.py")


if __name__ == "__main__":
    main()
