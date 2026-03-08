import { runAgent } from "./run-agent.js";

const args = process.argv.slice(2);
const debugFlag = args.indexOf("--debug");
const debug = debugFlag !== -1;
if (debug) args.splice(debugFlag, 1);
const userPrompt = args.join(" ").trim();

if (!userPrompt) {
  console.error("Usage: npm run dev -- \"<your prompt>\"");
  console.error("Example: npm run dev -- \"what's the weather in Toronto?\"");
  process.exit(1);
}

runAgent(userPrompt, { debug })
  .then((result) => {
    if (debug && result.mode === "skill") {
      console.log(`[skill: ${result.skillName}] ${result.reason}\n`);
    }
    console.log(result.output);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
