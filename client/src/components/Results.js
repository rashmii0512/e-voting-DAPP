import React, { Component } from "react";
import ElectionContract from '../contracts/ElectionContract.json';
import getWeb3 from "../getWeb3";
import NavBarAdmin from "./NavBarAdmin";
import NavBarVoter from "./NavBarVoter";
import { Button } from 'react-bootstrap';
// import candidateicon from "../images/candidatepic.jpg";

class Results extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      toggle: false,
      result: null,
      isOwner: false,
      candidateList: null,
      start: false,
      end: false
    }
  }

  result = async () => {

    let result = [];
    let candidateList = [];
    let candidateCount = Number(await this.state.ElectionInstance.methods.getTotalCandidates().call());

    for (let i = 0; i < candidateCount; i++) {
      let candidate = await this.state.ElectionInstance.methods.candidateDetails(i).call();

      result.push(candidate);
    }

    this.setState({ result: result });
    this.setState({ toggle: true })
    this.setState({ candidateList: candidateList });

  }

  componentDidMount = async () => {
    if (!window.location.hash) {
      window.location = window.location + '#loaded';
      window.location.reload();
    }

    try {

      const web3 = await getWeb3();

      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ElectionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        ElectionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      this.setState({ ElectionInstance: instance, web3: web3, account: accounts[0] });

      // Wait for the state to update before continuing
      await this.setStateAsync({});

      const owner = await this.state.ElectionInstance.methods.getOwner().call();
      if (this.state.account === owner) {
        this.setState({ isOwner: true });
      }

      let start = await this.state.ElectionInstance.methods.getStart().call();
      let end = await this.state.ElectionInstance.methods.getEnd().call();

      await this.result();

      this.setState({ start: start, end: end });

    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract`,
      );
      console.error(error);
    }
  };

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  render() {
    let candidateList;
    // const sampleJSON = {BJP: "BJP.webp",AITC: "AITC.png",BSP: "BSP.webp",CPI: "CPI.png",CPIM: "CPI(M).png",INC: "INC.webp",NCP: "NCP.webp",AAP: "AAP.png",Others: "other.png"};

    // console.log(this.state.result);
    if (this.state.result) {
      var res = this.state.result;
      var count = 1;
      res.sort((a, b) => Number(b.voteCount) - Number(a.voteCount));
      candidateList = res.map((candidate, index) => {
        return (
          <div key={index} className="row">
            <div
              className="col-md-1"
              style={{
                textAlign: "center",
              }}
              id="rowitem"
            >
              <h1>{count++}</h1>
            </div>
            <div
              className="col-md-3"
              style={{
                textAlign: "center",
              }}
              id="rowitem"
            >
              <div className="fs-5">Total Votes: {Number(candidate.voteCount)}</div>
            </div>
            <div className="col-md-5" id="rowitem">
              <div className="display-6" id="name">
                {candidate.name}
              </div>
              <div className="row mt-4">
                
              </div>
            </div>
            <div className="col-md-3" style={{ textAlign: "center" }} id="rowitem">
              
              <p className="fs-5 mt-2">{candidate.party}</p>
            </div>
          </div>
        );
      }
      );
      // console.log(candidateList);
    }

    if (this.state.start || !this.state.end) {
      return (
        <div>
          {this.state.isOwner ? <NavBarAdmin /> : <NavBarVoter />}
          <div
            className="container"
            style={{
              textAlign: "center",
              marginTop: "200px",
            }}
          >
            <h2>VOTING IS NOT COMPLETED YET!!</h2>

          </div>
        </div>
      );
    }

    if (!this.state.web3) {
      return (
        <div>
          {this.state.isOwner ? <NavBarAdmin /> : <NavBarVoter />}
          <div className="container"
            style={{
              textAlign: "center",
              marginTop: "200px"
            }}
          >
            <h2>Getting Results...</h2>
          </div>

        </div>

      );
    }


    return (
      <div>
        {this.state.isOwner ? <NavBarAdmin /> : <NavBarVoter />}
        <div className="text-center mt-4">
          <h1 className="text-black"> RESULTS </h1><br></br>
          {/* <Button onClick={this.result}>See Results</Button> */}
          
        </div>

        <br></br>

        <div className="container">
          <div className="row text-center">
            <div className="page-wrapper p-t-40 p-b-100 font-poppins">
              <div className="wrapper">
                <div className="card-heading border">
                  <div className="row" id="mainrow">
                    <div className="row" id="insiderow">
                      <div className="row fs-3" id="header">
                        <div className="col-md-1">
                          #
                        </div>
                        <div className="col-md-3">
                          Number of votes
                        </div>
                        <div className="col-md-5">
                          Candidate
                        </div>
                        <div className="col-md-3">
                          Party Logo
                        </div>
                      </div>
                      <div className="row" id="candidatelist">
                        {candidateList}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Results;