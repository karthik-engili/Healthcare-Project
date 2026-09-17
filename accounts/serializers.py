from rest_framework import serializers
from .models import User, LanguagePreference, PatientProfile, HealthcareWorkerProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role')
        read_only_fields = ('id', 'role')


LANG_CHOICES_MAP = {
    'hi': 'Hindi',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'bn': 'Bengali',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'en': 'English',
    'pa': 'Punjabi',
}

REV_LANG_MAP = {v.lower(): k for k, v in LANG_CHOICES_MAP.items()}


class PatientProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', required=False, allow_blank=True)
    phone_number = serializers.CharField(source='user.phone_number', required=False, allow_blank=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    full_name = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    preferred_language = serializers.CharField(required=False, allow_blank=True)
    age = serializers.ReadOnlyField()
    bmi = serializers.ReadOnlyField()
    bmi_category = serializers.ReadOnlyField()

    def get_full_name(self, obj):
        fname = (obj.user.first_name or '').strip()
        lname = (obj.user.last_name or '').strip()
        if fname or lname:
            return f"{fname} {lname}".strip()
        return obj.user.username.capitalize() if obj.user.username else "Patient"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Read preferred language from LanguagePreference
        lang_code = 'en'
        if hasattr(instance.user, 'language_preference'):
            lang_code = instance.user.language_preference.preferred_language or 'en'
        data['preferred_language'] = LANG_CHOICES_MAP.get(lang_code, lang_code.capitalize())
        data['preferred_language_code'] = lang_code
        return data

    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'username', 'email', 'phone_number', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'gender', 'height_cm', 'weight_kg', 'blood_group', 'age', 'bmi', 'bmi_category',
            'address', 'village_town', 'district', 'state', 'emergency_contact_name', 'emergency_contact_number',
            'preferred_language', 'allergies', 'medical_conditions'
        ]
        read_only_fields = ('id', 'user', 'age', 'bmi', 'bmi_category')

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        if 'email' in user_data:
            user.email = user_data['email']
        if 'phone_number' in user_data:
            user.phone_number = user_data['phone_number']
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        user.save()

        # Update preferred language if provided
        pref_lang = validated_data.pop('preferred_language', None)
        if pref_lang:
            lang_code = REV_LANG_MAP.get(pref_lang.strip().lower(), pref_lang.strip().lower())
            if lang_code in LanguagePreference.LANGUAGE_CHOICES or lang_code in LANG_CHOICES_MAP:
                lp, _ = LanguagePreference.objects.get_or_create(user=user)
                lp.preferred_language = lang_code if lang_code in dict(LanguagePreference.LANGUAGE_CHOICES) else 'en'
                lp.save()

        return super().update(instance, validated_data)


class HealthcareWorkerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', required=False, allow_blank=True)
    phone_number = serializers.CharField(source='user.phone_number', required=False, allow_blank=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = HealthcareWorkerProfile
        fields = [
            'id', 'user', 'username', 'email', 'phone_number', 'first_name',
            'specialization', 'registration_number', 'facility_name',
            'facility_address', 'years_of_experience'
        ]
        read_only_fields = ('id', 'user')

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        if 'email' in user_data:
            user.email = user_data['email']
        if 'phone_number' in user_data:
            user.phone_number = user_data['phone_number']
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        user.save()

        return super().update(instance, validated_data)


class LanguagePreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LanguagePreference
        fields = '__all__'
        read_only_fields = ('user',)

        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, default='')
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, default='')
    address = serializers.CharField(required=False, allow_blank=True, default='')
    village_town = serializers.CharField(required=False, allow_blank=True, default='')
    emergency_contact_number = serializers.CharField(required=False, allow_blank=True, default='')
    preferred_language = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 'role', 'phone_number',
            'first_name', 'last_name', 'date_of_birth', 'gender',
            'address', 'village_town', 'emergency_contact_number', 'preferred_language'
        )

    def create(self, validated_data):
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        dob = validated_data.get('date_of_birth', None)
        gender_raw = validated_data.get('gender', '')
        address = validated_data.get('address', '') or validated_data.get('village_town', '')
        village_town = validated_data.get('village_town', '') or address
        emergency_contact = validated_data.get('emergency_contact_number', '')
        preferred_language = validated_data.get('preferred_language', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data['role'],
            phone_number=validated_data.get('phone_number', ''),
            first_name=first_name,
            last_name=last_name,
        )

        # Set language preference
        lang_code = 'en'
        if preferred_language:
            mapped_code = REV_LANG_MAP.get(preferred_language.strip().lower(), preferred_language.strip().lower())
            if mapped_code in dict(LanguagePreference.LANGUAGE_CHOICES):
                lang_code = mapped_code
        LanguagePreference.objects.create(user=user, preferred_language=lang_code)

        if user.role == 'patient':
            # Map gender code
            gender_code = ''
            if gender_raw.upper().startswith('M'):
                gender_code = 'M'
            elif gender_raw.upper().startswith('F'):
                gender_code = 'F'
            elif gender_raw.upper().startswith('O'):
                gender_code = 'O'

            PatientProfile.objects.create(
                user=user,
                date_of_birth=dob,
                gender=gender_code,
                address=address,
                village_town=village_town,
                emergency_contact_number=emergency_contact,
                height_cm=None,
                weight_kg=None,
                blood_group='',
                allergies='',
                medical_conditions='',
            )
        elif user.role == 'healthcare_worker':
            HealthcareWorkerProfile.objects.create(user=user)
        return user