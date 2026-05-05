# pyre-ignore-all-errors
import os, time, uuid, re
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
    UploadedDocument, Consent, ChatMessage, VitalsEntry, Medication, MedicalProfile, NotificationSettings, PaymentProfile, SupportTicket
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
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({
            "weekly_summary": {
                "completed": 3,
                "partial": 1,
                "not_started": 1,
                "progress_percent": 60,
                "total": 5
            },
            "actions": [
                {"id": 1, "icon": "directions_walk", "title": "Walk 20 minutes daily", "subtext": "4 of 5 days completed", "status": "On Track", "status_color": "success", "color_hex": "#10B981"},
                {"id": 2, "icon": "cake", "title": "Reduce sugar intake", "subtext": "Improved, but above target", "status": "Partial", "status_color": "warning", "color_hex": "#F59E0B"},
                {"id": 3, "icon": "water_drop", "title": "Drink 8 glasses of water", "subtext": "3 of 5 days completed", "status": "Partial", "status_color": "warning", "color_hex": "#3B82F6"},
                {"id": 4, "icon": "fitness_center", "title": "Strength training 2x per week", "subtext": "Completed 2 of 2 this week", "status": "On Track", "status_color": "success", "color_hex": "#8B5CF6"},
                {"id": 5, "icon": "event", "title": "Schedule follow-up lab test", "subtext": "Not started", "status": "Not Started", "status_color": "error", "color_hex": "#EF4444", "is_actionable": True}
            ],
            "insights": [
                {"icon": "trending_up", "text": "Your activity level increased by 22% this week", "color": "success"},
                {"icon": "trending_flat", "text": "Sugar intake still fluctuating", "subtext": "Try reducing added sugars", "color": "warning"},
                {"icon": "bedtime", "text": "You're most consistent on weekdays", "color": "primary"}
            ],
            "projection": {
                "text": "You are on track to improve your glucose levels by your next test.",
                "subtext": "Based on your current adherence pattern"
            },
            "re_test": {
                "days_left": 18,
                "text": "Based on your progress, your next lab test is recommended in 18 days."
            }
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