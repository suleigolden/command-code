import fg from "fast-glob";
import path from "node:path";
import { parseSkillMetadata } from "./parse-skill.js";
import type { SkillMetadata } from "./types.js";

export async function discoverSkills(baseDir = process.cwd()): Promise<SkillMetadata[]> {
  const skillsRoot = path.join(baseDir, ".skills");

  const matches = await fg(["*/SKILL.md"], {
    cwd: skillsRoot,
    absolute: true,
    onlyFiles: true,
    suppressErrors: true,
  });

  const discovered: SkillMetadata[] = [];
  const errors: string[] = [];

  for (const file of matches) {
    try {
      const skill = await parseSkillMetadata(file);
      discovered.push(skill);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
    }
  }

  // deterministic ordering
  discovered.sort((a, b) => a.name.localeCompare(b.name));

  if (errors.length > 0) {
    for (const error of errors) {
      console.warn(`[skill-warning] ${error}`);
    }
  }

  return discovered;
}