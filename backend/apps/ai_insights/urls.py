from django.urls import path
from .views import AIInsightsView, ParseLabPDFView, LatestLabResultsView, CompareLabPDFView

urlpatterns = [
    path('insights/', AIInsightsView.as_view(), name='ai_insights'),
    path('parse-pdf/', ParseLabPDFView.as_view(), name='parse_pdf'),
    path('lab-results/latest/', LatestLabResultsView.as_view(), name='latest_lab_results'),
    path('compare-labs/', CompareLabPDFView.as_view(), name='compare_labs'),
]
