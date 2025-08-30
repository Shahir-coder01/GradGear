from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Custom User Manager to handle user creation
class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, password, **extra_fields)

# Custom User model
class User(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, null=False, default='Anonymous')
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, default='student')
    subscription = models.CharField(max_length=50, default='free')

    # Fields from AbstractBaseUser
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']  # Only 'name' is required for creating superuser
    
    objects = CustomUserManager()

    def __str__(self):
        return self.name


class Group(models.Model):
    group_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group_name = models.CharField(max_length=100)
    group_type = models.CharField(max_length=50)
    description = models.TextField()
    whatsapp = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20)

    def __str__(self):
        return self.group_name

class PYQ(models.Model):
    pyq_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    branch = models.CharField(max_length=50)
    semester = models.CharField(max_length=10)
    subject = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    link = models.URLField()
    status = models.CharField(max_length=20)

    def __str__(self):
        return self.name

class Note(models.Model):
    note_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    branch = models.CharField(max_length=50)
    semester = models.CharField(max_length=10)
    subject = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    link = models.URLField()
    rating = models.IntegerField()
    status = models.CharField(max_length=20)

    def __str__(self):
        return self.name

class Lecture(models.Model):
    lecture_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    branch = models.CharField(max_length=50)
    semester = models.CharField(max_length=10)
    subject = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    link = models.URLField()
    rating = models.IntegerField()
    status = models.CharField(max_length=20)

    def __str__(self):
        return self.name


