from django.urls import path
from . import views

urlpatterns = [
    # pages
    path("", views.landing_page, name="landing"),
    path("login/", views.login_page, name="home"),
    path("teacher/login/", views.teacher_login_page, name="teacher_login"),
    path("teacher/home/", views.teacher_home, name="teacher_home"),
    path("teacher/select-class/", views.select_class_page, name="select_class"),
    path("calci/4credits/", views.four_credits_page, name="four_credits"),
    path("calci/3-2credits/", views.three_two_credits_page, name="three_two_credits"),
    path("teacher/student-list/", views.student_list_manage, name="student_list"),
    path("teacher/subject-create/", views.subject_create_page, name="subject_create"),
    path("teacher/marks/", views.teacher_marks_page, name="teacher_marks"),
    path("teacher/course-upload/", views.course_and_upload_page, name="course_and_upload"),  # <-- FIXED WITH COMMA
    path("student/login/", views.student_login_page),
    path("student/dashboard/", views.student_dashboard_page),
    path("student/summary/", views.student_summary_page),

    # APIs
    path("api/create_subject/", views.create_subject),
    path("api/list_subjects/", views.list_subjects),
    path("api/download_subject_template/", views.download_template_for_subject),
    path("api/upload_marks_subject/", views.upload_marks_for_subject),
    path("api/student_check/", views.student_check),
    path("api/student_subjects/", views.student_subjects),

    path("api/get_students/", views.get_student_list),
    path("api/upload_students/", views.upload_student_list),
    path("api/get_uploaded_marks/", views.get_uploaded_marks),
    path("api/get_course_marks/", views.get_course_marks),
    path("api/delete_uploaded_marks/", views.delete_uploaded_marks),

    # student endpoints
   
    path("api/student/summary/", views.get_student_summary),
]
