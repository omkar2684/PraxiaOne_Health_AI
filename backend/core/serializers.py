from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    WeeklyGoal,
    WeightGoal,
    WeightEntry,
    UserProfile,
    UploadedDocument,
    Consent,
    ChatMessage,
    ChatMessage,
    Medication,
    SupportTicket,
    MedicalProfile,
    NotificationSettings,
    PaymentProfile,
)


class WeeklyGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyGoal
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]


class WeightGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightGoal
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]


class WeightEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightEntry
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    patient_id = serializers.SerializerMethodField()

    def get_patient_id(self, obj):
        return f"PRX-{obj.user.id:04d}"

    class Meta:
        model = UserProfile
        fields = "__all__"
        read_only_fields = ["id", "user", "updated_at"]


class UploadedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedDocument
        fields = "__all__"
        read_only_fields = ["id", "user", "uploaded_at"]


class ConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consent
        fields = "__all__"
        read_only_fields = ["id", "user", "updated_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    age = serializers.IntegerField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    allergies = serializers.CharField(required=False, allow_blank=True)
    conditions = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "age", "gender", "full_name", "phone_number", "allergies", "conditions"]

    def validate_username(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists or is too similar to another user.")
        return value

    def validate_email(self, value):
        value = (value or "").strip().lower()
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        age = validated_data.pop("age", None)
        gender = validated_data.pop("gender", "")
        full_name = validated_data.pop("full_name", "")
        phone_number = validated_data.pop("phone_number", "")
        allergies = validated_data.pop("allergies", "")
        
        username = validated_data.get("username")
        email = validated_data.get("email", "")
        password = validated_data.get("password")
        
        user = User(username=username, email=email)
        user.set_password(password)
        user.save()
        
        # Update/Create profile with extra fields
        from .models import UserProfile, MedicalProfile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.age = age
        profile.gender = gender
        profile.full_name = full_name
        profile.phone_number = phone_number
        profile.allergies = allergies
        profile.save()
        
        conditions = validated_data.pop("conditions", "")
        if conditions:
            med_prof, _ = MedicalProfile.objects.get_or_create(user=user)
            med_prof.conditions = conditions
            med_prof.save()
        
        return user

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "role", "text", "meta_data", "created_at"]

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at", "status"]

class MedicalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalProfile
        fields = ['conditions', 'medications_list', 'allergies_list']

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = ['email_alerts', 'push_notifications', 'appointment_reminders']

class PaymentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentProfile
        fields = ['insurance_provider', 'policy_number', 'last_four_digits']
