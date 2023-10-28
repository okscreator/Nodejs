import users from "../../../data/users.json" assert { type: "json" };

const findUser = async (data, map) => {
  const { login, password } = data;
  let result;
  for (const [key, value] of map) {
    if (value.login === login) {
      result = true;
      break;
    } else {
      result = false;
    }
  }
  return result;
};

export const checkUserName = async (data) => {
  if (users.length === 0) {
    return false;
  } else {
    const map = new Map(Object.entries(users));
    return findUser(data, map);
  }
};
