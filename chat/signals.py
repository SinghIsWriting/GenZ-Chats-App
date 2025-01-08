from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Chat

@receiver(post_save, sender=User)
def create_chat_for_new_user(sender, instance, created, **kwargs):
    if created:
        # The new user has been created
        new_user = instance
        # Get all other users
        all_users = User.objects.exclude(id=new_user.id)

        # Create a chat between the new user and every other user
        for user in all_users:
            # Ensure that the chat is created only once regardless of user order
            if not Chat.objects.filter(user1__in=[new_user, user], user2__in=[new_user, user]).exists():
                Chat.objects.create(user1=new_user, user2=user)

