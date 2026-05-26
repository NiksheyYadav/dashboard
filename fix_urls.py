import os
import re

files_to_fix = [
    r"c:\eblock\src\components\layout\Topbar.tsx",
    r"c:\eblock\src\app\(dashboard)\academic-data\page.tsx",
    r"c:\eblock\src\app\(dashboard)\activity-attendance\page.tsx",
    r"c:\eblock\src\app\(dashboard)\extra-classes\page.tsx",
    r"c:\eblock\src\app\(dashboard)\leave-arrangement\page.tsx",
    r"c:\eblock\src\app\(dashboard)\mentee-monitor\page.tsx",
    r"c:\eblock\src\app\(dashboard)\reports\page.tsx",
    r"c:\eblock\src\app\(dashboard)\subject-attendance\page.tsx"
]

import_statement = 'import { apiUrl } from "@/lib/api/config";\n'

for file_path in files_to_fix:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    if "http://localhost:8000/api/v1" not in content:
        continue

    # Add import if not present
    if "import { apiUrl }" not in content:
        # Find the last import statement or put at the top
        lines = content.split('\n')
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.startswith("import "):
                last_import_idx = i
        
        if last_import_idx != -1:
            lines.insert(last_import_idx + 1, 'import { apiUrl } from "@/lib/api/config";')
        else:
            lines.insert(0, 'import { apiUrl } from "@/lib/api/config";')
        
        content = '\n'.join(lines)

    # Replace URLs
    # Pattern: "http://localhost:8000/api/v1/some/path" -> apiUrl("/some/path")
    # This regex handles both standard string literals and backticks, but backticks without variables might be okay as strings.
    # Actually, simpler: replace `"http://localhost:8000/api/v1/` with `apiUrl("/` and then replace the ending `"` with `")`? No, that's hard.
    
    # Let's use regex
    # Match: "http://localhost:8000/api/v1/something"
    content = re.sub(r'"http://localhost:8000/api/v1([^"]*)"', r'apiUrl("\1")', content)
    
    # Match: `http://localhost:8000/api/v1/something${var}`
    # For template literals, it's safer to just replace http://localhost:8000/api/v1 with ${API_BASE} and import API_BASE.
    # Let's change the import statement to include API_BASE just in case.
    if "API_BASE" not in content and "`http://localhost:8000/api/v1" in content:
        content = content.replace('import { apiUrl }', 'import { apiUrl, API_BASE }')
        
    content = content.replace("`http://localhost:8000/api/v1", "`${API_BASE}")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files updated successfully!")
