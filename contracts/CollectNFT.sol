// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract CollectNFT is VRFConsumerBase {
    uint public poolCount = 0;
    mapping(uint => Pool) public pools;
    
    uint public imageCount = 0;
    mapping(uint => Image) public images;

    mapping(address => mapping(uint => UserCard)) public userCardList;

    uint public amountWon = 0;
    
    bytes32 internal keyHash;
    uint256 internal fee;
    
    uint256 public randomResult;        // Make this private on production
    
    /**
     * Constructor inherits VRFConsumerBase
     * 
     * Network: Polygon (Matic) Mumbai Testnet
     * Chainlink VRF Coordinator address: 0x8C7382F9D8f56b33781fE506E897a4F1e2d17255
     * LINK token address:                0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Key Hash: 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4
     * Fee: 0.0001 LINK
     *
     * Network: Rinkeby Testnet
     * Chainlink VRF Coordinator address: 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B
     * LINK token address:                0x01BE23585060835E02B77ef475b0Cc51aA1e0709
     * Key Hash: 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311
     * Fee: 0.1 LINK
     *
     * Network: Binance Smart Chain Testnet
     * Chainlink VRF Coordinator address: 0xa555fC018435bef5A13C6c6870a9d4C11DEC329C
     * LINK token address:                0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06
     * Key Hash: 0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186
     * Fee: 0.1 LINK
     */
    constructor() 
        VRFConsumerBase(
            0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, // VRF Coordinator
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709  // LINK Token
        ) public
    {
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }
    
    struct Pool {
        uint id;
        string collectionName;
        string creatorName;
        string description;
        uint[] imageIdList;
        uint imageCount;
        uint poolPrize;
        address payable owner;
    }
    
    struct Image {
        uint id;
        uint poolId;
        string url;
        address payable owner;
    }
    
    struct UserCard {
        uint poolId;
        uint imageCount;
        uint[] imageIdList;
        uint winCount;
        uint[] winList;
    }
    
    event ImageCreated (
        uint imageId,
        uint poolId,
        string url,
        address payable owner
    );
    
    event LootBoxResult (
        uint256[] imageIdList,
        address payable owner
    );

    event PrizeWon (
        uint poolId,
        uint amount,
        address payable winner
    );

    event CollectionFunded (
        uint poolId,
        uint amount,
        address payable from
    );
    
    function createPool(string memory _collectionName, string memory _creatorName, string memory _description, string[] memory _urls, uint _arrLength) external {
        poolCount++;
        pools[poolCount] = Pool(poolCount, _collectionName, _creatorName, _description, new uint[](0), 0, 0, msg.sender);
        
        // Add images to the collection
        for (uint i = 0; i < _arrLength; i++) {
            addImageToPool(poolCount, _urls[i]);
        }
    }
    
    function addImageToPool(uint _poolId, string memory _url) public {
        // Add Image to the Image List
        imageCount++;
        images[imageCount] = Image(imageCount, _poolId, _url, msg.sender);
        
        // Add Image to the Pool
        Pool storage _pool = pools[_poolId];
        _pool.imageIdList.push(imageCount);
        _pool.imageCount++;
        
        emit ImageCreated(imageCount, _poolId, _url, msg.sender);
    }
    
    function createUserCard(uint _poolId) external {
        userCardList[msg.sender][_poolId] = UserCard(_poolId, 0, new uint[](0), 0, new uint[](0));
    }
    
    function buyLootBox() payable external {
        getRandomNumber();

        uint256[] memory imageWonList = new uint256[](5);

        for(uint i = 0; i < 5; i++){
            uint256 _randomNumber = uint256(keccak256(abi.encode(randomResult, i))) % imageCount + 1;
            uint prizeAmount = msg.value / 5;
            earnNFTofImage(_randomNumber, prizeAmount);
            imageWonList[i] = _randomNumber;
        }

        emit LootBoxResult(imageWonList, msg.sender);
    }
    
    function earnNFTofImage(uint256 _randomNumber, uint _prizeAmount) internal {
        Image storage _images = images[_randomNumber];
        
        UserCard storage _userCard = userCardList[msg.sender][_images.poolId];
        _userCard.imageIdList.push(_images.id);
        _userCard.imageCount++;
        
        Pool storage _pool = pools[_images.poolId];
        _pool.poolPrize += _prizeAmount;
    }
    
    function earnNFTofImageByPool(uint _poolId) external {
        Pool storage _pool = pools[_poolId];
        uint _randomNumber = getRandomValue(_pool.imageCount);
        
        UserCard storage _userCard = userCardList[msg.sender][_poolId];
        _userCard.imageIdList.push(_pool.imageIdList[_randomNumber]);
        _userCard.imageCount++;
    }
    
    function getPoolImages(uint _poolId) public view returns (uint [] memory){
        Pool storage _pool = pools[_poolId];
        return _pool.imageIdList;
    }
    
    function getUserImages(uint _poolId) public view returns (uint [] memory){
        UserCard storage _userCard = userCardList[msg.sender][_poolId];
        return _userCard.imageIdList;
    }
    
    function getPoolImageId(uint _poolId, uint _imageId) public view returns (uint){
        Pool storage _pool = pools[_poolId];
        return _pool.imageIdList[_imageId];
    }
    
    function checkWinner(uint _poolId) public view returns (bool){
        Pool storage _pool = pools[_poolId];
        UserCard storage _userCard = userCardList[msg.sender][_poolId];
        bool isMatch = false;
        
        for(uint i = 0; i < _pool.imageCount; i++){
            isMatch = false;
            
            for(uint j = 0; j < _userCard.imageCount; j++){
               if(_pool.imageIdList[i] == _userCard.imageIdList[j]){
                   isMatch = true;
                   break;
               }
            }
            
            if(isMatch == false) return false;
        }
        
        return true;
    }

    function claimPrize(uint _poolId) external {
        Pool storage _pool = pools[_poolId];
        UserCard storage _userCard = userCardList[msg.sender][_poolId];

        for(uint i = 0; i < _userCard.winCount; i++){
            require(_userCard.winList[i] != _poolId,  "You already won for this collection");
        }

        require(checkWinner(_poolId), "You did not have all the pieces");

        _userCard.winCount += 1;
        _userCard.winList.push(_poolId);

        uint amount = (_pool.poolPrize * 50) / 100;
        msg.sender.transfer(amount);
        _pool.poolPrize -= amount;
        amountWon += amount;

        emit PrizeWon(_poolId, amount, msg.sender);
    }

    function fundACollection(uint _poolId) payable external {
        Pool storage _pool = pools[_poolId];
        _pool.poolPrize += msg.value;

        emit CollectionFunded(_poolId,  msg.value, msg.sender);
    }
    
    /** 
     * Get the prize pool from this contract
     */
    function getPrizePool() public view returns (uint) {
        return address(this).balance;
    }
    
    /** 
     * Return a random number 0 - 100
     */
    function getRandomValue(uint mod) internal view returns(uint) {
        return uint(keccak256(abi.encodePacked(now, block.difficulty, msg.sender))) % mod;
    }
    
    /** 
     * Requests randomness 
     */
    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) > fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
    }
    
    /**
     * DO NOT ADD THIS IN PRODUCTION
     * Avoid locking your LINK in the contract
     */
    function withdrawLink() external {
        require(LINK.transfer(msg.sender, LINK.balanceOf(address(this))), "Unable to transfer");
    }
    
    /**
     * DO NOT ADD THIS IN PRODUCTION
     * Withdraw all the funds from the contract
     */
    function withdrawETH() external {
        msg.sender.transfer(address(this).balance);
    }
}