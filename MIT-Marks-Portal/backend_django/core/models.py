# core/models.py
from django.db import models

class ClassInfo(models.Model):
    branch = models.CharField(max_length=20)
    semester = models.CharField(max_length=5)
    section = models.CharField(max_length=5)

    class Meta:
        unique_together = ('branch', 'semester', 'section')

    def __str__(self):
        return f"{self.branch} - Sem {self.semester} - Sec {self.section}"

class Student(models.Model):
    class_info = models.ForeignKey(ClassInfo, on_delete=models.CASCADE, related_name='students')
    sl_no = models.IntegerField(null=True, blank=True)
    usn = models.CharField(max_length=40)
    name = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.usn} - {self.name}"

class Course(models.Model):
    # A distinct course instance for a particular class (branch/sem/section)
    class_info = models.ForeignKey(ClassInfo, on_delete=models.CASCADE, related_name='courses')
    course_name = models.CharField(max_length=200)
    sub_code = models.CharField(max_length=100, blank=True, null=True)
    faculty = models.CharField(max_length=200, blank=True, null=True)
    credits = models.IntegerField(default=3)  # 1/2/3/4

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course_name} ({self.sub_code}) - {self.class_info}"

class Marks(models.Model):
    student = models.ForeignKey("Student", on_delete=models.CASCADE)
    class_info = models.ForeignKey("ClassInfo", on_delete=models.CASCADE)
    course = models.ForeignKey(
    "Course",
    on_delete=models.CASCADE,
    related_name="marks",
    null=True,     # ← Add this
    blank=True     # ← And this
)


    ia1 = models.FloatField(null=True, blank=True)
    ia2 = models.FloatField(null=True, blank=True)
    ia3 = models.FloatField(null=True, blank=True)
    asg1 = models.FloatField(null=True, blank=True)
    asg2 = models.FloatField(null=True, blank=True)
    lab_cie = models.FloatField(null=True, blank=True)
    lab_test = models.FloatField(null=True, blank=True)
    total = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.usn} - {self.course.course_name} - Marks"
    

class Subject(models.Model):
    class_info = models.ForeignKey(ClassInfo, on_delete=models.CASCADE, related_name="subjects")
    subject = models.CharField(max_length=200)
    subcode = models.CharField(max_length=20)
    credits = models.IntegerField(default=0)
    faculty = models.CharField(max_length=200, blank=True)

