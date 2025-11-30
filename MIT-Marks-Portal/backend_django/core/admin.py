from django.contrib import admin
from .models import ClassInfo, Student, Subject, Course, Marks

admin.site.register(ClassInfo)
admin.site.register(Student)
admin.site.register(Marks)
