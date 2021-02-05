import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';
import Navbar from './Navbar';

const App = () => {
  const [state, setState] = useState({
    account: '',
    ethBalance: '0'
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
      const account = accounts[0];
      setState((prev) => ({ ...prev, account }));

      const ethBalance = await web3.eth.getBalance(account);
      setState((prev) => ({ ...prev, ethBalance }));
    };

    const init = async () => {
      await loadWeb3();
      await loadBlockchainData();
    };

    init();
  }, []);

  return (
    <div>
      <Navbar account={state.account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <h1>Hello World!</h1>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
