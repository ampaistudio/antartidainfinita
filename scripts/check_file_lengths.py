#!/usr/bin/env python3
"""Check repository files and alert when any text file exceeds a line limit."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


DEFAULT_THRESHOLD = 500
DEFAULT_IGNORED_DIRS = {
    ".git",
    ".next",
    ".venv",
    "build",
    "coverage",
    "dist",
    "node_modules",
}
DEFAULT_IGNORED_FILES = {".DS_Store"}


@dataclass(frozen=True)
class FileReport:
    path: Path
    lines: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Alert when text files exceed a maximum number of lines."
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Root directory to scan. Defaults to the current directory.",
    )
    parser.add_argument(
        "--threshold",
        type=int,
        default=DEFAULT_THRESHOLD,
        help=f"Maximum allowed lines per file. Defaults to {DEFAULT_THRESHOLD}.",
    )
    parser.add_argument(
        "--include-hidden",
        action="store_true",
        help="Include hidden directories and files in the scan.",
    )
    return parser.parse_args()


def is_probably_binary(path: Path) -> bool:
    try:
        with path.open("rb") as handle:
            chunk = handle.read(4096)
    except OSError:
        return True

    return b"\0" in chunk


def iter_files(root: Path, include_hidden: bool) -> Iterable[Path]:
    for path in root.rglob("*"):
        if not path.is_file():
            continue

        relative_parts = path.relative_to(root).parts
        if not include_hidden:
            if any(part.startswith(".") for part in relative_parts):
                continue
            if any(part in DEFAULT_IGNORED_DIRS for part in relative_parts):
                continue

        if path.name in DEFAULT_IGNORED_FILES:
            continue

        yield path


def count_lines(path: Path) -> int:
    with path.open("r", encoding="utf-8") as handle:
        return len(handle.read().splitlines())


def scan(root: Path, threshold: int, include_hidden: bool) -> list[FileReport]:
    reports: list[FileReport] = []

    for path in iter_files(root, include_hidden):
        if is_probably_binary(path):
            continue

        try:
            lines = count_lines(path)
        except UnicodeDecodeError:
            continue
        except OSError:
            continue

        if lines > threshold:
            reports.append(FileReport(path=path, lines=lines))

    reports.sort(key=lambda item: (-item.lines, str(item.path)))
    return reports


def main() -> int:
    args = parse_args()
    root = args.root.resolve()

    if not root.exists():
        print(f"ERROR: root path does not exist: {root}")
        return 2

    reports = scan(root, args.threshold, args.include_hidden)

    if not reports:
        print(f"OK: no files exceed {args.threshold} lines in {root}")
        return 0

    print(f"ALERT: {len(reports)} file(s) exceed {args.threshold} lines in {root}")
    for report in reports:
        relative_path = report.path.relative_to(root)
        overflow = report.lines - args.threshold
        print(f"- {relative_path} -> {report.lines} lines (+{overflow})")

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
