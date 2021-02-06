/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import tokenLogo from '../token-logo.png';
import ethLogo from '../eth-logo.png';

const Main = (props) => {
  const [amountInEther, setAmountInEther] = useState(0);

  const onEthInputChange = (e) => {
    const input = e.target;
    setAmountInEther(input.value);
  };

  const outputTokenAmount = () => amountInEther * 100;

  const onSubmit = (e) => {
    e.preventDefault();
    const etherAmountInWei = window.web3.utils.toWei(amountInEther, 'Ether'); // convert the ether to wei units
    console.log(
      `Buying ${outputTokenAmount()} tokens for ${amountInEther} ETH (${etherAmountInWei})`
    );
    props.buyTokens(etherAmountInWei);
  };

  return (
    <div id="content">
      <div className="card mb-4">
        <div className="card-body">
          <form className="mb-3" onSubmit={onSubmit}>
            <div>
              <label className="float-left">
                <b>Input</b>
              </label>
              <span className="float-right text-muted">
                Balance: {window.web3.utils.fromWei(props.ethBalance, 'Ether')}
              </span>
            </div>
            <div className="input-group mb-4">
              <input
                type="text"
                onChange={onEthInputChange}
                className="form-control form-control-lg"
                placeholder="0"
                required
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <img src={ethLogo} height="32" alt="" />
                  &nbsp;&nbsp;&nbsp; ETH
                </div>
              </div>
            </div>
            <div>
              <label className="float-left">
                <b>Output</b>
              </label>
              <span className="float-right text-muted">
                Balance:{' '}
                {window.web3.utils.fromWei(props.tokenBalance, 'Ether')}
              </span>
            </div>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="0"
                disabled
                value={outputTokenAmount()}
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <img src={tokenLogo} height="32" alt="" />
                  &nbsp; DApp
                </div>
              </div>
            </div>
            <div className="mb-5">
              <span className="float-left text-muted">Exchange Rate</span>
              <span className="float-right text-muted">1 ETH = 100 DApp</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              SWAP!
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
Main.propTypes = {
  ethBalance: PropTypes.string.isRequired,
  tokenBalance: PropTypes.string.isRequired,
  buyTokens: PropTypes.func.isRequired
};

export default Main;
