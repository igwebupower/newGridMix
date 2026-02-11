"""
Audio Looper -- Extends short audio files to target duration.

Takes a short audio clip (15-60 minutes) and seamlessly loops it to
a target duration (8-10 hours) with crossfade transitions.

Usage:
    python loop_audio.py input.wav --duration 10 --output output.wav
    python loop_audio.py input.mp3 --duration 8 --crossfade 5
"""

import argparse
import subprocess
import shutil
import sys
import os
import math
import tempfile


def check_ffmpeg():
    """Verify FFmpeg is installed and accessible."""
    if not shutil.which("ffmpeg"):
        print("ERROR: FFmpeg not found. Install it from https://ffmpeg.org/download.html")
        print("  Windows: winget install FFmpeg")
        sys.exit(1)


def get_audio_duration(filepath):
    """Get duration of audio file in seconds using ffprobe."""
    cmd = [
        "ffprobe", "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        filepath
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERROR: Could not read '{filepath}'. Is it a valid audio file?")
        sys.exit(1)
    return float(result.stdout.strip())


def loop_audio(input_path, target_hours, output_path, crossfade_seconds=3):
    """
    Loop audio to target duration with crossfade transitions.

    Strategy:
    1. If input is short (< 5 min), first concatenate several copies with crossfade
       to create a longer segment, then loop that.
    2. Use FFmpeg's -stream_loop for bulk looping, then trim to exact duration.
    3. Apply fade-in at start and fade-out at end.
    """
    check_ffmpeg()

    target_seconds = target_hours * 3600
    source_duration = get_audio_duration(input_path)

    print(f"Source audio: {source_duration:.1f}s ({source_duration/60:.1f} min)")
    print(f"Target duration: {target_hours}h ({target_seconds}s)")

    if source_duration >= target_seconds:
        print("Source is already longer than target. Trimming...")
        cmd = [
            "ffmpeg", "-y", "-i", input_path,
            "-t", str(target_seconds),
            "-af", f"afade=t=in:st=0:d=5,afade=t=out:st={target_seconds-10}:d=10",
            "-ar", "44100", "-ac", "2",
            output_path
        ]
        subprocess.run(cmd, check=True)
        print(f"Done: {output_path}")
        return

    # Calculate how many loops we need
    loops_needed = math.ceil(target_seconds / source_duration) + 1

    print(f"Loops needed: {loops_needed}")
    print("Looping with stream_loop and trimming to target...")

    # Use stream_loop for efficient looping, then trim and add fades
    cmd = [
        "ffmpeg", "-y",
        "-stream_loop", str(loops_needed),
        "-i", input_path,
        "-t", str(target_seconds),
        "-af", (
            f"afade=t=in:st=0:d=5,"
            f"afade=t=out:st={target_seconds-10}:d=10"
        ),
        "-ar", "44100", "-ac", "2",
        "-b:a", "192k",
        output_path
    ]

    print("Processing... (this may take a few minutes for 10-hour files)")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"ERROR: FFmpeg failed:\n{result.stderr[-500:]}")
        sys.exit(1)

    final_duration = get_audio_duration(output_path)
    print(f"Output: {output_path}")
    print(f"Final duration: {final_duration/3600:.1f}h ({final_duration:.0f}s)")


def loop_audio_with_crossfade(input_path, target_hours, output_path, crossfade_seconds=3):
    """
    Loop audio with proper crossfade between segments for seamless transitions.

    Uses a two-pass approach:
    1. Create a medium-length segment with crossfaded copies
    2. Stream-loop that segment to target duration
    """
    check_ffmpeg()

    target_seconds = target_hours * 3600
    source_duration = get_audio_duration(input_path)

    print(f"Source audio: {source_duration:.1f}s ({source_duration/60:.1f} min)")
    print(f"Target duration: {target_hours}h ({target_seconds}s)")
    print(f"Crossfade: {crossfade_seconds}s")

    # Step 1: Create a crossfaded medium segment (4 copies with crossfade)
    # This gives us a ~4x longer segment with smooth transitions
    with tempfile.TemporaryDirectory() as tmpdir:
        mid_segment = os.path.join(tmpdir, "mid_segment.wav")

        # Build a filter that concatenates 4 copies with crossfade
        copies = 4
        filter_parts = []

        # Create input labels
        inputs = []
        for i in range(copies):
            inputs.extend(["-i", input_path])

        # Build crossfade chain
        if copies == 1:
            filter_complex = "[0:a]acopy[out]"
        else:
            # First crossfade: [0] x [1]
            cf_duration = min(crossfade_seconds, source_duration * 0.1)
            filter_complex = f"[0:a][1:a]acrossfade=d={cf_duration}:c1=tri:c2=tri[cf1]"
            for i in range(2, copies):
                prev = f"cf{i-1}"
                curr = f"cf{i}"
                filter_complex += f";[{prev}][{i}:a]acrossfade=d={cf_duration}:c1=tri:c2=tri[{curr}]"
            filter_complex = filter_complex.replace(f"[cf{copies-1}]", "[out]")

        cmd = [
            "ffmpeg", "-y",
            *inputs,
            "-filter_complex", filter_complex,
            "-map", "[out]",
            "-ar", "44100", "-ac", "2",
            mid_segment
        ]

        print("Step 1/2: Creating crossfaded segment...")
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print("Crossfade failed, falling back to simple loop...")
            loop_audio(input_path, target_hours, output_path, crossfade_seconds)
            return

        mid_duration = get_audio_duration(mid_segment)
        print(f"  Mid-segment: {mid_duration/60:.1f} min")

        # Step 2: Stream-loop the mid segment to target duration
        loops_needed = math.ceil(target_seconds / mid_duration) + 1

        cmd = [
            "ffmpeg", "-y",
            "-stream_loop", str(loops_needed),
            "-i", mid_segment,
            "-t", str(target_seconds),
            "-af", (
                f"afade=t=in:st=0:d=5,"
                f"afade=t=out:st={target_seconds-10}:d=10"
            ),
            "-ar", "44100", "-ac", "2",
            "-b:a", "192k",
            output_path
        ]

        print("Step 2/2: Extending to target duration...")
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"ERROR: FFmpeg failed:\n{result.stderr[-500:]}")
            sys.exit(1)

    final_duration = get_audio_duration(output_path)
    print(f"Output: {output_path}")
    print(f"Final duration: {final_duration/3600:.1f}h ({final_duration:.0f}s)")


def main():
    parser = argparse.ArgumentParser(
        description="Loop short audio to target duration with seamless transitions."
    )
    parser.add_argument("input", help="Input audio file (wav, mp3, flac, etc.)")
    parser.add_argument(
        "--duration", "-d", type=float, default=10,
        help="Target duration in hours (default: 10)"
    )
    parser.add_argument(
        "--output", "-o", default=None,
        help="Output file path (default: input_10h.wav)"
    )
    parser.add_argument(
        "--crossfade", "-c", type=float, default=3,
        help="Crossfade duration in seconds between loops (default: 3)"
    )
    parser.add_argument(
        "--simple", action="store_true",
        help="Use simple loop without crossfade (faster but may have audible seam)"
    )

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"ERROR: File not found: {args.input}")
        sys.exit(1)

    if args.output is None:
        base, ext = os.path.splitext(args.input)
        args.output = f"{base}_{int(args.duration)}h{ext}"

    if args.simple:
        loop_audio(args.input, args.duration, args.output, args.crossfade)
    else:
        loop_audio_with_crossfade(args.input, args.duration, args.output, args.crossfade)


if __name__ == "__main__":
    main()
