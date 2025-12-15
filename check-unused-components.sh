#!/bin/bash

# Script to find unused components in the codebase

echo "🔍 Checking for unused components..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find all component files
COMPONENT_FILES=$(find src/components -name "*.tsx" -o -name "*.ts" | grep -v node_modules | sort)

unused_count=0
used_count=0
unused_components=()

# Function to extract component name from file
get_component_name() {
    local file=$1
    local basename=$(basename "$file" .tsx)
    basename=$(basename "$basename" .ts)
    echo "$basename"
}

# Function to check if component is used
check_component_usage() {
    local file=$1
    local component_name=$(get_component_name "$file")
    local file_path="$file"
    
    # Skip index files and utility files
    if [[ "$component_name" == "index" ]] || [[ "$file" == *"/index.ts" ]] || [[ "$file" == *"/index.tsx" ]]; then
        return 1
    fi
    
    # Skip test files
    if [[ "$file" == *".test."* ]] || [[ "$file" == *"/test/"* ]]; then
        return 1
    fi
    
    # Get directory structure to build import paths
    local rel_path="${file#src/}"
    local dir_path=$(dirname "$rel_path")
    local import_path="${rel_path%.tsx}"
    import_path="${import_path%.ts}"
    
    # Check various import patterns
    local patterns=(
        "$component_name"
        "from.*[\"']\.\.\/.*$component_name"
        "from.*[\"']\.\/.*$component_name"
        "from.*[\"'].*$component_name"
        "import.*$component_name"
        "from.*[\"']@/components.*$component_name"
        "from.*[\"']@/components.*$import_path"
    )
    
    # Search for usage (excluding the file itself)
    local found=false
    
    for pattern in "${patterns[@]}"; do
        if grep -r -l --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" "$pattern" src/ 2>/dev/null | grep -v "$file" | grep -q .; then
            found=true
            break
        fi
    done
    
    # Also check for the file path as import
    local import_patterns=(
        "$import_path"
        "$dir_path/$component_name"
    )
    
    for pattern in "${import_patterns[@]}"; do
        if grep -r -l --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" "from.*[\"'].*$pattern" src/ 2>/dev/null | grep -v "$file" | grep -q .; then
            found=true
            break
        fi
    done
    
    if [ "$found" = false ]; then
        return 0  # Component is unused
    else
        return 1  # Component is used
    fi
}

# Process each component file
while IFS= read -r file; do
    if check_component_usage "$file"; then
        unused_components+=("$file")
        ((unused_count++))
    else
        ((used_count++))
    fi
done <<< "$COMPONENT_FILES"

# Print results
echo "📊 Results:"
echo "  ✅ Used components: $used_count"
echo "  ❌ Unused components: $unused_count"
echo ""

if [ $unused_count -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Potentially unused components:${NC}"
    echo ""
    for component in "${unused_components[@]}"; do
        echo -e "  ${RED}✗${NC} $component"
    done
    echo ""
    echo "⚠️  Note: Some components might be used dynamically or exported from index files."
    echo "   Please review manually before deleting."
else
    echo -e "${GREEN}✓ All components appear to be used!${NC}"
fi

