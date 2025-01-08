const chatWindow = document.getElementById("chatWindow");
const chatHeader = document.getElementById("chatHeader");
const messageInput = document.getElementById("messageInput");
const messageInputDiv = document.getElementById("messageInputDiv");
const messagesDiv = document.getElementById("messages");
const sendButton = document.getElementById("sendButton");
const secretKey = "{{ SECRET_KEY }}";

console.log("chat.js loaded");

// Chat list of a user
function getChatList() {
  let username = "{{username}}";
  console.log(username);
  $.ajax({
    url: "/chat/getChatList/",
    data: { username: username },
    success: function (data) {
      console.log(data);
      let usersList = $("#users-list");
      usersList.empty();
      data.chats.forEach((user) => {
        if (user.last_message) {
          // if (user.logged_in_user === user.user1) {
          // usersList.append(`
          // <li class="user" id="${user.id}">
          //   <div><i class="fa-solid fa-user"></i></div>
          //   <div class="user-info">
          //   <span class="user-name">${user.user2}</span>
          //   <div class="last-essage-time"><span class="last-message">${user.last_message}</span>
          //   <span title="${user.time_of_message}" class="timestamp" id="timestamp">${user.time_of_message}</span>
          //     </div>
          //   </div>
          // </li>`);
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
        }
      });
      // After chat list is rendered, add event listeners to the newly rendered list items
      addChatListEventListeners();
      updateRelativeTimes();
    },
  });
}

// Load chat list
getChatList();

// Update relative times every minute
setInterval(updateRelativeTimes, 60000);
setInterval(getChatList, 10000); // for real time updatation of messages
const fUid = localStorage.getItem("friendUserId");

setInterval(() => {
  if (
    getMessagesFromLocalStorage("last_message1") &&
    getMessagesFromLocalStorage("last_message2") &&
    getMessagesFromLocalStorage("last_message1").message !==
      getMessagesFromLocalStorage("last_message2").message &&
    getMessagesFromLocalStorage("last_message1").id ===
      getMessagesFromLocalStorage("last_message2").id
  ) {
    console.log("last messages not same!!!");
    let uid = fUid;
    loadChatMessages(fUid);
    // localStorage.removeItem("last_message1");
    // localStorage.removeItem("last_message2");
    localStorage.clear();
    localStorage.setItem("friendUserId", uid);
    isTrue = true;
  }
}, 3000);

// Add event listeners to all chat list items
function addChatListEventListeners() {
  const chatItems = document.querySelectorAll(".user");
  console.log("users:", chatItems);
  // Check if chatItems exist
  if (chatItems.length === 0) {
    console.log("No users found in the chat list.");
    return;
  }
  chatItems.forEach((item) => {
    item.addEventListener("click", function () {
      const userId = this.getAttribute("id");
      console.log("user_id", userId, "clicked!");
      localStorage.setItem("friendUserId", userId);
      storeMessageInLocalStorage(
        "last_message1",
        this.getAttribute("data"),
        parseInt(userId)
      );
      loadChatMessages(userId); // Fetch messages for clicked user
      messageInputDiv.style.display = "flex";
    });
  });
}

// Function to render chat messages in the chatbox
function loadChatMessages(userId) {
  // Clear existing messages
  messagesDiv.innerHTML += '<p class="message received">Loading...</p>'; // Optional loading text

  // AJAX request to fetch chat messages for the selected user
  $.ajax({
    url: `/chat/fetch_chats/${userId}/`, // Endpoint to fetch the chat messages
    method: "GET",
    success: function (data) {
      console.log(`Hi ${data.owner}! Let's Chat`);
      const loggedInUserId = data.logged_in_user_id;
      const otherUserId = data.other_user_id;
      if (localStorage.getItem("last_message1")) {
        storeMessageInLocalStorage(
          "last_message2",
          data.last_message,
          otherUserId
        );
      }

      document.getElementById(
        "chatHeader"
      ).textContent = `Hi ${data.owner}! Let's Chat`;
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
          // console.log(messageContent, loggedInUserId, otherUserId);
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
    },
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
    return; // Do not send empty messages
  }
  console.log(messageContent, senderId, receiverId);
  // AJAX request to send the message to the server
  $.ajax({
    url: "/chat/send_message/", // Define this view to handle sending messages
    method: "POST",
    data: {
      sender_id: senderId,
      receiver_id: receiverId,
      message: messageContent,
      csrfmiddlewaretoken: getCookie("csrftoken"), // CSRF token
    },
    success: function (data) {
      console.log(data);
      // On success, reload chat messages for the same chat
      loadChatMessages(receiverId);
      getChatList();
      // Force a reflow before updating the scroll
      messagesDiv.offsetHeight; // This triggers a reflow
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },
    error: function (error) {
      console.log("Error sending message", error);
    },
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

// Encryption function
function encryptMessage(message, secretKey) {
  // return CryptoJS.AES.encrypt(message, secretKey).toString();
  return message;
}

// Storing encrypted message in local storage
function storeMessageInLocalStorage(chatId, message, id) {
  last = {
    message: message,
    id: id,
  };
  localStorage.setItem(chatId, JSON.stringify(last));
}

// Decryption function
function decryptMessage(encryptedMessage) {
  // const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  // return bytes.toString(CryptoJS.enc.Utf8);
  return encryptedMessage;
}

// Retrieving and decrypting messages from local storage
function getMessagesFromLocalStorage(chatId) {
  let chatMessages = localStorage.getItem(chatId);
  return JSON.parse(chatMessages);
}

function updateRelativeTimes() {
  const timeElements = document.querySelectorAll("#timestamp");
  console.log(timeElements);

  timeElements.forEach((element) => {
    // console.log(element.getAttribute("title"));
    const exactTime = new Date(element.getAttribute("title"));
    const now = new Date();
    // console.log(exactTime.getTime(), exactTime.getHours(), exactTime.getMinutes());
    const diffInSeconds = Math.floor((now - exactTime) / 1000);

    let timeAgo;
    if (diffInSeconds < 60) {
      timeAgo = "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      timeAgo = `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
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
    //  else if (diffInSeconds < 2600640) {
    //   const weeks = Math.floor(diffInSeconds / 604800);
    //   timeAgo = weeks === 1 ? "last week" : `${weeks} weeks ago`;
    // } else if (diffInSeconds < 31207680) {
    //   const weeks = Math.floor(diffInSeconds / 2600640);
    //   timeAgo = weeks === 1 ? "last month" : `${weeks} months ago`;
    // } else if (diffInSeconds < 31207680) {
    //   const months = Math.floor(diffInSeconds / 2600640);
    //   timeAgo = months === 1 ? "last month" : `${weeks} months ago`;
    //   if (months >= 12) {
    //     if (months == 12) timeAgo = `${months / 12} year ago`;
    //     else if (months % 12 == 0) timeAgo = `${months / 12} years ago`;
    //     else timeAgo = `${months / 12} years and ${months % 12} months ago`;
    //   }
    // }
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

// Apply random rotation
// const randomRotation = Math.floor(Math.random() * 20) - 10; // Rotate between -10 to 10 degrees
// messageDiv.style.transform = `rotate(${randomRotation}deg)`;

// function sendMessage() {
//   const message = messageInput.value;
//   if (message.trim() !== "") {
//     addMessageToChat(message, "User", "sent");
//     messageInput.value = "";

//     chatSocket.send(
//       JSON.stringify({
//         message: message,
//       })
//     );

//     // Simulate receiving a reply for demo purposes
//     setTimeout(
//       () => addMessageToChat("Received message!", "Bot", "received"),
//       1000
//     );
//   }
// }

// function addMessageToChat(message, username, messageType) {
//   const messageDiv = document.createElement("div");
//   messageDiv.classList.add("message", messageType);
//   messageDiv.innerHTML = `<strong>${username}:</strong> ${message}`;
//   // Apply random rotation
//   const randomRotation = Math.floor(Math.random() * 20) - 10; // Rotate between -10 to 10 degrees
//   messageDiv.style.transform = `rotate(${randomRotation}deg)`;
//   messagesDiv.appendChild(messageDiv);

//   // Force a reflow before updating the scroll
//   messagesDiv.offsetHeight; // This triggers a reflow
//   messagesDiv.scrollTop = messagesDiv.scrollHeight;
// }
