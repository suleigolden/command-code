import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { ParsedSkill, SkillMetadata } from "./types.js";

const frontmatterSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export async function parseSkillMetadata(skillFile: string): Promise<SkillMetadata> {
  const raw = await fs.readFile(skillFile, "utf8");
  const parsed = matter(raw);

  const frontmatter = frontmatterSchema.parse(parsed.data);
  const skillDir = path.dirname(skillFile);
  const dirName = path.basename(skillDir);

  // Keep this strict for the assignment.
  if (frontmatter.name !== dirName) {
    throw new Error(
      `Invalid skill at ${skillFile}: frontmatter name "${frontmatter.name}" must match directory "${dirName}".`
    );
  }

  return {
    name: frontmatter.name,
    description: frontmatter.description,
    skillDir,
    skillFile,
  };
}

export async function parseFullSkill(skillFile: string): Promise<ParsedSkill> {
  const raw = await fs.readFile(skillFile, "utf8");
  const parsed = matter(raw);

  const frontmatter = frontmatterSchema.parse(parsed.data);
  const skillDir = path.dirname(skillFile);
  const dirName = path.basename(skillDir);

  if (frontmatter.name !== dirName) {
    throw new Error(
      `Invalid skill at ${skillFile}: frontmatter name "${frontmatter.name}" must match directory "${dirName}".`
    );
  }

  return {
    name: frontmatter.name,
    description: frontmatter.description,
    skillDir,
    skillFile,
    instructions: parsed.content.trim(),
    raw,
  };
}