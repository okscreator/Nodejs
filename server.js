"use strict";
import { lstatSync, readdirSync, readFileSync, readFile } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { parse } from "node-html-parser";
import { Server } from "socket.io";
import pkgColors from "colors";
import favicon from "serve-favicon";
import express from "express";
import { checkUserCredetionals } from "./js/server/auth/checkUserCredential.js";
import { checkUserName } from "./js/server/auth/checkUserName.js";
import { addUser } from "./js/server/addUser.js";
import { encrypt } from "./js/server/encryptPasword.js";
import { generateUserName } from "./js/server/generateUserName.js";
import { deleteClients } from "./js/server/deleteClients.js";
import { searchingStringsAndCreatingFiles } from "./js/server/worker/searchingStringsAndCreatingFiles.js";
import clients from "./data/clients.json" assert { type: "json" };

const { green, blue, underline } = pkgColors;
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(dirname(__filename), "public/");

const HOSTNAME = "localhost";
const PORT = 3000;
const app = express();
const router = express.Router();

const user = [];

const isDir = (path) => {
  return lstatSync(path).isDirectory();
};

router.get("*", (req, res) => {
  if (req.originalUrl.match(/style.css/)) {
    res.writeHead(200, { "Content-type": "text/css" });
    const css = readFileSync(join(__dirname + "css/style.css"), {
      encoding: "utf8",
    });
    res.write(css);
    return res.end();
  }

  if (req.originalUrl.match(/login.js/)) {
    res.writeHead(200, { "Content-type": "application/javascript" });
    const js = readFileSync(join(__dirname + "js/client/login.js"), {
      encoding: "utf8",
    });
    res.write(js);
    return res.end();
  }

  if (req.originalUrl.match(/register.js/)) {
    res.writeHead(200, { "Content-type": "application/javascript" });
    const js = readFileSync(join(__dirname + "js/client/register.js"), {
      encoding: "utf8",
    });
    res.write(js);
    return res.end();
  }

  if (req.originalUrl.match(/socketHandler.js/)) {
    res.writeHead(200, { "Content-type": "application/javascript" });
    const js = readFileSync(join(__dirname + "js/client/socketHandler.js"), {
      encoding: "utf8",
    });
    res.write(js);
    return res.end();
  }

  if (user.auth) {
    if (isDir(join(__dirname, req.originalUrl))) {
      readFile(join(__dirname + "index.html"), "utf8", (err, html) => {
        if (err) {
          throw err;
        }
        const subDir = parse(html);
        const elListSubDir = subDir.querySelector(".list");

        let currPath = readdirSync(join(__dirname, req.originalUrl));
        let lastIndex = req.baseUrl.lastIndexOf("/");
        let prevPath = req.baseUrl.substring(0, lastIndex);

        if (req.baseUrl !== "") {
          elListSubDir.appendChild(
            parse(
              `<li class="item dots"><a href="${join(prevPath)}">..</a></li>`
            )
          );
        }

        currPath.map((item) =>
          isDir(join(__dirname, req.originalUrl, item))
            ? elListSubDir.appendChild(
              parse(
                `<li class="item dir"><a href="${req.baseUrl + "/" + item
                }"><i class="fa fa-folder" aria-hidden="true"></i>${item}</a></li>`
              )
            )
            : elListSubDir.appendChild(
              parse(
                `<li class="item"><a href="${req.baseUrl + "/" + item
                }">${item}</a></li>`
              )
            )
        );

        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(subDir.toString());
      });
    } else {
      const filePath = join(__dirname + req.originalUrl);
      readFile(filePath, "utf8", (err, data) => {
        if (err) {
          throw err;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(data.toString());
      });

      searchingStringsAndCreatingFiles(filePath)
        .then((res) => console.log(blue(res.result)))
        .catch((err) => console.error(err));
    }
  } else {
    if (req.baseUrl === "/register") {
      readFile(join(__dirname + "register.html"), "utf8", (err, register) => {
        if (err) {
          throw err;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(register.toString());
      });
    } else {
      readFile(join(__dirname + "login.html"), "utf8", (err, login) => {
        if (err) {
          throw err;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(login.toString());
      });
    }
  }
});

app.use(favicon(__dirname + "favicon.ico"));
app.use("*", router);

const server = app.listen(PORT, HOSTNAME, () => {
  console.log(
    `${green("Server running at:")} ${underline(`http://${HOSTNAME}:${PORT}`)}`
  );
});

const io = new Server(server);

io.on("connection", async (client) => {
  const userName = await generateUserName();

  clients.push({ id: client.id, name: userName });

  io.emit("server-msg-count-clients", {
    msg: clients.length,
  });

  client.on("disconnect", async () => {
    await deleteClients(client.id);

    io.emit("server-msg-disconnect-client", {
      msg: `Client with id ${client.id} disconnect`,
    });

    io.emit("server-msg-count-clients", {
      msg: clients.length,
    });
  });

  client.on("reconnect", () => {
    io.emit("server-msg-reconnect-clients", {
      msg: `Client with id ${client.id} reconnected`,
    });
  });

  io.emit("server-msg-count-client", {
    msg: clients.length,
  });

  io.emit("server-msg-new-client", {
    msg: `Client ${userName} with id ${client.id} connected`,
  });

  client.on("user-сredentials", async (data) => {
    if (data) {
      const { auth, credentional } = await checkUserCredetionals(data);
      if (auth) {
        user.id = credentional.id;
        user.login = credentional.login;
        user.auth = true;
      } else {
        user.id = null;
        user.login = null;
        user.auth = false;
      }
      client.emit("server-msg-auth", { msg: { auth: auth } });
    }
  });

  client.on("get-current-user", () => {
    client.emit("server-msg-auth", { msg: user.login });
  });

  client.on("logout", () => {
    user.id = null;
    user.login = null;
    user.auth = false;
    client.emit("server-msg-logout");
  });

  client.on("add-user", async (data) => {
    if (data) {
      const isFound = await checkUserName(data);
      if (!isFound) {
        const passwordEncrypt = await encrypt(data.password);
        const id = addUser(data, client.id, passwordEncrypt);
        user.id = id;
        user.login = data.login;
        user.auth = true;
      }
      client.emit("server-msg-checkUserName", { msg: { isFound } });
    }
  });
});
