from django.db import models
from django.conf import settings


class WeeklyGoal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    goal = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.goal}"


class WeightGoal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    target_weight = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} target {self.target_weight}kg"


class WeightEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    current_weight = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} current {self.current_weight}kg"


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    full_name = models.CharField(max_length=120, blank=True, default="")
    profile_picture = models.ImageField(upload_to="profile_pics/", null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, default="")
    phone_number = models.CharField(max_length=20, blank=True, default="")
    height_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    wellness_interests = models.JSONField(default=list, blank=True)
    allergies = models.CharField(max_length=255, blank=True, default="")

    diet_preference = models.CharField(max_length=30, blank=True, default="")
    address = models.TextField(blank=True, null=True)
    preferred_ai_mode = models.CharField(max_length=50, default='Fast (Med42)')
    privacy_lock_enabled = models.BooleanField(default=True)
    notes = models.TextField(blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} profile"


class UploadedDocument(models.Model):
    DOC_TYPES = (
        ("care_plan", "Care Plan"),
        ("lab_result", "Lab Result"),
        ("insurance_policy", "Insurance Policy"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    doc_type = models.CharField(max_length=20, choices=DOC_TYPES)
    file = models.FileField(upload_to="uploads/%Y/%m/")
    title = models.CharField(max_length=255, blank=True, default="")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # --- ADD THESE NEW FIELDS ---
    processing_status = models.CharField(
        max_length=20, # <--- Fixed to max_length
        default="pending", 
        choices=(("pending", "Pending"), ("completed", "Completed"), ("failed", "Failed"))
    )
    raw_text_extracted = models.TextField(blank=True, default="")
    # ----------------------------

    def __str__(self):
        return f"{self.user} - {self.doc_type} - {self.title or self.file.name}"


class Consent(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="consent",
    )

    care_plan_allowed = models.BooleanField(default=False)
    lab_results_allowed = models.BooleanField(default=False)

    vitals_allowed = models.BooleanField(default=False)
    ai_insights_allowed = models.BooleanField(default=False)
    recommendations_allowed = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} consent"


class ChatMessage(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_messages",
    )
    role = models.CharField(max_length=10, choices=(("user", "user"), ("ai", "ai")))
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} {self.role} @ {self.created_at}"


class VitalsEntry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="vitals"
    )
    # Clinical metrics requested by user
    oxygen_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True) # SpO2 %
    pulse_rate = models.IntegerField(null=True, blank=True) # BPM
    sugar_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True) # mg/dL
    bp_systolic = models.IntegerField(null=True, blank=True)
    bp_diastolic = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} Vitals @ {self.created_at}"

class Medication(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="medications",
    )
    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    schedule = models.CharField(max_length=100)
    start_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.name}"

class ProfileChangeLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile_changes",
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    old_email = models.CharField(max_length=255, blank=True, default="")
    new_email = models.CharField(max_length=255, blank=True, default="")
    old_username = models.CharField(max_length=255, blank=True, default="")
    new_username = models.CharField(max_length=255, blank=True, default="")
    
    def __str__(self):
        return f"{self.user} changes @ {self.changed_at}"

class SupportTicket(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="support_tickets",
    )
    category = models.CharField(max_length=50)
    priority = models.CharField(max_length=20)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    email = models.EmailField()
    status = models.CharField(max_length=20, default="Open")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.status}] {self.subject} ({self.user})"

class MedicalProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='medical_profile')
    conditions = models.TextField(blank=True, null=True, help_text="Comma-separated conditions")
    medications_list = models.TextField(blank=True, null=True, help_text="Comma-separated medications")
    allergies_list = models.TextField(blank=True, null=True, help_text="Comma-separated allergies")

class NotificationSettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_settings')
    email_alerts = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    appointment_reminders = models.BooleanField(default=True)

class PaymentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_profile')
    insurance_provider = models.CharField(max_length=100, blank=True, null=True)
    policy_number = models.CharField(max_length=100, blank=True, null=True)
    last_four_digits = models.CharField(max_length=4, blank=True, null=True)
