from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from core.ai_memory import search_user_docs, _extract_text_from_file
from core.ai_prompt import build_praxia_prompt
from core.mock_llm import call_ollama_pipeline, DEEPSEEK_MODEL
from core.models import MedicalProfile
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
            You are a rigorous medical data extraction assistant. Extract all key biomarkers and their values from the following lab report text.
            CRITICAL INSTRUCTION: You MUST strictly evaluate each biomarker's value against standard medical reference ranges. If a value is outside the optimal range, you MUST classify its status as 'High', 'Low', 'Elevated', or 'Irregular'. Do NOT classify abnormal values as 'Normal'.
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
                # Save to MedicalProfile
                if biomarkers:
                    profile, _ = MedicalProfile.objects.get_or_create(user=request.user)
                    profile.latest_biomarkers = biomarkers
                    profile.save()
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
        CRITICAL INSTRUCTION: If any biomarker has a status of 'High', 'Low', 'Elevated', or 'Irregular', you MUST explicitly mention it in 'top_findings' and 'what_it_means'. NEVER say 'Everything looks good' or 'No abnormalities' if there are abnormal markers.
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
                {{"title": "Walk 20 mins", "description": "Helps improve blood sugar", "icon": "directions_walk", "impact": "High"}}
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
                # Save to MedicalProfile
                profile, _ = MedicalProfile.objects.get_or_create(user=request.user)
                profile.latest_insights = data
                profile.save()

                # Auto-generate ActionTasks
                from core.models import ActionTask
                action_plans = data.get("action_plan", [])
                for plan in action_plans:
                    title = plan.get("title", "")
                    if title and not ActionTask.objects.filter(user=request.user, title=title).exists():
                        ActionTask.objects.create(
                            user=request.user,
                            title=title,
                            subtext=plan.get("description", ""),
                            icon=plan.get("icon", "check_circle").replace("-", "_"),
                            is_ai_generated=True,
                            status="Not Started",
                            status_color="error",
                            color_hex="#EF4444"
                        )

                return Response(data)
            else:
                return Response({"error": "Failed to parse AI response", "raw": llm_res}, status=500)
                
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class LatestInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = MedicalProfile.objects.get(user=request.user)
            return Response({
                "latest_biomarkers": profile.latest_biomarkers or [],
                "latest_insights": profile.latest_insights or None
            })
        except MedicalProfile.DoesNotExist:
            return Response({
                "latest_biomarkers": [],
                "latest_insights": None
            })