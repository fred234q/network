
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user/<str:username>", views.user, name="user"),
    path("following", views.following, name="following"),

    # API Routes
    path("new-post", views.new_post, name="new-post"),
    path("posts/<str:feed>", views.posts, name="posts"),
    path("user/<str:username>/info", views.user_info, name="user_info"),
    path("user/<str:username>/follow", views.follow, name="follow"),
    path("posts/<int:post_id>/edit", views.edit, name="edit"),
]
