from rest_framework import generics, permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from .models import PatientProfile, HealthcareWorkerProfile, LanguagePreference
from .serializers import (
    RegisterSerializer, UserSerializer, PatientProfileSerializer,
    HealthcareWorkerProfileSerializer, LanguagePreferenceSerializer
)


class UserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        print(f"\n{'='*50}")
        print(f"[USER UPDATE] User: {request.user}")
        print(f"[USER UPDATE] Method: {request.method}")
        print(f"[USER UPDATE] Received data: {request.data}")

        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            print(f"[USER UPDATE ERROR] Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        print(f"[USER UPDATE] Saved successfully! New data: {serializer.data}")
        print(f"{'='*50}\n")
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.role == 'patient':
            return PatientProfileSerializer
        return HealthcareWorkerProfileSerializer

    def get_object(self):
        user = self.request.user
        if user.role == 'patient':
            profile, _ = PatientProfile.objects.get_or_create(user=user)
            return profile
        profile, _ = HealthcareWorkerProfile.objects.get_or_create(user=user)
        return profile

    def update(self, request, *args, **kwargs):
        print(f"\n[PROFILE UPDATE] Method: {request.method}")
        print(f"[PROFILE UPDATE] User: {request.user} (ID: {request.user.id})")
        print(f"[PROFILE UPDATE] Payload received: {request.data}")

        partial = kwargs.pop('partial', True)
        instance = self.get_object()

        # Sanitize data: convert empty string date_of_birth, height_cm, weight_kg or "null" string to None
        data = request.data.copy()
        if 'date_of_birth' in data and (data['date_of_birth'] == '' or data['date_of_birth'] == 'null'):
            data['date_of_birth'] = None
        if 'height_cm' in data and (data['height_cm'] == '' or data['height_cm'] == 'null'):
            data['height_cm'] = None
        if 'weight_kg' in data and (data['weight_kg'] == '' or data['weight_kg'] == 'null'):
            data['weight_kg'] = None

        serializer = self.get_serializer(instance, data=data, partial=partial)
        if not serializer.is_valid():
            print(f"[PROFILE UPDATE ERROR] Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        print(f"[PROFILE UPDATE SUCCESS] Saved payload: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_200_OK)


class LanguagePreferenceView(generics.RetrieveUpdateAPIView):
    serializer_class = LanguagePreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.language_preference


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=201)