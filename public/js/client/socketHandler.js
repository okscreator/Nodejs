const elTopLine = document.querySelector(".top-line");
const elUserInfo = document.createElement("div");
const elSignOut = document.querySelector(".sign-out");
const elListMessages = document.querySelector(".list-messages");
const elCount = document.querySelector(".count");

elSignOut.addEventListener("click", () => {
  socket.emit("logout");
});

const socket = io("localhost:3000");
socket.on("connect", () =>
  console.log("Socket connection to localhost: 3000 successfully established")
);

socket.on("server-msg-auth", ({ msg }) => {
  elUserInfo.textContent = "Hello " + msg;
  elTopLine.prepend(elUserInfo);
});

socket.on("server-msg-logout", () => {
  console.log("logout");
  location.reload();
});

socket.on("server-msg-new-client", ({ msg }) => {
  console.log(msg);
  const elP = document.createElement("p");
  elP.textContent = msg;
  elListMessages.appendChild(elP);
});

socket.on("server-msg-disconnect-client", ({ msg }) => {
  console.log(msg);
  const elP = document.createElement("p");
  elP.textContent = msg;
  elListMessages.appendChild(elP);
});

socket.on("server-msg-reconnect-client", ({ msg }) => {
  console.log(msg);
  const elP = document.createElement("p");
  elP.textContent = msg;
  elListMessages.appendChild(elP);
});

socket.on("server-msg-count-clients", ({ msg }) => {
  elCount.textContent = msg;
  console.log(`Count clients ${msg}`);
});

socket.emit("get-current-user");
