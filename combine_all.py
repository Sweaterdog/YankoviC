import os
import sys

# --- Configuration ---

# The name of the file that will contain the combined code.
OUTPUT_FILENAME = "combined_code.txt"

# A set of directory names to completely exclude from the search.
# This is the most efficient way to skip large directories like node_modules.
EXCLUDED_DIRS = {
    "node_modules",
    "venv",
    ".venv",
    "env",
    ".env",
    "__pycache__",
    ".git",
    ".vscode",
    ".idea",
    "build",
    "dist",
    "target", # For Rust/Java
}

# A set of file extensions to include in the combination.
# Add or remove extensions as needed for your project.
INCLUDED_EXTENSIONS = {
    # Python
    ".py",
    # Web
    ".html", ".css", ".js", ".jsx", ".ts", ".tsx", ".scss", ".json", ".xml", ".yaml", ".yml",
    # Markdown & Text
    ".md", ".markdown", ".txt", ".rst",
    # Config files
    ".cfg", ".ini", ".toml",
    # C/C++
    ".c", ".h", ".cpp", ".hpp",
    # C#
    ".cs",
    # YankoviC
    ".yc", ".hat",
    # Java
    ".java", ".gradle", ".properties",
    # Go
    ".go",
    # Rust
    ".rs",
    # Ruby
    ".rb",
    # PHP
    ".php",
    # Shell/Scripts
    ".sh", ".bat", ".ps1",
    # SQL
    ".sql",
    # Docker
    "Dockerfile", ".dockerignore"
}

# A set of specific filenames to always exclude.
EXCLUDED_FILES = {
    OUTPUT_FILENAME,
    "package-lock.json",
    "yarn.lock",
}

# --- Main Script Logic ---

def combine_files():
    """
    Walks through the current directory and its subdirectories, combining the contents
    of specified file types into a single output file.
    """
    # Get the absolute path for the output file to ensure it's excluded correctly.
    output_filepath = os.path.abspath(os.path.join(os.getcwd(), OUTPUT_FILENAME))
    files_processed_count = 0
    
    print(f"Starting file combination process...")
    print(f"Output will be saved to: {output_filepath}")

    try:
        with open(output_filepath, "w", encoding="utf-8") as outfile:
            # os.walk is the ideal tool for recursively walking a directory tree.
            for root, dirs, files in os.walk("."):
                
                # Modify the 'dirs' list in-place to prevent os.walk from descending
                # into the excluded directories. This is much more efficient than
                # checking the path on every single file.
                dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

                # Sort files for a consistent order
                files.sort()
                
                for filename in files:
                    # Check for exact filename exclusions
                    if filename in EXCLUDED_FILES:
                        continue
                        
                    # Check for file extension inclusion
                    # We use os.path.splitext to handle filenames like 'Dockerfile' that have no extension.
                    file_ext = os.path.splitext(filename)[1]
                    if file_ext not in INCLUDED_EXTENSIONS and filename not in INCLUDED_EXTENSIONS:
                        continue

                    filepath = os.path.join(root, filename)
                    
                    # Final check to ensure we don't include the output file itself
                    if os.path.abspath(filepath) == output_filepath:
                        continue
                        
                    try:
                        with open(filepath, "r", encoding="utf-8") as infile:
                            content = infile.read()
                            
                            # Write a clear separator and the file path to the output file
                            outfile.write("=" * 80 + "\n")
                            outfile.write(f"=== FILE: {filepath}\n")
                            outfile.write("=" * 80 + "\n\n")
                            
                            # Write the file's content
                            outfile.write(content)
                            outfile.write("\n\n")
                            
                            files_processed_count += 1
                            print(f"  + Added: {filepath}")

                    except UnicodeDecodeError:
                        # This can happen with binary files or files with unexpected encodings
                        print(f"  ! Skipped (UnicodeDecodeError): {filepath}", file=sys.stderr)
                    except Exception as e:
                        print(f"  ! Skipped (Error: {e}): {filepath}", file=sys.stderr)

    except IOError as e:
        print(f"\nError: Could not write to output file {output_filepath}.", file=sys.stderr)
        print(f"Reason: {e}", file=sys.stderr)
        sys.exit(1)

    print("\n" + "-" * 40)
    print("      File combination complete!      ")
    print("-" * 40)
    print(f"Total files combined: {files_processed_count}")
    print(f"Output saved to: {OUTPUT_FILENAME}")
    print("-" * 40)

if __name__ == "__main__":
    combine_files()
