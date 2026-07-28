# Argo CD Master Prompt

## ROLE
You are a Principal GitOps Engineer and Argo CD Specialist.

## OBJECTIVE
Create a production-grade Argo CD handbook in Markdown.

## OUTPUT
Generate ONE complete Markdown file covering Argo CD from beginner to advanced level.

# MONTHLY HANDBOOK VERSIONING (VERY IMPORTANT)

The handbook follows an incremental monthly edition model.

## Rule 1 – Previous Versions Are Permanent

Once a monthly handbook is completed, it becomes READ-ONLY.

Never modify it again.

Example:

Argo-CD-Handbook-2026-07-v1.md

After July ends, this file is archived forever.

---

## Rule 2 – New Month = New Handbook

When a new month begins:

Create a new handbook.

Example:

Argo-CD-Handbook-2026-08-v2.md

This becomes the active handbook.

---

## Rule 3 – Do NOT Duplicate Topics

Before writing the new handbook:

Read the previous month's handbook completely.

Compare every new topic with the previous version.

If the topic is already completely covered in the previous handbook:

❌ Do NOT duplicate it.

The new handbook should contain only NEW or UPDATED knowledge.



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

Rule 11

Interview Question Integration Rule

If the input contains interview questions (from text, PDF, DOCX, Markdown, or any other format), or if the input is an existing Markdown notes file that includes interview questions:

Analyze each question individually.
Identify the underlying concept or technology being tested (not just the wording of the question).
Convert the question into structured handbook notes instead of storing it as a Q&A.
Place the generated notes under the most relevant topic/chapter in the handbook (e.g., Kubernetes → Scheduling, Terraform → State Management, AWS → Auto Scaling, Linux → Processes).
If the topic does not already exist, create a new section in the appropriate chapter.
Before adding any content, check the entire handbook for duplicate concepts.
If the same concept is already explained (even if the wording is different), treat it as a duplicate and do not add it again.
If the new question contains additional useful information beyond the existing notes, merge only the missing information into the existing section instead of creating duplicate content.
Preserve the handbook's formatting, numbering, and style.
At the end, generate a summary containing:
Questions processed
New concepts added
Existing concepts updated
Duplicate questions skipped
Handbook sections modified

Goal: The handbook should remain a clean, deduplicated knowledge base organized by concepts rather than a collection of interview questions. Every interview question should enrich the relevant topic only if it introduces new knowledge.

# FINAL OBJECTIVE

Each monthly handbook should contain ONLY

- Completely new topics
- Updated topics
- Improved topics

Never repeat topics already fully covered.

Across all monthly handbooks, the knowledge should become one complete Argo CD encyclopedia.

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
- Sync flow
- Deployment flow
- Rollout flow

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
- What is Argo CD
- GitOps principles
- Architecture and components
- Applications and projects
- Sync and refresh strategies
- Healthy and degraded states
- Rollback and drift detection
- Multi-cluster deployments
- RBAC and secrets
- Helm and Kustomize integration
- Troubleshooting and best practices
- Interview questions and production scenarios

## WRITING STYLE
- Use simple English
- Use short bullet points only
- No long paragraphs
- Include diagrams, YAML examples, and commands
- Add production-focused examples
