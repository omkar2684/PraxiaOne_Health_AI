from django.urls import path
from .views import AIInsightsView, ParseLabPDFView, LatestInsightsView

urlpatterns = [
    path('insights/', AIInsightsView.as_view(), name='ai_insights'),
    path('parse-pdf/', ParseLabPDFView.as_view(), name='parse_pdf'),
    path('latest/', LatestInsightsView.as_view(), name='latest_insights'),
]
