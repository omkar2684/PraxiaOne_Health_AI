import os, time, uuid, re, json
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from django.http import HttpResponse

from .models import (
    WeeklyGoal, WeightGoal, WeightEntry, UserProfile,
    UploadedDocument, Consent, ChatMessage, VitalsEntry, Medication, MedicalProfile, NotificationSettings, PaymentProfile, SupportTicket, ActionTask
)
from .serializers import (
    RegisterSerializer, WeeklyGoalSerializer, WeightGoalSerializer,
    WeightEntrySerializer, UserProfileSerializer, UploadedDocumentSerializer,
    ConsentSerializer, MedicationSerializer, MedicalProfileSerializer, NotificationSettingsSerializer, PaymentProfileSerializer, SupportTicketSerializer
)
from .ai_memory import (
    search_user_memories, upsert_memory_point,
    ingest_uploaded_document, search_user_docs,
    embed_text, _extract_text_from_file, _chunk_text
)

# --- Helpers ---
def get_or_create_consent(user):
    consent, _ = Consent.objects.get_or_create(user=user)
    # Auto-approve consent for development/demo mode
    if not consent.lab_results_allowed or not consent.care_plan_allowed:
        consent.lab_results_allowed = True
        consent.care_plan_allowed = True
        consent.vitals_allowed = True
        consent.save()
    return consent

# --- Authentication & Profile ---
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": {"id": user.id, "username": user.username, "email": user.email},
            "access": str(refresh.access_token), "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(UserProfileSerializer(profile).data)
    def put(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        ser = UserProfileSerializer(profile, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)
    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        ser = UserProfileSerializer(profile, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

class SettingsProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        medical, _ = MedicalProfile.objects.get_or_create(user=user)
        notifications, _ = NotificationSettings.objects.get_or_create(user=user)
        payment, _ = PaymentProfile.objects.get_or_create(user=user)

        return Response({
            "profile": UserProfileSerializer(profile).data,
            "medical": MedicalProfileSerializer(medical).data,
            "notifications": NotificationSettingsSerializer(notifications).data,
            "payment": PaymentProfileSerializer(payment).data,
        })

    def patch(self, request):
        user = request.user
        data = request.data
        
        if "profile" in data:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            ser = UserProfileSerializer(profile, data=data["profile"], partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
            
        if "medical" in data:
            medical, _ = MedicalProfile.objects.get_or_create(user=user)
            ser = MedicalProfileSerializer(medical, data=data["medical"], partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
            
        if "notifications" in data:
            notifications, _ = NotificationSettings.objects.get_or_create(user=user)
            ser = NotificationSettingsSerializer(notifications, data=data["notifications"], partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
            
        if "payment" in data:
            payment, _ = PaymentProfile.objects.get_or_create(user=user)
            ser = PaymentProfileSerializer(payment, data=data["payment"], partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
            
        return self.get(request)

class ConsentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        consent = get_or_create_consent(request.user)
        return Response(ConsentSerializer(consent).data)
    def patch(self, request):
        consent = get_or_create_consent(request.user)
        ser = ConsentSerializer(consent, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

# --- Goals & Vitals ---
class WeeklyGoalViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyGoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return WeeklyGoal.objects.filter(user=self.request.user).order_by("-created_at")
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class WeightGoalViewSet(viewsets.ModelViewSet):
    serializer_class = WeightGoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return WeightGoal.objects.filter(user=self.request.user).order_by("-created_at")
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class WeightEntryViewSet(viewsets.ModelViewSet):
    serializer_class = WeightEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return WeightEntry.objects.filter(user=self.request.user).order_by("created_at")
    def perform_create(self, serializer): serializer.save(user=self.request.user)

class VitalsProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        profile = UserProfile.objects.filter(user=request.user).first()
        goal = WeightGoal.objects.filter(user=request.user).order_by("-created_at").first()
        current = float(profile.weight_kg) if profile and profile.weight_kg else 0
        target = float(goal.target_weight) if goal else 0
        start = current # Logic could be improved to find first entry
        progress = 0
        if start > target and target > 0:
            progress = ((start - current) / (start - target)) * 100
        return Response({
            "start_weight": start,
            "current_weight": current,
            "target_weight": target,
            "progress": round(max(0, min(100, progress)), 2)
        })

class VitalsLatestView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        latest = VitalsEntry.objects.filter(user=request.user).first()
        if not latest: return Response({"detail": "No vitals found"}, status=404)
        from django.utils import timezone
        is_stale = (timezone.now() - latest.created_at).days >= 1
        return Response({
            "oxygen": latest.oxygen_level, "pulse": latest.pulse_rate, "sugar": latest.sugar_level,
            "systolic": latest.bp_systolic, "diastolic": latest.bp_diastolic,
            "is_stale": is_stale, "last_updated": latest.created_at
        })
    def post(self, request):
        latest = VitalsEntry.objects.create(
            user=request.user,
            oxygen_level=request.data.get("oxygen"),
            pulse_rate=request.data.get("pulse"),
            sugar_level=request.data.get("sugar"),
            bp_systolic=request.data.get("systolic"),
            bp_diastolic=request.data.get("diastolic")
        )
        return Response({"detail": "Vitals updated", "id": latest.id}, status=201)

# --- Documents ---
class DocumentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        qs = UploadedDocument.objects.filter(user=request.user).order_by("-uploaded_at")
        return Response(UploadedDocumentSerializer(qs, many=True, context={"request": request}).data)
    def post(self, request):
        ser = UploadedDocumentSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        doc = ser.save(user=request.user)
        try:
            ingest_uploaded_document(user_id=request.user.id, doc_id=doc.id, doc_type=doc.doc_type, title=doc.title, file_path=doc.file.path)
            doc.processing_status = "completed"; doc.save()
            return Response(ser.data, status=201)
        except Exception:
            doc.processing_status = "failed"; doc.save()
            return Response({"detail": "Ingest failed"}, status=500)

class DeleteDocumentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, doc_id):
        try:
            doc = UploadedDocument.objects.get(id=doc_id, user=request.user)
            doc.file.delete(save=False)
            doc.delete()
            return Response({"detail": "Deleted"})
        except UploadedDocument.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

# --- TTS & Chat ---
class TTSView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        text = request.data.get("text", "").strip()
        voice_id = getattr(settings, "ELEVEN_LABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
        api_key = getattr(settings, "ELEVEN_LABS_API_KEY", "").strip()
        if not text or not api_key: return Response({"detail": "Text or API key missing"}, status=400)
        try:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            resp = requests.post(url, headers={'xi-api-key': api_key, 'Content-Type': 'application/json'}, json={"text": text, "model_id": "eleven_multilingual_v2"}, timeout=30)
            if resp.status_code != 200: return Response({"detail": "ElevenLabs Error"}, status=resp.status_code)
            return HttpResponse(resp.content, content_type="audio/mpeg")
        except Exception as e: return Response({"detail": str(e)}, status=500)

class HealthChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def _save(self, user, role, text, meta=None): ChatMessage.objects.create(user=user, role=role, text=text, meta_data=meta or {})
    def get(self, request):
        from .serializers import ChatMessageSerializer
        qs = ChatMessage.objects.filter(user=request.user).order_by("created_at")
        return Response(ChatMessageSerializer(qs, many=True).data)
    def post(self, request):
        user_message = (request.data.get("message") or "").strip()
        doc_id = request.data.get("doc_id")
        if not user_message: return Response({"detail": "message required"}, status=400)
        self._save(request.user, "user", user_message)
        
        doc_hits = []
        doc_context = ""
        try:
            doc_hits = search_user_docs(user_id=request.user.id, query=user_message, limit=10, doc_id=doc_id)
            doc_context = "\n".join([h.get('text', '') for h in doc_hits])
        except Exception: pass
        
        memories = []
        try: memories = search_user_memories(user_id=request.user.id, query=user_message, limit=5)
        except Exception: pass
        mem_context = "\n".join([m.get('text', '') for m in memories])

        try:
            profile = UserProfile.objects.filter(user=request.user).first()
            profile_context = f"User: {profile.full_name}, Age: {profile.age}, Weight: {profile.weight_kg}kg" if profile else ""
        except Exception: profile_context = ""

        try:
            from .mock_llm import generate_parallel_analysis
            results = generate_parallel_analysis(user_message, doc_context, mem_context, profile_context)
            reply = results.get("consensus", results.get("deepseek", "Analysis complete."))
            self._save(request.user, "ai", reply, meta={"results": results})
            return Response({"reply": reply, "results": results, "doc_hits": doc_hits})
        except Exception as e: return Response({"detail": str(e)}, status=500)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        password = request.data.get("new_password")
        if not password:
            return Response({"detail": "Password is required"}, status=400)
        request.user.set_password(password)
        request.user.save()
        return Response({"detail": "Password changed successfully"})

class SocialLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        # Stub for social login (Google/Facebook)
        return Response({"detail": "Social login not implemented yet", "success": True})

class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user).order_by("-created_at")
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class JourneyFlowView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response([
            {"step": 1, "title": "Entry Welcome", "status": "Started", "completed": True},
            {"step": 2, "title": "Data Sources", "status": "Connected", "completed": True},
            {"step": 3, "title": "Health Intelligence", "status": "Analyzed", "completed": True},
            {"step": 4, "title": "AI Assistant", "status": "Informed", "completed": True},
            {"step": 5, "title": "Prediction", "status": "Projected", "completed": True},
            {"step": 6, "title": "Recommendation", "status": "Prescribed", "completed": False},
            {"step": 7, "title": "Escalation", "status": "Optional", "completed": False},
            {"step": 8, "title": "Future Health", "status": "Unlocked", "completed": False},
        ])

class ForecastView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response({
            "current_score": 72,
            "forecast_score": 72,
            "historical_trends": [50.0, 52.0, 55.0, 60.0, 62.0, 65.0, 68.0, 72.0],
            "projection_current_trend": "+32% metabolic risk (9 months)",
            "projection_with_changes": "Reduced to +12%",
            "recommendations": [
                {"label": "Walk 30 min/day", "score": "82", "assetPath": "public/prediction_screen/activity.png"},
                {"label": "Improve Sleep", "score": "85", "assetPath": "public/prediction_screen/improve_sleep.png"}
            ],
            "detail_card": {
                "icon": "bed",
                "title": "Sleep Optimization",
                "tag": "Bedtime Routine",
                "description": "Try to go to bed and wake up at the same time each day for better endocrine recovery."
            }
        })

class RecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response([
            {
                'id': 1,
                'title': 'Increase Sleep Consistency',
                'subtitle': 'Highest impact to improve score and reduce glucose risk',
                'description': 'Walking after meals helps regulate blood sugar levels and improves cardiovascular health.',
                'impact_text': 'reduce glucose variability',
                'icon': 'sleep'
            },
            {
                'id': 2,
                'title': 'Reduce Saturated Fat Intake',
                'subtitle': 'Stabilize morning glucose spikes',
                'description': 'Reducing processed carbohydrates in your dinner can significantly improve fasting glucose stability.',
                'impact_text': 'LDL ↓ 10–15%',
                'icon': 'food'
            },
            {
                'id': 3,
                'title': 'Daily Walking (20 min)',
                'subtitle': 'Improve recovery and hormone balance',
                'description': 'Maintaining a consistent sleep schedule (7-8 hours) lowers cortisol and helps body weight management.',
                'impact_text': 'cardiovascular risk ↓',
                'icon': 'walk'
            }
        ])

class RiskFactorsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response({
            "factors": [
                {"name": "LDL", "status": "Elevated"},
                {"name": "Sleep", "status": "Irregular"},
                {"name": "Activity", "status": "Low"}
            ],
            "warning_message": "These combined factors are increasing your cardiovascular risk.",
            "explanation_title": "Why am I seeing this?",
            "explanation_text": "Based on your recent lab results, wearable sleep data, and daily step count, our AI detects a pattern that correlates with elevated cardiovascular risk. Improving your sleep consistency and adding 20 minutes of daily activity can help stabilize your LDL and overall metabolic health."
        })

class VitalsExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        # Simulate PDF generation
        return HttpResponse(b"%PDF-1.4\n%\xE2\xE3\xCF\xD3\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF", content_type='application/pdf')

class HealthScoreView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response({
            "score": 88,
            "level": "Excellent",
            "glucose_trend": [110, 115, 128, 120, 118, 114, 118],
            "activity_trend": [4000, 5200, 4800, 6100, 6500, 5900, 7240],
            "care_plan": [
                 {"title": "Action Required", "description": "Your glucose trend is slightly elevated. Consider a consultation.", "is_urgent": True, "completed": False},
                 {"title": "Daily Walk", "description": "30 min goal", "is_urgent": False, "completed": True},
                 {"title": "Nutrition Log", "description": "Low carb focus", "is_urgent": False, "completed": False}
            ]
        })

class TrackProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        tasks = ActionTask.objects.filter(user=request.user)
        
        # Initialize default tasks if user has none
        if not tasks.exists():
            default_tasks = [
                {"title": "Walk 20 minutes daily", "subtext": "8432 steps today (Goal: 8,000)", "icon": "directions_walk", "status": "On Track", "status_color": "success", "color_hex": "#10B981"},
                {"title": "Reduce sugar intake", "subtext": "Improved, but above target", "icon": "cake", "status": "Partial", "status_color": "warning", "color_hex": "#F59E0B"},
                {"title": "Drink 8 glasses of water", "subtext": "3 of 5 days completed", "icon": "water_drop", "status": "Partial", "status_color": "warning", "color_hex": "#3B82F6"},
                {"title": "Strength training 2x per week", "subtext": "Completed 2 of 2 this week", "icon": "fitness_center", "status": "On Track", "status_color": "success", "color_hex": "#8B5CF6"},
                {"title": "Schedule follow-up lab test", "subtext": "Not started", "icon": "event", "status": "Not Started", "status_color": "error", "color_hex": "#EF4444", "is_actionable": True}
            ]
            for t in default_tasks:
                ActionTask.objects.create(
                    user=request.user,
                    title=t['title'],
                    subtext=t['subtext'],
                    icon=t['icon'],
                    status=t['status'],
                    status_color=t['status_color'],
                    color_hex=t['color_hex'],
                    is_actionable=t.get('is_actionable', False),
                    days_completed=[False] * 7
                )
            tasks = ActionTask.objects.filter(user=request.user)

        # Mapping for frontend with adherence enrichment
        actions = []
        enriched_actions = []
        for t in tasks:
            days = t.days_completed or [False] * 7
            count = days.count(True)
            adherence = int((count / 7) * 100)
            
            act_data = {
                "id": t.id,
                "title": t.title,
                "subtext": t.subtext,
                "icon": t.icon,
                "status": t.status,
                "status_color": t.status_color,
                "color_hex": t.color_hex,
                "days_completed": days,
                "adherence_percentage": adherence,
                "days_completed_count": count,
                "is_actionable": t.is_actionable,
                "is_ai_generated": t.is_ai_generated
            }
            actions.append(act_data)
            enriched_actions.append(act_data)

        completed = len([a for a in actions if a['status'] == "On Track"])
        partial = len([a for a in actions if a['status'] == "Partial"])
        not_started = len([a for a in actions if a['status'] == "Not Started"])
        total = len(actions)

        # Simulated Wearable Data
        wearable_data = {"steps": 8432, "sleep_duration": 7.2}

        # Calculate a basic dynamic baseline for projection and signals
        # This ensures we don't show "dummy" data even on initial load
        total_adherence = sum([a['adherence_percentage'] for a in enriched_actions]) / len(enriched_actions) if enriched_actions else 0
        
        # Improvement scales with adherence (max 15% improvement at 100% adherence)
        imp_scale = total_adherence / 100.0
        glucose_imp = int(12 * imp_scale)
        chol_imp = int(8 * imp_scale)
        
        baseline_projection = {
            "text": "Your health metrics are improving based on your habits." if total_adherence > 30 else "Stay consistent to see improvements.",
            "subtext": f"Current overall adherence: {int(total_adherence)}%",
            "biomarkers": [
                {"name": "Fasting Glucose", "improvement": f"-{glucose_imp}%", "from_to": f"Improving towards goal", "trend": "down"},
                {"name": "LDL Cholesterol", "improvement": f"-{chol_imp}%", "from_to": f"Trending down", "trend": "down"}
            ]
        }
        
        baseline_signals = [
            {"name": "Activity Consistency", "value": f"+{int(20 * imp_scale)}%"},
            {"name": "Habit Completion", "value": f"{int(total_adherence)}%"},
            {"name": "Sleep Regularity", "value": "Stable"}
        ]

        return Response({
            "weekly_summary": {
                "completed": completed,
                "partial": partial,
                "not_started": not_started,
                "progress_percent": int((completed / total) * 100) if total > 0 else 0,
                "total": total
            },
            "actions": actions,
            "insights": [
                {"icon": "trending_up", "text": f"Overall adherence is at {int(total_adherence)}%", "color": "success" if total_adherence > 50 else "warning"},
                {"icon": "bedtime", "text": "Sleep patterns remain consistent with your plan.", "color": "primary"}
            ],
            "projection": baseline_projection,
            "signals": baseline_signals,
            "re_test": {
                "days_left": 18,
                "text": "Based on your progress, your next lab test is recommended in 18 days."
            }
        })

    def post(self, request):
        # Save AI generated actions
        actions = request.data.get('actions', [])
        for a in actions:
            # Avoid duplicates by title
            if not ActionTask.objects.filter(user=request.user, title=a['title']).exists():
                ActionTask.objects.create(
                    user=request.user,
                    title=a['title'],
                    subtext=a.get('subtitle') or a.get('subtext') or 'Added from AI insights',
                    icon=a.get('icon', 'star'),
                    status="Not Started",
                    status_color="error",
                    color_hex="#EF4444",
                    is_ai_generated=True,
                    days_completed=[False] * 7
                )
        
        # Return all tasks so frontend gets IDs
        tasks = ActionTask.objects.filter(user=request.user)
        actions_data = []
        for t in tasks:
            actions_data.append({
                "id": t.id,
                "title": t.title,
                "subtext": t.subtext,
                "icon": t.icon,
                "status": t.status,
                "status_color": t.status_color,
                "color_hex": t.color_hex,
                "days_completed": t.days_completed,
                "is_actionable": t.is_actionable,
                "is_ai_generated": t.is_ai_generated
            })
        return Response({"status": "success", "actions": actions_data})

class UpdateActionTaskView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def patch(self, request, task_id):
        try:
            task = ActionTask.objects.get(id=task_id, user=request.user)
            task.status = request.data.get('status', task.status)
            task.status_color = request.data.get('status_color', task.status_color)
            task.color_hex = request.data.get('color_hex', task.color_hex)
            task.days_completed = request.data.get('days_completed', task.days_completed)
            task.save()
            return Response({"status": "success"})
        except ActionTask.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)

class TrackProgressInsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        actions = request.data.get("actions", [])
        if not actions:
            return Response({
                "insights": [{"icon": "auto_awesome", "text": "Start tracking actions to see insights.", "color": "primary"}],
                "projection": {"text": "Track your actions to see projections.", "subtext": "", "biomarkers": []},
                "re_test": {"days_left": 30, "text": "Track actions to get a personalized re-test recommendation."},
                "signals": []
            })
            
        from core.ai_memory import search_user_docs
        
        # 1. Fetch Latest Vitals & Mock Wearable Data
        vitals = VitalsEntry.objects.filter(user=request.user).first()
        
        # Simulated Wearable Data (Dummy data as requested)
        wearable_data = {
            "steps": "8,432 (Avg last 7 days)",
            "sleep_duration": "7h 12m",
            "resting_heart_rate": "64 bpm",
            "active_minutes": "45 min",
            "sleep_quality": "Good (82/100)"
        }
        
        clinical_vitals = {}
        if vitals:
            clinical_vitals = {
                "oxygen": f"{vitals.oxygen_level}%",
                "pulse": f"{vitals.pulse_rate} bpm",
                "sugar": f"{vitals.sugar_level} mg/dL",
                "bp": f"{vitals.bp_systolic}/{vitals.bp_diastolic}" if vitals.bp_systolic else None
            }
            
        # 2. Fetch Recent Health Document Chunks
        doc_hits = search_user_docs(user_id=request.user.id, query="biomarkers laboratory results glucose cholesterol hba1c", limit=5)
        doc_context = "\n".join([h['text'] for h in doc_hits])

        # Calculate adherence for AI context
        total_days = 0
        total_completed = 0
        for a in actions:
            days = a.get('days_completed', [])
            total_days += len(days)
            total_completed += sum([1 for d in days if d])
        
        adherence_pct = int((total_completed / total_days) * 100) if total_days > 0 else 0
        
        prompt = f"""
        You are a medical AI assistant for PraxiaOne. 
        USER DATA SUMMARY:
        - Habit Adherence: {adherence_pct}% (based on {total_completed}/{total_days} checkmarks)
        - Active Habits: {json.dumps(actions)}
        - Wearable Trends: {json.dumps(wearable_data)}
        - Clinical Vitals: {json.dumps(clinical_vitals)}
        
        RECENT MEDICAL HISTORY (from PDFs):
        {doc_context[:1500]}
 
        TASK:
        Generate a JSON response predicting health outcomes.
        
        STRICT ADHERENCE RULES:
        1. If Adherence is > 75%: Show significant reduction (e.g. Glucose drops by 15%, Cholesterol drops by 18%). Formatting: "-15%".
        2. If Adherence is 40-75%: Show moderate reduction (e.g. Glucose drops by 5%, Cholesterol drops by 7%). Formatting: "-5%".
        3. If Adherence is < 40%: Show slight worsening or no change. Formatting: "+1%" or "0%".
        
        IMPORTANT: For Glucose and Cholesterol, a lower number is better! The 'improvement' field MUST be a negative percentage (e.g. "-12%") if they are improving.
        
        RESPONSE FORMAT (JSON ONLY):
        {{
          "insights": [{{ "icon": "...", "text": "...", "subtext": "...", "color": "..." }}],
          "projection": {{
            "text": "Detailed textual explanation of WHY these changes are happening...",
            "biomarkers": [
              {{ "name": "Fasting Glucose", "improvement": "-12%", "from_to": "105 -> 92", "trend": "down" }},
              {{ "name": "LDL Cholesterol", "improvement": "-8%", "from_to": "130 -> 120", "trend": "down" }}
            ],
            "causality_analysis": [
              {{ "action_name": "Walking 20 mins", "benefit": "Had the highest impact on reducing your Glucose", "rank": 1 }}
            ]
          }},
          "signals": [{{ "name": "Activity", "value": "+20%" }}],
          "re_test": {{ "days_left": 15, "text": "..." }}
        }}
        """
        
        try:
            from core.mock_llm import call_ollama_pipeline, DEEPSEEK_MODEL
            llm_res = call_ollama_pipeline(prompt, DEEPSEEK_MODEL)
            match = re.search(r'\{.*\}', llm_res, re.DOTALL)
            if match:
                res_data = json.loads(match.group(0))
                # Fallback if AI didn't provide specific biomarkers
                if 'projection' not in res_data or 'biomarkers' not in res_data['projection'] or not res_data['projection']['biomarkers']:
                    imp = int(15 * (adherence_pct / 100))
                    res_data['projection'] = {
                        "text": f"Based on your {adherence_pct}% adherence, we project steady improvement in your metabolic markers.",
                        "biomarkers": [
                            {"name": "Fasting Glucose", "improvement": f"-{imp}%", "from_to": "Improving", "trend": "down"},
                            {"name": "LDL Cholesterol", "improvement": f"-{max(1, imp-2)}%", "from_to": "Trending down", "trend": "down"}
                        ],
                        "causality_analysis": [
                            { "action_name": actions[0]['title'] if actions else "Healthy Habits", "benefit": "Consistent effort drives metabolic health.", "rank": 1 }
                        ]
                    }
                return Response(res_data)
            else:
                raise ValueError("JSON match not found")
        except Exception as e:
            # Full logic fallback if AI fails entirely
            imp = int(15 * (adherence_pct / 100))
            return Response({
                "insights": [{"icon": "auto_awesome", "text": f"Your {adherence_pct}% consistency is building momentum.", "color": "primary"}],
                "projection": {
                    "text": f"Your current habits (Adherence: {adherence_pct}%) are projected to improve your key biomarkers over the next 3 weeks.",
                    "biomarkers": [
                        {"name": "Fasting Glucose", "improvement": f"-{imp}%", "from_to": "Projected Improvement", "trend": "down"},
                        {"name": "LDL Cholesterol", "improvement": f"-{max(1, imp-3)}%", "from_to": "Projected Improvement", "trend": "down"}
                    ],
                    "causality_analysis": [
                        { "action_name": actions[0]['title'] if actions else "Healthy Habits", "benefit": "Consistent effort drives metabolic health.", "rank": 1 }
                    ]
                },
                "signals": [{"name": "Consistency", "value": f"{adherence_pct}%"}],
                "re_test": {"days_left": 18, "text": "Keep this up for 18 more days for a meaningful re-test."}
            })

# --- PDF & Auth Endpoints ---
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from rest_framework_simplejwt.tokens import RefreshToken

class GeneratePDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        doc_type = request.GET.get('type', 'vitals')
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        p.setFont("Helvetica-Bold", 16)
        
        profile = UserProfile.objects.filter(user=request.user).first()
        name = profile.full_name if profile and profile.full_name else request.user.username
        
        if doc_type == 'vitals':
            p.drawString(100, 750, f"Vitals Report for {name}")
            latest = VitalsEntry.objects.filter(user=request.user).first()
            p.setFont("Helvetica", 12)
            if latest:
                p.drawString(100, 720, f"Oxygen Level: {latest.oxygen_level or 'N/A'}%")
                p.drawString(100, 700, f"Pulse Rate: {latest.pulse_rate or 'N/A'} bpm")
                p.drawString(100, 680, f"Blood Sugar: {latest.sugar_level or 'N/A'} mg/dL")
                p.drawString(100, 660, f"Blood Pressure: {latest.bp_systolic or 'N/A'} / {latest.bp_diastolic or 'N/A'}")
            else:
                p.drawString(100, 720, "No vitals recorded.")
        else:
            p.drawString(100, 750, f"Medical Profile for {name}")
            medical = MedicalProfile.objects.filter(user=request.user).first()
            p.setFont("Helvetica", 12)
            if medical:
                p.drawString(100, 720, f"Conditions: {medical.conditions or 'None'}")
                p.drawString(100, 700, f"Allergies: {medical.allergies_list or 'None'}")
                p.drawString(100, 680, f"Medications: {medical.medications_list or 'None'}")
            else:
                p.drawString(100, 720, "No medical profile recorded.")

        p.showPage()
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{doc_type}_report.pdf"'
        return response

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        user = request.user
        user.delete()
        return Response({"detail": "Account deleted successfully."}, status=status.HTTP_200_OK)