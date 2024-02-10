const headerConfig = () => {
    const token = localStorage.getItem("token");
    const config = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
    }

    return config;
}

const utilsFunc = {
    headerConfig
}

export default utilsFunc;