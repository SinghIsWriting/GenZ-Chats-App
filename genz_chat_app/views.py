from django.shortcuts import render
from chat.models import Contact

# Create your views here.
def index(request):
    return render(request, 'home/landing_page.html')

def about(request):
    return render(request, 'home/about.html')

def contactus(request):
    thank=True
    if request.method == "POST":
        name = request.POST.get('name','')
        email = request.POST.get('email','')
        phone = request.POST.get('phone','')
        message = request.POST.get('message','')
        print(name, email, phone, message)
        if (name !='' and email !='' and phone !='' and message !=''):
            contact = Contact(name=name, email=email, phone=phone, message=message)
            contact.save()
            thank=True
            return render(request,"home/contact.html", {'thank':'alert alert-success'})
        else:
            return render(request,"home/contact.html", {'thanks':'alert alert-danger'})
    return render(request, 'home/contact.html')

def privacy_policy(request):
    return render(request, 'home/privacy_policy.html')

def terms_and_services(request):
    return render(request, 'home/terms_and_services.html')
