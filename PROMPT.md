# Hackathon Challenge Prompt: The Unread Problem - What Did I Miss?

Build a simple React app for the hackathon challenge "The Unread Problem - What Did I Miss?" using WebLLM running locally in the browser with WebGPU.

## Requirements

1. **Input Interface**:
   - Set up a clean, responsive UI where users can paste raw unread chat logs (Slack, Discord, Teams, WhatsApp, etc.).
   - Provide 1-click "Load Sample Chat" presets covering critical incidents, sprint planning, and design discussions.

2. **100% On-Device Local AI**:
   - Use `@mlc-ai/web-llm` running directly inside the browser using WebGPU compute shaders.
   - Processing must happen 100% client-side without sending sensitive conversation logs to any external servers or APIs.

3. **Structured JSON Parsing**:
   - Have the local LLM parse the chat log into a structured JSON schema containing:
     - `summary` (string): 2-3 sentence executive recap of what happened.
     - `key_decisions` (array of strings): Official decisions and consensus reached.
     - `action_items` (array of `{ task, assignee, deadline }`): Concrete next steps with ownership and timeframes.
     - `mentions` (array of strings): Tagged `@handles` and key participants.
     - `urgency` (`"High"` | `"Medium"` | `"Low"`): Priority level based on outages, deadlines, or routine chatter.

4. **Intelligence Dashboard**:
   - Render the parsed output into clean, visual sections:
     - Prominent urgency banner with color-coded status.
     - Executive summary card with 1-click clipboard copy.
     - Key decisions checklist.
     - Interactive action items checklist (with completion toggle).
     - Participant and mention pills.
     - Raw JSON inspector and Markdown brief exporter.
