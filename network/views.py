from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.core.paginator import Paginator

from .models import User, Post, Like


def paginate(request, posts):
    paginator = Paginator(posts, 10)

    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return page_obj


def index(request):
    posts = Post.objects.all()
    posts = posts.order_by("-timestamp").all()
    page_obj = paginate(request, posts)
    return render(request, "network/index.html", {
        "page_obj": page_obj
        })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Banned usernames
        banned_usernames = ["all", "following"]

        # Attempt to create new user
        try:
            if username in banned_usernames:
                raise IntegrityError
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def new_post(request):
    
    # Creating a new post must be done via POST
    if request.method == "POST":
        
        # Get data
        data = json.loads(request.body)
        body = data.get("body", "")
        
        if body == "":
            return JsonResponse({"error": "Post must not be empty."}, status=400)

        # Create post
        post = Post(
            user=request.user,
            body=body
        )
        post.save()

        return JsonResponse({"message": "Post created successfully."}, status=201)

    else:
        return JsonResponse({"error": "POST request required."}, status=400)


def user(request, username):
    try:
        user = User.objects.get(username=username)
    except:
        return HttpResponseRedirect(reverse("index"))
    
    posts = Post.objects.filter(
        user=user
    )

    # Return posts in reverse chronological order
    posts = posts.order_by("-timestamp").all()
    page_obj = paginate(request, posts)
    return render(request, "network/index.html", {
        "feed": user,
        "page_obj": page_obj
        })


def posts(request, feed):
    print(f"Feed: {feed}")

    # Filter posts based on feed
    if feed == "all":
        posts = Post.objects.all()

    elif feed == "following":
        following = request.user.following.all()
        posts = Post.objects.filter(user__in=following)

    else:
        try:
            user = User.objects.get(username=feed)
        except:
            return JsonResponse({"error": f"User with username {feed} does not exist"}, status=400)
        
        posts = Post.objects.filter(
            user=user
        )
        if not posts:
            return JsonResponse({"error": "Invalid feed."}, status=400)

    # Return posts in reverse chronological order
    posts = posts.order_by("-timestamp").all()
    page_obj = paginate(request, posts)
    return JsonResponse([post.serialize() for post in page_obj], safe=False)


def user_info(request, username):
    try:
        user = User.objects.get(username=username)
    except:
        return JsonResponse({"error": f"User with username {username} does not exist"}, status=400)
    
    if not user:
        return JsonResponse({"error": "Invalid user."}, status=400)
    
    return JsonResponse(user.serialize())


@csrf_exempt
@login_required
def follow(request, username):
    if request.method == "POST":
        try:
            followed_user = User.objects.get(username=username)
        except:
            return JsonResponse({"error": f"User with username {username} does not exist"}, status=400)

        if not followed_user:
            return JsonResponse({"error": "Invalid user."}, status=400)
        
        if followed_user == request.user:
            return JsonResponse({"error": "User cannot follow self."}, status=400)
        
        if request.user not in followed_user.followers.all():
            followed_user.followers.add(request.user)
            followed_user.save()
            return JsonResponse({"message": f"Followed user {username} successfully."})
        
        else:
            followed_user.followers.remove(request.user)
            followed_user.save()
            return JsonResponse({"message": f"Unfollowed user {username} successfully."})
        
    else:
        return JsonResponse({"error": "POST request required."}, status=400)


@login_required
def following(request):
    following = request.user.following.all()
    posts = Post.objects.filter(user__in=following)
    posts = posts.order_by("-timestamp").all()
    page_obj = paginate(request, posts)

    return render(request, "network/index.html", {
        "feed": "following",
        "page_obj": page_obj
        })


@csrf_exempt
@login_required
def edit(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    
    try:
        post = Post.objects.get(user=request.user, pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    if request.user != post.user:
        return JsonResponse({"error": "Cannot edit another user's post."}, status=400)
    
    data = json.loads(request.body)
    if data.get("body") is not None:
        post.body = data["body"]
    post.save()
    return HttpResponse(status=204)

@csrf_exempt
@login_required
def like(request, post_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    like, created = Like.objects.get_or_create(post=post, user=request.user)
    print(like)
    if created:
        like.save()
        return JsonResponse({"message": "Post liked succesfully."}, status=200)
    else:
        like.delete()
        return JsonResponse({"message": "Post unliked succesfully"}, status=200)