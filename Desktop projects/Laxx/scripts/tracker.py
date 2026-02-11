"""
Video Pipeline Tracker -- Manage the Laxx Meditate production pipeline.

Track the status of each video through production stages:
  planned -> audio_done -> visual_done -> assembled -> uploaded

Usage:
    python tracker.py status                      # Show all videos and their status
    python tracker.py status --filter planned      # Show only planned videos
    python tracker.py update V01 audio_done        # Mark V01 audio as complete
    python tracker.py update V01 uploaded --url "https://youtu.be/..."
    python tracker.py next                         # Show next video to work on
    python tracker.py stats                        # Show progress summary
    python tracker.py export V01                   # Export metadata for upload
"""

import argparse
import json
import os
import sys
from datetime import datetime

PIPELINE_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "tracker", "pipeline.json"
)

VALID_STATUSES = ["planned", "audio_done", "visual_done", "assembled", "uploaded"]
STATUS_ICONS = {
    "planned": "[ ]",
    "audio_done": "[A]",
    "visual_done": "[V]",
    "assembled": "[R]",
    "uploaded": "[X]"
}


def load_pipeline():
    path = os.path.normpath(PIPELINE_FILE)
    if not os.path.exists(path):
        print(f"ERROR: Pipeline file not found: {path}")
        print("Run 'python tracker.py init' to create it from template.")
        sys.exit(1)
    with open(path) as f:
        return json.load(f)


def save_pipeline(data):
    path = os.path.normpath(PIPELINE_FILE)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def cmd_status(args):
    data = load_pipeline()
    videos = data.get("videos", [])

    if args.filter:
        videos = [v for v in videos if v["status"] == args.filter]

    if not videos:
        print("No videos match the filter.")
        return

    # Header
    print(f"\n{'ID':<6} {'Status':<5} {'Batch':<8} {'Category':<14} {'Dur':<5} {'Title'}")
    print("-" * 100)

    for v in videos:
        icon = STATUS_ICONS.get(v["status"], "???")
        dur = f"{v['duration_hours']}h"
        batch = v.get("batch", "?")
        print(f"{v['id']:<6} {icon:<5} {batch:<8} {v['category']:<14} {dur:<5} {v['title']}")

    print(f"\nTotal: {len(videos)} videos")


def cmd_update(args):
    data = load_pipeline()
    video_id = args.video_id.upper()

    video = None
    for v in data.get("videos", []):
        if v["id"] == video_id:
            video = v
            break

    if not video:
        print(f"ERROR: Video '{video_id}' not found.")
        sys.exit(1)

    old_status = video["status"]
    new_status = args.new_status

    if new_status not in VALID_STATUSES:
        print(f"ERROR: Invalid status '{new_status}'. Valid: {', '.join(VALID_STATUSES)}")
        sys.exit(1)

    video["status"] = new_status
    video["last_updated"] = datetime.now().isoformat()

    if args.url:
        video["youtube_url"] = args.url

    if args.notes:
        video.setdefault("notes", []).append({
            "date": datetime.now().isoformat(),
            "text": args.notes
        })

    save_pipeline(data)
    print(f"Updated {video_id}: {old_status} -> {new_status}")
    print(f"  Title: {video['title']}")


def cmd_next(args):
    data = load_pipeline()

    # Find the first video that isn't uploaded
    for v in data.get("videos", []):
        if v["status"] != "uploaded":
            icon = STATUS_ICONS.get(v["status"], "???")
            print(f"\nNext video to work on:")
            print(f"  ID:       {v['id']}")
            print(f"  Title:    {v['title']}")
            print(f"  Category: {v['category']}")
            print(f"  Duration: {v['duration_hours']}h")
            print(f"  Status:   {v['status']} {icon}")
            print()

            # Show what step to do next
            next_steps = {
                "planned": "Create/source audio -> run loop_audio.py",
                "audio_done": "Create/source visuals -> run loop_video.py",
                "visual_done": "Run assemble.py to combine audio + video",
                "assembled": "Upload to YouTube with generated metadata"
            }
            print(f"  Next step: {next_steps.get(v['status'], '?')}")
            return

    print("All videos are uploaded! Time to plan the next batch.")


def cmd_stats(args):
    data = load_pipeline()
    videos = data.get("videos", [])

    counts = {}
    for status in VALID_STATUSES:
        counts[status] = sum(1 for v in videos if v["status"] == status)

    total = len(videos)
    completed = counts.get("uploaded", 0)

    print(f"\n=== Laxx Meditate Pipeline Stats ===\n")
    print(f"Total videos: {total}")
    print(f"Progress:     {completed}/{total} ({100*completed//total if total else 0}%)\n")

    bar_width = 40
    for status in VALID_STATUSES:
        count = counts[status]
        filled = int(bar_width * count / total) if total else 0
        bar = "#" * filled + "." * (bar_width - filled)
        print(f"  {status:<14} [{bar}] {count}")

    # Category breakdown
    print(f"\nBy category:")
    cat_counts = {}
    for v in videos:
        cat = v["category"]
        cat_counts.setdefault(cat, {"total": 0, "done": 0})
        cat_counts[cat]["total"] += 1
        if v["status"] == "uploaded":
            cat_counts[cat]["done"] += 1

    for cat, c in sorted(cat_counts.items()):
        print(f"  {cat:<16} {c['done']}/{c['total']}")

    # Total hours of content
    total_hours = sum(v["duration_hours"] for v in videos)
    done_hours = sum(v["duration_hours"] for v in videos if v["status"] == "uploaded")
    print(f"\nContent hours: {done_hours:.0f}h / {total_hours:.0f}h produced")


def cmd_export(args):
    """Export upload-ready metadata for a video."""
    data = load_pipeline()
    video_id = args.video_id.upper()

    video = None
    for v in data.get("videos", []):
        if v["id"] == video_id:
            video = v
            break

    if not video:
        print(f"ERROR: Video '{video_id}' not found.")
        sys.exit(1)

    # Import metadata generator
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from metadata import generate_metadata

    meta = generate_metadata(
        title=video["title"],
        category=video["category"],
        duration_hours=video["duration_hours"]
    )

    output_path = args.output or f"{video_id}_upload.json"
    with open(output_path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"Exported upload metadata: {output_path}")
    print(f"\nTitle: {meta['title']}")
    print(f"Tags: {len(meta['tags'])} tags")
    print(f"Synthetic content flag: {meta['contains_synthetic_content']}")


def main():
    parser = argparse.ArgumentParser(description="Laxx Meditate Video Pipeline Tracker")
    subparsers = parser.add_subparsers(dest="command")

    # status
    sp = subparsers.add_parser("status", help="Show pipeline status")
    sp.add_argument("--filter", "-f", choices=VALID_STATUSES, help="Filter by status")

    # update
    sp = subparsers.add_parser("update", help="Update video status")
    sp.add_argument("video_id", help="Video ID (e.g., V01)")
    sp.add_argument("new_status", choices=VALID_STATUSES, help="New status")
    sp.add_argument("--url", help="YouTube URL (for uploaded status)")
    sp.add_argument("--notes", "-n", help="Add a note")

    # next
    subparsers.add_parser("next", help="Show next video to work on")

    # stats
    subparsers.add_parser("stats", help="Show progress statistics")

    # export
    sp = subparsers.add_parser("export", help="Export upload metadata for a video")
    sp.add_argument("video_id", help="Video ID (e.g., V01)")
    sp.add_argument("--output", "-o", help="Output file path")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    commands = {
        "status": cmd_status,
        "update": cmd_update,
        "next": cmd_next,
        "stats": cmd_stats,
        "export": cmd_export,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
