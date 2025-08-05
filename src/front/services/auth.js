const host = "https://redesigned-giggle-5g5xqxxrvjwr344vq-3001.app.github.dev"


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