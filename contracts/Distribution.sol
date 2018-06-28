pragma solidity ^0.4.24;

contract Distribution {
  struct Share {
    address shareholder;
    uint96 shareCount;
  }

  event SetShares(address shareholder, uint96 shareCount);
  event Distribute(address shareholder, uint value);

  Share[] shares;
  address public owner = msg.sender;
  mapping (address => uint) shareIndex;
  uint96 public totalShares;

  constructor() public {
    _setShares(msg.sender, 100);
  }

  function setShares(address shareholder, uint96 shareCount) public {
    require(msg.sender == owner);
    _setShares(shareholder, shareCount);
  }

  function _setShares(address shareholder, uint96 shareCount) private {
    uint index = shareIndex[shareholder];
    if (index < shares.length && shares[index].shareholder == shareholder) {
      totalShares += shareCount - shares[index].shareCount;
      shares[index].shareCount = shareCount;
    } else {
      shareIndex[shareholder] = shares.length;
      totalShares += shareCount;
      shares.push(Share(shareholder, shareCount));
    }
    emit SetShares(shareholder, shareCount);
  }

  function sharesHeld(address shareholder) public view returns (uint96) {
    uint index = shareIndex[shareholder];
    if (shares[index].shareholder == shareholder) {
      return shares[index].shareCount;
    } else {
      return 0;
    }
  }

  function distribute() public payable {
    uint oneShare = address(this).balance / uint256(totalShares);
    if (oneShare == 0) return;
    uint sharesLength = shares.length;
    for (uint i = 0; i < sharesLength; i++) {
      uint shareCount = uint(shares[i].shareCount);
      if (shareCount != 0) {
        uint value = shareCount * oneShare;
        address shareholder = shares[i].shareholder;
        shareholder.transfer(value);
        emit Distribute(shareholder, value);
      }
    }
  }

  function() public payable {
    if (gasleft() > 9000) { // Don't distribute if someone just sends basic gas.
      distribute();
    }
  }
}
