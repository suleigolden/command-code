import { anthropic, MODEL } from "./anthropic.js";
import { discoverSkills } from "./discover-skills.js";
import { parseFullSkill } from "./parse-skill.js";

type RunAgentOptions = {
  debug?: boolean;
};

export async function runAgent(userPrompt: string, options: RunAgentOptions = {}) {
  const { debug = false } = options;

  const skills = await discoverSkills();

  if (debug) {
    console.log("[debug] discovered skills:");
    console.log(JSON.stringify(skills, null, 2));
  }

  // Lazy import to avoid cycles in future extensions
  const { selectSkill } = await import("./select-skill.js");
  const selection = await selectSkill(userPrompt, skills);

  if (debug) {
    console.log("[debug] skill selection:");
    console.log(JSON.stringify(selection, null, 2));
  }

  if (selection.useSkill) {
    const selected = skills.find((s) => s.name === selection.skillName);

    if (!selected) {
      throw new Error(
        `Model selected "${selection.skillName}" but no such discovered skill exists.`
      );
    }

    const fullSkill = await parseFullSkill(selected.skillFile);

    const systemPrompt = `
You are a Node.js CLI coding agent.

A skill has been selected for this task.
Follow the skill carefully.

Activated skill name:
${fullSkill.name}

Activated skill description:
${fullSkill.description}

Activated skill instructions:
${fullSkill.instructions}
`.trim();

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return {
      mode: "skill" as const,
      skillName: fullSkill.name,
      reason: selection.reason,
      output: text,
    };
  }

  const fallbackSystem = `
You are a Node.js CLI coding agent.

No skill was selected for this request.
Answer normally and helpfully.
`.trim();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    temperature: 0.2,
    system: fallbackSystem,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return {
    mode: "normal" as const,
    reason: selection.reason,
    output: text,
  };
}