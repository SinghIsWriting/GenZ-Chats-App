from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.forms import UserChangeForm
from .models import Profile

class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email']
        # Remove help texts
        help_texts = {
            'username': None,
            'email': None,
        }
        # Add custom widgets
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your username',
                'style': 'width: 100%; margin-bottom: 10px;',
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your email',
                'style': 'width: 100%; margin-bottom: 10px;',
            }),
        }

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['image', 'bio']
        widgets = {
            'image': forms.ClearableFileInput(attrs={
                'class': 'form-control-file',
                'style': 'margin-bottom: 10px;',
            }),
            'bio': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Write something about yourself...',
                'rows': 4,
                'style': 'width: 100%; margin-bottom: 10px;',
            }),
        }

class LoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)

        # Customize username widget
        self.fields['username'].widget = forms.TextInput(attrs={
            'class': 'form-control',  # Custom CSS class
            'placeholder': 'Username',  # Placeholder text
            'autofocus': True,  # Autofocus on username field
        })

        # Customize password widget
        self.fields['password'].widget = forms.PasswordInput(attrs={
            'class': 'form-control',  # Custom CSS class
            'placeholder': 'Password',  # Placeholder text
        })

        # Optional: Remove help texts if any
        for field in self.fields.values():
            field.help_text = None

class UserRegisterForm(UserCreationForm):
    # email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
    
    def __init__(self, *args, **kwargs):
        super(UserRegisterForm, self).__init__(*args, **kwargs)

        # Customize username widget
        self.fields['username'].widget = forms.TextInput(attrs={
            'class': 'form-control',  # Custom CSS class
            'placeholder': 'Username',  # Placeholder text
            'autofocus': True,  # Autofocus on username field
        })

        # Customize email widget
        self.fields['email'].widget = forms.EmailInput(attrs={
            'class': 'form-control',  # Custom CSS class
            'placeholder': 'Email address',  # Placeholder text
        })

        # Customize password1 widget
        self.fields['password1'].widget = forms.PasswordInput(attrs={
            'class': 'form-control',  # Custom CSS class
            'placeholder': 'Password',  # Placeholder text
        })

        # Customize password2 (password confirmation) widget
        self.fields['password2'].widget = forms.PasswordInput(attrs={
            'class': 'form-control',  # Custom CSS class
            'placeholder': 'Confirm Password',  # Placeholder text
        })

        # Customizing each field to remove help text and modify labels
        for field_name in ['username', 'email', 'password1', 'password2']:
            self.fields[field_name].help_text = ''  # Remove help text
