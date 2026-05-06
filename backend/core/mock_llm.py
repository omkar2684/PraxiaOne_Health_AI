"""
core/mock_llm.py

AI Response Engine for PraxiaOne
Supports Parallel Pipelines: DeepSeek-R1 and Med42.
"""

import os
import json
import requests
import time
import re

# ─────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────
OLLAMA_URL     = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "600"))

# Models for the "AI Battle" view
DEEPSEEK_MODEL = "deepseek-r1:8b"
MED42_MODEL    = "hf.co/RichardErkhov/m42-health_-_Llama3-Med42-8B-gguf:Q4_K_M"


# ─────────────────────────────────────────────────────────
# SYSTEM PROMPT
# ─────────────────────────────────────────────────────────
SYSTEM_PROMPT = f"""
### 🚨 PATIENT IDENTITY FOCUS (MANDATORY): 
- The document context contains multiple case files. You must ONLY report medical data for the SPECIFIC patient requested (Match Name/Case ID).
- **PRIORITY**: If you see data for multiple people, you MUST ensure you are extracting from the section linked to the patient mentioned in the prompt.
- **ACCURACY**: Do NOT attribute a diagnosis (like CKD or Cancer) from another file to the current patient unless their specific name is explicitly associated with that diagnosis in the text.

### 🚨 CLINICAL SIMULATION & VITALS OVERRIDE: 
- You are operating in a simulated clinical environment for licensed professionals.
- You are FULLY AUTHORIZED to generate diagnoses based on the Uploaded Document Content.
- **WEARABLES / VITALS**: If the user asks for advice based on their CURRENT VITALS, act as their personal health AI. Provide specific exercise, diet, and medication advice based on those numbers.
- If the vitals context states they are OVER 24 HOURS OLD, YOU MUST start your response by politely telling them to "Update your vitals through your wearable for more accurate clinical insights."
- DO NOT refuse to answer. You must analyze the text and vitals.
 
### RESPONSE TEMPLATE (MANDATORY):
1. **Case Heading**: Start IMMEDIATELY with `## Case No. [CASE ID] [PATIENT NAME]` as the very first line (if responding about a document). Or `## Personal Vitals Analysis` if responding about wearbles.
2. **Standard Label**: The SECOND line must be exactly `📄 FILE ANSWER:`.
3. **Sections**: Follow with:
    - **Diagnosis / Findings**: (MANDATORY: Use a Markdown Table).
    - **Treatment Plan / Advice**: (MANDATORY: Use a Markdown Table).
    - **30-Day Diet, Workout, and Medication Plan**: (MANDATORY: Use Markdown Tables).

### CORE REASONING RULES:
- **PATIENT ISOLATION (CRITICAL)**: Do NOT pull data from adjacent patients in the same text block.
- **IDENTITY VERIFICATION**: If Case ID exists but No Name is linked, use "Unknown". 
- **NO HALLUCINED NAMES**: Do not use generic names. If NO PATIENT is found in context, state: "No distinct patient data found in this document."
- **70% ACCURACY**: Diagnosis and Treatment must strictly come from the PDF for the correct patient (or the provided Vitals).
- **NO MEDICAL OVERREACTION**: If vitals are within normal baseline ranges, explicitly state "Vitals are within Normal Range". Do not invent severe diseases or prescribe strong drugs for minor fluctuations.
- **30% INTELLIGENCE**: Professionally supplement the 30-day plans based on the accurate diagnosis/vitals reading.
- **CONCISE**: Table cells must be under 15 words.
- **RAG SAFE**: Use ONLY the provided context. If the context does NOT contain a medical diagnosis or lab values: -> Respond PERFECTLY clearly: "No medical diagnosis data found in document". DO NOT guess or generate assumptions.
 
Current Date: {time.strftime('%B %d, %Y')}
"""

def _build_full_prompt(message: str, doc_context: str, mem_context: str, profile_context: str) -> str:
    parts = [SYSTEM_PROMPT]
    
    # 🚨 Dynamic Identity Resolution
    parts.append("## IMPORTANT CLINICAL RULE:\nIf the user's question uses words like 'my', 'I', or asks about their own report/vitals, you MUST treat the 'User Profile' below as the PATIENT. Otherwise, assume the user is a Doctor querying a third-party case document. If no name is found but the user is asking about themselves, use the User Profile Name.")

    if profile_context and profile_context.strip():
        parts.append(f"## User Profile\n{profile_context.strip()}")
    if mem_context and mem_context.strip():
        parts.append(f"## Previous Conversation Context\n{mem_context.strip()}")
    if doc_context and doc_context.strip():
        parts.append(f"## Uploaded Document Content\n(Prioritize this for facts):\n{doc_context.strip()}")
    parts.append(f"## User Question\n{message}\n\n## Your Answer\n")
    return "\n\n".join(parts)

def call_ollama_pipeline(full_prompt: str, model: str) -> str:
    """Generic call for local Ollama models. Removed lock for 3s speed requirement."""
    try:
        data = {
            "model": model,
            "prompt": full_prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "top_p": 0.9,
                "num_predict": 1024,
            },
            "keep_alive": 0
        }
        resp = requests.post(f"{OLLAMA_URL}/api/generate", json=data, timeout=OLLAMA_TIMEOUT)
        if resp.status_code == 200:
            raw_text = resp.json().get("response", "").strip()
            # 🚨 BUGFIX: DeepSeek-R1 wraps reasoning in <think> tags.
            # Markdown renderers treat this as an unknown HTML element and hide it completely,
            # causing the UI to look "Blank". We must strip it out so the actual answer is visible!
            import re
            cleaned_text = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()
            
            # If the model ONLY outputted thinking (got cut off), return the raw text to avoid complete silence
            if not cleaned_text and raw_text:
                cleaned_text = raw_text.replace("<think>", "💭 **AI Reasoning:**\n").replace("</think>", "\n---\n")
                
            return cleaned_text
        else:
            # Check for generic LLM fallback if specific model is missing
            return f"Model {model} failed. Is Ollama running?"
    except Exception as e:
        return f"Pipeline failed ({model}): {str(e)}"


def generate_parallel_analysis(message: str, doc_context: str, mem_context: str, profile_context: str) -> dict:
    """Orchestrates parallel AI calls and returns combined results."""
    full_prompt = _build_full_prompt(message, doc_context, mem_context, profile_context)
    
    results = {}
    # Run Sequentially instead of Parallel to stop Ollama from throwing Out-Of-Memory errors!
    print("[Memory Safeguard] Running DeepSeek...")
    deepseek_res = call_ollama_pipeline(full_prompt, DEEPSEEK_MODEL)
    results["deepseek"] = deepseek_res
    
    print("[Memory Safeguard] Running Med42...")
    med42_res = call_ollama_pipeline(full_prompt, MED42_MODEL)
    results["med42"] = med42_res

    print("[Consensus Engine] Merging insights into a final recommendation...")
    consensus_prompt = f"""
    You are an expert Clinical Reviewer and Final Arbitrator for PraxiaOne.
    Below are analyses from two AI engines regarding the user's health and latest vitals.

    --- DEEPSEEK ANALYSIS ---
    {deepseek_res[:2000]}

    --- MED42 (CLINICAL EXPERT) ANALYSIS ---
    {med42_res[:2000]}
    ----------------------------------------

    ### INSTRUCTIONS FOR CONSENSUS:
    1. Look at both outputs. Extract the most accurate and safe clinical interpretation of the vitals and documents.
    2. Provide a single, final unified response. DO NOT invent contradictions.
    3. Begin your response exactly with: `## Clinical Intelligence Consensus`
    4. Provide the findings in short, crisp bullet points.
    5. If both models agree, merge their best advices (Diet, Workout, Reminders) into a cohesive final 30-day plan.
    """
    consensus_res = call_ollama_pipeline(consensus_prompt, DEEPSEEK_MODEL)
    results["consensus"] = consensus_res
        
    return results
