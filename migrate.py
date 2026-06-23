import os
import re

base_dir = '/Users/macos/Desktop/NewSample'
v2_dir = os.path.join(base_dir, 'v2')
my_dir = os.path.join(v2_dir, 'my')

os.makedirs(my_dir, exist_ok=True)
os.makedirs(os.path.join(v2_dir, 'src'), exist_ok=True)

files_to_process = [
    ('index.html', 'index.jsx'),
    ('my/patoline.html', 'patoline.jsx'),
    ('my/chroma_color_tools.html', 'chroma.jsx'),
    ('my/linguistic_ribbon_editor.html', 'ribbon.jsx'),
    ('my/barcode_generator.html', 'barcode.jsx'),
    ('my/WB XLSX CSV Sanitizer.html', 'wb.jsx'),
    ('my/gen_shape.html', None) # vanilla JS, no React extraction needed
]

for html_file, jsx_file in files_to_process:
    src_path = os.path.join(base_dir, html_file)
    dst_path = os.path.join(v2_dir, html_file)
    
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Remove CDN links
    content = re.sub(r'<script crossorigin src="https://unpkg.com/react@18/umd/react\.development\.js"></script>\n?', '', content)
    content = re.sub(r'<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom\.development\.js"></script>\n?', '', content)
    content = re.sub(r'<script crossorigin src="https://unpkg.com/react@18/umd/react\.production\.min\.js"></script>\n?', '', content)
    content = re.sub(r'<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom\.production\.min\.js"></script>\n?', '', content)
    content = re.sub(r'<script src="https://unpkg.com/@babel/standalone.*"></script>\n?', '', content)
    content = re.sub(r'<script src="https://cdn.tailwindcss.com"></script>\n?', '', content)
    content = re.sub(r'<!-- React & ReactDOM -->\n?', '', content)
    content = re.sub(r'<!-- Babel -->\n?', '', content)
    content = re.sub(r'<!-- Tailwind CSS -->\n?', '', content)

    # Add Vite CSS link in head
    if '</head>' in content:
        content = content.replace('</head>', '    <link rel="stylesheet" href="/src/index.css" />\n</head>')

    if jsx_file:
        # Extract Babel script content
        match = re.search(r'<script type="text/babel">(.*?)</script>', content, re.DOTALL)
        if match:
            jsx_content = match.group(1).strip()
            
            # Create the JSX file
            jsx_content = f"import React, {{ useState, useEffect, useRef, useMemo, useCallback }} from 'react';\nimport {{ createRoot }} from 'react-dom/client';\n\n" + jsx_content
            
            # Remove React global destructuring if present
            jsx_content = re.sub(r'const \{[^\}]+\} = React;', '', jsx_content)
            
            # Replace ReactDOM.render with createRoot
            if 'ReactDOM.createRoot' in jsx_content:
                jsx_content = jsx_content.replace('ReactDOM.createRoot', 'createRoot')
            else:
                jsx_content = re.sub(
                    r'ReactDOM\.render\((.*?),\s*document\.getElementById\((.*?)\)\);', 
                    r'createRoot(document.getElementById(\2)).render(\1);', 
                    jsx_content, 
                    flags=re.DOTALL
                )
                
            jsx_path = os.path.join(v2_dir, 'src', jsx_file)
            with open(jsx_path, 'w', encoding='utf-8') as f:
                f.write(jsx_content)
                
            # Replace script block in HTML
            script_replacement = f'<script type="module" src="/src/{jsx_file}"></script>'
            content = content[:match.start()] + script_replacement + content[match.end():]
            
    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Migration completed.")
