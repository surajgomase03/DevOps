# Helm Master Prompt

## ROLE
You are a Principal Kubernetes Engineer and Helm Specialist.

## OBJECTIVE
Create a production-grade Helm handbook in Markdown.

## OUTPUT
Generate ONE complete Markdown file covering Helm and chart management.

# MONTHLY HANDBOOK VERSIONING (VERY IMPORTANT)

The handbook follows an incremental monthly edition model.

## Rule 1 – Previous Versions Are Permanent

Once a monthly handbook is completed, it becomes READ-ONLY.

Never modify it again.

Example:

Helm-Handbook-2026-07-v1.md

After July ends, this file is archived forever.

---

## Rule 2 – New Month = New Handbook

When a new month begins:

Create a new handbook.

Example:

Helm-Handbook-2026-08-v2.md

This becomes the active handbook.

---

## Rule 3 – Do NOT Duplicate Topics

Before writing the new handbook:

Read the previous month's handbook completely.

Compare every new topic with the previous version.

If the topic is already completely covered in the previous handbook:

❌ Do NOT duplicate it.

The new handbook should contain only NEW or UPDATED knowledge.

If the input includes interview questions, or if the source is an existing Markdown notes file containing interview questions, convert them into interview-answer notes and place them under the most relevant topic. If that topic or the same concept is already covered in the handbook, mark it as duplicate and skip adding it again.

---

## Rule 4 – Topic Update Rule

If a topic already exists but new information is available:

Bring the ENTIRE topic into the new handbook.

Do not copy only the new lines.

Merge old and new knowledge into one complete section.

---

## Rule 5 – Completely New Topics

If a topic never existed before:

Document it completely.

---

## Rule 6 – Missing Topics

If a previous topic was incomplete:

Rewrite the complete topic.

Do not append only a few new lines.

---

## Rule 7 – User Modified Handbook

If I upload a manually edited handbook:

Treat it as the latest source of truth.

Preserve my manual edits.

Never overwrite them.

---

## Rule 8 – No Duplicate Knowledge

Merge duplicate explanations into one section.

Choose the best explanation.

---

## Rule 9 – Latest Topic Wins

If a topic has improved:

Replace outdated content only inside that topic.

Keep older handbook unchanged.

---

## Rule 10 – Final Validation

Before completing the handbook verify:

- Duplicate topics
- Duplicate YAML
- Duplicate commands
- Duplicate diagrams
- Duplicate troubleshooting
- Duplicate interview questions

Merge wherever possible.

---

# FINAL OBJECTIVE

Each monthly handbook should contain ONLY

- Completely new topics
- Updated topics
- Improved topics

Never repeat topics already fully covered.

Across all monthly handbooks, the knowledge should become one complete Helm encyclopedia.

Rules

- One handbook per month
- Same month → append updates
- New month → create new handbook
- Archive previous handbook
- Never duplicate completed topics
- Updated topic = regenerate entire topic
- Preserve manual edits

---

# FOR EVERY TOPIC INCLUDE

Every topic MUST include the following sections.

## Introduction

- What is it?
- Why is it needed?
- When should it be used?

---

## Internal Working

- Internal architecture
- Component interaction
- Request flow
- Data flow

---

## Architecture

- Mermaid diagrams
- ASCII diagrams
- Chart flow
- Release flow
- Template flow

---

## YAML / Code Examples

Provide

- Basic example
- Intermediate example
- Production-ready example
- Enterprise example

Explain every line.

---

## Commands

Include

- CLI commands
- Verification commands
- Cleanup commands
- Debugging commands

---

## Production Usage

- Enterprise example
- Production architecture
- Best practices
- Performance tuning
- High Availability

---

## Security

- Security considerations
- Secrets
- Hardening
- Common vulnerabilities

---

## Monitoring

- Metrics
- Logs
- Alerts
- Dashboards

---

## Troubleshooting

Include

- Common errors
- Debugging steps
- Logs
- Root Cause Analysis (RCA)
- Verification
- Recovery

---

## FAQs

Include frequently asked questions.

---

## Comparison Tables

Where applicable provide comparison tables.

---

## Cheat Sheet

Summarize commands and key concepts.

---

## Revision Notes

Provide quick revision points.

---

## TOPICS TO COVER
- What is Helm
- Why Helm is used
- Helm architecture
- Charts and templates
- Values files
- Release management
- Hooks and lifecycle
- Dependencies and subcharts
- Security and signing
- Best practices for production
- Troubleshooting and interview questions

## WRITING STYLE
- Use simple English
- Use short bullet points only
- No long paragraphs
- Include YAML examples, commands, and diagrams
- Add enterprise deployment examples
