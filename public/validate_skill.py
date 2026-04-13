#!/usr/bin/env python3
"""Validate a SKILL.md file against the Isaac Skill Standard v1.

Usage:
    python3 validate_skill.py path/to/SKILL.md
    python3 validate_skill.py example-skills/nav-slam-lidar/SKILL.md

Checks:
    - YAML frontmatter is parseable
    - Required fields present (name, version, description, license, domain, execution)
    - Domain is a recognized value
    - Execution context is valid (sim | real | hybrid)
    - Entry point is specified
    - License is a known SPDX identifier
    - Inputs/outputs have name + type if present
    - Parameters have name + type if present
    - Version is semver-like
    - LICENSE.txt exists alongside SKILL.md
"""

import re
import sys
from pathlib import Path

VALID_DOMAINS = {
    "navigation", "manipulation", "perception", "data_training",
    "simulation", "control", "safety", "integration",
}

VALID_CONTEXTS = {"sim", "real", "hybrid"}

COMMON_SPDX = {
    "Apache-2.0", "MIT", "BSD-2-Clause", "BSD-3-Clause", "GPL-2.0-only",
    "GPL-3.0-only", "LGPL-2.1-only", "LGPL-3.0-only", "MPL-2.0",
    "ISC", "Unlicense", "CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0",
    "Proprietary",
}

SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+")


def parse_frontmatter(text: str) -> tuple[dict, list[str]]:
    """Extract YAML frontmatter from a SKILL.md file."""
    errors = []
    if not text.startswith("---"):
        errors.append("File does not start with YAML frontmatter (---)")
        return {}, errors

    end = text.find("\n---", 3)
    if end == -1:
        errors.append("No closing --- for YAML frontmatter")
        return {}, errors

    yaml_str = text[3:end].strip()
    try:
        import yaml
        data = yaml.safe_load(yaml_str)
    except ImportError:
        data = _simple_yaml_parse(yaml_str)
    except Exception as e:
        errors.append(f"YAML parse error: {e}")
        return {}, errors

    if not isinstance(data, dict):
        errors.append("Frontmatter is not a YAML mapping")
        return {}, errors

    return data, errors


def _simple_yaml_parse(text: str) -> dict:
    """Minimal key: value parser for when PyYAML is not available."""
    result = {}
    current_key = None
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if ":" in stripped and not stripped.startswith("-") and not stripped.startswith(" "):
            k, v = stripped.split(":", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if v:
                result[k] = v
            else:
                result[k] = {}
            current_key = k
        elif stripped.startswith("-") and current_key:
            if not isinstance(result.get(current_key), list):
                result[current_key] = []
            result[current_key].append(stripped.lstrip("- ").strip())
    return result


def validate(path: Path) -> list[str]:
    """Validate a SKILL.md and return a list of issues (empty = valid)."""
    errors = []
    warnings = []

    if not path.exists():
        return [f"File not found: {path}"]

    text = path.read_text(encoding="utf-8")
    fm, parse_errors = parse_frontmatter(text)
    errors.extend(parse_errors)
    if not fm:
        return errors

    for field in ("name", "version", "description", "license", "domain"):
        if field not in fm:
            errors.append(f"Missing required field: {field}")

    if "execution" not in fm:
        errors.append("Missing required field: execution")
    elif isinstance(fm["execution"], dict):
        if "context" not in fm["execution"]:
            errors.append("Missing required field: execution.context")
        elif fm["execution"]["context"] not in VALID_CONTEXTS:
            errors.append(f"Invalid execution.context: '{fm['execution']['context']}' (expected: {VALID_CONTEXTS})")
        if "entry_point" not in fm["execution"]:
            errors.append("Missing required field: execution.entry_point")

    if "domain" in fm and fm["domain"] not in VALID_DOMAINS:
        errors.append(f"Unrecognized domain: '{fm['domain']}' (expected: {sorted(VALID_DOMAINS)})")

    if "license" in fm and fm["license"] not in COMMON_SPDX:
        warnings.append(f"Uncommon license: '{fm['license']}' (not in common SPDX list)")

    if "version" in fm and not SEMVER_RE.match(str(fm["version"])):
        errors.append(f"Version '{fm['version']}' is not semver (expected X.Y.Z)")

    for io_field in ("inputs", "outputs"):
        if io_field in fm and isinstance(fm[io_field], list):
            for i, item in enumerate(fm[io_field]):
                if isinstance(item, dict):
                    if "name" not in item:
                        errors.append(f"{io_field}[{i}]: missing 'name'")
                    if "type" not in item:
                        errors.append(f"{io_field}[{i}]: missing 'type'")

    if "parameters" in fm and isinstance(fm["parameters"], list):
        for i, param in enumerate(fm["parameters"]):
            if isinstance(param, dict):
                if "name" not in param:
                    errors.append(f"parameters[{i}]: missing 'name'")
                if "type" not in param:
                    errors.append(f"parameters[{i}]: missing 'type'")

    license_file = path.parent / "LICENSE.txt"
    if not license_file.exists():
        alt = path.parent / "LICENSE"
        if not alt.exists():
            warnings.append("No LICENSE.txt found alongside SKILL.md")

    body_after_frontmatter = text[text.find("\n---", 3) + 4:].strip()
    if len(body_after_frontmatter) < 50:
        warnings.append("SKILL.md body is very short — consider adding documentation")

    return errors + [f"WARNING: {w}" for w in warnings]


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 validate_skill.py <path/to/SKILL.md>")
        print("       python3 validate_skill.py example-skills/*/SKILL.md")
        sys.exit(1)

    exit_code = 0
    for arg in sys.argv[1:]:
        path = Path(arg)
        issues = validate(path)
        if issues:
            print(f"\n{'FAIL' if any(not i.startswith('WARNING') for i in issues) else 'WARN'}: {path}")
            for issue in issues:
                prefix = "  ⚠ " if issue.startswith("WARNING") else "  ✗ "
                print(f"{prefix}{issue}")
            if any(not i.startswith("WARNING") for i in issues):
                exit_code = 1
        else:
            print(f"OK: {path}")

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
