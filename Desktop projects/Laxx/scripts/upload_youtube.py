"""
YouTube Uploader -- Upload assembled videos to YouTube via API.

Uses the YouTube Data API v3 to upload videos with pre-generated
metadata (title, description, tags, thumbnail).

Setup:
    1. Go to https://console.cloud.google.com/
    2. Create a new project (e.g., "Laxx Meditate")
    3. Enable "YouTube Data API v3"
    4. Create OAuth 2.0 credentials (Desktop application)
    5. Download the client_secrets.json file
    6. Place it in the Laxx project root directory
    7. pip install google-auth google-auth-oauthlib google-api-python-client

Usage:
    python upload_youtube.py V01                      # Upload video V01
    python upload_youtube.py V01 --private            # Upload as private (for review)
    python upload_youtube.py V01 --schedule "2026-02-15T10:00:00Z"  # Schedule publish
    python upload_youtube.py --batch "Batch 1"        # Upload all assembled Batch 1 videos
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
PIPELINE_FILE = os.path.join(PROJECT_DIR, "tracker", "pipeline.json")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "output")
THUMBNAIL_DIR = os.path.join(PROJECT_DIR, "assets", "thumbnails")
METADATA_DIR = os.path.join(PROJECT_DIR, "tracker", "metadata")
CLIENT_SECRETS_FILE = os.path.join(PROJECT_DIR, "client_secrets.json")
TOKEN_FILE = os.path.join(PROJECT_DIR, ".youtube_token.json")

SCOPES = ["https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube"]

MAX_RETRIES = 3


def check_dependencies():
    """Verify required packages are installed."""
    missing = []
    try:
        from google.oauth2.credentials import Credentials
    except ImportError:
        missing.append("google-auth")
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        missing.append("google-auth-oauthlib")
    try:
        from googleapiclient.discovery import build
    except ImportError:
        missing.append("google-api-python-client")

    if missing:
        print("ERROR: Missing required packages:")
        print(f"  pip install {' '.join(missing)}")
        return False
    return True


def get_authenticated_service():
    """Get an authenticated YouTube API service."""
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    credentials = None

    # Load saved token
    if os.path.exists(TOKEN_FILE):
        credentials = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    # Refresh or get new token
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            print("  Refreshing authentication token...")
            credentials.refresh(Request())
        else:
            if not os.path.exists(CLIENT_SECRETS_FILE):
                print(f"ERROR: {CLIENT_SECRETS_FILE} not found.")
                print()
                print("Setup instructions:")
                print("  1. Go to https://console.cloud.google.com/")
                print("  2. Create a project -> Enable 'YouTube Data API v3'")
                print("  3. Create OAuth 2.0 credentials (Desktop application)")
                print("  4. Download client_secrets.json to the Laxx project root")
                return None

            print("  Opening browser for YouTube authentication...")
            print("  (First time only -- token will be saved for future uploads)")
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
            credentials = flow.run_local_server(port=0)

        # Save token for future use
        with open(TOKEN_FILE, "w") as token_file:
            token_file.write(credentials.to_json())
        print("  Authentication token saved.")

    return build("youtube", "v3", credentials=credentials)


def load_metadata(vid_id):
    """Load pre-generated metadata for a video."""
    # Try metadata directory first
    meta_path = os.path.join(METADATA_DIR, f"{vid_id}_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            return json.load(f)

    # Generate on the fly
    print(f"  No pre-generated metadata found, generating...")
    sys.path.insert(0, SCRIPT_DIR)
    from metadata import generate_metadata

    data = load_pipeline()
    video = None
    for v in data["videos"]:
        if v["id"] == vid_id:
            video = v
            break

    if not video:
        return None

    return generate_metadata(video["title"], video["category"], video["duration_hours"])


def find_video_file(vid_id):
    """Find the assembled video file for upload."""
    # Check for common naming patterns
    for filename in os.listdir(OUTPUT_DIR) if os.path.exists(OUTPUT_DIR) else []:
        if filename.startswith(vid_id) and filename.endswith(".mp4"):
            return os.path.join(OUTPUT_DIR, filename)
    return None


def find_thumbnail_file(vid_id):
    """Find the thumbnail file."""
    thumb_path = os.path.join(THUMBNAIL_DIR, f"{vid_id}_thumbnail.jpg")
    if os.path.exists(thumb_path):
        return thumb_path
    return None


def upload_video(youtube, video_file, metadata, privacy="public", schedule_time=None):
    """Upload a video to YouTube."""
    from googleapiclient.http import MediaFileUpload

    privacy_status = privacy
    if schedule_time:
        privacy_status = "private"  # Scheduled videos must be private initially

    body = {
        "snippet": {
            "title": metadata["title"],
            "description": metadata["description"],
            "tags": metadata.get("tags", []),
            "categoryId": metadata.get("category_id", "10"),
            "defaultLanguage": metadata.get("default_language", "en"),
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": metadata.get("made_for_kids", False),
        }
    }

    if schedule_time:
        body["status"]["publishAt"] = schedule_time

    file_size_gb = os.path.getsize(video_file) / (1024 ** 3)
    print(f"  Uploading: {video_file}")
    print(f"  File size: {file_size_gb:.2f} GB")
    print(f"  Privacy: {privacy_status}")
    if schedule_time:
        print(f"  Scheduled: {schedule_time}")

    # Use resumable upload for large files
    media = MediaFileUpload(
        video_file,
        mimetype="video/mp4",
        resumable=True,
        chunksize=50 * 1024 * 1024  # 50MB chunks
    )

    request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media
    )

    # Execute with progress tracking
    response = None
    retry_count = 0

    while response is None:
        try:
            status, response = request.next_chunk()
            if status:
                progress = int(status.progress() * 100)
                print(f"  Upload progress: {progress}%")
        except Exception as e:
            retry_count += 1
            if retry_count > MAX_RETRIES:
                print(f"  Upload failed after {MAX_RETRIES} retries: {e}")
                return None
            print(f"  Upload error, retrying ({retry_count}/{MAX_RETRIES})...")
            time.sleep(5 * retry_count)

    video_id = response["id"]
    video_url = f"https://youtu.be/{video_id}"
    print(f"  Upload complete!")
    print(f"  URL: {video_url}")

    return video_id, video_url


def set_thumbnail(youtube, video_id, thumbnail_path):
    """Set the thumbnail for an uploaded video."""
    from googleapiclient.http import MediaFileUpload

    print(f"  Setting thumbnail: {thumbnail_path}")

    media = MediaFileUpload(thumbnail_path, mimetype="image/jpeg")
    youtube.thumbnails().set(
        videoId=video_id,
        media_body=media
    ).execute()

    print(f"  Thumbnail set successfully.")


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


def upload_single(vid_id, youtube, privacy="public", schedule_time=None):
    """Upload a single video."""
    data = load_pipeline()
    video = get_video(data, vid_id)

    if not video:
        print(f"ERROR: Video '{vid_id}' not found in pipeline.")
        return False

    if video["status"] not in ("assembled", "visual_done", "audio_done"):
        print(f"WARNING: {vid_id} status is '{video['status']}' -- expected 'assembled'.")
        print(f"  Continue anyway? The video file must exist in output/.")

    # Find video file
    video_file = find_video_file(vid_id)
    if not video_file:
        print(f"ERROR: No video file found for {vid_id} in {OUTPUT_DIR}")
        print(f"  Run batch_produce.py first to assemble the video.")
        return False

    # Load metadata
    metadata = load_metadata(vid_id)
    if not metadata:
        print(f"ERROR: Could not load/generate metadata for {vid_id}")
        return False

    print(f"\n{'='*60}")
    print(f"UPLOADING: {vid_id} -- {metadata['title']}")
    print(f"{'='*60}")

    # Upload
    result = upload_video(youtube, video_file, metadata, privacy, schedule_time)
    if not result:
        return False

    yt_video_id, video_url = result

    # Set thumbnail if available
    thumbnail = find_thumbnail_file(vid_id)
    if thumbnail:
        try:
            set_thumbnail(youtube, yt_video_id, thumbnail)
        except Exception as e:
            print(f"  WARNING: Could not set thumbnail: {e}")
            print(f"  (You may need a verified YouTube channel for custom thumbnails)")

    # Update tracker
    video["status"] = "uploaded"
    video["youtube_url"] = video_url
    video["youtube_id"] = yt_video_id
    video["uploaded_at"] = datetime.now().isoformat()
    video["last_updated"] = datetime.now().isoformat()
    save_pipeline(data)

    print(f"\n  Tracker updated: uploaded")
    print(f"  YouTube URL: {video_url}")
    return True


def main():
    parser = argparse.ArgumentParser(description="Upload Laxx Meditate videos to YouTube.")
    parser.add_argument("video_id", nargs="?", help="Video ID (e.g., V01)")
    parser.add_argument("--private", action="store_true", help="Upload as private")
    parser.add_argument("--unlisted", action="store_true", help="Upload as unlisted")
    parser.add_argument("--schedule", help="Schedule publish time (ISO 8601, e.g., 2026-02-15T10:00:00Z)")
    parser.add_argument("--batch", help="Upload all assembled videos in a batch")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded")

    args = parser.parse_args()

    if not args.dry_run and not check_dependencies():
        sys.exit(1)

    privacy = "public"
    if args.private:
        privacy = "private"
    elif args.unlisted:
        privacy = "unlisted"

    data = load_pipeline()
    videos_to_upload = []

    if args.batch:
        videos_to_upload = [
            v for v in data["videos"]
            if v.get("batch") == args.batch and v["status"] == "assembled"
        ]
    elif args.video_id:
        video = get_video(data, args.video_id)
        if not video:
            print(f"ERROR: Video '{args.video_id}' not found.")
            sys.exit(1)
        videos_to_upload = [video]
    else:
        parser.print_help()
        return

    if not videos_to_upload:
        print("No assembled videos found to upload.")
        print("  Run batch_produce.py first to assemble videos.")
        return

    print(f"{'='*60}")
    print(f"YOUTUBE UPLOAD")
    print(f"Videos: {len(videos_to_upload)}")
    print(f"Privacy: {privacy}")
    print(f"{'='*60}")

    if args.dry_run:
        for v in videos_to_upload:
            video_file = find_video_file(v["id"])
            thumb_file = find_thumbnail_file(v["id"])
            file_info = f"{os.path.getsize(video_file)/(1024**3):.2f} GB" if video_file else "NOT FOUND"
            print(f"\n  {v['id']}: {v['title']}")
            print(f"  Video: {file_info}")
            print(f"  Thumbnail: {'YES' if thumb_file else 'NO'}")
        print(f"\n  (Dry run -- no uploads performed)")
        return

    # Authenticate once
    youtube = get_authenticated_service()
    if not youtube:
        sys.exit(1)

    results = []
    for video in videos_to_upload:
        success = upload_single(video["id"], youtube, privacy, args.schedule)
        results.append((video["id"], "SUCCESS" if success else "FAILED"))

        # Pause between uploads (YouTube rate limits)
        if len(videos_to_upload) > 1:
            print("\n  Waiting 30s before next upload...")
            time.sleep(30)

    print(f"\n{'='*60}")
    print(f"UPLOAD RESULTS")
    print(f"{'='*60}")
    for vid_id, status in results:
        print(f"  {vid_id}: {status}")

    success_count = sum(1 for _, s in results if s == "SUCCESS")
    print(f"\n  {success_count}/{len(results)} uploaded successfully.")


if __name__ == "__main__":
    main()
