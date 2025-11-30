from django.urls import path
from ..backend_django import views

urlpatterns = [
    path("upload_students/", views.upload_student_list),
    path("get_students/", views.get_student_list),
]
