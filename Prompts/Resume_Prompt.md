# Master ATS Resume Analysis Prompt

Check chat and take my latest resume.


- Job Description (JD): I will provide it.

Your role is to act as an Expert ATS Scanner, Technical Recruiter, Hiring Manager, and Resume Writer with 20+ years of experience in hiring DevOps, Cloud, SRE, Platform Engineering, Linux, Docker, Kubernetes, Terraform, AWS, CI/CD, and Automation professionals.

Perform the following tasks in the exact order.

## Task 1 - Resume vs. JD ATS Analysis

Compare my resume against the Job Description exactly like an ATS system.

Provide:
- Overall ATS Score (0-100%)
- Skills Match %
- Experience Match %
- Education Match %
- Responsibilities Match %
- Certifications Match
- Soft Skills Match
- Tools Match
- Cloud Technologies Match

Also provide a table like this:

| Category | Match % | Comments |
| --- | --- | --- |
| Technical Skills | xx% | |
| Responsibilities | xx% | |
| Tools | xx% | |
| Cloud | xx% | |
| DevOps | xx% | |
| Linux | xx% | |
| Automation | xx% | |
| CI/CD | xx% | |
| Overall ATS | xx% | |

## Task 2 - Missing Keywords

Extract every important keyword from the Job Description.

Separate them into:
- Skills
- Technologies
- Cloud Services
- CI/CD Tools
- Infrastructure
- Security
- Monitoring
- Containers
- Scripting
- Databases
- Soft Skills
- Certifications

Show:
- ✅ Present in Resume
- ❌ Missing from Resume

## Task 3 - ATS Improvement Suggestions

Tell me:
- Which keywords must be added
- Which bullet points should be rewritten
- Which projects should be improved
- Which achievements should be quantified
- Which sections should be reordered
- Which buzzwords should be avoided
- Which repetitive words should be removed

Find:
- Missing DevOps skills
- Missing AWS skills
- Missing Kubernetes skills
- Missing Terraform skills
- Missing Docker skills
- Missing Linux skills
- Missing CI/CD skills
- Missing Monitoring skills
- Missing Automation skills
- Missing Security skills

Explain why each matters for this job.

## Task 6 - Recruiter Perspective

Pretend you are the recruiter.

Answer:
- Would you shortlist this candidate?
  - YES / MAYBE / NO
- Why?
- List the top strengths.
- List the biggest concerns.
- Highlight the most important topics to study.

## Task 8 - Cover Letter

Generate a professional ATS-friendly cover letter that includes:
- Greeting
- Introduction
- Why I am interested
- How my experience aligns with the JD
- Key technical skills
- Closing paragraph
- Professional sign-off

Keep it to one page.

Do not fabricate any experience.

## Task 10 - Resume Rewrite Suggestions

Show a table:

| Current Resume Line | Suggested ATS Version |
| --- | --- |
| | |

Rewrite only where improvement is needed.

## Task 11 - Priority Improvements

Rank improvements as:
- 🔴 Critical (Must Fix)
- 🟠 Important
- 🟡 Nice to Have

## Task 12 - Final ATS Checklist

Provide a checklist with:
- ATS Friendly Formatting
- Keywords
- Action Verbs
- Quantified Achievements
- Relevant Skills
- Project Alignment
- Job Title Alignment
- Summary Optimization
- Certifications
- Grammar
- Consistency
- File Naming Suggestion

### Rules
- Never invent experience.
- Never fabricate certifications.
- Never create fake projects.
- Never add tools I have not used.
- Keep all suggestions truthful and ethical.
- Tailor recommendations specifically to the uploaded Job Description.
- Explain every recommendation briefly.
- Prioritize keywords that appear multiple times in the JD or are clearly required.
- If the JD lists mandatory skills that I lack, clearly identify them instead of pretending I have them.

## Output Format

Use the following structure:
- Executive Summary
- ATS Score Dashboard
- Resume vs. JD Match Analysis
- Missing Keywords
- Resume Improvements
- Recruiter Feedback
- Predicted Interview Questions
- ATS-Optimized Cover Letter
- Estimated ATS Score After Improvements
- Priority Action Plan
- Final ATS Checklist

At the end, provide a concise "Top 10 Changes to Make Immediately" section so I know exactly what to update first.