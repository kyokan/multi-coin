import React, { Component } from 'react';
import EthJs from 'ethjs';
import './App.css';

const abi = [{"constant":false,"inputs":[{"name":"amounts","type":"uint256[]"}],"name":"sum","outputs":[{"name":"totalAmount","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"minter","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"addresses","type":"address[]"},{"name":"amounts","type":"uint256[]"}],"name":"mintMultiples","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"supply","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"amount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"addresses","type":"address[]"},{"name":"amounts","type":"uint256[]"}],"name":"transferMulitples","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
let eth;

if (typeof window.web3 !== 'undefined') {
  eth = new EthJs(window.web3.currentProvider);
}

class App extends Component {
  state = {
    activeTab: 'create',
    name: '',
    symbol: '',
    totalSupply: 0,
    decimal: 0,
    mintAmount: 0,
    tokenName: '',
    tokenSymbol: '',
    tokenTotalSupply: null,
    transferCsvContent: { addresses: [], amounts: [] },
    mintMultiplesCsvContent: { addresses: [], amounts: [] },
  };

  renderCreate() {
    return (
      <div className="create">
        <div className="create__row">
          <div className="create__row-label">Name</div>
          <input
            type="text"
            className="create__row-input"
            onChange={e => this.setState({ name: e.target.value })}
            value={this.state.name}
          />
        </div>
        <div className="create__row">
          <div className="create__row-label">Symbol</div>
          <input
            type="text"
            className="create__row-input"
            onChange={e => this.setState({ symbol: e.target.value })}
            value={this.state.symbol}
          />
        </div>
        <div className="create__row">
          <div className="create__row-label">Total Supply</div>
          <input
            type="number"
            className="create__row-input"
            onChange={e => this.setState({ totalSupply: e.target.value })}
            value={this.state.totalSupply}
          />
        </div>
        <div className="create__row">
          <div className="create__row-label">Decimal Places</div>
          <input
            type="number"
            className="create__row-input"
            onChange={e => this.setState({ decimal: e.target.value })}
            value={this.state.decimal}
          />
        </div>
        <button
          className="create__row create__button"
          onClick={async () => {
            const contract = `
                pragma solidity ^0.4.0;

                contract Coin {
                    string public constant symbol = "${this.state.symbol}";
                    string public constant name = "${this.state.name}";
                    uint8 public constant decimals = ${this.state.decimal};
                    uint256 _totalSupply = ${this.state.totalSupply};
                    address public minter;

                    mapping (address => uint) balances;
                    mapping (address => mapping (address => uint256)) allowed;
                    
                    // Triggered when tokens are transferred.
                    event Transfer(address indexed _from, address indexed _to, uint256 _value);
                    // Triggered whenever approve(address _spender, uint256 _value) is called.
                    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

                    function Coin() {
                        minter = msg.sender;
                        balances[minter] = _totalSupply;
                    }

                    function mint(address owner, uint amount) {
                        if (msg.sender != minter) return;
                        balances[owner] += amount;
                        _totalSupply += amount;
                    }

                    function mintMultiples(address[] addresses, uint[] amounts) {
                        if (msg.sender != minter) return;
                        for (uint i = 0; i < addresses.length; i++) {
                            mint(addresses[i], amounts[i]);
                        }
                    }
                    
                    function totalSupply() constant returns (uint256 supply) {
                        return _totalSupply;
                    }

                    function transfer(address receiver, uint amount) returns (bool success) {
                        if (balances[msg.sender] < amount) {
                            return false;
                        } else {
                            balances[msg.sender] -= amount;
                            balances[receiver] += amount;
                            Transfer(msg.sender, receiver, amount);
                            return true;
                        }
                    }
                    
                    function sum(uint[] amounts) returns (uint totalAmount) {
                        uint total = 0;
                        for (uint i = 0; i < amounts.length; i++) {
                            total = total + amounts[i];
                        }
                        return total;
                    }
                    
                    function transferMulitples(address[] addresses, uint[] amounts) returns (bool success) {
                        if (addresses.length != amounts.length) {
                            return false;
                        }
                        
                        if (balances[msg.sender] < sum(amounts)) {
                            return false;
                        }

                        for (uint i = 0; i < addresses.length; i++) {
                            transfer(addresses[i], amounts[i]);
                        }
                        return true;
                    }
                    
                    function transferFrom(
                      address _from,
                      address _to,
                      uint256 _amount
                    ) returns (bool success) {
                      if (balances[_from] >= _amount
                        && allowed[_from][msg.sender] >= _amount
                        && _amount > 0
                        && balances[_to] + _amount > balances[_to]) {
                        balances[_from] -= _amount;
                        allowed[_from][msg.sender] -= _amount;
                        balances[_to] += _amount;
                        Transfer(_from, _to, _amount);
                        return true;
                      } else {
                        return false;
                      }
                    }

                    function balanceOf(address addr) constant returns (uint balance) {
                        return balances[addr];
                    }
                    
                    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
                    // If this function is called again it overwrites the current allowance with _value.
                    function approve(address _spender, uint256 _amount) returns (bool success) {
                        allowed[msg.sender][_spender] = _amount;
                        Approval(msg.sender, _spender, _amount);
                        return true;
                    }
                    
                    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
                        return allowed[_owner][_spender];
                    }
                }
              `

              window.BrowserSolc.loadVersion("soljson-v0.4.6+commit.2dabbdf0.js", async compiler => {
                const optimize = 1;
                const result = compiler.compile(contract, optimize);
                const bytecode = result.contracts.Coin.bytecode;
                const abi = JSON.parse(result.contracts.Coin.interface);
                const output = eth.contract(abi);
                console.log(JSON.stringify(abi))
                const account = await eth.accounts()

                const data = {
                  data: '0x' + bytecode,
                  from: account[0],
                  gas: 0
                };

                const gas = await eth.estimateGas(data)

                const contractInstance = output.new({ ...data, gas }, (err, res) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    // Log the tx, you can explore status with eth.getTransaction()
                    console.log(res.transactionHash);

                    // If we have an address property, the contract was deployed
                    if (res.address) {
                        console.log('Contract address: ' + res.address);
                    }
                });
              });
          }}
        >
          Create Token
        </button>
      </div>
    );
  }

  parseFile(text) {
    return text
      .split('\n')
      .map(d => d.split(','))
      .reduce((acc, row) => {
        acc.addresses.push(row[0]);
        acc.amounts.push(row[1]);
        return acc;
      }, {
        addresses: [],
        amounts: [],
      })
  }

  renderManage() {
    const { tokenName, tokenSymbol, tokenTotalSupply } = this.state;
    return (
      <div className="manage">
        <div className="manage__section">
          <input
            type="text" placeholder="Enter Token Address"
            className="manage__token-address-input"
            onChange={async e => {
              try {
                const tokenAddress = e.target.value;
                const token = eth.contract(abi)
                  .at(tokenAddress)
                const name = await token.name();
                const symbol = await token.symbol();
                const decimals = await token.decimals();
                const totalSupply = await token.totalSupply();
                this.setState({
                  tokenAddress,
                  tokenName: name[0],
                  tokenSymbol: symbol[0],
                  tokenTotalSupply: (totalSupply[0].toString() / Math.pow(10, decimals[0].toString())),
                })
              } catch (e) {
                console.error('Invalid Token Address');
                this.setState({
                  tokenAddress: '',
                  tokenName: '',
                  tokenSymbol: '',
                  tokenTotalSupply: null,
                })
              }
            }}
          />
        </div>
        <div className="manage__section manage__token-info">
          <div className="manage__row">
            <div className="manage__label">Name</div>
            <div className="manage__value">{tokenName || '-'}</div>
          </div>
          <div className="manage__row">
            <div className="manage__label">Symbol</div>
            <div className="manage__value">{tokenSymbol || '-'}</div>
          </div>
          <div className="manage__row">
            <div className="manage__label">Total Supply</div>
            <div className="manage__value">
              {typeof tokenTotalSupply !== 'number'
                ? '-'
                : tokenTotalSupply
              }
            </div>
          </div>
        </div>
        {this.state.tokenAddress && (
          <div className="manage__section manage__token-function">
            <div className="manage__section-title">Mint Tokens For One</div>
            <div className="manage__small-input-group">
              <input
                type="number"
                placeholder="e.g. 100000"
                onChange={e => this.setState({ mintAmount: e.target.value })}
              />
              <button
                onClick={async () => {
                  const { mintAmount, tokenAddress } = this.state;
                  const account = await eth.accounts()

                  if (tokenAddress && mintAmount && account[0]) {
                    const token = eth.contract(abi).at(tokenAddress)
                    token.mint(account[0], mintAmount, {
                      from: account[0],
                      amount: '0x0',
                    });
                  }
                }}
              >
                Mint
              </button>
            </div>
          </div>
        )}
        {this.state.tokenAddress && (
            <div className="manage__section manage__token-function">
            <div className="manage__section-title">Mint Tokens For Multiples</div>
            <div className="manage__small-input-group">
              <input
                type="file"
                accept=".csv"
                onChange={e => {
                  const f = e.target.files[0];
                  const reader = new FileReader();
                  const parseFile = this.parseFile;

                  // Closure to capture the file information.
                  reader.onload = ((theFile) => {
                    return e => {
                      this.setState({
                        mintMultiplesCsvContent: parseFile(e.target.result)
                      });
                    };
                  })(f);

                  // Read in the image file as a data URL.
                  reader.readAsText(f);
                }}
              />
              <button
                onClick={async () => {
                  const { mintMultiplesCsvContent, tokenAddress } = this.state;
                  const { addresses, amounts } = mintMultiplesCsvContent;
                  const account = await eth.accounts()

                  if (addresses.length && amounts.length && account[0]) {
                    const token = eth.contract(abi).at(tokenAddress)
                    token.mintMultiples(addresses, amounts, {
                      from: account[0],
                      amount: '0x0',
                    });
                  }
                }}
              >
                Mint Multiples
              </button>
            </div>
            <div className="manage__addresses-table">
              <div className="manage__address-column">
                <div className="manage__address-header">Address</div>
                {this.state.mintMultiplesCsvContent.addresses.map((address, i) => (
                  <div key={i} className="manage__address-cell">{address}</div>
                ))}
              </div>
              <div className="manage__amount-column">
                <div className="manage__amount-header">Amount</div>
                {this.state.mintMultiplesCsvContent.amounts.map((amount, i) => (
                  <div key={i} className="manage__amount-cell">{amount}</div>
                ))}
              </div>
            </div>
          </div>
        )}
        {this.state.tokenAddress && (
          <div className="manage__section manage__token-function">
            <div className="manage__section-title">Transfer</div>
            <div className="manage__small-input-group">
              <input
                type="file"
                accept=".csv"
                onChange={e => {
                  console.log({ files: e.target.files })
                  const f = e.target.files[0];
                  const reader = new FileReader();
                  const parseFile = this.parseFile;

                  // Closure to capture the file information.
                  reader.onload = ((theFile) => {
                    return e => {
                      this.setState({
                        transferCsvContent: parseFile(e.target.result)
                      });
                    };
                  })(f);

                  // Read in the image file as a data URL.
                  reader.readAsText(f);
                }}
              />
              <button
                onClick={async () => {
                  const { transferCsvContent, tokenAddress } = this.state;
                  const { addresses, amounts } = transferCsvContent;
                  const account = await eth.accounts()

                  if (addresses.length && amounts.length && account[0]) {
                    const token = eth.contract(abi).at(tokenAddress)
                    token.transferMulitples(addresses, amounts, {
                      from: account[0],
                      amount: '0x0',
                    });
                  }
                }}
              >
                Transfer
              </button>
            </div>
            <div className="manage__addresses-table">
              <div className="manage__address-column">
                <div className="manage__address-header">Address</div>
                {this.state.transferCsvContent.addresses.map((address, i) => (
                  <div key={i} className="manage__address-cell">{address}</div>
                ))}
              </div>
              <div className="manage__amount-column">
                <div className="manage__amount-header">Amount</div>
                {this.state.transferCsvContent.amounts.map((amount, i) => (
                  <div key={i} className="manage__amount-cell">{amount}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  renderContent() {
    switch (this.state.activeTab) {
      case 'create':
        return this.renderCreate();
      case 'manage':
        return this.renderManage();
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div
            className="App-header__tab"
            onClick={() => this.setState({ activeTab: 'manage' })}
          >
            Manage
          </div>
          <div
            className="App-header__tab"
            onClick={() => this.setState({ activeTab: 'create' })}
          >
            Create
          </div>
        </header>
        <div className="App-intro">
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

export default App;
