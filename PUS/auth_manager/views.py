from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from .forms import LoginForm, UserRegistrationForm
import json

@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(request, username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return JsonResponse({
                        'status': 'success',
                        'username': user.username,
                        'message': 'Authentication successful'
                    })
                else:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Account is disabled'
                    }, status=403)
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid credentials'
                }, status=401)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request method'
    }, status=405)

@csrf_exempt
def user_logout(request):
    logout(request)
    return JsonResponse({
        'status': 'success',
        'message': 'Logged out successfully'
    })

@csrf_exempt
def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_form = UserRegistrationForm(data)
            
            if user_form.is_valid():
                new_user = user_form.save(commit=False)
                new_user.set_password(user_form.cleaned_data['password'])
                new_user.save()
                
                # Automatyczne logowanie po rejestracji
                login(request, new_user)
                
                return JsonResponse({
                    'status': 'success',
                    'username': new_user.username,
                    'message': 'Registration successful'
                })
            else:
                errors = {field: error[0] for field, error in user_form.errors.items()}
                return JsonResponse({
                    'status': 'error',
                    'errors': errors,
                    'message': 'Form validation failed'
                }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request method'
    }, status=405)

@login_required
def api_user(request):
    return JsonResponse({
        'username': request.user.username,
        'is_authenticated': True
    })

@login_required
def dashboard(request):
    return render(request, 'account/dashboard.html', {'section': 'dashboard'})