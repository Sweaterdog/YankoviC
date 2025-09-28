#!/bin/bash

# --- Configuration ---
# The name of the final merged file.
OUTPUT_FILE="merged.txt"

# An array of directory NAMES to exclude recursively.
# This will match the name anywhere in the directory tree.
EXCLUDE_NAMES=("node_modules" ".git")

# An array of file name PATTERNS to exclude.
# Use wildcards (*) to match file extensions.
EXCLUDE_PATTERNS=("*.png" "*.gif" "*.jpg" "*.jpeg" "*.ico" "*.svg" "*.pdf" "*.zip" "*.gz")


# --- Script Logic ---

# Check if the find command is available
if ! command -v find &> /dev/null
then
    echo "Error: 'find' command not found. This script requires it to run."
    exit 1
fi

echo "Starting file merge process..."
echo "Excluding directories named: ${EXCLUDE_NAMES[*]}"
echo "Excluding file patterns:   ${EXCLUDE_PATTERNS[*]}"
echo "Output will be saved to:     $OUTPUT_FILE"

# Create or clear the output file to ensure we start fresh
> "$OUTPUT_FILE"


# --- Build the 'find' command arguments dynamically ---

# 1. Build arguments for directory exclusions to prune
find_dir_exclude_args=()
if [ ${#EXCLUDE_NAMES[@]} -gt 0 ]; then
    for name in "${EXCLUDE_NAMES[@]}"; do
        if [ ${#find_dir_exclude_args[@]} -gt 0 ]; then
            find_dir_exclude_args+=(-o) # Add OR operator
        fi
        find_dir_exclude_args+=(-name "$name")
    done
fi

# 2. Build arguments for the final file selection (including pattern exclusions)
# Start with the basic requirement: it must be a file.
find_file_select_args=(-type f)
if [ ${#EXCLUDE_PATTERNS[@]} -gt 0 ]; then
    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
        # Add a "NOT" condition for each pattern
        find_file_select_args+=(-not -name "$pattern")
    done
fi


# --- Execute the 'find' command and process the results ---

# The find command is constructed based on whether there are directories to exclude.
if [ ${#find_dir_exclude_args[@]} -gt 0 ]; then
    # Case 1: We have directories to prune.
    # The logic is: (find and prune these dirs) OR (find files matching our criteria)
    find . \( "${find_dir_exclude_args[@]}" \) -prune -o \( "${find_file_select_args[@]}" \) -print0
else
    # Case 2: No directories to prune, just find files matching the criteria.
    find . \( "${find_file_select_args[@]}" \) -print0
fi | while IFS= read -r -d '' file; do
    # --- Safety Check ---
    # Skip the output file itself to prevent it from including its own content.
    if [ "$file" == "./$OUTPUT_FILE" ]; then
        continue
    fi

    echo "Adding: $file"

    # Append a clear header for each file into the output file
    echo "==================================================" >> "$OUTPUT_FILE"
    echo "### FILE: $file" >> "$OUTPUT_FILE"
    echo "==================================================" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Append the actual content of the file
    cat "$file" >> "$OUTPUT_FILE"

    # Append two newlines for separation
    echo "" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

echo "----------------------------------------"
echo "✅ Process complete!"
echo "All matching file contents have been merged into '$OUTPUT_FILE'."
