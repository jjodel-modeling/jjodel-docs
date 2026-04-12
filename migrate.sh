#!/bin/bash
# migrate.sh — Restructures jjodel-docs from flat Markdown to Starlight project
#
# Run this from the root of the jjodel-docs repo AFTER extracting the archive.
# It moves the existing doc folders into src/content/docs/
#
# Usage:
#   cd jjodel-docs
#   bash migrate.sh

set -e

echo "=== Jjodel Docs → Starlight Migration ==="

# Check we're in the right place
if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found. Make sure you extracted the archive first."
  exit 1
fi

if [ ! -d "src/content/docs" ]; then
  echo "ERROR: src/content/docs not found. Archive may not have been extracted correctly."
  exit 1
fi

# Remove the old flat docs if they exist at root (from the previous commit)
DOCS_DIRS="getting-started user-guide concepts tutorials reference installation comparisons"

for dir in $DOCS_DIRS; do
  if [ -d "$dir" ] && [ -d "src/content/docs/$dir" ]; then
    echo "Removing old root-level: $dir/"
    rm -rf "$dir"
  fi
done

# Remove old root-level doc files
for file in faq.md video-pills.md index.mdx; do
  if [ -f "$file" ] && [ -f "src/content/docs/$file" ]; then
    echo "Removing old root-level: $file"
    rm -f "$file"
  fi
done

# Remove old README (replaced by new one)
# Keep the old one as backup just in case
if [ -f "README.md.bak" ]; then
  rm -f "README.md.bak"
fi

echo ""
echo "=== Migration complete ==="
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run dev        (preview at http://localhost:4321)"
echo "  3. git add -A"
echo "  4. git commit -m 'feat: migrate to Astro + Starlight'"
echo "  5. git push"
echo ""
echo "After push, enable GitHub Pages:"
echo "  → Repo Settings → Pages → Source: GitHub Actions"
echo ""
echo "DNS setup (Aruba):"
echo "  → Add CNAME record: docs → jjodel-modeling.github.io"
echo "  → Repo Settings → Pages → Custom domain: docs.jjodel.io"
