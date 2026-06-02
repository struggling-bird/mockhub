#!/usr/bin/env python3

from pathlib import Path
import shutil
import sys

DEFAULT_SCENES = [
    "new-feature-dev",
    "bugfix",
    "security-fix",
    "api-refactor",
    "feature-refactor",
    "performance-tuning",
]


def main() -> int:
    if len(sys.argv) not in (3, 4):
        print(
            "usage: init_project_skills.py <template_root> <project_slug> [scene1,scene2,...|all]"
        )
        return 1

    template_root = Path(sys.argv[1]).resolve()
    project_slug = sys.argv[2].strip()
    source_dir = template_root / "skills" / "_templates" / "project"
    target_dir = template_root / "skills" / project_slug
    scene_template_dir = source_dir / "scene-template"
    scene_arg = sys.argv[3].strip() if len(sys.argv) == 4 else "all"

    if not project_slug:
        print("project_slug is required")
        return 1

    if not source_dir.exists():
        print(f"template source not found: {source_dir}")
        return 1

    if target_dir.exists():
        print(f"target already exists: {target_dir}")
        return 1

    shutil.copytree(source_dir, target_dir)
    if not scene_template_dir.exists():
        print(f"scene template not found: {scene_template_dir}")
        return 1

    if scene_arg == "all":
        scenes = DEFAULT_SCENES
    else:
        scenes = [item.strip() for item in scene_arg.split(",") if item.strip()]

    template_scene = target_dir / "scene-template"
    if not template_scene.exists():
        print(f"copied scene template not found: {template_scene}")
        return 1

    for scene in scenes:
        shutil.copytree(template_scene, target_dir / scene)

    shutil.rmtree(template_scene)
    print(f"created: {target_dir}")
    print(f"scenes: {', '.join(scenes)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
