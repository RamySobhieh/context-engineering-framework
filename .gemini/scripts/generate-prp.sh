#!/usr/bin/env bash
set -eo pipefail

if ! command -v gemini &> /dev/null; then
  echo "Error: gemini CLI not installed. Install with npm or npx."
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "Error: jq is not installed."
  exit 1
fi

if [ -z "$1" ]; then
  echo "Usage: $0 <feature-request.md>"
  exit 1
fi

FEATURE_FILE="$1"
TEMPLATE_FILE=".gemini/templates/prp_template.md"

for f in "$FEATURE_FILE" "$TEMPLATE_FILE"; do
  if [ ! -f "$f" ]; then
    echo "Error: Required file '$f' not found."
    exit 1
  fi
done

# 2. Read Content
GENERATE_PRP_PROMPT=$(cat <<'EOF'
You are an expert-level AI software engineer. Your task is to generate a complete Product Requirements Prompt (PRP) based on the provided user request.

**Your output MUST strictly follow the structure and use the exact headings from the template provided below.** Do not invent your own headings or sections. You must fill out every section of the template: `1. Overview`, `2. Success Criteria`, `3. Context & Resources`, `4. Implementation Blueprint`, and `5. Validation Plan`.

Your final output must be ONLY the completed PRP markdown content. Do not include any other text.
EOF
)

TEMPLATE_CONTENT=$(< "$TEMPLATE_FILE")
FEATURE_REQUEST=$(< "$FEATURE_FILE")

# 3. Construct combined prompt
COMBINED_PROMPT="${GENERATE_PRP_PROMPT}

--- TEMPLATE TO FOLLOW ---
${TEMPLATE_CONTENT}

--- USER REQUEST ---
${FEATURE_REQUEST}"

echo "$COMBINED_PROMPT"

echo "✅ Invoking Gemini CLI non-interactively..."

# 4. Run via Gemini CLI
RESPONSE_TEXT=$(gemini -p "$COMBINED_PROMPT" --model gemini-2.5-flash)

# 5. Extract output
PRP_CONTENT="$RESPONSE_TEXT"

echo "$PRP_CONTENT"

if [ -z "$PRP_CONTENT" ] || [ "$PRP_CONTENT" = "null" ]; then
  echo "Error: No content from Gemini CLI."
  echo "Full response: $RESPONSE_JSON"
  exit 1
fi

# 6. Save resulting PRP
mkdir -p PRPs
BASE=$(basename "$FEATURE_FILE" .md | tr '[:upper:]' '[:lower:]')
OUTPUT="PRPs/${BASE}_prp_v2.md"

printf "%s\n" "$PRP_CONTENT" > "$OUTPUT"

echo "------------------------------------------------------------------"
echo "✅ Success! PRP generated and saved to: $OUTPUT"
