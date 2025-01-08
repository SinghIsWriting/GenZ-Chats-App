# GenZ Chats

![License](https://img.shields.io/badge/license-MIT-green)
![Django](https://img.shields.io/badge/Django-5.x-blue)
![Python](https://img.shields.io/badge/Python-3.x-yellow)
![AJAX](https://img.shields.io/badge/Realtime-AJAX-orange)

## 📋 Project Overview

**GenZ Chats** is an chat application built with Django, designed specifically for Gen Z. The app combines modern, interactive UI elements like draggable chat windows and floating animations to deliver a unique, dynamic messaging experience. The goal is to offer seamless real-time messaging while incorporating fun, creative design elements that appeal to the Gen Z audience.

### Key Features

- **Real-time Messaging:** Leverages AJAX to update chats without refreshing the page.
- **Draggable Chatbox:** Users can move chat windows around for a more flexible UI experience.
- **Floating Animations:** Sent and received messages are displayed with eye-catching animations.
- **Interactive UI:** Inspired by Instagram Stories with a futuristic, creative layout.
- **User Finder:** Users can find list of others users by their username and initiate real-time conversations.
- **Database Persistence:** All chat data is stored in the database to retrieve past conversations.

---

## 💡 Features Breakdown

- **Landing Page:** A highly animated landing page with modern color combinations, background images, and a sliding navbar.
- **Real-time Chat:** Users can select a chat from the chat list and converse in real-time. All previous messages are loaded when a chat is selected.
- **User Authentication:** Django's built-in authentication is used for secure login, signup, and account management.
- **Message Timestamps:** Messages show relative timestamps (e.g., "5 minutes ago") and are automatically updated without page reloads.
- **Customizable Chat Experience:** Interactive chat interface allows users to customize their experience by dragging and resizing chat windows.
- **Scalable Backend:** Built on Django, the project is prepared for future scalability to handle a large user base.

---

## Screenshots

*Screenshots of the application interface to showcase the design and functionality.*

![GenZ Chats Home](https://github.com/user-attachments/assets/59d80182-f4a6-48a2-9023-59538a6ae517)

## 🚀 Tech Stack

### Backend
- **Framework:** Django 4.x
- **Language:** Python 3.x
- **Database:** SQLite (can be configured to use PostgreSQL or MySQL)
- **Real-time Functionality:** AJAX for real-time chat updates
- **APIs:** Django REST Framework (for potential expansion)

### Frontend
- **HTML5/CSS3:** For structure and styling.
- **JavaScript (AJAX):** For real-time updates and dynamic behavior.
- **FontAwesome:** For beautiful icons used in the chat UI.

### Tools & Libraries
- **Django Channels (Optional):** For scalable real-time WebSocket support.
- **JQuery:** Simplifying AJAX requests.
- **Bootstrap 5:** For responsive design.
- **CSS Animations:** To deliver smooth UI animations.

---

## 🛠️ Setup & Installation

### Prerequisites

- **Python 3.x** (Recommended: 3.8+)
- **Django 4.x**
- **Virtualenv** (Optional but recommended)
- **Node.js** (For frontend dependencies like Bootstrap or Tailwind if needed)

### 🛠️ Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/SinghIsWriting/GenZ-Chats-App.git
   cd GenZ-Chats-App
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start the development server**
   ```bash
   python manage.py runserver
   ```
   Access the project at `http://127.0.0.1:8000/`

## 🔧 Configuration

### Database Settings
Default is SQLite. For PostgreSQL, update `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Static Files
Configure for production:
```bash
python manage.py collectstatic
```

## 🔗 API Endpoints

1. **Fetch Chat List**: `GET /chat/`
2. **Send Message**: `POST /chat/send_message/`
   - Params: `receiver_id`
3. **Fetch Chat Messages**: `GET /chat/fetch_chats/<user_id>/`

## ⚙️ Future Enhancements

- WebSocket Support for real-time messaging
- Group Chat Functionality
- Multimedia Messaging
- Push Notifications
- Theme Customization

## 🧑‍💻 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/my-feature`)
5. Create a Pull Request

## 📜 License
MIT License - see [LICENSE](LICENSE) file

## 👨‍💻 Author
**Abhishek Singh**  
Full Stack Developer | AI Enthusiast  

## 📫 Contact
* Email: sabhisheksingh343104@gmail.com
* Linkedin: [Abhishek Singh](https://linkedin.com/in/abhishek-singh-bba2662a9)
* GitHub: [SinghIsWriting](https://github.com/SinghIsWriting)

## Key Points

1. **Project Overview**: Concise overview with unique features
2. **Tech Stack**: Defined tools and frameworks
3. **Installation Instructions**: Step-by-step setup guide
4. **Future Enhancements**: Project extension suggestions
5. **Contribution Guide**: Community contribution guidelines
6. **Contact Information**: Developer contact details

