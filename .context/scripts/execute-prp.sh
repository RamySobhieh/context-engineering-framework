#!/bin/bash

# ---
# execute-prp.sh (v10 - With Robust `while read` Loop)
#
# Description:
#   The definitive agent script. It uses `awk` to parse the AI plan
#   and a robust `while read` loop to process and execute each action.
# ---

# 1. Validate Input & Environment
# --------------------------------
if [ -z "$1" ]; then
  echo "Error: No PRP file specified."
  exit 1
fi

PRP_FILE_PATH=$1
if [ ! -f "$PRP_FILE_PATH" ]; then
  echo "Error: PRP file '$PRP_FILE_PATH' not found."
  exit 1
fi

# 2. Define the Execution Prompt
# ------------------------------
EXECUTE_PRP_PROMPT=$(cat <<'END_PROMPT'
You are an expert-level software engineer.

You are given a Product Requirements Prompt (PRP) that already contains the full feature plan. Your job is to **implement the plan step by step**.

For each step:

1. **Explain what you are about to do and why** (in 1–2 sentences).
2. Proceed with the implementation.

⚠️ Only show one step at a time. Wait for user approval before continuing.

Do NOT generate the entire implementation at once.

Do NOT re-plan the feature.

You must walk through the implementation step by step, providing a reason before every action.

Start with the first step.
END_PROMPT
)

# 3. Send PRP to Gemini and Get the Plan
# --------------------------------------
PRP_CONTENT=$(cat "$PRP_FILE_PATH")
FULL_PROMPT="${EXECUTE_PRP_PROMPT}\n\nHere is the PRP to execute:\n---\n${PRP_CONTENT}"

echo "🤖 Launching Gemini CLI in interactive mode..."
echo "(You'll follow up within the Gemini REPL to approve and execute actions.)"

gemini -i "$FULL_PROMPT" --model gemini-2.5-pro