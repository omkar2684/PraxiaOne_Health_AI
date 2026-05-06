# backend/core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .ai_memory import QdrantHealthView, QdrantUpsertDemo, QdrantSearchView

from .views import (
    WeeklyGoalViewSet,
    WeightGoalViewSet,
    WeightEntryViewSet,
    ProfileView,
    ConsentView,
    VitalsProgressView,
    VitalsLatestView,
    DocumentsView,
    DeleteDocumentView,
    HealthChatView,
    TTSView,
    ChangePasswordView,
    SocialLoginView,
    SupportTicketViewSet,
    SettingsProfileView,
    JourneyFlowView,
    ForecastView,
    RecommendationsView,
    RiskFactorsView,
    VitalsExportView,
    GeneratePDFView,
    LogoutView,
    DeleteAccountView,
    HealthScoreView,
    TrackProgressView,
)

from .medication_views import MedicationViewSet


router = DefaultRouter()
router.register(r"weekly-goals", WeeklyGoalViewSet, basename="weekly-goals")
router.register(r"weight-goals", WeightGoalViewSet, basename="weight-goals")
router.register(r"weight-entries", WeightEntryViewSet, basename="weight-entries")
router.register(r"medications", MedicationViewSet, basename="medications")
router.register(r"support-tickets", SupportTicketViewSet, basename="support-tickets")

urlpatterns = [
    path("", include(router.urls)),

    path("profile/", ProfileView.as_view()),
    path("auth/social/", SocialLoginView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    path("consent/", ConsentView.as_view()),
    path("vitals/progress/", VitalsProgressView.as_view()),
    path("vitals/latest/", VitalsLatestView.as_view(), name="vitals-latest"),
    path("vitals/export/", VitalsExportView.as_view(), name="vitals-export"),
    path("journey/", JourneyFlowView.as_view(), name="journey-flow"),
    path("forecast/", ForecastView.as_view(), name="forecast"),
    path("health/recommendations/", RecommendationsView.as_view(), name="recommendations"),
    path("health/risk-factors/", RiskFactorsView.as_view(), name="risk-factors"),

    path("documents/", DocumentsView.as_view()),
    path("documents/<int:doc_id>/delete/", DeleteDocumentView.as_view()),

    path("health-chat/", HealthChatView.as_view()),
    path("tts/", TTSView.as_view()),

    # Qdrant debug endpoints
    path("qdrant/health/", QdrantHealthView.as_view(), name="qdrant-health"),
    path("ai/qdrant-upsert-demo/", QdrantUpsertDemo.as_view()),
    path("ai/qdrant-search/", QdrantSearchView.as_view()),
    path("user/settings/", SettingsProfileView.as_view()),
    path("generate-pdf/", GeneratePDFView.as_view()),
    path("auth/logout/", LogoutView.as_view()),
    path("auth/delete-account/", DeleteAccountView.as_view()),
    path("track-progress/", TrackProgressView.as_view()),
    path("health-score/", HealthScoreView.as_view(), name="health-score"),
]
