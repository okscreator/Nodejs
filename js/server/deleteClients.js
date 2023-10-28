import clients from "../../data/clients.json" assert { type: "json" };

export const deleteClients = async (id) => {
  const data = clients.filter((item) => item.id !== id);
};
