from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='chat'),
    path('getChatList/', views.load_chat_list, name='load_chats'),
    path('fetch_chats/<int:user_id>/', views.fetch_chats, name='fetch_chats'),
    path('send_message/', views.send_message, name='send_message'),
    path('check_new_messages/<int:user_id>/<str:last_message_timestamp>/', views.check_new_messages, name='check_new_messages'),
]
