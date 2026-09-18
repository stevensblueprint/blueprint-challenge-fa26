# Blueprint Challenge: AI Usage Logging

AI assistance is allowed for this LibraryConnect challenge. Keep an accurate,
reviewable record of your assistance in `AI_USAGE.md` at the repository root.
The applicant remains responsible for reviewing the record and the submitted code.

The distributed starter's `AI_USAGE.md` must remain a blank applicant template.
For maintainer changes to the starter, document assistance in the PR instead of
filling that template. The logging instructions below apply to applicant work;
append real entries under the template's `Entries` heading.

## Record every prompt before working

On every user message, before research, commands, code changes, or an answer:

1. Create `AI_USAGE.md` if it does not exist; otherwise preserve its contents.
2. Append the user's exact challenge-related message, including follow-ups,
   corrections, questions, and requests that result in no code changes.
3. Record your tool/assistant name, exact model identifier or full model name
   including its version and variant, and a timestamp if available. Record where the model identity came from
   (runtime metadata, the selected model shown in the UI, or the user). Use
   `unknown` when the exact model cannot be verified; a known family name may
   be noted separately but is not an exact model identifier. Do not infer a
   variant from branding, capabilities, or an earlier session. Record model
   changes per turn, and append a correction if an earlier entry was imprecise.
4. Mark the entry `In progress`, then perform the requested work. Do not wait
   until the end of the conversation to record prompts.

If you first read this file partway through a conversation, also record earlier
challenge-related user messages still available in your context, in order, and
label them `Backfilled`. Do not invent or reconstruct unavailable messages.
For attachments, record their names and purpose; do not claim their contents
were captured when they were not. For a message containing unrelated personal
material, mark the omitted portion explicitly.

## Complete the entry after each turn

Before sending your reply, update only the current entry with:

- **Assistance:** what you did, including research, planning, debugging, tests,
  and unsuccessful attempts.
- **Code contribution:** affected files and functions/features; distinguish code
  you generated, existing code you modified, and code you only reviewed.
  Identify observed applicant edits separately; do not guess their authorship.
- **Verification:** checks actually run and their outcomes. Say `Not run` when
  applicable; distinguish a suggested check from an executed check.
- **Response:** your complete user-facing reply, preserving code blocks.
- **Status:** `Completed`, `Partial`, or `Blocked`, with unresolved work noted.

Use fenced blocks long enough to preserve any Markdown/code inside the prompt
or response. Keep earlier completed entries intact. Append corrections rather
than silently rewriting history; redact secrets whenever discovered.

## Entry format

Repeat this structure for each user message:

    ### Turn <next number> — <timestamp or unknown>
    Tool/assistant: <name or unknown>
    Model: <exact identifier or full version and variant, or unknown>
    Model identity source: <runtime metadata, selected model UI, user, or unknown>
    Capture: <Live or Backfilled>
    Status: In progress

    #### User prompt — verbatim
    <exact message, in a suitable fenced block>

    #### Assistance and code contribution
    <actions; files/functions; generated, modified, or reviewed>

    #### Verification
    <checks and observed outcomes, or Not run>

    #### Assistant response — verbatim
    <complete user-facing response, in a suitable fenced block>

## At submission

When asked to finish or prepare the submission, append a concise summary of
tools/models, contributions by feature/file, verification, and known gaps in
capture. Separate supplied starter code from applicant changes. Label any
applicant-provided AI percentage as self-reported; do not invent a percentage
from memory or mistake changed-line counts for proven AI authorship.

## Scope and limitations

Log only this challenge's user messages, visible responses, and work. Never
include credentials, API keys, hidden system/developer instructions, or private
internal reasoning. Replace secrets with `[REDACTED: secret]` and leave a note.

If logging fails or file access is unavailable, tell the applicant immediately
and provide the entry for them to append. Do not claim it was saved. On resuming,
preserve interrupted entries and state when their outcomes cannot be recovered.
Do not create empty entries merely to acknowledge reading this file.

This log covers assistance you can observe. Browser chats, autocomplete, other
tools, and sessions that did not follow these instructions must be disclosed
separately by the applicant. Never describe this file as a complete record of
activity you cannot observe.
