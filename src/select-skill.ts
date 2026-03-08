import { anthropic, MODEL } from "./anthropic.js";
import type { SkillMetadata, SkillSelection } from "./types.js";

export async function selectSkill(
  userPrompt: string,
  skills: SkillMetadata[]
): Promise<SkillSelection> {
  if (skills.length === 0) {
    return {
      useSkill: false,
      reason: "No skills were discovered in the local .skills directory.",
    };
  }

  const skillsCatalog = skills.map((skill) => ({
    name: skill.name,
    description: skill.description,
  }));

  const systemPrompt = `
You are a skill router for a CLI coding agent.

Your task:
- Review the user's prompt
- Review the available skills
- Decide whether exactly one skill should be used
- Return JSON only
- Do not include markdown fences
- If no skill is clearly relevant, return useSkill=false

Rules:
- Only choose a skill when it is directly relevant
- Do not guess
- Do not select multiple skills
- Prefer no skill over a weak match

Return exactly one of these shapes:

{"useSkill":true,"skillName":"skill-name","reason":"brief reason"}
{"useSkill":false,"reason":"brief reason"}
`.trim();

  const userMessage = `
User prompt:
${userPrompt}

Available skills:
${JSON.stringify(skillsCatalog, null, 2)}
`.trim();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    temperature: 0,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      useSkill: false,
      reason: `Model returned non-JSON during skill selection: ${text}`,
    };
  }

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "useSkill" in parsed &&
    (parsed as { useSkill: boolean }).useSkill === true &&
    typeof (parsed as { skillName?: unknown }).skillName === "string" &&
    typeof (parsed as { reason?: unknown }).reason === "string"
  ) {
    return {
      useSkill: true,
      skillName: (parsed as unknown as { skillName: string }).skillName,
      reason: (parsed as unknown as { reason: string }).reason,
    };
  }

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "useSkill" in parsed &&
    (parsed as { useSkill: boolean }).useSkill === false &&
    typeof (parsed as { reason?: unknown }).reason === "string"
  ) {
    return {
      useSkill: false,
      reason: (parsed as unknown as { reason: string }).reason,
    };
  }

  return {
    useSkill: false,
    reason: "Model returned invalid selection JSON shape.",
  };
}