# Mini Agent Skills CLI

A minimal Node.js CLI coding agent that implements the core ideas of the open Agent Skills specification.

This project discovers skills from a local `.skills/` directory, sends only lightweight skill metadata to Claude for routing, and loads the full `SKILL.md` instructions only when a skill is selected. This keeps unrelated skills out of context and demonstrates progressive skill loading.

## Features

- Discover skills from a local `.skills/` directory
- Parse `SKILL.md` frontmatter for `name` and `description`
- Use Claude to match a user prompt to the most relevant skill
- Load full skill instructions only when needed
- Fall back to a normal response when no skill matches
- Support community-style skills that follow the `SKILL.md` convention
- Debug mode for visibility into discovery and routing decisions

## Project Setup

1. **Install dependencies**

   ```bash
   cd agent
   npm install
   ```

2. **Configure environment**

   Use the `.env-example` file to create a `.env` file in the `agent` directory with your Anthropic API key:

   ```bash
   ANTHROPIC_API_KEY=your_api_key_here
   ```

   Optionally set the model (defaults to `claude-sonnet-4-6`):

   ```bash
   ANTHROPIC_MODEL=claude-sonnet-4-6
   ```

3. **Build** (optional for development; use `npm run dev` to run without building)

   ```bash
   npm run build
   ```

## Running tests

Run the test suite once:

```bash
npm run test
```

Run tests in watch mode (re-run on file changes):

```bash
npm run test:watch
```
