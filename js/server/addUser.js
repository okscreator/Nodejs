import users from "../../data/users.json" assert { type: "json" };

export const addUser = (data, id, password) => {
  users.push({
    id: id,
    login: data.login,
    password: password,
  });
  return id;
};
