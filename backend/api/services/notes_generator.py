import google.generativeai as genai
import base64
from weasyprint import HTML
import os
import tempfile

# Configure the API key
genai.configure(api_key="AIzaSyC6K6vTyujKBgb5XOtzw4QK8_tJISvgH_s")

def generate_notes(syllabus, reference_books=''):
    """Generate notes from syllabus using Google's generative AI."""
    if not syllabus:
        return None, "Syllabus is required"
    
    prompt = f"Generate detailed notes with explanations, examples, and references based on this syllabus. The notes should be at least 10 pages long.\n\nSyllabus:\n{syllabus}\n"
    if reference_books:
        prompt += f"Refer to these books: {reference_books}"
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        notes = response.text.strip()
        
        # Style the notes and convert to PDF
        styled_notes = style_notes(notes)
        
        # Create a temporary file for the PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            pdf_path = tmp.name
        
        # Generate PDF
        HTML(string=styled_notes).write_pdf(pdf_path)
        
        # Read and encode the PDF
        with open(pdf_path, "rb") as pdf_file:
            encoded_pdf = base64.b64encode(pdf_file.read()).decode('utf-8')
        
        # Clean up
        os.unlink(pdf_path)
        
        return encoded_pdf, None
    except Exception as e:
        return None, str(e)

def style_notes(raw_text):
    """Convert raw text to styled HTML for PDF generation."""
    lines = raw_text.split("\n")
    
    html = """
    <html>
    <head>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            background-color: #f9f9f9;
        }
        h1, h2, h3 {
            color: #2c3e50;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        h1 {
            font-size: 22px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 2px solid #2980b9;
            padding-bottom: 5px;
        }
        h2 {
            font-size: 20px;
            font-weight: bold;
            color: #2980b9;
            margin-bottom: 5px;
        }
        h3 {
            font-size: 18px;
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
        }
        p {
            margin-bottom: 10px;
            text-align: justify;
        }
        ul, ol {
            padding-left: 20px;
            margin-bottom: 10px;
        }
        li {
            margin-bottom: 5px;
            line-height: 1.6;
        }
        blockquote {
            padding: 10px 20px;
            margin: 10px 0;
            background-color: #eef2f3;
            border-left: 5px solid #3498db;
            font-style: italic;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table, th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .highlight {
            background-color: #ffffcc;
            padding: 5px;
            border-radius: 5px;
        }
    </style>
    </head>
    <body>
    """

    is_list = False
    is_ordered_list = False

    for line in lines:
        line = line.strip()

        # Headings
        if line.startswith("**") and line.endswith("**"): 
            html += f"<h2>{line.strip('**')}</h2>"
        elif line.startswith("*") and line.endswith("*"):  
            html += f"<h3>{line.strip('*')}</h3>"

        # Unordered lists
        elif line.startswith("- "):
            if not is_list:
                html += "<ul>"
                is_list = True
            html += f"<li>{line[2:]}</li>"
        
        # Ordered lists
        elif len(line) > 1 and line[0].isdigit() and line[1] == ".":
            if not is_ordered_list:
                html += "<ol>"
                is_ordered_list = True
            html += f"<li>{line[2:]}</li>"

        # Blockquotes
        elif line.startswith("> "):
            html += f"<blockquote>{line[2:]}</blockquote>"

        # Tables
        elif "|" in line:
            columns = [col.strip() for col in line.split("|") if col.strip()]
            if len(columns) > 1:
                if "<table>" not in html:
                    html += "<table><tr>"
                    for col in columns:
                        html += f"<th>{col}</th>"
                    html += "</tr>"
                else:
                    html += "<tr>"
                    for col in columns:
                        html += f"<td>{col}</td>"
                    html += "</tr>"
            continue
        
        # Regular paragraphs
        else:
            if is_list:
                html += "</ul>"
                is_list = False
            if is_ordered_list:
                html += "</ol>"
                is_ordered_list = False

            html += f"<p>{line}</p>"

    if is_list:
        html += "</ul>"
    if is_ordered_list:
        html += "</ol>"

    html += "</body></html>"
    
    html = html.replace('**', '').replace('*', '')

    return html