from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from core.ai_memory import search_user_docs, _extract_text_from_file
from core.ai_prompts import build_praxia_prompt
from core.mock_llm import call_ollama_pipeline, DEEPSEEK_MODEL
import json
import re
import os
import tempfile
class ParseLabPDFView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=400)
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            for chunk in file_obj.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            text = _extract_text_from_file(tmp_path)
            prompt = f"""
            You are a medical data extraction assistant. Extract all key biomarkers and their values from the following lab report text.
            Return ONLY a valid JSON array of objects. Do not include any markdown formatting, explanations, or thinking blocks.
            Format: [{{"name": "Glucose", "value": "102", "unit": "mg/dL", "status": "High"}}]
            If no data is found, return [].
            
            Lab Report:
            {text[:4000]}
            """
            
            llm_res = call_ollama_pipeline(prompt, DEEPSEEK_MODEL)
            match = re.search(r'\[.*\]', llm_res, re.DOTALL)
            if match:
                biomarkers = json.loads(match.group(0))
            else:
                biomarkers = []
                
            return Response({"biomarkers": biomarkers})
            
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

class AIInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        biomarkers = request.data.get("biomarkers", [])
        if not biomarkers:
            return Response({"error": "No biomarkers provided"}, status=400)
            
        prompt = f"""
        You are a medical AI assistant. Analyze the following biomarkers and provide insights.
        Return ONLY a valid JSON object. Do not include markdown formatting or thinking blocks.
        Format:
        {{
            "top_findings": [
                {{"name": "Glucose", "status": "High", "finding": "Your fasting glucose is above optimal."}}
            ],
            "what_it_means": [
                {{"biomarker": "Glucose", "explanation": "High blood sugar can lead to...", "good_news": "Small changes can help!"}}
            ],
            "action_plan": [
                {{"title": "Walk 20 mins", "description": "Helps improve blood sugar", "icon": "directions-walk", "impact": "High"}}
            ]
        }}
        
        Biomarkers:
        {json.dumps(biomarkers)}
        """
        
        try:
            llm_res = call_ollama_pipeline(prompt, DEEPSEEK_MODEL)
            match = re.search(r'\{.*\}', llm_res, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
                return Response(data)
            else:
                return Response({"error": "Failed to parse AI response", "raw": llm_res}, status=500)
                
        except Exception as e:
            return Response({"error": str(e)}, status=500)