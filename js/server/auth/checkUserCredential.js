import users from "../../../data/users.json" assert { type: "json" };
import { verifyEncryptPassword } from "../verifyEncryptPassword.js";

const findUser = async (data, map) => {
  let result;
  const { login, password } = data;

  for await (const [key, value] of map) {
    if (value.login === login) {
      const verify = await verifyEncryptPassword(password, value.password);
      if (verify) {
        result = { auth: true, credentional: value };
        break;
      }
      result = { auth: false, credentional: null };
    } else {
      result = { auth: false, credentional: null };
    }
  }

  return result;
};

export const checkUserCredetionals = async (data) => {
  if (users.length === 0) {
    return false;
  } else {
    const map = new Map(Object.entries(users));
    return findUser(data, map);
  }
};
