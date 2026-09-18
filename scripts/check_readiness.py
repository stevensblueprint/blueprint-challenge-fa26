"""Skip automatic grading while the supplied executable TODO stubs remain."""

import os
from pathlib import Path
import re
import sys


SOURCE_FILES = ("backend/app.py", "frontend/src/App.tsx", "frontend/src/api/api.ts")
# ponytail: recognize the supplied one-line stubs, not arbitrary unfinished code;
# the test suites catch incomplete implementations after these stubs are removed.
STUB = re.compile(r"^\s*(?:raise HTTPException|throw new Error|setError)\s*\(.*TODO: implement")


def remaining_stubs(root: Path) -> list[str]:
    return [
        f"{filename}:{number}"
        for filename in SOURCE_FILES
        for number, line in enumerate((root / filename).read_text().splitlines(), 1)
        if STUB.search(line)
    ]


def self_test() -> None:
    for line in (
        '    raise HTTPException(status_code=501, detail="TODO: implement GET /books")',
        '  throw new Error("TODO: implement listBooks in src/api/api.ts");',
        "    setError('TODO: implement handleLoadBooks in App.tsx')",
    ):
        assert STUB.search(line), line
        for prefix in ("# ", "// ", "/* ", "* "):
            assert not STUB.search(prefix + line), prefix + line
    for line in ("// TODO: Implement validation", "return books", "setError(error.message)"):
        assert not STUB.search(line), line
    print("Readiness checks passed.")


if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        self_test()
    else:
        pending = remaining_stubs(Path.cwd())
        print(f"ready={'false' if pending else 'true'}")
        summary = (
            "## NOT GRADED — implementation TODOs remain\n\n"
            "Test jobs and Grade are skipped, not passed. Grading starts automatically "
            "on the next push once these stubs are implemented.\n\n"
            + "\n".join(f"- `{location}`" for location in pending)
            if pending else "## Ready for grading\n\nBoth test suites will run."
        )
        if destination := os.environ.get("GITHUB_STEP_SUMMARY"):
            with Path(destination).open("a") as output:
                output.write(summary + "\n")
