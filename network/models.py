from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('User', related_name="followers")

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user}'s post on {self.timestamp}"

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    timestamp = models.DateTimeField(auto_now_add=True)