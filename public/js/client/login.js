const elSection = document.querySelector(".section-login");
const elErrorName = document.createElement("small");
elErrorName.textContent = "Name is required";
const elErrorPassword = document.createElement("small");
elErrorPassword.textContent = "Password is required";
const elMessageAuth = document.createElement("div");
elMessageAuth.classList.add("message", "hide");
elSection.prepend(elMessageAuth);
const elForm = document.querySelector(".form-login");

elForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (
    elForm.elements.name.value.trim() !== "" &&
    elForm.elements.password.value.trim() !== ""
  ) {
    elErrorName.remove();
    elErrorPassword.remove();
    socket.emit("user-сredentials", {
      login: elForm.elements.name.value,
      password: elForm.elements.password.value,
    });
  } else {
    if (elForm.elements.name.value.trim() === "") {
      elSection.prepend(elErrorName);
    } else {
      elErrorName.remove();
    }
    if (elForm.elements.password.value.trim() === "") {
      elSection.prepend(elErrorPassword);
    } else {
      elErrorPassword.remove();
    }
  }
});

const socket = io("localhost:3000");
socket.on("connect", () =>
  console.log("Socket connection to localhost: 3000 successfully established")
);

socket.on("server-msg-auth", ({ msg }) => {
  if (msg.auth) {
    elMessageAuth.classList.remove("hide", "error");
    elMessageAuth.classList.add("successful");
    elMessageAuth.textContent = "User login successful";
    setTimeout(() => {
      location.reload();
    }, 2000);
  } else {
    elMessageAuth.classList.remove("hide", "successful");
    elMessageAuth.classList.add("error");
    elMessageAuth.textContent = "User credential error";
    setTimeout(() => {
      elMessageAuth.classList.add("hide");
    }, 5000);
  }
});
