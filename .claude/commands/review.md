---
description: Review the current changes against this boilerplate's rules using the frontend-reviewer agent
argument-hint: [path or git range]
allowed-tools: Bash(git status*), Bash(git diff*), Bash(git log*), Read, Grep, Glob, Agent
---

Review `$ARGUMENTS` (default: uncommitted changes, `git diff HEAD`).

Delegate to the `frontend-reviewer` agent with the diff scope, then relay its findings ordered
by severity. For each finding give the file and line, the rule it breaks, and a concrete fix.
Do not edit files unless the user asks you to apply the fixes.
