"""
Video Looper -- Extends short video clips to match audio duration.

Takes a short video clip (10-60 seconds) and loops it seamlessly to
match a target duration, with crossfade transitions between loops.

Usage:
    python loop_video.py clip.mp4 --duration 10 --output loop_10h.mp4
    python loop_video.py clip.mp4 --duration 8 --crossfade 2
"""

import argparse
import subprocess
import shutil
import sys
import os
import math


def check_ffmpeg():
    if not shutil.which("ffmpeg"):
        print("ERROR: FFmpeg not found. Install it from https://ffmpeg.org/download.html")
        sys.exit(1)


def get_duration(filepath):
    cmd = [
        "ffprobe", "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        filepath
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERROR: Could not read '{filepath}'")
        sys.exit(1)
    return float(result.stdout.strip())


def loop_video(input_path, target_hours, output_path, crossfade_seconds=1.5):
    """
    Loop video to target duration.

    Uses FFmpeg stream_loop for efficiency -- this avoids creating
    massive intermediate files.
    """
    check_ffmpeg()

    target_seconds = target_hours * 3600
    source_duration = get_duration(input_path)

    print(f"Source video: {source_duration:.1f}s")
    print(f"Target duration: {target_hours}h ({target_seconds}s)")

    loops_needed = math.ceil(target_seconds / source_duration) + 1

    print(f"Loops needed: {loops_needed}")
    print("Processing... (this may take a while for long videos)")

    # Stream-loop the video and trim to target duration
    # Use -c:v libx264 for broad compatibility
    cmd = [
        "ffmpeg", "-y",
        "-stream_loop", str(loops_needed),
        "-i", input_path,
        "-t", str(target_seconds),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-an",  # No audio -- we'll add audio in the assembly step
        "-movflags", "+faststart",
        output_path
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"ERROR: FFmpeg failed:\n{result.stderr[-500:]}")
        sys.exit(1)

    final_duration = get_duration(output_path)
    file_size_gb = os.path.getsize(output_path) / (1024 ** 3)
    print(f"Output: {output_path}")
    print(f"Duration: {final_duration/3600:.1f}h ({final_duration:.0f}s)")
    print(f"File size: {file_size_gb:.2f} GB")


def loop_video_with_crossfade(input_path, target_hours, output_path, crossfade_seconds=1.5):
    """
    Create a crossfaded loop of the video clip, then extend to target.

    For ambient content, a gentle crossfade between loop points prevents
    jarring visual jumps. This creates a 2-copy crossfaded segment first,
    then stream-loops that.
    """
    check_ffmpeg()
    import tempfile

    target_seconds = target_hours * 3600
    source_duration = get_duration(input_path)

    print(f"Source video: {source_duration:.1f}s")
    print(f"Target duration: {target_hours}h")
    print(f"Crossfade: {crossfade_seconds}s")

    cf = min(crossfade_seconds, source_duration * 0.2)

    with tempfile.TemporaryDirectory() as tmpdir:
        # Step 1: Create a crossfaded pair
        mid_path = os.path.join(tmpdir, "mid_loop.mp4")
        offset = source_duration - cf

        filter_complex = (
            f"[0:v][1:v]xfade=transition=fade:duration={cf}:offset={offset},"
            f"format=yuv420p[outv]"
        )

        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-i", input_path,
            "-filter_complex", filter_complex,
            "-map", "[outv]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "23",
            "-r", "30", "-an",
            mid_path
        ]

        print("Step 1/2: Creating crossfaded segment...")
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print("Crossfade failed, falling back to simple loop...")
            loop_video(input_path, target_hours, output_path, crossfade_seconds)
            return

        mid_duration = get_duration(mid_path)
        loops_needed = math.ceil(target_seconds / mid_duration) + 1

        # Step 2: Stream-loop the crossfaded segment
        cmd = [
            "ffmpeg", "-y",
            "-stream_loop", str(loops_needed),
            "-i", mid_path,
            "-t", str(target_seconds),
            "-c:v", "libx264", "-preset", "medium", "-crf", "23",
            "-pix_fmt", "yuv420p",
            "-r", "30", "-an",
            "-movflags", "+faststart",
            output_path
        ]

        print("Step 2/2: Extending to target duration...")
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"ERROR: FFmpeg failed:\n{result.stderr[-500:]}")
            sys.exit(1)

    final_duration = get_duration(output_path)
    file_size_gb = os.path.getsize(output_path) / (1024 ** 3)
    print(f"Output: {output_path}")
    print(f"Duration: {final_duration/3600:.1f}h")
    print(f"File size: {file_size_gb:.2f} GB")


def main():
    parser = argparse.ArgumentParser(
        description="Loop short video clips to target duration."
    )
    parser.add_argument("input", help="Input video file (mp4, mov, etc.)")
    parser.add_argument(
        "--duration", "-d", type=float, default=10,
        help="Target duration in hours (default: 10)"
    )
    parser.add_argument(
        "--output", "-o", default=None,
        help="Output file path (default: input_10h.mp4)"
    )
    parser.add_argument(
        "--crossfade", "-c", type=float, default=1.5,
        help="Crossfade duration in seconds (default: 1.5)"
    )
    parser.add_argument(
        "--simple", action="store_true",
        help="Simple loop without crossfade (faster)"
    )

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"ERROR: File not found: {args.input}")
        sys.exit(1)

    if args.output is None:
        base, ext = os.path.splitext(args.input)
        args.output = f"{base}_{int(args.duration)}h{ext}"

    if args.simple:
        loop_video(args.input, args.duration, args.output, args.crossfade)
    else:
        loop_video_with_crossfade(args.input, args.duration, args.output, args.crossfade)


if __name__ == "__main__":
    main()
