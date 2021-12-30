// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CollectNFTV2 is ERC721 {
    uint public poolCount = 0;
    mapping(uint => Pool) public pools;
    
    uint public imageCount = 0;
    mapping(uint => Image) public images;

    mapping(address => mapping(uint => UserCard)) public userCardList;

    uint public amountWon = 0;
    uint256 public randomResult = 999999999999;        // Make this private on production
    
    mapping(uint => bool) private redeemCodeList;
    
    constructor() ERC721("NFT Bingo", "NFTB")  public {}
    
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

    event PieceWon (
        uint imageId,
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

    event NFTMinted (
      uint tokenId,
      string url,
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
        uint num = getRandomValue(randomResult);
        randomResult = num;

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
    
    function earnNFTofImageByPool(uint _poolId) internal {
        Pool storage _pool = pools[_poolId];
        uint _randomNumber = getRandomValue(_pool.imageCount);
        
        UserCard storage _userCard = userCardList[msg.sender][_poolId];
        _userCard.imageIdList.push(_pool.imageIdList[_randomNumber]);
        _userCard.imageCount++;

        emit PieceWon(_pool.imageIdList[_randomNumber], msg.sender);
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

    function createCode() public returns (uint) {
        uint randomNumber = getRandomValue(99999999999999999);
        redeemCodeList[randomNumber] = true;

        return randomNumber;
    }

    function redeemToken(uint redeemId, uint _poolId) public returns(bool){
        if(redeemCodeList[redeemId]){
            redeemCodeList[redeemId] = false;
            earnNFTofImageByPool(_poolId);

            return true;
        }
        else return false;
    }

    function mintCollectionNFT(string memory _url) external {
        uint _tokenId = totalSupply().add(1);
        _safeMint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, _url);

        emit NFTMinted(_tokenId, _url, msg.sender);
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
     * DO NOT ADD THIS IN PRODUCTION
     * Withdraw all the funds from the contract
     */
    function withdrawETH() external {
        msg.sender.transfer(address(this).balance);
    }
}