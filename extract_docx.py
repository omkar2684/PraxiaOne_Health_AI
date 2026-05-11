import docx
import json

def extract_text_from_docx(filepath):
    doc = docx.Document(filepath)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

text = extract_text_from_docx('Final Manas Project Report.docx')
with open('report_text.txt', 'w', encoding='utf-8') as f:
    f.write(text)

words = text.split()
print(f"Total words: {len(words)}")
