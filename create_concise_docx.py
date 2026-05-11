import docx
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = docx.Document()

# Styles
style = doc.styles['Normal']
font = style.font
font.name = 'Arial'
font.size = Pt(11)

def add_heading(text, level=1):
    h = doc.add_heading(text, level=level)
    h.alignment = WD_ALIGN_PARAGRAPH.LEFT

# Title
title = doc.add_heading('INDUSTRIAL TRAINING REPORT', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
doc.add_heading('PraxiaOne Health Care AI', 1).alignment = WD_ALIGN_PARAGRAPH.CENTER
doc.add_paragraph('By Manas Patane').alignment = WD_ALIGN_PARAGRAPH.CENTER
doc.add_page_break()

# Acknowledgement
add_heading('ACKNOWLEDGEMENT', 1)
doc.add_paragraph("I sincerely thank Prime Numerics for the opportunity to undergo industrial training and work on the PraxiaOne Health Care AI project. This experience bridged my theoretical knowledge with real-world applications in full-stack architecture, AI, and backend systems.")
doc.add_paragraph("I extend my gratitude to my mentors for their continuous guidance, and to my faculty and family for their unwavering support throughout this internship.")
doc.add_page_break()

# Declaration
add_heading("CANDIDATE'S DECLARATION", 1)
doc.add_paragraph("I, Manas Nivrutti Patane, declare that I undertook 3 months of Industry Oriented Project Training at Prime Numerics from January 25 to April 25. This report authentically represents the work completed in partial fulfillment of my MCA degree at DES Pune University.")
doc.add_paragraph("\n\nSignature:\nManas Patane\n(PRN No: 3542411065)")
doc.add_page_break()

# Abstract
add_heading('ABSTRACT', 1)
doc.add_paragraph("This report details my industrial training at Prime Numerics on the PraxiaOne Health Care AI project. PraxiaOne leverages AI to translate fragmented health data into actionable, preventive care plans. My contribution focused on the 'AI-Driven Health Journey,' integrating lab result parsing, AI insights, and dynamic action planning across web and mobile platforms.")
doc.add_paragraph("Utilizing Python, Django, React Native, Neo4j, Qdrant, and local LLMs (Med42, Ollama), I developed robust APIs, asynchronous tasks via Celery, and a Cost Management Layer for optimized AI usage. This training significantly advanced my full-stack and applied AI engineering skills.")
doc.add_page_break()

# Chapter 1
add_heading('[Chapter-1] INTRODUCTION TO ORGANIZATION', 1)
add_heading('1.1 Overview', 2)
doc.add_paragraph("Prime Equity, LLC is a health-tech organization translating consumer wellness data and clinical records into structured preventive care through its PraxiaOne platform.")
add_heading('1.2 Leadership & Market', 2)
doc.add_paragraph("Led by Dr. Mady Jalinous (CEO) and Dr. Akash Mavle (CTO) alongside clinical advisors, the company targets Direct-to-Consumer, Provider Organizations, and Employer Health sectors.")
add_heading('1.3 Internship Structure', 2)
doc.add_paragraph("The 20-member internship cohort followed agile phases: Phase 1 focused on pixel-perfect UI/UX replication; Phase 2 on complex backend layers (Graph DB, Vector DB); Phase 3 on AI integration and Flutter mobile development.")

# Chapter 2
add_heading('[Chapter-2] SOFTWARE TRAINING WORK', 1)
doc.add_paragraph("Key tools and technologies mastered:")
doc.add_paragraph("• Languages: Python, JS/TS, Cypher, Dart.")
doc.add_paragraph("• Frameworks: Next.js, React, Material UI, Django, DRF, Flutter.")
doc.add_paragraph("• Databases: MySQL (relational), Neo4j (graph), Qdrant (vector), Redis (caching).")
doc.add_paragraph("• AI Integration: Local deployment via Ollama. Evaluated general APIs (Gemini) against domain-specific models (Med42, DeepSeek-R1) for clinical safety.")
doc.add_paragraph("• DevOps: Git, Docker, Tailscale, Bitwise SSH.")

# Chapter 3
add_heading('[Chapter-3] INDUSTRIAL TRAINING WORK', 1)
doc.add_paragraph("• Front-End: Developed a 1:1 pixel-perfect web dashboard using Next.js and MUI.")
doc.add_paragraph("• Cost Management Layer: Built an intelligent router that evaluates ROI, dynamically switching between low-cost and premium AI models to enforce budgets.")
doc.add_paragraph("• Database Setup: Configured Neo4j for mapping complex medical relationships and Qdrant for Retrieval-Augmented Generation (RAG).")
doc.add_paragraph("• AI Comparison: Benchmarked Med42 against Gemini, proving domain-specific local models offer superior privacy and clinical accuracy.")
doc.add_paragraph("• Mobile & DevOps: Synchronized Flutter mobile app features and containerized the architecture via Docker for remote deployment using Tailscale.")

# Chapter 4
add_heading('[Chapter-4] PROJECT WORK', 1)
doc.add_paragraph("• Problem: Patients lack continuous, actionable execution plans between doctor visits.")
doc.add_paragraph("• Objectives: Aggregate health data, generate AI-guided weekly wellness plans, ensure clinical safety, and optimize LLM overhead.")
doc.add_paragraph("• Architecture:")
doc.add_paragraph("  - Data Aggregation: Wearables and lab reports stored in MySQL and Neo4j.")
doc.add_paragraph("  - Intelligence Layer: Text embedded in Qdrant; routed to optimal LLMs via Cost Manager.")
doc.add_paragraph("  - Execution: Generates dynamic interventions based on continuous feedback loops.")

# Chapter 5
add_heading('[Chapter-5] RESULTS AND DISCUSSIONS', 1)
doc.add_paragraph("• UI/UX: Successfully delivered responsive, cohesive web and mobile interfaces.")
doc.add_paragraph("• Cost & Performance: ROI scoring drastically reduced AI operating costs. The hybrid database approach (Neo4j + Qdrant) accelerated RAG queries and prevented hallucinations.")
doc.add_paragraph("• Clinical Safety: Med42 hosted locally via Ollama maintained strict data privacy and demonstrated superior clinical reasoning over general APIs.")
doc.add_paragraph("• Deployment: Docker ensured consistent environments, validating production readiness.")

# Chapter 6
add_heading('[Chapter-6] CONCLUSION AND FUTURE SCOPE', 1)
doc.add_paragraph("• Conclusion: PraxiaOne successfully operationalized fragmented health data into dynamic execution plans. The internship provided deep hands-on expertise in advanced AI orchestration, graph databases, and full-stack DevOps.")
doc.add_paragraph("• Future Scope: Planned integrations include direct Wearable APIs, FHIR standards for EHR interoperability, predictive cost management algorithms, and expansion into cardiovascular and autoimmune condition management.")

doc.save('Concise_Manas_Project_Report.docx')
print("Successfully created Concise_Manas_Project_Report.docx")
