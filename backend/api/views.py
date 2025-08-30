import json
from django.http import JsonResponse
from rest_framework.decorators import api_view
import jwt
from django.conf import settings
from .models import  User  # Import your custom User model
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .services.notes_generator import generate_notes
from .services.qp_solver import solve_question_paper


@api_view(['POST'])
def google_login(request):
    token = request.data.get('token')

    if not token:
        return JsonResponse({"error": "Token is missing"}, status=400)

    try:
        # For development only — don't skip signature/expiration checks in production
        decoded_token = jwt.decode(
            token,
            options={"verify_signature": False, "verify_exp": False}
        )

        email = decoded_token.get('email')
        name = decoded_token.get('name')

        if not email or not name:
            return JsonResponse({"error": "Invalid token: email or name missing"}, status=400)

        if not email.lower().endswith('@ug.cusat.ac.in'):
            return JsonResponse({"error": "Only CUSAT emails (@ug.cusat.ac.in) are allowed"}, status=403)

        role = 'admin' if email.lower() == 'admin@cusat.ac.in' else 'student'
        subscription = 'pro' if request.data.get('premium', False) else 'free'

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'name': name,
                'role': role,
                'subscription': subscription,
            }
        )

        if not created:
            updated = False
            if user.role != role:
                user.role = role
                updated = True
            if user.subscription != subscription:
                user.subscription = subscription
                updated = True
            if updated:
                user.save()

        return JsonResponse({
            "access_token": token,
            "user_info": {
                "user_id": user.user_id,  # ✅ Include user_id here
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "subscription": user.subscription,
            }
        })

    except jwt.ExpiredSignatureError:
        return JsonResponse({"error": "Token has expired"}, status=400)
    except jwt.InvalidTokenError:
        return JsonResponse({"error": "Invalid token"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"An unexpected error occurred: {str(e)}"}, status=500)
    
    


@csrf_exempt
@require_POST
def generate_notes_api(request):
    """API endpoint to generate notes from syllabus."""
    try:
        data = json.loads(request.body)
        syllabus = data.get('syllabus')
        reference_books = data.get('referenceBooks', '')
        
        if not syllabus:
            return JsonResponse({"error": "Syllabus is required"}, status=400)
        
        pdf_data, error = generate_notes(syllabus, reference_books)
        
        if error:
            return JsonResponse({"error": error}, status=500)
        
        return JsonResponse({"pdf": pdf_data})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_POST
def solve_qp_api(request):
    """API endpoint to solve question papers from images."""
    try:
        if not request.FILES.get('file'):
            return JsonResponse({"error": "No file uploaded"}, status=400)
        
        image_file = request.FILES['file']
        
        # Check file size (max 10MB)
        if image_file.size > 10 * 1024 * 1024:
            return JsonResponse({"error": "File size exceeds 10MB limit"}, status=400)
        
        # Check file type
        valid_types = ['image/jpeg', 'image/png', 'image/jpg']
        if image_file.content_type not in valid_types:
            return JsonResponse({"error": "Invalid file type. Please upload a JPEG or PNG image"}, status=400)
        
        result, error = solve_question_paper(image_file)
        
        if error:
            return JsonResponse({"error": error}, status=500)
        
        return JsonResponse({
            "pdf": result["pdf"],
            "text_solution": result["text_solution"]
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .performance_analyzer import (
    predict_future_sgpa,
    identify_strengths_weaknesses,
    recommend_electives,
    recommend_specialization
)

@api_view(['POST'])
def analyze_performance(request):
    """Analyze student performance and provide predictions."""
    try:
        data = request.data
        semesters = data.get('semesters', [])
        
        if not semesters:
            return Response({'error': 'No data provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract SGPAs for prediction
        sgpas = []
        all_subjects = []
        
        for semester in semesters:
            if 'sgpa' in semester and semester['sgpa'] != 'N/A' and semester['sgpa'] is not None:
                try:
                    sgpa_value = float(semester['sgpa'])
                    sgpas.append(sgpa_value)
                except (ValueError, TypeError):
                    pass
            
            if 'subjects' in semester and semester['subjects']:
                all_subjects.extend(semester['subjects'])
        
        # Get predictions
        future_sgpa_prediction = predict_future_sgpa(sgpas) if len(sgpas) >= 2 else None
        strengths_weaknesses = identify_strengths_weaknesses(all_subjects) if all_subjects else None
        elective_recommendations = recommend_electives(all_subjects) if all_subjects else None
        specialization_recommendations = recommend_specialization(all_subjects) if all_subjects else None
        
        return Response({
            'sgpa_prediction': future_sgpa_prediction,
            'strengths_weaknesses': strengths_weaknesses,
            'elective_recommendations': elective_recommendations,
            'specialization_recommendations': specialization_recommendations
        })
    except Exception as e:
        return Response(
            {'error': 'An error occurred during analysis', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Lecture, Note, PYQ, Group
from .serializers import LectureSerializer, NoteSerializer, PYQSerializer, GroupSerializer

# Admin API Views

class AdminLectureListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        lectures = Lecture.objects.all().select_related('user')
        serializer = LectureSerializer(lectures, many=True)
        return Response(serializer.data)

class AdminLectureActionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def put(self, request, lecture_id, action):
        lecture = get_object_or_404(Lecture, lecture_id=lecture_id)
        
        if action == 'approve':
            lecture.status = 'approved'
            lecture.save()
            return Response({'message': 'Lecture approved successfully'})
        elif action == 'reject':
            lecture.status = 'rejected'
            lecture.rejection_reason = request.data.get('rejection_reason', '')
            lecture.save()
            return Response({'message': 'Lecture rejected successfully'})
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

class AdminNoteListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        notes = Note.objects.all().select_related('user')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

class AdminNoteActionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def put(self, request, note_id, action):
        note = get_object_or_404(Note, note_id=note_id)
        
        if action == 'approve':
            note.status = 'approved'
            note.save()
            return Response({'message': 'Note approved successfully'})
        elif action == 'reject':
            note.status = 'rejected'
            note.rejection_reason = request.data.get('rejection_reason', '')
            note.save()
            return Response({'message': 'Note rejected successfully'})
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

class AdminPYQListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        pyqs = PYQ.objects.all().select_related('user')
        serializer = PYQSerializer(pyqs, many=True)
        return Response(serializer.data)

class AdminPYQActionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def put(self, request, pyq_id, action):
        pyq = get_object_or_404(PYQ, pyq_id=pyq_id)
        
        if action == 'approve':
            pyq.status = 'approved'
            pyq.save()
            return Response({'message': 'PYQ approved successfully'})
        elif action == 'reject':
            pyq.status = 'rejected'
            pyq.rejection_reason = request.data.get('rejection_reason', '')
            pyq.save()
            return Response({'message': 'PYQ rejected successfully'})
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

class AdminGroupListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        groups = Group.objects.all().select_related('user')
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)

class AdminGroupActionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def put(self, request, group_id, action):
        group = get_object_or_404(Group, group_id=group_id)
        
        if action == 'approve':
            group.status = 'approved'
            group.save()
            return Response({'message': 'Group approved successfully'})
        elif action == 'reject':
            group.status = 'rejected'
            group.rejection_reason = request.data.get('rejection_reason', '')
            group.save()
            return Response({'message': 'Group rejected successfully'})
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        

# Add to views.py
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

@api_view(['POST'])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user is not None and user.is_staff:
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'username': user.name or user.email
        })
    else:
        return Response({'error': 'Invalid credentials or not an admin user'}, 
                        status=status.HTTP_401_UNAUTHORIZED)
    

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Lecture
from .serializers import LectureSerializer

# Lecture API Views
class LectureListView(APIView):
    """
    List all lectures or create a new lecture
    """
    def get(self, request):
        # Get query parameters
        branch = request.query_params.get('branch', None)
        semester = request.query_params.get('semester', None)
        subject = request.query_params.get('subject', None)
        search = request.query_params.get('search', None)
        status_filter = request.query_params.get('status', 'approved')
        
        # Start with all lectures
        lectures = Lecture.objects.all()
        
        # Apply filters
        if branch:
            lectures = lectures.filter(branch=branch)
        if semester:
            lectures = lectures.filter(semester=semester)
        if subject:
            lectures = lectures.filter(subject=subject)
        if search:
            lectures = lectures.filter(name__icontains=search)
        if status_filter:
            lectures = lectures.filter(status=status_filter)
            
        # Order by rating (highest first)
        lectures = lectures.order_by('-rating')
        
        serializer = LectureSerializer(lectures, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        try:
            # Get a default user for anonymous submissions
            # This assumes you have at least one user in your database
            default_user = User.objects.first()
            
            # Create a mutable copy of the data
            data = request.data.copy() if hasattr(request.data, 'copy') else request.data
            
            # Set default values if not provided
            if 'rating' not in data:
                data['rating'] = 0
            if 'status' not in data:
                data['status'] = 'pending'
                
            # Create serializer with request data
            serializer = LectureSerializer(data=data)
            
            if serializer.is_valid():
                # Save with the default user
                serializer.save(user=default_user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log the error for debugging
            print(f"Error in lecture submission: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LectureDetailView(APIView):
    """
    Retrieve, update or delete a lecture instance
    """
    def get(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, lecture_id=lecture_id)
        serializer = LectureSerializer(lecture)
        return Response(serializer.data)
    
    def put(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, lecture_id=lecture_id)
        
        serializer = LectureSerializer(lecture, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, lecture_id=lecture_id)
        lecture.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def upvote_lecture(request, lecture_id):
    """
    Upvote a lecture (increment rating by 1)
    """
    try:
        lecture = Lecture.objects.get(lecture_id=lecture_id)
    except Lecture.DoesNotExist:
        return Response({"detail": "Lecture not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Increment rating by 1
    lecture.rating = lecture.rating + 1
    lecture.save()
    
    return Response({"detail": "Lecture upvoted successfully", "new_rating": lecture.rating})


from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Note, User
from .serializers import NoteSerializer

class NoteListView(APIView):
    """
    List all notes or create a new note
    """
    def get(self, request):
        # Get query parameters
        branch = request.query_params.get('branch', None)
        semester = request.query_params.get('semester', None)
        subject = request.query_params.get('subject', None)
        search = request.query_params.get('search', None)
        status_filter = request.query_params.get('status', 'approved')
        
        # Start with all notes
        notes = Note.objects.all()
        
        # Apply filters
        if branch:
            notes = notes.filter(branch=branch)
        if semester:
            notes = notes.filter(semester=semester)
        if subject:
            notes = notes.filter(subject=subject)
        if search:
            notes = notes.filter(name__icontains=search)
        if status_filter:
            notes = notes.filter(status=status_filter)
            
        # Order by rating (highest first)
        notes = notes.order_by('-rating')
        
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        try:
            # Get a default user for anonymous submissions
            # This assumes you have at least one user in your database
            default_user = User.objects.first()
            
            # Create a mutable copy of the data
            data = request.data.copy() if hasattr(request.data, 'copy') else request.data
            
            # Set default values if not provided
            if 'rating' not in data:
                data['rating'] = 0
            if 'status' not in data:
                data['status'] = 'pending'
                
            # Create serializer with request data
            serializer = NoteSerializer(data=data)
            
            if serializer.is_valid():
                # Save with the default user
                serializer.save(user=default_user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log the error for debugging
            print(f"Error in note submission: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NoteDetailView(APIView):
    """
    Retrieve, update or delete a note instance
    """
    def get(self, request, note_id):
        note = get_object_or_404(Note, note_id=note_id)
        serializer = NoteSerializer(note)
        return Response(serializer.data)
    
    def put(self, request, note_id):
        note = get_object_or_404(Note, note_id=note_id)
        serializer = NoteSerializer(note, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, note_id):
        note = get_object_or_404(Note, note_id=note_id)
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def upvote_note(request, note_id):
    """
    Upvote a note (increment rating by 1)
    """
    try:
        note = Note.objects.get(note_id=note_id)
    except Note.DoesNotExist:
        return Response({"detail": "Note not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Increment rating by 1
    note.rating = note.rating + 1
    note.save()
    
    return Response({"detail": "Note upvoted successfully", "new_rating": note.rating})

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import PYQ, User
from .serializers import PYQSerializer

class PYQListView(APIView):
    """
    List all PYQs or create a new PYQ
    """
    def get(self, request):
        # Get query parameters
        branch = request.query_params.get('branch', None)
        semester = request.query_params.get('semester', None)
        subject = request.query_params.get('subject', None)
        search = request.query_params.get('search', None)
        status_filter = request.query_params.get('status', 'approved')
        
        # Start with all PYQs
        pyqs = PYQ.objects.all()
        
        # Apply filters
        if branch:
            pyqs = pyqs.filter(branch=branch)
        if semester:
            pyqs = pyqs.filter(semester=semester)
        if subject:
            pyqs = pyqs.filter(subject=subject)
        if search:
            pyqs = pyqs.filter(name__icontains=search)
        if status_filter:
            pyqs = pyqs.filter(status=status_filter)
            
        serializer = PYQSerializer(pyqs, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        try:
            # Get a default user for anonymous submissions
            default_user = User.objects.first()
            
            # Create a mutable copy of the data
            data = request.data.copy() if hasattr(request.data, 'copy') else request.data
            
            # Set default values if not provided
            if 'status' not in data:
                data['status'] = 'pending'
                
            # Create serializer with request data
            serializer = PYQSerializer(data=data)
            
            if serializer.is_valid():
                # Save with the default user
                serializer.save(user=default_user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log the error for debugging
            print(f"Error in PYQ submission: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PYQDetailView(APIView):
    """
    Retrieve, update or delete a PYQ instance
    """
    def get(self, request, pyq_id):
        pyq = get_object_or_404(PYQ, pyq_id=pyq_id)
        serializer = PYQSerializer(pyq)
        return Response(serializer.data)
    
    def put(self, request, pyq_id):
        pyq = get_object_or_404(PYQ, pyq_id=pyq_id)
        serializer = PYQSerializer(pyq, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pyq_id):
        pyq = get_object_or_404(PYQ, pyq_id=pyq_id)
        pyq.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Group, User
from .serializers import GroupSerializer

class GroupListView(APIView):
    """
    List all groups or create a new group
    """
    def get(self, request):
        # Get query parameters
        search = request.query_params.get('search', None)
        status_filter = request.query_params.get('status', 'approved')
        group_type = request.query_params.get('group_type', None)
        
        # Start with all groups
        groups = Group.objects.all()
        
        # Apply filters
        if search:
            groups = groups.filter(
                group_name__icontains=search
            ) | groups.filter(
                description__icontains=search
            )
        if status_filter:
            groups = groups.filter(status=status_filter)
        if group_type:
            groups = groups.filter(group_type=group_type)
            
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        try:
            # Get a default user for anonymous submissions
            default_user = User.objects.first()
            
            # Create a mutable copy of the data
            data = request.data.copy() if hasattr(request.data, 'copy') else request.data
            
            # Set default values if not provided
            if 'status' not in data:
                data['status'] = 'pending'
                
            # Create serializer with request data
            serializer = GroupSerializer(data=data)
            
            if serializer.is_valid():
                # Save with the default user
                serializer.save(user=default_user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log the error for debugging
            print(f"Error in group submission: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GroupDetailView(APIView):
    """
    Retrieve, update or delete a group instance
    """
    def get(self, request, group_id):
        group = get_object_or_404(Group, group_id=group_id)
        serializer = GroupSerializer(group)
        return Response(serializer.data)
    
    def put(self, request, group_id):
        group = get_object_or_404(Group, group_id=group_id)
        serializer = GroupSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, group_id):
        group = get_object_or_404(Group, group_id=group_id)
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)