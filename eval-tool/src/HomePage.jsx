import React, { Component } from 'react';
import * as d3 from 'd3';
import ReactSlider from 'react-slider'
import { Data } from "./Data";
// import $ from 'jquery';
import { Chart } from 'chart.js';
import { WeightData } from './InvestorView';
import axios from 'axios';

const defaultState = {
  name: "",
  funding: "A",
  sector: "Other",
  execExper: 5,
  score: 0,
  age: 0,
  growthRate: 0,
  burnRate: 0,
  cash: 0,
  profitability: 0,
  data: Data,
  submitted: false,
  weightData: WeightData
}

//Sheet.best connection URL for database sheet. Ask Eran for login. 
export const postURL = 'https://sheet.best/api/sheets/7a352bfd-9d5f-4039-9001-66cae6bd1d85';

export default class HomePage extends Component {
  constructor() {
    super();
    document.title = "Startup Evaluator";
    this.state = defaultState;
    this.fundingMap = { "A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5 }
    this.sectorMap = {
      "Ecommerce": 0, "Finance": 2,
      "Healthcare": 4, "Insurance": 6,
      "Tech (hardware)": 8, "Tech (software)": 10,
      "Other": 0
    }
    this.fundingInput = this.fundingInput.bind(this);
    this.sectorInput = this.sectorInput.bind(this);
    this.updateExpSlider = this.updateExpSlider.bind(this);
    this.updateAgeSlider = this.updateAgeSlider.bind(this);
    this.updateGrowthSlider = this.updateGrowthSlider.bind(this);
    this.updateBurnSlider = this.updateBurnSlider.bind(this);
    this.updateCashSlider = this.updateCashSlider.bind(this);
    this.updateProfitSlider = this.updateProfitSlider.bind(this);
    this.calc2Rating = this.calc2Rating.bind(this);
    this.updateScore = this.updateScore.bind(this);
    this.updateChart1 = this.updateChart1.bind(this);
    this.updateChart2 = this.updateChart2.bind(this);
    this.updateChartResults = this.updateChartResults.bind(this);
    this.submitButton = this.submitButton.bind(this);
    this.restartButton = this.restartButton.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  updateExpSlider(val, i) {
    //function called on change of executive experience slider
    this.state.data[0].data.datasets[0].data[0] = val * 10 //set first index of "your company" dataset to exec exper val
    this.setState({ execExper: val }, this.updateScore);
    this.updateChart1(this.state.data[0]);
  }

  updateAgeSlider(val, i) {
    //function called on change of age slider
    this.state.data[1].data.datasets[0].data[3] = val * 5;
    this.setState({ age: val }, this.updateScore);
    this.updateChart2(this.state.data[1]);
  }

  updateGrowthSlider(val, i) {
    //function called on change of grwoth slider
    this.state.data[1].data.datasets[0].data[0] = val;
    this.setState({ growthRate: val });
    this.calc2Rating();
  }

  updateBurnSlider(val, i) {
    //function called on change of burn rate slider
    this.state.data[1].data.datasets[0].data[1] = val;
    this.setState({ burnRate: val });
    this.calc2Rating();
  }

  updateCashSlider(val, i) {
    //function called on change of cash available slider
    this.state.data[1].data.datasets[0].data[2] = val;
    this.setState({ cash: val });
    this.calc2Rating();
  }

  updateProfitSlider(val, i) {
    //function called on change of profit slider
    this.state.data[1].data.datasets[0].data[3] = val;
    this.setState({ profitability: val });
    this.calc2Rating();
  }

  calc2Rating() {
    //calculate a rating score and update charts
    var growthWeight = WeightData.find(e => e['Criteria'] == 'Growth Rate')[2];
    var growthRating = growthWeight * this.state.growthRate;
    var burnWeight = WeightData.find(e => e['Criteria'] == 'Burn Rate')[2];
    var burnRating = burnWeight * this.state.burnRate;
    var cashWeight = WeightData.find(e => e['Criteria'] == 'Cash Available')[2];
    var cashRating = cashWeight * this.state.cash;
    var profitWeight = WeightData.find(e => e['Criteria'] == 'Profitability')[2];
    var profitRating = profitWeight * this.state.profitability;
    var rating = growthRating + burnRating + cashRating + profitRating;
    this.state.data[this.state.data.length - 1].data.datasets[0].data[1] = rating;
    this.updateChartResults(this.state.data[this.state.data.length - 1]);
  }

  fundingInput() {
    //function called on change of funding dropdown. Update state and then score.
    let fundingStage = d3.select('#fundingSelect').property('value');
    this.setState({ funding: fundingStage }, this.updateScore);
  }

  sectorInput() {
    //on change of sector dropdown, update sector and then score. 
    let sector = d3.select('#sectorSelect').property('value');
    this.state.data[0].data.datasets[0].data[4] = this.sectorMap[sector] * 10;
    this.setState({ sector: sector }, this.updateScore);
  }

  updateScore() {
    //calculate score based on state
    let fundingStage = this.state.funding;
    let fundingScore = this.fundingMap[fundingStage];
    let sector = this.state.sector;
    let sectorScore = this.sectorMap[sector];
    let execScore = this.state.execExper;
    let ageScore = this.state.age;
    let newScore = sectorScore + fundingScore + execScore + ageScore;
    let companyName = document.getElementById('nameInput').value;
    this.setState({ score: newScore, name: companyName });
    document.getElementById("score-text").innerHTML = newScore;
    if (companyName != "") {
      this.state.data[0].data.datasets[0].label = companyName;
    }
  }

  updateChart1(newData) {
    //create chart 1 on radar-canvas div. Only some features functional.
    if (this.state.submitted) {
      this.chart.destroy();
      var ctx = document.getElementById('radar-canvas');
      ctx.height = 400;
      this.chart = new Chart(ctx, newData);
      this.chart.resize();
    }
  }

  updateChart2(newData) {
    //create chart 2 on radar-canvas 2 div. Based on 4 slider labels. 
    if (this.state.submitted) {
      this.chart2.destroy();
      var ctx2 = document.getElementById('radar-canvas2');
      ctx2.height = 400;
      this.chart2 = new Chart(ctx2, newData);
      this.chart2.resize();
    }
  }

  updateChartResults(newData) {
    //update final, cumulative chart for topics. 
    //Only one topic functional based on results of chart 2.
    if (this.state.submitted) {
      this.chart2.destroy();
      var ctx2 = document.getElementById('radar-canvas-results');
      ctx2.height = 400;
      this.chart2 = new Chart(ctx2, newData);
      this.chart2.resize();
    }
  }

  submitButton = e => {
    //action taken upon submit button
    e.preventDefault();
    //post state is JSON sent to URL with axios.
    var postState = { "name": this.state.name, "funding": this.state.funding, "growthRate": this.state.growthRate, "burnRate": this.state.burnRate, "numEvals": '0' };
    axios.post(postURL, postState)
      .then(response => { console.log(response) }); //send and log res
    this.setState({ submitted: true });
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('not-results').classList.add('hidden');
    this.updateScore();
    var ctx = document.getElementById('radar-canvas');
    ctx.classList.add('radar-canvas1');
    var ctx2 = document.getElementById('radar-canvas2'); //update charts
    ctx2.classList.add('radar-canvas1');
    this.chart = new Chart(ctx, this.state.data[0]);
    this.chart2 = new Chart(ctx2, this.state.data[1]);
    var ctxResults = document.getElementById('radar-canvas-results');
    ctxResults.classList.add('radar-canvas1');
    this.chart3 = new Chart(ctxResults, this.state.data[this.state.data.length - 1]);
  }

  restartButton() {
    this.setState(defaultState); //undo saved progress on restart
    document.getElementById('results').classList.add('hidden');
    document.getElementById('not-results').classList.remove('hidden');
  }

  render() {
    return (
      <div className="Home-Page">
        <div id="not-results">
          <div class="QA">
            <label id="nameInputLabel" class="itm" htmlFor='nameInput'>
              Company Name:
            </label>
            <input id='nameInput' type='text' placeholder='Company A...'></input>

            <label htmlFor="fundingSelect" class="itm right-itm">
              Series funding desired:
            </label>
            <select id="fundingSelect" class="selector" onChange={this.fundingInput}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
            </select>
          </div>
          <br />
          <div class="QA">
            <label htmlFor="sectorSelect" >
              Sector:
            </label>
            <select id="sectorSelect" class="selector" onChange={this.sectorInput}>
              <option value="Ecommerce">Ecommerce</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Insurance">Insurance</option>
              <option value="Tech (hardware)">Tech (hardware)</option>
              <option value="Tech (software)">Tech (software)</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="QA">
            <div class="text-slider-pair">
              <label htmlFor='ageSelect' class="itm">
                Company age:
              </label>
              <ReactSlider id="ageSlider" className="horizontal-slider" marks={true} defaultValue={0}
                min={0} max={20} thumbClassName="example-thumb" thumbActiveClassName='current-thumb'
                trackClassName='example-track' markClassName='example-mark'
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                renderTrack={(props, state) => <div {...props} />}
                onChange={this.updateAgeSlider} />
              {/* above is format for creating a react slider. 
                Need a new function to pass to onChange unlesss you can find
                a better way.  */}
            </div>
          </div>
          <br />
          <div class="slider-space QA">
            <label>Rate your executive's experience: </label>
            <ReactSlider id="slider"
              className="horizontal-slider"
              marks={true}
              defaultValue={5}
              min={0}
              max={10}
              thumbClassName="example-thumb"
              thumbActiveClassName='current-thumb'
              trackClassName="example-track"
              markClassName="example-mark"
              onChange={this.updateExpSlider}
              renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
              renderTrack={(props, state) => <div {...props} />}
            />

          </div>
          <br />
          <div class="QA">
            <div class="text-slider-pair">
              <label htmlFor='growthSlider' class="itm">
                Growth Rate (%):
              </label>
              <ReactSlider id="growthSlider" className="horizontal-slider" marks={true} defaultValue={0}
                min={-100} max={100} thumbClassName="example-thumb" thumbActiveClassName='current-thumb'
                trackClassName='example-track' markClassName='example-mark'
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                renderTrack={(props, state) => <div {...props} />}
                onChange={this.updateGrowthSlider} />
            </div>
          </div>
          <br />
          <div class="QA">
            <div class="text-slider-pair">
              <label htmlFor='burnSlider' class="itm">
                Burn Rate (%):
              </label>
              <ReactSlider id="burnSlider" className="horizontal-slider" marks={true} defaultValue={0}
                min={0} max={100} thumbClassName="example-thumb" thumbActiveClassName='current-thumb'
                trackClassName='example-track' markClassName='example-mark'
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                renderTrack={(props, state) => <div {...props} />}
                onChange={this.updateBurnSlider} />
            </div>
          </div>
          <br />
          <div class="two-sliders">
            <div class="QA">
              <div class="text-slider-pair">
                <label htmlFor='cashSlider' class="itm">
                  % Cash Available:
                </label>
                <ReactSlider id="cashSlider" className="horizontal-slider" marks={true} defaultValue={0}
                  min={0} max={100} thumbClassName="example-thumb" thumbActiveClassName='current-thumb'
                  trackClassName='example-track' markClassName='example-mark'
                  renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                  renderTrack={(props, state) => <div {...props} />}
                  onChange={this.updateCashSlider} />
              </div>
            </div>
            <br />
            <div class="QA">
              <div class="text-slider-pair">
                <label htmlFor='profitSlider' class="itm">
                  Annual Profit (as % of assets):
                </label>
                <ReactSlider id="profitSlider" className="horizontal-slider" marks={true} defaultValue={0}
                  min={0} max={100} thumbClassName="example-thumb" thumbActiveClassName='current-thumb'
                  trackClassName='example-track' markClassName='example-mark'
                  renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                  renderTrack={(props, state) => <div {...props} />}
                  onChange={this.updateProfitSlider} />
              </div>
            </div>
          </div>
          <br />
          <button type="button" class="button" id="submit-button" onClick={this.submitButton}>
            <span class="button__text">Submit</span>
            <span class="button__icon">
              <ion-icon name="checkmark-done"></ion-icon>
            </span>
          </button>
        </div>
        <div id="results" class="hidden">
          <div class="div-score">
            <p >Score: <span id="score-text"></span></p>
          </div>
          <br />
          <div class="chart-container" style={{ display: "inline-block" }}>
            <div style={{ width: "400px", height: "400px" }}>
              <canvas id="radar-canvas" style={{ width: "400px", height: "400px" }}></canvas>
              {/*canvas to draw radar chart on  */}
            </div>
            <div style={{ width: "400px", height: "400px" }}>
              <canvas id="radar-canvas2" style={{ width: "400px", height: "400px" }}></canvas>
            </div>
            <div style={{ width: "400px", height: "400px" }}>
              <canvas id="radar-canvas-results" style={{ width: "400px", height: "400px" }}></canvas>
            </div>
          </div>
          <br />
          <button type="button" class="button" id="restart-button" onClick={this.restartButton}>
            <span class="button__text">Restart</span>
            <span class="button__icon">
              <ion-icon name="refresh-circle-outline"></ion-icon>
            </span>
          </button>
        </div>
      </div >
    )
  }
}

