import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { discoverSkills } from "../discover-skills.js";

const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mini-agent-discover-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      await fs.rm(dir, { recursive: true, force: true });
    }
  }
});

describe("discoverSkills", () => {
  it("discovers valid skills from local .skills directory", async () => {
    const root = await makeTempDir();

    const changelogDir = path.join(root, ".skills", "changelog-generator");
    const readmeDir = path.join(root, ".skills", "readme-writer");

    await fs.mkdir(changelogDir, { recursive: true });
    await fs.mkdir(readmeDir, { recursive: true });

    await fs.writeFile(
      path.join(changelogDir, "SKILL.md"),
      `---
name: changelog-generator
description: Generate changelogs from commits
---

Changelog instructions.
`,
      "utf8"
    );

    await fs.writeFile(
      path.join(readmeDir, "SKILL.md"),
      `---
name: readme-writer
description: Write or improve README files
---

README instructions.
`,
      "utf8"
    );

    const skills = await discoverSkills(root);

    expect(skills).toHaveLength(2);
    expect(skills.map((s) => s.name)).toEqual([
      "changelog-generator",
      "readme-writer",
    ]);
  });

  it("ignores invalid skills and keeps valid ones", async () => {
    const root = await makeTempDir();

    const validDir = path.join(root, ".skills", "changelog-generator");
    const invalidDir = path.join(root, ".skills", "broken-skill");

    await fs.mkdir(validDir, { recursive: true });
    await fs.mkdir(invalidDir, { recursive: true });

    await fs.writeFile(
      path.join(validDir, "SKILL.md"),
      `---
name: changelog-generator
description: Generate changelogs from commits
---

Valid instructions.
`,
      "utf8"
    );

    await fs.writeFile(
      path.join(invalidDir, "SKILL.md"),
      `---
name: another-name
description: Broken because name does not match directory
---

Broken instructions.
`,
      "utf8"
    );

    const skills = await discoverSkills(root);

    expect(skills).toHaveLength(1);
    expect(skills[0]?.name).toBe("changelog-generator");
  });

  it("returns an empty array when .skills does not exist", async () => {
    const root = await makeTempDir();

    const skills = await discoverSkills(root);

    expect(skills).toEqual([]);
  });
});