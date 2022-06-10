import React, { Component } from 'react';
import * as d3 from 'd3';
import ReactSlider from 'react-slider'
import { Data } from "./Data";
// import $ from 'jquery';
import { Chart } from 'chart.js';

const defaultState = {
  funding: "A",
  sector: "Other",
  execExper: 5,
  score: 0,
  age: 0,
  data: Data,
  submitted: false,
}

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
    this.updateScore = this.updateScore.bind(this);
    this.updateChart1 = this.updateChart1.bind(this);
    this.updateChart2 = this.updateChart2.bind(this);
    this.submitButton = this.submitButton.bind(this);
    this.restartButton = this.restartButton.bind(this);
  }

  updateExpSlider(val, i) {
    this.state.data[0].data.datasets[0].data[0] = val * 10 //set first index of "your company" dataset to exec exper val
    this.setState({ execExper: val }, this.updateScore);
    this.updateChart1(this.state.data[0]);
  }

  updateAgeSlider(val, i) {
    this.state.data[1].data.datasets[0].data[3] = val * 5;
    this.setState({ age: val }, this.updateScore);
    this.updateChart2(this.state.data[1]);
  }

  fundingInput() {
    let fundingStage = d3.select('#fundingSelect').property('value');
    this.setState({ funding: fundingStage }, this.updateScore)
  }

  sectorInput() {
    let sector = d3.select('#sectorSelect').property('value');
    this.state.data[0].data.datasets[0].data[4] = this.sectorMap[sector] * 10;
    this.setState({ sector: sector }, this.updateScore)
  }

  updateScore() {
    let fundingStage = this.state.funding;
    let fundingScore = this.fundingMap[fundingStage];
    let sector = this.state.sector;
    let sectorScore = this.sectorMap[sector];
    let execScore = this.state.execExper;
    let ageScore = this.state.age;
    let newScore = sectorScore + fundingScore + execScore + ageScore;
    this.setState({ score: newScore })
    document.getElementById("score-text").innerHTML = newScore;
    let companyName = document.getElementById('nameInput').value;
    if (companyName != "") {
      this.state.data[0].data.datasets[0].label = companyName;
    }
  }

  updateChart1(newData) {
    if (this.state.submitted) {
      this.chart.destroy();
      var ctx = document.getElementById('radar-canvas');
      ctx.height = 400;
      this.chart = new Chart(ctx, newData);
      this.chart.resize();
    }
  }

  updateChart2(newData) {
    if (this.state.submitted) {
      this.chart2.destroy();
      var ctx2 = document.getElementById('radar-canvas2');
      ctx2.height = 400;
      this.chart2 = new Chart(ctx2, newData)
      this.chart2.resize();
    }
  }

  submitButton() {
    this.setState({ submitted: true });
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('not-results').classList.add('hidden');
    this.updateScore();
    var ctx = document.getElementById('radar-canvas');
    ctx.classList.add('radar-canvas1');
    var ctx2 = document.getElementById('radar-canvas2')
    ctx2.classList.add('radar-canvas1');
    this.chart = new Chart(ctx, this.state.data[0]);
    this.chart2 = new Chart(ctx2, this.state.data[1]);
  }

  restartButton() {
    this.setState(defaultState);
    this.chart.destroy();
    this.chart2.destroy();
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
            </div>
            <div style={{ width: "400px", height: "400px" }}>
              <canvas id="radar-canvas2" style={{ width: "400px", height: "400px" }}></canvas>
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

