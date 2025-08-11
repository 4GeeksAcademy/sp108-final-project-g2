const host = import.meta.env.VITE_BACKEND_URL


export const login = async (userToLogin) => {
  const uri = `${host}/api/login`;
  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(userToLogin),
  };
  const response = await fetch(uri, options);
  try {
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const loginOk = await response.json();
    return loginOk;
  } catch {
    console.error("Error posting login");
  }
};


export const register = async (userToPost) => {
  const uri = `${host}/api/register`;
  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(userToPost),
  };
  const response = await fetch(uri, options);
  try {
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const registerOk = await response.json();
    return registerOk;
  } catch {
    console.error("Error posting user");
  }
};


export const modifyUser = async (userId, userToPut) => {
  const uri = `${host}/api/users/${userId}`;
  const options = {
    method: "PUT",
    headers: { 
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
     },
    body: JSON.stringify(userToPut),
  };
  const response = await fetch(uri, options);
  try {
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const userPut = await response.json();
    return userPut;
  } catch {
    console.error("Error putting user");
  }
}


export const deleteUser = async (userId, userToDelete) => {
  const uri = `${host}/api/users/${userId}`;
  const options = {
    method: "DELETE",
    headers: { 
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
     }
  };
  const response = await fetch(uri, options);
  try {
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const userDeleted = await response.json();
    return userDeleted;
  } catch {
    console.error("Error putting user");
  }
}