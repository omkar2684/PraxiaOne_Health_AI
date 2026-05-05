from django.urls import path
from .views import AIInsightsView, ParseLabPDFView

urlpatterns = [
    path('insights/', AIInsightsView.as_view(), name='ai_insights'),
    path('parse-pdf/', ParseLabPDFView.as_view(), name='parse_pdf'),
]
