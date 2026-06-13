# Phase 2.5 Project Manager Preparation

Phase 2.5 prepares Jarvis Pro for reproducible automation and project-management workflows without adding real Manus or LangGraph integrations.

## Goals

- Make the n8n Jarvis Pro workflow restorable from version control.
- Keep Jarvis Web compatible with the existing n8n bridge contract.
- Define Manus as a planned COO/project-manager role.
- Prepare future Codex task handoffs with clear scope and validation.

## Scope

- Store the n8n workflow JSON under `n8n/workflows/`.
- Provide scripts for importing the workflow and starting local services.
- Document local n8n restore and testing.
- Define the COO responsibilities for sprint planning, task splitting, progress checks, questions, Codex task preparation, and reporting.

## Out of Scope

- No real Manus API integration.
- No real LangGraph integration.
- No committed API keys, passwords, tokens, or credentials.
- No change to the Jarvis Web request/response contract.

## Acceptance Criteria

- The workflow can be imported with `scripts/import-n8n-workflow.ps1`.
- The webhook accepts a JSON body containing `chatInput`.
- The webhook returns JSON in the exact shape `{ "output": "..." }`.
- Jarvis Web continues to send `chatInput` and read `data.output`.
- Local OpenAI credentials, if used in a later workflow revision, are configured only inside n8n and are never committed.

## Future COO Workflow

1. Human owner defines the sprint objective.
2. Manus COO drafts a sprint plan and identifies missing information.
3. Human owner approves the plan.
4. Manus COO prepares Codex-ready task briefs.
5. Codex implements approved tasks.
6. Manus COO checks progress and prepares a review report.
7. Human reviewer approves, requests changes, or merges.
