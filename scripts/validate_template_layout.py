#!/usr/bin/env python3

from pathlib import Path
import sys


REQUIRED_PATHS = [
    ".gitignore",
    "README.md",
    "QUICKSTART.md",
    "AGENTS.md",
    "workspace-assets-index.md",
    "task-completion-checklist.md",
    "docs/README.md",
    "docs/development-specs/README.md",
    "docs/development-specs/workflow-skills-design.md",
    "docs/overall-architecture/README.md",
    "docs/product-knowledge/mockhub.md",
    "docs/projects/README.md",
    "docs/projects/mockhub/README.md",
    "docs/projects/mockhub/backend-design-nodejs.md",
    "docs/projects/mockhub/development-spec.md",
    "docs/projects/mockhub/frontend-product-design.md",
    "docs/projects/mockhub/source-map.md",
    "references/api-routing.md",
    "references/runtime-and-ports.md",
    "skills/README.md",
    "skills/mockhub/README.md",
    "skills/_templates/project/scene-template/SKILL.md",
    "skills/_templates/project/scene-template/examples.md",
    "skills/_templates/project/scene-template/references/README.md",
    "workspace-config/code-sources.yaml",
    "workspace-config/workspace-version.yaml",
    "workspace-config/README.md",
    "references/README.md",
    "scripts/validate_template_layout.py",
    "task-plans/TEMPLATE.md",
    "change-history/TEMPLATE.md",
    "sources/README.md",
    "sources/backend-nest/package.json",
    "sources/frontend/package.json",
]

REQUIRED_WORKFLOWS = [
    "solution-confirmation",
    "writing-implementation-plan",
    "systematic-debugging",
    "verification-before-completion",
    "branch-and-worktree-workflow",
    "workspace-upgrade",
]

REQUIRED_PROJECT_SCENES = [
    "backend-bugfix",
    "frontend-bugfix",
    "gateway-debugging",
    "api-refactor",
    "feature-refactor",
    "performance-tuning",
]

REQUIRED_SKILL_SECTIONS = [
    "## 适用范围",
    "## 触发条件",
    "## 前置输入",
    "## 产物与退出条件",
    "## 工作流程",
    "## 验证清单",
    "## 禁止事项",
    "## 按需资料",
]


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
    required_paths = REQUIRED_PATHS + [
        f"skills/_workflow/{workflow}/SKILL.md" for workflow in REQUIRED_WORKFLOWS
    ] + [
        f"skills/mockhub/{scene}/SKILL.md" for scene in REQUIRED_PROJECT_SCENES
    ] + [
        f"skills/mockhub/{scene}/examples.md" for scene in REQUIRED_PROJECT_SCENES
    ] + [
        f"skills/mockhub/{scene}/references/README.md"
        for scene in REQUIRED_PROJECT_SCENES
    ]
    missing = [item for item in required_paths if not (root / item).exists()]
    if missing:
        print("missing required paths:")
        for item in missing:
            print(f"- {item}")
        return 1

    invalid_skills = []
    for workflow in REQUIRED_WORKFLOWS:
        path = root / "skills" / "_workflow" / workflow / "SKILL.md"
        content = path.read_text(encoding="utf-8")
        missing_sections = [
            section for section in REQUIRED_SKILL_SECTIONS if section not in content
        ]
        if missing_sections:
            invalid_skills.append((path.relative_to(root), missing_sections))

    if invalid_skills:
        print("workflow skills missing required sections:")
        for path, sections in invalid_skills:
            print(f"- {path}: {', '.join(sections)}")
        return 1

    skills_index = (root / "skills" / "README.md").read_text(encoding="utf-8")
    unregistered = [
        workflow
        for workflow in REQUIRED_WORKFLOWS
        if f"./_workflow/{workflow}/SKILL.md" not in skills_index
    ]
    if unregistered:
        print("workflow skills missing from skills/README.md:")
        for workflow in unregistered:
            print(f"- {workflow}")
        return 1

    missing_project_scenes = [
        scene
        for scene in REQUIRED_PROJECT_SCENES
        if f"./mockhub/{scene}/SKILL.md" not in skills_index
    ]
    if missing_project_scenes:
        print("project scenes missing from skills/README.md:")
        for scene in missing_project_scenes:
            print(f"- {scene}")
        return 1

    workspace_index = (root / "workspace-assets-index.md").read_text(
        encoding="utf-8"
    )
    for required_text in [
        "docs/projects/mockhub/README.md",
        "docs/projects/mockhub/source-map.md",
        "skills/mockhub/gateway-debugging/SKILL.md",
        "sources/backend-nest/",
        "sources/frontend/",
    ]:
        if required_text not in workspace_index:
            print(f"workspace asset index missing: {required_text}")
            return 1

    code_sources = (root / "workspace-config" / "code-sources.yaml").read_text(
        encoding="utf-8"
    )
    for required_text in [
        "repo_id: mockhub-backend",
        "local_path: sources/backend-nest",
        "repo_id: mockhub-frontend",
        "local_path: sources/frontend",
    ]:
        if required_text not in code_sources:
            print(f"code sources missing: {required_text}")
            return 1

    gitignore = (root / ".gitignore").read_text(encoding="utf-8").splitlines()
    if ".DS_Store" not in gitignore:
        print("missing .DS_Store ignore rule in .gitignore")
        return 1
    if "sources/*" in gitignore:
        print("sources/* must not be ignored in this workspace")
        return 1

    ignored_files = [path.relative_to(root) for path in root.rglob(".DS_Store")]
    if ignored_files:
        print("workspace contains ignored system files:")
        for path in ignored_files:
            print(f"- {path}")
        return 1

    print("MockHub workspace layout validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
