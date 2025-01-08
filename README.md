# AI Model Marketplace dApp

## Overview
The AI Model Marketplace is a decentralized application (dApp) that enables users to list, purchase, and rate AI models. Built on the Ethereum blockchain, this marketplace ensures transparency and security for all transactions. 

## Features
- **List AI Models**: Users can add their AI models to the marketplace with a name, description, and price.
- **Purchase Models**: Users can buy available AI models.
- **Rate Models**: Users can rate the models they purchased, contributing to an overall rating score.
- **Withdraw Funds**: Model creators can withdraw their accumulated earnings from sales.
- **View Model Details**: Users can view the details of a specific AI model, including its average rating.

## Smart Contract Functions
- `listModel(string memory name, string memory description, uint256 price)`: Allows users to list a new AI model.
- `purchaseModel(uint256 modelId)`: Enables users to purchase a model by its ID.
- `rateModel(uint256 modelId, uint8 rating)`: Lets users rate a purchased model.
- `withdrawFunds()`: Allows the contract owner to withdraw funds from sales.
- `getModelDetails(uint256 modelId)`: Retrieves the details of a specific AI model.

## Project Structure
