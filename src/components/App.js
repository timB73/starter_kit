import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Navbar from './Navbar';
import Token from '../abis/Token.json';
import EthSwap from '../abis/EthSwap.json';
import './App.css';
import Main from './Main';

const App = () => {
  const [state, setState] = useState({
    account: '',
    token: {},
    ethSwap: {},
    ethBalance: '0',
    tokenBalance: '0',
    loading: true
  });

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        // modern browsers
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else if (window.web3) {
        console.warn('Using legacy web3 object');
        // legacy
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        // eslint-disable-next-line no-alert
        window.alert(
          'Non-Ethereum browser detected. You should consider installing MetaMask browser extension to use this dApp'
        );
      }
    };

    const loadBlockchainData = async () => {
      const { web3 } = window;

      const accounts = await web3.eth.getAccounts();
      console.log('Accounts', accounts);
      const account = accounts[0];
      const ethBalance = await web3.eth.getBalance(account);
      console.log('EthBalance', ethBalance);
      setState((prev) => ({ ...prev, ethBalance, account }));

      const networkId = await web3.eth.net.getId();

      // Load Token
      const tokenData = Token.networks[networkId];
      if (tokenData) {
        const token = new web3.eth.Contract(Token.abi, tokenData.address);
        const tokenBalance = await token.methods.balanceOf(account).call();

        setState((prev) => ({
          ...prev,
          token,
          tokenBalance: tokenBalance.toString()
        }));
      } else {
        window.alert('Token contract not deployed to detected network');
      }

      // Load EthSwap
      const ethSwapData = EthSwap.networks[networkId];
      if (ethSwapData) {
        const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);
        setState((prev) => ({
          ...prev,
          ethSwap
        }));
        console.log(ethSwap);
      } else {
        window.alert('EthSwap contract not deployed to detected network');
      }

      setState((prev) => ({ ...prev, loading: false }));
    };

    const init = async () => {
      await loadWeb3();
      await loadBlockchainData();
    };

    init();
  }, []);

  const buyTokens = (etherAmount) => {
    setState((prev) => ({ ...prev, loading: true }));
    state.ethSwap.methods
      .buyTokens()
      .send({ value: etherAmount, from: state.account })
      .on('transactionHash', () => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  };

  let content;

  if (state.loading) {
    content = (
      <p id="loader" className="text-center">
        Loading...
      </p>
    );
  } else {
    content = (
      <Main
        ethBalance={state.ethBalance}
        tokenBalance={state.tokenBalance}
        buyTokens={buyTokens}
      />
    );
  }

  return (
    <div>
      <Navbar account={state.account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main
            role="main"
            className="col-lg-12 ml-auto mr-auto"
            style={{ maxWidth: '600px' }}
          >
            <div className="content mr-auto ml-auto">{content}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
