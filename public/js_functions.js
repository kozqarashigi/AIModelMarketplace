document.addEventListener("DOMContentLoaded", function () {
    const userBtn = document.getElementById("userBtn");
    const adminBtn = document.getElementById("adminBtn");
    const userForm = document.getElementById("userForm");
    const adminForm = document.getElementById("adminForm");

    function activateButton(activeBtn, inactiveBtn) {
        activeBtn.classList.add("active");
        inactiveBtn.classList.remove("active");
    }

    userBtn.addEventListener("click", function () {
        userForm.style.display = "flex";
        adminForm.style.display = "none";
        activateButton(userBtn, adminBtn);
    });

    adminBtn.addEventListener("click", function () {
        userForm.style.display = "none";
        adminForm.style.display = "flex";
        activateButton(adminBtn, userBtn);
    });

    // По умолчанию активен User
    window.onload = function () {
        document.getElementById("userBtn").click();
    };
    
});
// Подключаемся к метамаску
document.addEventListener("DOMContentLoaded", function () {
    const connectButton = document.getElementById("connectMetamask");

    if (connectButton) {
        connectButton.addEventListener("click", async function () {
            if (window.ethereum) {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    await provider.send("eth_requestAccounts", []);
                    
                    const signer = provider.getSigner();
                    const connectedAddress = (await signer.getAddress()).toLowerCase();
                    
                    // Получаем адрес, введенный в поле
                    const inputField = document.getElementById("inputAccount");
                    const enteredAddress = inputField.value.trim().toLowerCase();

                    if (inputField && enteredAddress === connectedAddress) {
                        sessionStorage.setItem("userAddress", connectedAddress);
                        console.log(sessionStorage.getItem("userAddress"));

                        alert("Successfully logged in!");
                        window.location.href = "/index"; // Перенаправление после успешного входа
                    } else {
                        alert("Error: Entered address does not match connected MetaMask account.");
                    }
                } catch (error) {
                    console.error("Error connecting to MetaMask", error);
                }
            } else {
                alert("MetaMask is not installed!");
            }
        });
    }
});


async function purchaseModel(modelId) {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const buyerAddress = accounts[0];

    const requestData = { buyer: buyerAddress };
    console.log("Sending request:", requestData); // Debugging

    const response = await fetch(`http://localhost:3000/purchase/${modelId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData), // Sending JSON
    });

    const result = await response.json();
    console.log("Server Response:", result);
}


async function ensureAddressInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("address") && window.ethereum) {
        try {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            const userAddress = accounts[0];

            // Добавляем адрес в URL
            urlParams.set("address", userAddress);
            window.location.search = urlParams.toString();
        } catch (error) {
            console.error("User denied account access:", error);
        }
    }
}

// Запускаем при загрузке страницы
window.onload = ensureAddressInUrl;

