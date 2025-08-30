from rest_framework import serializers
from .models import User, Lecture, Note, PYQ, Group

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email']

class LectureSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Lecture
        fields = ['lecture_id', 'user', 'branch', 'semester', 'subject', 
                  'name', 'link', 'rating', 'status']

class NoteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Note
        fields = ['note_id', 'user', 'branch', 'semester', 'subject', 
                  'name', 'link', 'rating', 'status']

class PYQSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PYQ
        fields = ['pyq_id', 'user', 'branch', 'semester', 'subject', 
                  'name', 'link', 'status']

class GroupSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Group
        fields = ['group_id', 'user', 'group_name', 'group_type', 
                  'description', 'whatsapp', 'instagram', 'linkedin', 
                  'status', 'branch', 'semester']

from rest_framework import serializers
from .models import Lecture, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email']

class LectureSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Lecture
        fields = '__all__'  # Use all fields from your existing model
        read_only_fields = ['lecture_id', 'user']


from rest_framework import serializers
from .models import Note, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email']

class NoteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Note
        fields = '__all__'
        read_only_fields = ['note_id', 'user']

class PYQSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PYQ
        fields = '__all__'
        read_only_fields = ['pyq_id', 'user']

class GroupSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Group
        fields = '__all__'
        read_only_fields = ['group_id', 'user']