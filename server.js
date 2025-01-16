import { Web3 } from 'web3';
import express from 'express';
import bodyParser from 'body-parser';
const app = express();
import { fileURLToPath } from 'url';
import path from 'path';




// Web3 setup
const web3 = new Web3('http://127.0.0.1:7545'); // Replace with your Web3 provider URL
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			}
		],
		"name": "deleteModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "listModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			}
		],
		"name": "ModelDeleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ModelListed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "ModelPurchased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "rating",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "rater",
				"type": "address"
			}
		],
		"name": "ModelRated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			}
		],
		"name": "purchaseModel",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "rating",
				"type": "uint8"
			}
		],
		"name": "rateModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllModels",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address payable",
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isSold",
						"type": "bool"
					},
					{
						"internalType": "uint8",
						"name": "totalRatings",
						"type": "uint8"
					},
					{
						"internalType": "uint256",
						"name": "ratingSum",
						"type": "uint256"
					}
				],
				"internalType": "struct AIModelMarketplace.Model[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			}
		],
		"name": "getModelDetails",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "averageRating",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "hasRated",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			}
		],
		"name": "isValidModelId",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "models",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isSold",
				"type": "bool"
			},
			{
				"internalType": "uint8",
				"name": "totalRatings",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "ratingSum",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // Add the ABI of your contract here
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Example usage
app.set('views', path.join(__dirname, 'views'));
const contractAddress = '0x63a4E3b2fAF514782744eB2783fDdD8cD5Ef32a9'; // Replace with your contract address
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
app.get('/', async (req, res) => {
    let models = [];
    try {
        const allModels = await contract.methods.getAllModels().call();
        models = allModels.map((model, index) => ({
            id: index,
            name: model.name,
            description: model.description,
            price: web3.utils.fromWei(model.price, 'ether'),
            owner: model.owner,
            averageRating: model.totalRatings > 0 ? model.ratingSum / model.totalRatings : 0
        }));
    } catch (error) {
        console.error('Error fetching models:', error);
    }
    res.render('index', { models });
});



// render homepage route
app.get('/add', (req, res) => {
    res.render('add');
    });


	app.post('/add', async (req, res) => {
		const { name, description, price } = req.body;
	
		if (!name || !description || isNaN(price)) {
			return res.status(400).send('Некорректные данные');
		}
	
		const accounts = await web3.eth.getAccounts();
		const sender = accounts[0]; 
		try {
			await contract.methods.listModel(name, description, web3.utils.toWei(price, 'ether')).send({ from: sender, gas: 3000000 });
			res.redirect('/');
		} catch (error) {
			console.error('Ошибка при добавлении модели:', error);
			res.status(500).send('Ошибка при добавлении модели');
		}
	});
	
	app.get('/details/:id', async (req, res) => {
		const modelId = req.params.id;
	
		try {
			const modelDetails = await contract.methods.getModelDetails(modelId).call();
			console.log('Model details:', modelDetails); // Проверка получаемых данных
	
			// Используем уже полученное значение рейтинга
			const averageRating = modelDetails.averageRating || 0;
	
			console.log('Average Rating:', averageRating); // Проверка
	
			res.render('details', {
				modelId,
				name: modelDetails.name,
				description: modelDetails.description,
				price: web3.utils.fromWei(modelDetails.price, 'ether'),
				owner: modelDetails.owner,
				averageRating,
			});
		} catch (error) {
			console.error('Error fetching model details:', error);
			res.status(500).send('Error fetching model details');
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
		const modelId = req.params.id;
		try {
			const accounts = await web3.eth.getAccounts();
			const buyer = accounts[1]; // In this case, it's the second account
	
			// Get model details
			const modelDetails = await contract.methods.getModelDetails(modelId).call();
			const modelPrice = modelDetails[2]; // Model price (in Wei)
			const isSold = modelDetails[4]; // Model sold status
	
			// Check if the model is already sold
			if (isSold) {
				return res.status(400).send('This model has already been sold.');
			}
	
			console.log(`Model with ID ${modelId} purchased by ${buyer}`);
	
			// Proceed with the purchase
			const transaction = await contract.methods.purchaseModel(modelId).send({
				from: buyer,
				value: modelPrice // Payment for the model
			});
	
			console.log('Transaction result:', transaction);
    
        // Отправляем успешное сообщение на клиентскую сторону
        res.send(`
            <script>
                alert("Purchase successful!");
                window.location.href = "/review/${modelId}"; // Перенаправляем на страницу с рейтингом
            </script>
        `);
    } catch (error) {
        console.error('Error during purchase:', error);
        res.status(500).send('Error during purchase');
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
			res.redirect(`/`);
		} catch (error) {
			console.error('Error submitting review:', error);
			res.status(500).send('Error submitting review');
		}
	});
	
	app.get('/delete-model/:id', async (req, res) => {
		const { id } = req.params;
	
		try {
			const accounts = await web3.eth.getAccounts();
			const sender = accounts[0]; // Replace with the address you want to use
	
			// Interact with the smart contract to delete the model
			await contract.methods.deleteModel(id).send({ from: sender, gas: 3000000 });
	
			console.log(`Model with ID ${id} deleted successfully.`);
			res.redirect('/'); // Redirect to the homepage after deletion
		} catch (error) {
			console.error('Error deleting model:', error);
			res.status(500).send('Ошибка при удалении модели');
		}
	});

	app.post('/delete-model/:id', (req, res) => {
		const modelId = req.params.id;
	
		// Удаляем модель из базы данных
		deleteModelById(modelId);
	
		// Перенаправляем обратно в каталог
		res.redirect('/');
	});
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));