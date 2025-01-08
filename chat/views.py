from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from .models import Chat, Message
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils.timezone import make_aware, localtime
from datetime import datetime, timezone

# Create your views here.
@login_required
def index(request):
    print('chat view', request.user)
    return render(request, 'chat/chat.html', {'username': request.user.username, 'SECRET_KEY': settings.SECRET_KEY})

def user_search(request):
    if request.is_ajax():
        search_term = request.GET.get('username', None)
        users = User.objects.filter(username__icontains=search_term)
        return JsonResponse({'users': list(users.values('id', 'username'))})

def load_chat_list(request):
    print('loading chats...')
    user = request.user
    # Get all users except the logged-in user
    all_users = User.objects.exclude(id=user.id).values('id', 'username')
    
    # Prepare chat list
    chat_list = []
    for other_user in all_users:
        chat = Chat.objects.filter(
            Q(user1=user, user2=other_user['id']) | 
            Q(user1=other_user['id'], user2=user)
        ).first()
        
        last_message = None
        # print(chat)
        if chat:
            try:
                last_message_obj = Message.objects.filter(chat=chat).order_by('timestamp').last()
                if last_message_obj:
                    local_timestamp = localtime(last_message_obj.timestamp)
                    last_message = {
                        'id': last_message_obj.id,
                        'content': last_message_obj.content if last_message_obj.content else "No messages yet!",
                        'timestamp': local_timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                        'std_timestamp': last_message_obj.timestamp
                    }
            except Exception as e:
                print(e)
                last_message = None
        
        chat_list.append({
            'id': other_user['id'],
            'username': other_user['username'],
            'last_message': last_message,
            'last_message_timestamp': last_message['std_timestamp'] if last_message else make_aware(datetime(1970, 1, 7, 22, 58, 57, 891229), timezone.utc)  # Keep raw timestamp for sorting
        })

    # Sort the chat list by the last message timestamp in descending order (most recent first)
    chat_list.sort(key=lambda x: x['last_message_timestamp'], reverse=True)
    # print(chat_list)
    logged_in_user_id = request.user.id
    logged_in_user = request.user.username
    return JsonResponse({'status': 'success', 'logged_in_user_id': logged_in_user_id, 'logged_in_user': logged_in_user, 'chats': chat_list})

# def load_chat(request, user_id):
#     target_user = get_object_or_404(User, id=user_id)
#     current_user = request.user
#     chat = Chat.objects.filter(
#         Q(user1=current_user, user2=target_user) | 
#         Q(user1=target_user, user2=current_user)
#     ).first()

#     if not chat:
#         chat = Chat.objects.create(user1=current_user, user2=target_user)
    
#     messages = chat.messages.order_by('timestamp')
#     return render(request, 'chat/chat.html', {'chat': chat, 'messages': messages})

def fetch_chats(request, user_id):
    target_user = get_object_or_404(User, id=user_id)
    current_user = request.user

    # Find or create a chat between the logged-in user and the target user
    chat = Chat.objects.filter(
        Q(user1=current_user, user2=target_user) | 
        Q(user1=target_user, user2=current_user)
    ).first()

    if not chat:
        chat = Chat.objects.create(user1=current_user, user2=target_user)

    # Fetch all messages for this chat
    messages = Message.objects.filter(chat=chat).order_by('timestamp')

    # Prepare the messages data to send as a JSON response
    message_data = []
    logged_in_user_id = request.user.id
    if messages:
        for message in messages:
            local_timestamp = localtime(message.timestamp)
            message_data.append({
                'id': message.id,
                'content': message.content,
                'timestamp': local_timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'sender': 'me' if message.sender == request.user else 'them'
            })
        
        return JsonResponse({
            'logged_in_user_id': logged_in_user_id, 
            'other_user_id': user_id, 
            'owner': target_user.username, 
            'messages': message_data,
            'last_message': message_data[-1]["content"]
        })
    return JsonResponse({
        'logged_in_user_id': logged_in_user_id, 
        'other_user_id': user_id, 
        'owner': target_user.username, 
        'messages': message_data,
        'last_message': None
    })

@csrf_exempt
def send_message(request):
    print('Send Message!')
    if request.method == 'POST':
        sender_id = request.POST.get('sender_id')
        receiver_id = request.POST.get('receiver_id')
        message_content = request.POST.get('message')
        # print('Send Message Post!', sender_id, receiver_id, message_content) 

        # Get the sender and receiver from the database
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)

        # Find the chat
        chat = Chat.objects.get(Q(user1=sender, user2=receiver) | Q(user2=sender, user1=receiver))

        # Create the new chat message
        new_message = Message.objects.create(
            chat=chat,
            sender=sender,
            content=message_content
        )

        # print(new_message)

        # Return success response
        return JsonResponse({'status': 'success', 'message': 'Message sent successfully!'})
    else:
        return JsonResponse({'status': 'fail', 'message': 'Invalid request method'})

def check_new_messages(request, user_id, last_message_timestamp):
    try:
        target_user = get_object_or_404(User, id=user_id)
        current_user = request.user

        # Find or create a chat between the logged-in user and the target user
        chat = Chat.objects.filter(
            Q(user1=current_user, user2=target_user) | 
            Q(user1=target_user, user2=current_user)
        ).first()

        if not chat:
            chat = Chat.objects.create(user1=current_user, user2=target_user)
        
        # Fetch messages sent after the last known message timestamp
        new_messages = Message.objects.filter(
            chat=chat,
            timestamp__gt=last_message_timestamp
        ).order_by('timestamp')
        
        # Prepare the new messages to send as JSON response

        message_data = [
            {
                'content': message.content,
                'timestamp': localtime(message.timestamp).strftime('%Y-%m-%d %H:%M:%S'),
                'sender': 'me' if message.sender == request.user else 'them'
            }
            for message in new_messages
        ]
        
        return JsonResponse({'new_messages': message_data}, status=200)
    
    except Chat.DoesNotExist:
        return JsonResponse({'error': 'Chat does not exist'}, status=404)

def send_message1(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)
    content = request.POST.get('message')
    sender = request.user

    message = Message.objects.create(chat=chat, sender=sender, content=content)
    local_timestamp = localtime(message.timestamp)
    return JsonResponse({
        'message': message.content,
        'sender': sender.username,
        'receiver': message.chat.user1.username if message.chat.user2 == sender else message.chat.user2.username,
        'timestamp': local_timestamp.strftime("%Y-%m-%d %H:%M")
    })
