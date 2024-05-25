document.addEventListener("DOMContentLoaded", () => {
  // Connecting to the socket server here.
  const socket = io.connect("http://localhost:3000");

  // Avatars arrays.
  const dp = [
    "./assets/batman.png",
    "./assets/dinosaur.png",
    "./assets/koala.png",
    "./assets/ninja.png",
    "./assets/superhero.png",
  ];

  // Function to getting random avatars.
  function getRandomAvatar() {
    return dp[Math.floor(Math.random() * dp.length)];
  }

  socket.on("user-joined-message", (data) => {
    console.log(data);
    const joinMessage = document.createElement("div");
    joinMessage.innerText = `${data.userName.userName} joined the chat`;
    userChat.appendChild(joinMessage);
    userChat.scrollTop = userChat.scrollHeight;
  });

    // Listen for "user-disconnected" event from the server
    socket.on("user-disconnected", (disconnectedUserName) => {
        // Display a message that the user has disconnected
        const disconnectedMessage = document.createElement("div");
        disconnectedMessage.innerText = `${disconnectedUserName.userName} has disconnected`;
        userChat.appendChild(disconnectedMessage);
        userChat.scrollTop = userChat.scrollHeight;
    });

  let userName;
  let UserAvatar;
  let typingTimeout = 0;

  const userChat = document.getElementById("user-chats");

  function getuserName() {
    userName = prompt("enter the username");
    UserAvatar = getRandomAvatar();
    const userDetails = document.getElementById("user-details");
    if (userName !== null && userName.trim() !== "") {
      socket.emit("user-joined", { userName, avatar: UserAvatar });

      const welcomeSpan = document.createElement("span");
      welcomeSpan.classList.add("fs-5", "text-success");
      welcomeSpan.innerText = `welcome ${userName}`;

      const UserImage = document.createElement("img");
      UserImage.classList.add("ms-2", "avatar");
      UserImage.src = UserAvatar;
      UserImage.alt = "userimage";

      userDetails.appendChild(welcomeSpan);
      userDetails.appendChild(UserImage);

      initialiseChat(userName);
    } else {
      // Attach event listener for the send button click outside of getuserName function
      document
        .getElementById("send-message")
        .addEventListener("click", getuserName);
    }
  }

  function initialiseChat(userName) {
    const textInput = document.getElementById("text-msg");
    const sendMsgBtn = document.getElementById("send-message");
    const userDetails = document.getElementById("user-details");

    // Typing indicator element
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("typing-indicator");
    typingIndicator.style.display = "none"; // Initially hidden

    // Add typing indicator to user details
    userDetails.appendChild(typingIndicator);

    sendMsgBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const textMessage = textInput.value.trim();
      if (textMessage !== "") {
        // Sending username, avatar, and message to server
        socket.emit("new-message", {
          user: userName,
          avatar: UserAvatar,
          message: textMessage,
        });

        // Displaying message in the chats.
        const newMessage = document.createElement("div");
        newMessage.classList.add("message", "align-right", "message-bg-blue");

        const userNameSpan = document.createElement("span");
        userNameSpan.className = "username";
        userNameSpan.classList.add("white");
        userNameSpan.textContent = userName;
        newMessage.appendChild(userNameSpan);

        const UserAvatarImg = document.createElement("img");
        UserAvatarImg.src = UserAvatar;
        UserAvatarImg.classList.add("avatar", "ms-2"); // Apply the avatar class for styling
        newMessage.appendChild(UserAvatarImg);

        const messageTime = document.createElement("span");
        messageTime.className = "time-white";
        const currentTime = new Date().toLocaleTimeString();
        messageTime.textContent = currentTime;
        newMessage.appendChild(messageTime);

        const message = document.createElement("p");
        message.classList.add("white");
        message.textContent = textMessage;
        newMessage.appendChild(message);

        userChat.appendChild(newMessage);

        textInput.value = "";
      }
    });

    socket.on("broadcast-messages", (message) => {
      console.log(message);
      const newMessage = document.createElement("div");
      newMessage.classList.add("message", "align-left", "message-bg-blue");

      const userName = document.createElement("span");
      userName.className = "username";
      userName.classList.add("white");
      userName.innerText = message.user;
      newMessage.appendChild(userName);

      const UserAvatarImg = document.createElement("img");
      UserAvatarImg.src = message.avatar;
      UserAvatarImg.classList.add("avatar", "ms-2"); // Apply the avatar class for styling
      newMessage.appendChild(UserAvatarImg);

      const messageTime = document.createElement("span");
      messageTime.className = "time-white";
      const currentTime = new Date(message.createdAt).toLocaleTimeString();
      messageTime.textContent = currentTime;
      newMessage.appendChild(messageTime);

      const messageText = document.createElement("p");
      messageText.classList.add("white");
      messageText.textContent = message.message;
      newMessage.appendChild(messageText);

      userChat.appendChild(newMessage);

      // Scroll to the bottom of chats when we send new message.
      userChat.scrollTop = userChat.scrollHeight;
    });

    // Adding event listener for Enter key press to send the message
    textInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMsgBtn.click();
      }
    });

    textInput.addEventListener("input", () => {
      socket.emit("user-typing", userName);

      clearTimeout();

      typingTimeout = setTimeout(() => {
        socket.emit("user-stopped-typing", userName);
      }, 2000);
    });

    // Listen for "user-typing" event from the server
    socket.on("user-typing", (userName) => {
      // Show typing indicator
      typingIndicator.style.display = "block";
      typingIndicator.innerText = `${userName} is typing...`;
    });

    // Listen for "user-stopped-typing" event from the server
    socket.on("user-stopped-typing", () => {
      // Hide typing indicator
      typingIndicator.style.display = "none";
    });

    socket.on("chat-history", (chats) => {
      chats.forEach((chat) => {
        const newMessage = document.createElement("div");
        newMessage.className = "message";

        // Creating an image element for the avatar
        const avatarImg = document.createElement("img");
        avatarImg.src = chat.avatar; // Set the source of the image to the avatar URL
        avatarImg.classList.add("avatar", "ms-2"); // Add a class for styling
        newMessage.appendChild(avatarImg); // Append the avatar image

        const messageContent = document.createElement("div");
        messageContent.className = "message-content";

        const usernameSpan = document.createElement("span");
        usernameSpan.className = "username";
        usernameSpan.textContent = chat.user;
        messageContent.appendChild(usernameSpan);

        const timeSpan = document.createElement("span");
        timeSpan.className = "time";
        const messageTime = new Date(chat.createdAt).toLocaleTimeString();
        timeSpan.textContent = messageTime;
        messageContent.appendChild(timeSpan);

        const messageP = document.createElement("p");
        messageP.textContent = chat.message;
        messageContent.appendChild(messageP);

        newMessage.appendChild(messageContent);

        userChat.appendChild(newMessage);

        // Scroll to the bottom of chats when we send new message.
        userChat.scrollTop = userChat.scrollHeight;
      });
    });

    // Listen for the "new-message-received" event
    socket.on("new-message-received", () => {
      // Play the incoming message sound
      incomingMessageSound.play();
    });

    socket.on("users-count", (usersCount) => {
      const usersCounts = document.getElementById("users-count-display");
      usersCounts.textContent = `Users connected ${usersCount}`;
    });

    socket.on("users-list", (usersList) => {
        console.log(usersList)
      const usersDisplay = document.getElementById("users-display");
      usersDisplay.innerHTML = "";

      usersList.forEach((user) => {
        const userDisplayBox = document.createElement("div");
        userDisplayBox.classList.add("alert", "alert-success", "w-100");

        const userContent = document.createElement("div");
        userContent.classList.add("d-flex", "align-items-center");

        const avatarImg = document.createElement("img");
        avatarImg.src = user.avatar;
        avatarImg.classList.add("avatar", "me-2");
        userContent.appendChild(avatarImg);

        const userInfo = document.createElement("div");
        const userName = document.createElement("span");
        userName.textContent = user.userName;
        userInfo.appendChild(userName);

        const greenDot = document.createElement("i");
        greenDot.classList.add("fa-solid", "fa-circle", "text-success", "ms-2");

        userInfo.appendChild(greenDot);

        userContent.appendChild(userInfo);
        userDisplayBox.appendChild(userContent);

        usersDisplay.appendChild(userDisplayBox);
      });
    });
  }

  getuserName();
});
