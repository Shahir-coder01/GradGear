from django.urls import path
from .views import google_login
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('api/google-login/', google_login, name='google_login'),
    path('api/generate', views.generate_notes_api, name='generate_notes'),
    path('api/solve-qp', views.solve_qp_api, name='solve_qp'),
    path('api/analyze-performance/', views.analyze_performance, name='analyze_performance'),

    path('api/admin/lectures/', views.AdminLectureListView.as_view(), name='admin-lectures'),
    path('api/admin/lectures/<int:lecture_id>/<str:action>/', views.AdminLectureActionView.as_view(), name='admin-lecture-action'),
    
    path('api/admin/notes/', views.AdminNoteListView.as_view(), name='admin-notes'),
    path('api/admin/notes/<int:note_id>/<str:action>/', views.AdminNoteActionView.as_view(), name='admin-note-action'),
    
    path('api/admin/pyqs/', views.AdminPYQListView.as_view(), name='admin-pyqs'),
    path('api/admin/pyqs/<int:pyq_id>/<str:action>/', views.AdminPYQActionView.as_view(), name='admin-pyq-action'),
    
    path('api/admin/groups/', views.AdminGroupListView.as_view(), name='admin-groups'),
    path('api/admin/groups/<int:group_id>/<str:action>/', views.AdminGroupActionView.as_view(), name='admin-group-action'),

    path('api/admin/login/', views.admin_login, name='admin-login'),

    path('api/lectures/', views.LectureListView.as_view(), name='lecture-list'),
    path('api/lectures/<int:lecture_id>/', views.LectureDetailView.as_view(), name='lecture-detail'),
    path('api/lectures/<int:lecture_id>/upvote/', views.upvote_lecture, name='lecture-upvote'),
    
    path('api/notes/', views.NoteListView.as_view(), name='note-list'),
    path('api/notes/<int:note_id>/', views.NoteDetailView.as_view(), name='note-detail'),
    path('api/notes/<int:note_id>/upvote/', views.upvote_note, name='note-upvote'),
    
    path('api/pyqs/', views.PYQListView.as_view(), name='pyq-list'),
    path('api/pyqs/<int:pyq_id>/', views.PYQDetailView.as_view(), name='pyq-detail'),
    
   
    path('api/groups/', views.GroupListView.as_view(), name='group-list'),
    path('api/groups/<int:group_id>/', views.GroupDetailView.as_view(), name='group-detail'),

    
    
]

