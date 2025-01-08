from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from .models import Chat, Message
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
@login_required
def index(request):
    print('chat view', request.user)
    return render(request, 'chat/chat.html', {'username': request.user.username})

def user_search(request):
    if request.is_ajax():
        search_term = request.GET.get('username', None)
        users = User.objects.filter(username__icontains=search_term)
        return JsonResponse({'users': list(users.values('id', 'username'))})

def load_chat_list(request):
    print('loading chats...')
    user = request.user
    chats = Chat.objects.all().order_by('-created_at')
    # print(chats)
    chats = list(chats.values('id', 'user1', 'user2', 'created_at'))
    print(chats)

    # extract last message from each chat
    for chat in chats:
        msg = Message.objects.filter(chat=chat['id']).order_by('timestamp').last()
        # print(Message.objects.filter(chat=chat['id']))
        try:
            chat['last_message'] = msg.content
            chat['time_of_message'] = msg.timestamp
        except:
            # chats.remove(chat)
            pass

    list(map(lambda chat: chat.update({'id': User.objects.get(id=chat['user2']).id, 'user1': User.objects.get(id=chat['user1']).username, 'user2': User.objects.get(id=chat['user2']).username}), chats))
    logged_in_user_id = request.user.id
    logged_in_user = request.user.username
    return JsonResponse({'status': 'success', 'logged_in_user_id': logged_in_user_id, 'logged_in_user': logged_in_user, 'chats': chats})

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
    # print("target_user", target_user)
    current_user = request.user
    chat = Chat.objects.filter(
        Q(user1=current_user, user2=target_user) | 
        Q(user1=target_user, user2=current_user)
    ).first()
    # print(chat)

    if not chat:
        chat = Chat.objects.create(user1=current_user, user2=target_user)
    # Assuming 'ChatMessage' is your chat model, fetch messages for the user
    messages = Message.objects.filter(chat=chat).order_by('timestamp')

    print("messages:\n", messages)

    # Prepare the messages data to send as a JSON response
    message_data = []
    owner = None
    for message in messages:
        message_data.append({
            'content': message.content,
            'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'sender': 'me' if message.sender == request.user else 'them'
        })
    # print("message_data:\n", message_data)
    logged_in_user_id = request.user.id
    # print('sender_id:', logged_in_user_id, 'receiver_id:', user_id)
    return JsonResponse({'logged_in_user_id': logged_in_user_id, 'other_user_id': user_id, 'owner': target_user.username, 'messages': message_data})

@csrf_exempt
def send_message(request):
    # print('Send Message!')
    if request.method == 'POST':
        sender_id = request.POST.get('sender_id')
        receiver_id = request.POST.get('receiver_id')
        message_content = request.POST.get('message')
        print('Send Message Post!', sender_id, receiver_id, message_content) 

        # Get the sender and receiver from the database
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)

        # Find the chat
        chat = Chat.objects.get(user1=sender, user2=receiver)

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

def send_message1(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)
    content = request.POST.get('message')
    sender = request.user

    message = Message.objects.create(chat=chat, sender=sender, content=content)

    return JsonResponse({
        'message': message.content,
        'sender': sender.username,
        'receiver': message.chat.user1.username if message.chat.user2 == sender else message.chat.user2.username,
        'timestamp': message.timestamp.strftime("%Y-%m-%d %H:%M")
    })
