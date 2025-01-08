const chatWindow = document.getElementById("chatWindow");
const chatHeader = document.getElementById("chatHeader");
const messageInput = document.getElementById("messageInput");
const messageInputDiv = document.getElementById("messageInputDiv");
const messagesDiv = document.getElementById("messages");
const sendButton = document.getElementById("sendButton");

console.log("chat.js loaded");

// Chat list of a user
function getChatList() {
  let username = "{{username}}";
  $.ajax({
    url: "/chat/getChatList/",
    data: { username: username },
    success: function (data) {
      console.log(data);
      let usersList = $("#users-list");
      usersList.empty();
      data.chats.forEach((user) => {
        if (user.last_message) {
          try {
            usersList.append(`
            <li class="user" id="${user.id}" data="${user.last_message.content}">
              <div><i class="fa-solid fa-user"></i></div>
              <div class="user-info">
              <span class="user-name">${user.username}</span>
              <div class="last-essage-time"><span class="last-message">${user.last_message.content}</span>
              <span title="${user.last_message.timestamp}" class="timestamp" id="timestamp">${user.last_message.timestamp}</span>
                </div>
              </div>
            </li>`);
          } catch (error) {
            usersList.append(`
            <li class="user" id="${user.id}" data="Start Chat!">
              <div><i class="fa-solid fa-user"></i></div>
              <div class="user-info">
              <span class="user-name">${user.username}</span>
              <div class="last-essage-time"><span class="last-message">No messages yet!</span>
                </div>
              </div>
            </li>`);
          }
        } else {
          usersList.append(`
            <li class="user" id="${user.id}" data="Start Chat!">
              <div><i class="fa-solid fa-user"></i></div>
              <div class="user-info">
              <span class="user-name">${user.username}</span>
              <div class="last-essage-time"><span class="last-message">No messages yet!</span>
                </div>
              </div>
            </li>`);
        }
      });
      // After chat list is rendered, add event listeners to the newly rendered list items
      try {
        addChatListEventListeners();
        updateRelativeTimes();
      } catch (error) {
        console.log(error)
      }
      
    },
  });
}

// Load chat list
getChatList();

// Update relative times every minute
setInterval(updateRelativeTimes, 60000);
setInterval(getChatList, 10000); // for real time updatation of messages
const fUid = localStorage.getItem("friendUserId");

// Add event listeners to all chat list items
function addChatListEventListeners() {
  const chatItems = document.querySelectorAll(".user");
  // Check if chatItems exist
  if (chatItems.length === 0) {
    console.log("No users found in the chat list.");
    return;
  }
  chatItems.forEach((item) => {
    item.addEventListener("click", function () {
      const userId = this.getAttribute("id");
      localStorage.setItem("friendUserId", userId);
      loadChatMessages(userId); // Fetch messages for clicked user
      messageInputDiv.style.display = "flex";
    });
  });
}

// Function to render chat messages in the chatbox
function loadChatMessages(userId) {
  // Clear existing messages
  messagesDiv.innerHTML +=
    '<p class="message received">Loading...</p>'; // Optional loading text

  // AJAX request to fetch chat messages for the selected user
  $.ajax({
    url: `/chat/fetch_chats/${userId}/`,  // Endpoint to fetch the chat messages
    method: 'GET',
    success: function (data) {
      const loggedInUserId = data.logged_in_user_id;
      const otherUserId = data.other_user_id;
        
      document.getElementById(
        "chatHeader"
      ).textContent = `Chat with ${data.owner}!`;
      messagesDiv.innerHTML = ""; // Clear the loading text
      data.messages.forEach((message) => {
        messagesDiv.innerHTML += `
          <div class="message ${message.sender === "me" ? "sent" : "received"}">
            <span class="message-text">
            ${message.content}
            </span>
            <span class="timestamp" id="timestamp" title="${
              message.timestamp
            }">${message.timestamp}</span>
          </div>
        `;
      });

      // Update the message form with both IDs (for sending new messages)
      document.querySelector("#messageInputDiv").innerHTML = `
        <input type="hidden" name="sender_id" id="logged_in_user_id" value="${loggedInUserId}">
        <input type="hidden" name="receiver_id" id="other_user_id" value="${otherUserId}">
        <input type="text" name="message" class="messageInput" id="messageInput" placeholder="Type a message..." autocomplete="off"/>
        <button type="submit" title="send message..." id="sendButton">Send</button>
      `;

      // Add event listener to send message
      document
        .querySelector("#sendButton")
        .addEventListener("click", function () {
          const messageContent = document.querySelector("#messageInput").value;
          sendMessage(loggedInUserId, otherUserId, messageContent);
        });

      // After messages load, update their relative times
      updateRelativeTimes();

      // Scroll to the bottom of the chat
      // Force a reflow before updating the scroll
      messagesDiv.offsetHeight; // This triggers a reflow
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },
    error: function (error) {
      console.log("Error fetching chat messages", error);
    }
  });
}

// Function to handle the message sending process
$("#messageInputDiv").on("submit", function (event) {
  event.preventDefault(); // Prevent page from reloading
  const messageContent = $("#messageInput").val(); // Assuming the message input field has this ID

  if (!messageContent.trim()) {
    return; // Do not send empty messages
  }
  // Clear the input field after sending the message
  $("#messageInput").val("");
});

// Function to send new message to the server
function sendMessage(senderId, receiverId, messageContent) {
  if (!messageContent.trim()) {
    return;  // Do not send empty messages
  }
  // AJAX request to send the message to the server
  $.ajax({
    url: '/chat/send_message/',  // Define this view to handle sending messages
    method: 'POST',
    data: {
      'sender_id': senderId,
      'receiver_id': receiverId,
      'message': messageContent,
      'csrfmiddlewaretoken': getCookie("csrftoken")  // CSRF token
    },
    success: function (data) {
      // On success, reload chat messages for the same chat
      loadChatMessages(receiverId);
      getChatList();
      // Force a reflow before updating the scroll
      messagesDiv.offsetHeight; // This triggers a reflow
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },
    error: function (error) {
      console.log("Error sending message", error);
    }
  });
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie("csrftoken");

$.ajaxSetup({
  beforeSend: function (xhr, settings) {
    if (
      !/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) &&
      !this.crossDomain
    ) {
      xhr.setRequestHeader("X-CSRFToken", csrftoken);
    }
  },
});



function updateRelativeTimes() {
  const timeElements = document.querySelectorAll("#timestamp");

  timeElements.forEach((element) => {
    const exactTime = new Date(element.getAttribute("title"));
    const now = new Date();
    const diffInSeconds = Math.floor((now - exactTime) / 1000);

    let timeAgo;
    if (diffInSeconds < 60) {
      timeAgo = "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      timeAgo = `${minutes}min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      const formattedHours =
        exactTime.getHours() < 10
          ? "0" + exactTime.getHours()
          : exactTime.getHours();
      const formattedMinutes =
        exactTime.getMinutes() < 10
          ? "0" + exactTime.getMinutes()
          : exactTime.getMinutes();
      timeAgo = `${formattedHours}:${formattedMinutes}`;
    } else if (diffInSeconds < 604800) {
      // Less than 7 days
      const days = Math.floor(diffInSeconds / 86400);
      const formattedHours =
        exactTime.getHours() < 10
          ? "0" + exactTime.getHours()
          : exactTime.getHours();
      const formattedMinutes =
        exactTime.getMinutes() < 10
          ? "0" + exactTime.getMinutes()
          : exactTime.getMinutes();
      timeAgo =
        days === 1
          ? `${formattedHours}:${formattedMinutes} Yesterday`
          : `${days} days ago`;
    } else {
      const formattedHours =
        exactTime.getHours() < 10
          ? "0" + exactTime.getHours()
          : exactTime.getHours();
      const formattedMinutes =
        exactTime.getMinutes() < 10
          ? "0" + exactTime.getMinutes()
          : exactTime.getMinutes();
      const formattedMonth = exactTime.getMonth() + 1; // Months are zero-indexed
      const formattedDate = exactTime.getDate(); // Correct method for day of the month
      const formattedYear = exactTime.getFullYear();
      timeAgo = `${formattedHours}:${formattedMinutes} ${formattedMonth}/${formattedDate}/${formattedYear}`;
    }
    // console.log(timeAgo);
    // Update only the relative time part
    element.textContent = `${timeAgo}`;
  });
}

function clearInput() {
  console.log("clearing input");
  document.querySelector("#messageInputDiv input").value = "";
}


let isDragging = false;
let offsetX, offsetY;

messagesDiv.scrollTop = messagesDiv.scrollHeight;

// Make chat window draggable via the header
chatHeader.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - chatWindow.offsetLeft;
  offsetY = e.clientY - chatWindow.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    chatWindow.style.left = `${e.clientX - offsetX}px`;
    chatWindow.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Force a reflow before updating the scroll
messagesDiv.offsetHeight; // This triggers a reflow
messagesDiv.scrollTop = messagesDiv.scrollHeight;

function addMessageToChat(message, username, messageType) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", messageType);
  messageDiv.innerHTML = `<strong>${username}:</strong> ${message}`;

  messagesDiv.appendChild(messageDiv);

  // Force a reflow before updating the scroll
  messagesDiv.offsetHeight; // This triggers a reflow
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
