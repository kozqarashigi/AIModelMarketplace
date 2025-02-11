import session from 'express-session';
import { Web3 } from 'web3';
import { ethers } from "ethers";
import express from 'express';
import bodyParser from 'body-parser';
const app = express();
import { fileURLToPath } from 'url';
import path from 'path';
import fs from "fs";
import multer from 'multer';  


// Web3 setup
const filesDB = {};
const web3 = new Web3('http://127.0.0.1:7545'); // Replace with your Web3 provider URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json()); // Enable JSON request body parsing

const storage = multer.diskStorage({
    destination: "./public/uploads", // Папка, куда будут сохраняться файлы
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    },
});
const upload = multer({ storage: storage });
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true
}));

// Example usage
app.set('views', path.join(__dirname, 'views'));
const tokenABI = JSON.parse(fs.readFileSync("./tABI.json", "utf8"));
const contractABI = JSON.parse(fs.readFileSync("./cABI.json", "utf8"));
const tokenAddress = '0x5aF3fc6E6dCf121c817Be159ecAd4cd8e4f79715';
const contractAddress = '0x4AD0d238d39354716a11CAE9c84A8AaA3E432DF6'; // Replace with your contract address
const token = new web3.eth.Contract(tokenABI, tokenAddress);
const contract = new web3.eth.Contract(contractABI, contractAddress);
async function interactWithContract(modelId) {
    try {
        // Validate the model ID
        const isValid = await contract.methods.isValidModelId(modelId).call();
        if (!isValid) {
            throw new Error("Invalid model ID");
        }

        // If valid, proceed with the transaction
		const accounts = await web3.eth.getAccounts();
        const result = await contract.methods.purchaseModel(modelId).send({ from: accounts[1]});
        console.log("Transaction successful:", result);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// Example usage
interactWithContract(1);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
(async () => {
    const models = await contract.methods.getAllModels().call();
})(); // In-memory database

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // render views with ejs as templating engine

// Routes

// render homepage route
app.get('/', (req, res) => {
    res.render('login');
});


// Handle User Login
app.post("/user-login", (req, res) => {
    const { account } = req.body;
    if (account) {
        req.session.userAddress = account;  // Store address in session
        res.send("Address stored successfully!");
    } else {
        res.status(400).send("Missing address.");
    }
});

// Handle Admin Login
app.post('/admin-login', (req, res) => {
    const { adminUsername, adminPassword } = req.body;
    console.log(`Admin Login: ${adminUsername}`);
    res.send("Admin login successful!");
});

app.get('/index', async (req, res) => {
    let models = [];
    let balance = 0;  // Ensure balance is always defined

    const address = req.query.address;
    console.log("Address from request:", address);

    if (address) {
        try {
            balance = await token.methods.balanceOf(address).call();
            const decimals = 18;
            balance = Math.floor(ethers.formatUnits(balance, decimals));
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    }

    console.log("Final Balance:", balance);

    try {
        const allModels = await contract.methods.getAllModels().call();
        const contractOwner = "0x123..."; // Адрес владельца контракта (зависит от вашей логики)

        models = allModels.map((model, index) => ({
            id: index,
            name: model.name,
            description: model.description,
            price: web3.utils.fromWei(model.price, 'ether'),
            owner: model.owner,
            averageRating: model.totalRatings > 0 ? model.ratingSum / model.totalRatings : 0,
            isSold: model.isSold
        }));
    } catch (error) {
        console.error('Error fetching models:', error);
    }

    res.render('index', { models, balance, address });
});

app.get("/download/:id", (req, res) => {
    const file = filesDB[req.params.id];
    if (!file) {
        return res.status(404).send("File not found.");
    }
    res.download(file.path, file.name);
});

// render homepage route
app.post('/add', upload.single("file"), async (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !description || isNaN(price)) {
        return res.status(400).send('Некорректные данные');
    }
	if (!req.file) {
        return res.status(400).send('Файл не загружен');
    }

    // Сохраняем файл в базе
    const fileId = Date.now().toString(); // Уникальный ID файла
    filesDB[fileId] = {
        path: req.file.path,
        name: req.file.originalname
    };
    // Проверяем, загружен ли файл
    const filePath = "/uploads/" + req.file.filename;

    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    try {
        // Передаем путь к файлу в контракт (если он используется)
        await contract.methods.listModel(name, description, web3.utils.toWei(price, 'ether'), filePath)
            .send({ from: sender, gas: 3000000 });

        res.redirect('/index');
    } catch (error) {
        console.error('Ошибка при добавлении модели:', error);
        res.status(500).send('Ошибка при добавлении модели');
    }
});


	app.get('/details/:id', async (req, res) => {
		try {
			const modelId = req.params.id;
			const modelDetails = await contract.methods.getModelDetails(modelId).call();
	
			if (!modelDetails) {
				return res.status(404).send("Model not found");
			}
	
			res.render('details', {
				modelId: modelId,
				name: modelDetails[0],  // Ensure the correct variable names
				description: modelDetails[1],
				price: web3.utils.fromWei(modelDetails[2], 'ether'),
				averageRating: modelDetails[4] || "N/A",  // Handle missing ratings
				file: modelDetails[5]
			});
		} catch (error) {
			console.error("Error fetching model details:", error);
			res.status(500).send("Error fetching model details");
		}
	});
	
	
	app.get('/purchase/:id', async (req, res) => {
		try {
			const modelId = parseInt(req.params.id, 10);
			const allModels = await contract.methods.getAllModels().call();
			
			// Log the allModels array to verify the data
			console.log(allModels);
	
			// Check if the model exists
			if (modelId >= allModels.length || modelId < 0) {
				return res.status(404).send('Model not found');
			}
	
			// Fetch model details from the contract (optional)
			const modelDetails = allModels[modelId];
			const name = modelDetails[0];
			const description = modelDetails[1];
			const price = web3.utils.fromWei(modelDetails[2], 'ether'); // Convert price from wei to ether
	
			res.render('purchase', {
				model: {
					id: modelId,
					name: name,
					description: description,
					price: price
				}
			});
		} catch (error) {
			res.status(500).send('Internal server error');
		}
	});
	
    app.post('/purchase/:id', async (req, res) => {
		try {
			const modelId = req.params.id;
			const buyer = '0x25d8d8E620149804bbf9c0Baa66F18d5cAeA498C'; // Buyer's address
	
			// Get buyer's balance
			const balance = await token.methods.balanceOf(buyer).call();
			console.log('Buyer balance:', balance);
	
			// Get model details
			const modelDetails = await contract.methods.getModelDetails(modelId).call();
			const modelPrice = modelDetails[2]; // Model price in Wei
			const isSold = modelDetails[4]; // Model sold status
	
			console.log('Model price:', modelPrice);
			console.log('Is sold:', isSold);
	
			// Check if the model is already sold
			if (isSold) {
				return res.status(400).send('This model has already been sold.');
			}
	
			// Ensure buyer has enough tokens
			if (BigInt(balance) < BigInt(modelPrice)) {
				throw new Error("Not enough UN tokens to purchase this model.");
			}
	
			// Check if the marketplace contract has approval
			const allowance = await token.methods.allowance(buyer, contract.options.address).call();
			console.log('Current allowance:', allowance);
	
			if (BigInt(allowance) < BigInt(modelPrice)) {
				console.log(`Approving transfer of ${modelPrice} UN tokens for model ${modelId} by ${buyer}`);
	
				// Approve the marketplace contract to spend UN tokens
				const approveReceipt = await token.methods.approve(contract.options.address, modelPrice).send({ from: buyer });
				console.log('Approve transaction receipt:', approveReceipt);
	
				// Verify the new allowance
				const newAllowance = await token.methods.allowance(buyer, contract.options.address).call();
				console.log('New allowance:', newAllowance);
	
				if (BigInt(newAllowance) < BigInt(modelPrice)) {
					throw new Error("Approval failed. Insufficient allowance.");
				}
			}
	
			console.log("Approval successful!");
	
			// Proceed with the purchase
			console.log(`Purchasing model ${modelId} with ${modelPrice} UN tokens`);
			const transaction = await contract.methods.purchaseModel(modelId).send({
				from: buyer,
				gas: 5000000 // Set a higher gas limit
			});
	
			console.log('Transaction result:', transaction);
	
			// Send a success message and redirect
			res.send(`
				<script>
					alert("Purchase successful!");
					window.location.href = "/review/${modelId}"; // Redirect to review page
				</script>
			`);
		} catch (error) {
			console.error('Error during purchase:', error);
			res.status(500).send(`Error during purchase: ${error.message}`);
		}
	});
	
app.get('/review/:id', async (req, res) => {
    const modelId = req.params.id;

    try {
        // Получаем детали модели (пример с контрактом или базой данных)
        const modelDetails = await contract.methods.getModelDetails(modelId).call();

        // Передаем данные модели в шаблон
        res.render('review', { model: { id: modelId, details: modelDetails } });
    } catch (error) {
        console.error('Error fetching model details:', error);
        res.status(500).send('Error fetching model details');
    }
});

	app.post('/review/:id', async (req, res) => {
		const modelId = req.params.id; // Получаем ID модели из URL
		const { rating } = req.body; // Получаем рейтинг из формы
	
		if (!rating) {
			return res.status(400).send('Rating is required');
		}
	
		try {
			const accounts = await web3.eth.getAccounts();
			const buyer = accounts[1];
	
			// Отправляем отзыв в контракт
			await contract.methods.rateModel(modelId, rating).send({ from: buyer });
	
			// Перенаправляем пользователя обратно на страницу с деталями модели
			res.redirect(`/index`);
		} catch (error) {
			console.error('Error submitting review:', error);
			res.status(500).send('Error submitting review');
		}
	});
	app.get('/delete-model/:id', async (req, res) => {
		const { id } = req.params;
	
		try {
			const accounts = await web3.eth.getAccounts();
			const sender = accounts[6]; // Explicitly setting the owner account
	
			console.log(`Sender: ${sender}`);
			console.log(`Expected owner: 0x25d8d8E620149804bbf9c0Baa66F18d5cAeA498C`);
	
			await contract.methods.deleteModel(id).send({ from: sender, gas: 3000000 });
	
			console.log(`Model with ID ${id} deleted successfully.`);
			res.redirect('/index'); // Redirect to the homepage after deletion
		} catch (error) {
			console.error('Error deleting model:', error);
			res.status(500).send('Ошибка при удалении модели');
		}
	});
	
	
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
