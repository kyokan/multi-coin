import React, { Component } from 'react';
import EthJs from 'ethjs';
import './App.css';
let eth;

if (typeof window.web3 !== 'undefined') {
  eth = new EthJs(window.web3.currentProvider);
  eth.accounts().then(console.log.bind(console))
}

class App extends Component {
  state = {
    activeTab: 'create',
    name: '',
    symbol: '',
    totalSupply: 0,
    decimal: 0,
  };

  renderCreate() {
    return (
      <div>
        <div>
          <div>Name</div>
          <input
            type="text"
            onChange={e => this.setState({ name: e.target.value })}
            value={this.state.name}
          />
        </div>
        <div>
          <div>Symbol</div>
          <input
            type="text"
            onChange={e => this.setState({ symbol: e.target.value })}
            value={this.state.symbol}
          />
        </div>
        <div>
          <div>Total Supply</div>
          <input
            type="number"
            onChange={e => this.setState({ totalSupply: e.target.value })}
            value={this.state.totalSupply}
          />
        </div>
        <div>
          <div>Decimal Places</div>
          <input
            type="number"
            onChange={e => this.setState({ decimal: e.target.value })}
            value={this.state.decimal}
          />
        </div>
        <button
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
              console.log({ contract, eth })

              window.BrowserSolc.loadVersion("soljson-v0.4.6+commit.2dabbdf0.js", compiler => {
                const optimize = 1;
                const result = compiler.compile(contract, optimize);
                console.log(result);
              });
          }}
        >
          Create Token
        </button>
      </div>
    );
  }

  renderContent() {
    switch (this.state.activeTab) {
      case 'create':
        return this.renderCreate();
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
