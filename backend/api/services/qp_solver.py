import google.generativeai as genai
import base64
from weasyprint import HTML
import os
import tempfile
import pytesseract
from PIL import Image
import io

# Configure the API key
genai.configure(api_key="AIzaSyC6K6vTyujKBgb5XOtzw4QK8_tJISvgH_s")

def solve_question_paper(image_file):
    """Extract text from image and generate solutions using AI."""
    import tempfile
    
    try:
        # Open the image using PIL
        image = Image.open(image_file)
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        # Extract text from image using OCR
        extracted_text = pytesseract.image_to_string(image)
        
        # If text extraction failed, return error
        if not extracted_text or len(extracted_text.strip()) < 10:
            return None, "Could not extract text from the image. Please upload a clearer image."
        
        # Create prompt for AI - improved for better structure
        prompt = f"""
            Solve the following question paper with clear, structured solutions.

            {extracted_text}

            Format your response as follows:

            For each question:
            1. Start with "Question:" followed by the question text
            2. Then provide a "Detailed Solution:" that includes:
            - A clear explanation of the approach
            - Step-by-step working with all necessary calculations
            - Proper mathematical notation for equations and formulas
            - A well-explained final answer

            Make sure to:
            - Keep the original question numbering
            - Format each solution in a structured, easy-to-follow manner
            - Clearly indicate the final answer for each question
            - Use bullet points or numbered steps where appropriate
            - Explain key concepts and theorems used in your solutions

            Your solutions should be comprehensive enough that a student can understand not just the answer, but the entire reasoning process.
            """
        
        # Generate solution using AI
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        solution_text = response.text.strip()
        
        # Create styled HTML for the solution
        styled_solution = style_solution(solution_text, extracted_text)
        
        # Create a temporary file for the PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            pdf_path = tmp.name
        
        # Generate PDF
        HTML(string=styled_solution).write_pdf(pdf_path)
        
        # Read and encode the PDF
        with open(pdf_path, "rb") as pdf_file:
            encoded_pdf = base64.b64encode(pdf_file.read()).decode('utf-8')
        
        # Clean up
        os.unlink(pdf_path)
        
        return {
            "pdf": encoded_pdf,
            "text_solution": solution_text
        }, None
    except Exception as e:
        return None, str(e)
    
def style_solution(solution_text, question_text):
    """Convert raw text to styled HTML for PDF generation."""
    lines = solution_text.split("\n")
    
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
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .answer {
            background-color: #e8f4f8;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            font-weight: bold;
        }
        .approach {
            background-color: #f0f7fb;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            border-left: 3px solid #3498db;
        }
    </style>
    </head>
    <body>
        <div class="header">
            <h1>QUESTION PAPER SOLUTIONS</h1>
            <p>Generated by GradeGear AI</p>
        </div>
    """

    is_list = False
    is_ordered_list = False
    current_section = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Detect Question headers
        if line.lower().startswith(('question', 'q.')):
            html += f"<h2>{line}</h2>"
            current_section = 'question'
            continue
            
        # Detect Approach section
        if line.lower().startswith('approach:'):
            html += f"<div class='approach'><h3>Approach</h3><p>{line[9:].strip()}</p>"
            if lines.index(line) + 1 < len(lines) and not lines[lines.index(line) + 1].lower().startswith(('solution:', 'answer:')):
                html += "</div>"
            current_section = 'approach'
            continue
            
        # Continue approach section if needed
        if current_section == 'approach' and not line.lower().startswith(('solution:', 'answer:')):
            html += f"<p>{line}</p>"
            continue
            
        # End approach section if needed
        if current_section == 'approach' and (line.lower().startswith('solution:') or line.lower().startswith('answer:')):
            html += "</div>"
            
        # Detect Solution section
        if line.lower().startswith('solution:'):
            html += f"<h3>{line}</h3>"
            current_section = 'solution'
            continue
            
        # Detect Answer section
        if line.lower().startswith('answer:'):
            html += f"<div class='answer'><h3>Answer</h3><p>{line[7:].strip()}</p></div>"
            current_section = 'answer'
            continue

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

    html += """
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
            <p>This solution was generated using artificial intelligence and may not be 100% accurate.</p>
            <p>Always verify important calculations and results.</p>
        </div>
    </body>
    </html>
    """
    
    html = html.replace('**', '').replace('*', '')

    return html