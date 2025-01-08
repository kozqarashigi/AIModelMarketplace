// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AIModelMarketplace {
    struct Model {
        string name;
        string description;
        uint256 price;
        address payable owner;
        bool isSold;
        uint8 totalRatings;
        uint256 ratingSum;
    }

    Model[] public models;
    mapping(address => mapping(uint256 => bool)) public hasRated;

    event ModelListed(uint256 modelId, string name, uint256 price, address owner);
    event ModelPurchased(uint256 modelId, address buyer);
    event ModelRated(uint256 modelId, uint8 rating, address rater);

    // List a new AI model
    function listModel(
        string memory name,
        string memory description,
        uint256 price
    ) public {
        require(price > 0, "Price must be greater than zero");

        models.push(
            Model({
                name: name,
                description: description,
                price: price,
                owner: payable(msg.sender),
                isSold: false,
                totalRatings: 0,
                ratingSum: 0
            })
        );

        emit ModelListed(models.length - 1, name, price, msg.sender);
    }

    // Purchase an AI model
    function purchaseModel(uint256 modelId) public payable {
        require(modelId < models.length, "Invalid model ID");
        Model storage model = models[modelId];

        require(!model.isSold, "Model is already sold");
        require(msg.value == model.price, "Incorrect payment amount");
        require(msg.sender != model.owner, "Owner cannot purchase their own model");

        // Transfer Ether to the seller
        (bool sent, ) = model.owner.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        model.isSold = true;

        emit ModelPurchased(modelId, msg.sender);
    }

    // Rate a purchased AI model
    function rateModel(uint256 modelId, uint8 rating) public {
        require(modelId < models.length, "Invalid model ID");
        require(rating > 0 && rating <= 5, "Rating must be between 1 and 5");
        require(!hasRated[msg.sender][modelId], "You have already rated this model");

        Model storage model = models[modelId];
        require(model.isSold, "Model must be purchased before rating");

        model.ratingSum += rating;
        model.totalRatings++;
        hasRated[msg.sender][modelId] = true;

        emit ModelRated(modelId, rating, msg.sender);
    }

    // Withdraw funds accumulated from sales (contract owner only)
    function withdrawFunds() public {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No funds to withdraw");
        require(msg.sender == address(this), "Only contract owner can withdraw funds");

        (bool success, ) = payable(msg.sender).call{value: contractBalance}("");
        require(success, "Withdraw failed");
    }

    // Get details of a specific model
    function getModelDetails(uint256 modelId)
        public
        view
        returns (
            string memory name,
            string memory description,
            uint256 price,
            address owner,
            uint256 averageRating
        )
    {
        require(modelId < models.length, "Invalid model ID");

        Model storage model = models[modelId];
        uint256 avgRating = model.totalRatings > 0
            ? model.ratingSum / model.totalRatings
            : 0;

        return (
            model.name,
            model.description,
            model.price,
            model.owner,
            avgRating
        );
    }
}
