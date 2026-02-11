"""
Video Assembler -- Combines looped audio + looped video into final output.

One-command pipeline: takes raw short audio + short video clip and produces
a complete YouTube-ready video at the target duration.

Usage:
    # Full pipeline: loop audio + loop video + combine
    python assemble.py --audio rain_30min.wav --video rain_clip.mp4 --duration 10 --title "rain_10h"

    # Just combine pre-looped files
    python assemble.py --audio rain_10h.wav --video rain_loop_10h.mp4 --title "rain_10h" --no-loop

    # Audio only with black screen
    python assemble.py --audio brown_noise.wav --duration 10 --title "brown_noise_10h" --black-screen
"""

import argparse
import subprocess
import shutil
import sys
import os
import tempfile


def check_ffmpeg():
    if not shutil.which("ffmpeg"):
        print("ERROR: FFmpeg not found.")
        sys.exit(1)


def get_duration(filepath):
    cmd = [
        "ffprobe", "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        filepath
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return float(result.stdout.strip())


def loop_audio_to_duration(input_path, target_seconds, output_path):
    """Quick audio loop using stream_loop."""
    import math
    source_dur = get_duration(input_path)
    loops = math.ceil(target_seconds / source_dur) + 1

    cmd = [
        "ffmpeg", "-y",
        "-stream_loop", str(loops),
        "-i", input_path,
        "-t", str(target_seconds),
        "-af", f"afade=t=in:st=0:d=5,afade=t=out:st={target_seconds-10}:d=10",
        "-ar", "44100", "-ac", "2", "-b:a", "192k",
        output_path
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True)
    return output_path


def loop_video_to_duration(input_path, target_seconds, output_path):
    """Quick video loop using stream_loop."""
    import math
    source_dur = get_duration(input_path)
    loops = math.ceil(target_seconds / source_dur) + 1

    cmd = [
        "ffmpeg", "-y",
        "-stream_loop", str(loops),
        "-i", input_path,
        "-t", str(target_seconds),
        "-c:v", "libx264", "-preset", "medium", "-crf", "23",
        "-pix_fmt", "yuv420p", "-r", "30", "-an",
        "-movflags", "+faststart",
        output_path
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True)
    return output_path


def create_black_screen(target_seconds, output_path, resolution="1920x1080"):
    """Generate a black screen video at target duration."""
    w, h = resolution.split("x")
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"color=c=black:s={resolution}:r=1:d={target_seconds}",
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
        "-pix_fmt", "yuv420p", "-an",
        "-movflags", "+faststart",
        output_path
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True)
    return output_path


def combine_audio_video(video_path, audio_path, output_path):
    """Mux audio and video into final output."""
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        output_path
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True)
    return output_path


def assemble(args):
    check_ffmpeg()

    target_seconds = args.duration * 3600
    output_dir = args.output_dir or os.path.dirname(args.audio) or "."
    output_path = os.path.join(output_dir, f"{args.title}.mp4")

    print(f"=== Laxx Meditate Video Assembly ===")
    print(f"Title: {args.title}")
    print(f"Target: {args.duration}h ({target_seconds}s)")
    print(f"Output: {output_path}")
    print()

    with tempfile.TemporaryDirectory() as tmpdir:
        # Step 1: Process audio
        if args.no_loop:
            final_audio = args.audio
            print(f"Using pre-looped audio: {args.audio}")
        else:
            final_audio = os.path.join(tmpdir, "audio_looped.wav")
            print(f"Step 1: Looping audio to {args.duration}h...")
            loop_audio_to_duration(args.audio, target_seconds, final_audio)
            print(f"  Audio ready: {get_duration(final_audio)/3600:.1f}h")

        # Step 2: Process video
        if args.black_screen or args.video is None:
            final_video = os.path.join(tmpdir, "black_screen.mp4")
            res = args.resolution or "1920x1080"
            print(f"Step 2: Creating black screen ({res})...")
            create_black_screen(target_seconds, final_video, res)
        elif args.no_loop:
            final_video = args.video
            print(f"Using pre-looped video: {args.video}")
        else:
            final_video = os.path.join(tmpdir, "video_looped.mp4")
            print(f"Step 2: Looping video to {args.duration}h...")
            loop_video_to_duration(args.video, target_seconds, final_video)
            print(f"  Video ready: {get_duration(final_video)/3600:.1f}h")

        # Step 3: Combine
        print(f"Step 3: Combining audio + video...")
        combine_audio_video(final_video, final_audio, output_path)

    final_dur = get_duration(output_path)
    file_size_gb = os.path.getsize(output_path) / (1024 ** 3)
    print()
    print(f"=== COMPLETE ===")
    print(f"File: {output_path}")
    print(f"Duration: {final_dur/3600:.1f}h ({final_dur:.0f}s)")
    print(f"Size: {file_size_gb:.2f} GB")
    print(f"Ready for YouTube upload!")


def main():
    parser = argparse.ArgumentParser(
        description="Assemble looped audio + video into YouTube-ready output."
    )
    parser.add_argument("--audio", "-a", required=True, help="Input audio file")
    parser.add_argument("--video", "-v", default=None, help="Input video clip (omit for black screen)")
    parser.add_argument("--duration", "-d", type=float, default=10, help="Target hours (default: 10)")
    parser.add_argument("--title", "-t", required=True, help="Output filename (without extension)")
    parser.add_argument("--output-dir", "-o", default=None, help="Output directory")
    parser.add_argument("--no-loop", action="store_true", help="Skip looping (files are pre-looped)")
    parser.add_argument("--black-screen", action="store_true", help="Use black screen instead of video")
    parser.add_argument("--resolution", default="1920x1080", help="Resolution for black screen (default: 1920x1080)")

    args = parser.parse_args()

    if not os.path.exists(args.audio):
        print(f"ERROR: Audio file not found: {args.audio}")
        sys.exit(1)

    if args.video and not os.path.exists(args.video):
        print(f"ERROR: Video file not found: {args.video}")
        sys.exit(1)

    assemble(args)


if __name__ == "__main__":
    main()
