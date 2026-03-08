import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseFullSkill, parseSkillMetadata } from "../parse-skill.js";

const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mini-agent-parse-test-"));
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

describe("parseSkillMetadata", () => {
  it("parses valid skill frontmatter", async () => {
    const root = await makeTempDir();
    const skillDir = path.join(root, "changelog-generator");
    const skillFile = path.join(skillDir, "SKILL.md");

    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(
      skillFile,
      `---
name: changelog-generator
description: Generate changelogs from commits
---

You are a changelog generator.
`,
      "utf8"
    );

    const result = await parseSkillMetadata(skillFile);

    expect(result).toEqual({
      name: "changelog-generator",
      description: "Generate changelogs from commits",
      skillDir,
      skillFile,
    });
  });

  it("throws when frontmatter name does not match directory name", async () => {
    const root = await makeTempDir();
    const skillDir = path.join(root, "changelog-generator");
    const skillFile = path.join(skillDir, "SKILL.md");

    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(
      skillFile,
      `---
name: readme-writer
description: Write README files
---

You are a README writer.
`,
      "utf8"
    );

    await expect(parseSkillMetadata(skillFile)).rejects.toThrow(
      /must match directory/
    );
  });

  it("throws when required frontmatter is missing", async () => {
    const root = await makeTempDir();
    const skillDir = path.join(root, "changelog-generator");
    const skillFile = path.join(skillDir, "SKILL.md");

    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(
      skillFile,
      `---
name: changelog-generator
---

Missing description here.
`,
      "utf8"
    );

    await expect(parseSkillMetadata(skillFile)).rejects.toThrow();
  });
});

describe("parseFullSkill", () => {
  it("parses metadata and instructions", async () => {
    const root = await makeTempDir();
    const skillDir = path.join(root, "readme-writer");
    const skillFile = path.join(skillDir, "SKILL.md");

    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(
      skillFile,
      `---
name: readme-writer
description: Write or improve README files
---

You are a README writing specialist.

Include setup and usage sections when relevant.
`,
      "utf8"
    );

    const result = await parseFullSkill(skillFile);

    expect(result.name).toBe("readme-writer");
    expect(result.description).toBe("Write or improve README files");
    expect(result.skillDir).toBe(skillDir);
    expect(result.skillFile).toBe(skillFile);
    expect(result.instructions).toContain("You are a README writing specialist.");
    expect(result.raw).toContain("description: Write or improve README files");
  });
});