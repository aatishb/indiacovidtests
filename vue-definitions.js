Vue.component('chart', {
  
  props: ['statedata'],

  template: '<div id="chart"></div>',

  mounted() {

    let xmax = this.statedata.map(e => e.positivityrate).reduce((a,b) => a > b ? a : b);
    xmax = 5*(Math.ceil(100*xmax/5))/100;

    let data = this.statedata.sort((a,b) => parseFloat(b.positivityrate) - parseFloat(a.positivityrate));

    // set the dimensions and margins of the graph
    var margin = {top: 50, right: 30, bottom: 10, left: 150},
        width = 500 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#chart")
      .append("svg")
        .attr("viewBox", '0 0 ' + String(width + margin.left + margin.right) + ' ' + String(height + margin.top + margin.bottom))
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

      // Add X axis
      var x = d3.scaleLinear()
        .domain([0, xmax])
        .range([ 0, width]);
      svg.append("g")
        .attr("transform", "translate(0,0)")
        .call(d3.axisTop(x).tickFormat(d3.format(".0%")))
        //.selectAll("text")
        //  .attr("transform", "translate(-10,0)rotate(-45)")
        //  .style("text-anchor", "end");

    svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", x(0.05))
            .attr("height", height)
            .style("fill", 'rgba(0,255,0,0.25)');

      /*
      svg.append("line")
         .attr("y1", 0)
         .attr("y2", height)
         .attr("x1", x(0.05))
         .attr("x2", x(0.05))
         .attr( "stroke", '#378b37' )
         .attr( "stroke-width", "1" );
      */

    // Y axis
    var y = d3.scaleBand()
      .range([ 0, height ])
      .domain(this.statedata.map(function(d) { return d.state; }))
      .padding(1);
    svg.append("g")
      .call(d3.axisLeft(y));

  svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", -30)
      .text("Percentage of tests that are positive");

    // Lines
    svg.selectAll("myline")
      .data(data)
      .enter()
      .append("line")
        .attr("x1", function(d) { return x(d.positivityrate); })
        .attr("x2", x(0))
        .attr("y1", function(d) { return y(d.state); })
        .attr("y2", function(d) { return y(d.state); })
        .attr("stroke", "rgba(0,0,0,0.2)");

    // Circles
    svg.selectAll("mycircle")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.positivityrate); })
        .attr("cy", function(d) { return y(d.state); })
        .attr("r", "4")
        .style("fill", function(d) { return d.positivityrate > 0.05 ? 'crimson' : '#378b37'; })
        .attr("stroke", "black");

  },

});

Vue.component('statetable', {
  props: ['statedata'],
  template: `<div>
    <table>
      <tr>
        <th class="columntitle" @click="key = 'state'"><b>State or Union Territory</b></th>
        <th class="columntitle" @click="key = 'positivityrate'"><b>% Positive Tests</b> <br>(1 week average)</th>
        <th class="columntitle" @click="key = 'change'"><b>Trend</b> <br>(1 week change)</th>
        <th class="columntitle" @click="key = 'weeklytestspercapita'"><b>Weekly Tests</b> <br>(per 1,000 people)</th>
      </tr>
      <tr v-for="(state,i) in sort(statedata,key)" :key="i">
        <td>{{state.state}}</td>
        <td>{{(100 * state.positivityrate).toFixed(1) + '%'}}</td>
        <td>
          <span :style="{color: state.change > 0 ? 'crimson' : '#378b37'}" v-if="Math.round(Math.abs(100*state.change)) > 0">
            <b>{{state.change > 0 ? '▲' : '▼'}}</b> {{(100 * state.change).toFixed(1) + '%'}}
          </span>
          <span v-else><span style="vertical-align: -0.25rem; super; font-size: 1.75rem;">≈</span> {{(100 * state.change).toFixed(1) + '%'}}</span>
        </td>
        <td>{{(1000 * state.weeklytestspercapita).toFixed(1)}}</td>
      </tr>
    </table> 
  </div>`,

  methods: {
    sort(data, key) {
      if(key == 'state') {
        return this.statedata.sort((a,b) => a[key] > b[key] ? 1 : -1);
      } else {
        return this.statedata.sort((a,b) => parseFloat(b[key]) - parseFloat(a[key]));        
      }
    }

  },

  data() {
    return {
      key: 'positivityrate'
    };
  },

});

// global data
let app = new Vue({

  el: '#root',

  mounted() {
    d3.csv('https://raw.githubusercontent.com/aatishb/indiatestpositivitydata/main/statedata.csv', data => {

      //this.lastUpdated = data.slice(-1)[0]['Date'];

      let [y, m, d] = data.slice(-1)[0]['Date'].split('-');
      this.lastUpdated = new Date(y,m - 1,d);

      let recentData = [];

      for (let state of this.states) {
        let stateData = data.filter(e => e['State'] == state.toUpperCase());
        if (stateData.length > 7) {
          let recentTPR = stateData.slice(-1)[0]['Test Positivity Rate'];
          let pastTPR = stateData.slice(-8,-7)[0]['Test Positivity Rate'];
          let weeklytestspercapita = stateData.slice(-1)[0]['Weekly Tests'] / this.population[state];
          recentData.push({
            state: state,
            positivityrate: recentTPR,
            change: recentTPR - pastTPR,
            weeklytestspercapita: weeklytestspercapita
          });          

        }
      }

      this.allData = data;
      this.recentData = recentData;

    });

  },

  methods: {
  },

  computed: {
    statesWithHighPositivity() {
      return this.recentData.filter(e => e.positivityrate >= 0.05);
    },

    statesWithLowPositivity() {
      return this.recentData.filter(e => e.positivityrate < 0.05);
    },

  },

  data: {
    viewMode: 'table',
    states: ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
    population: {
      'Andaman and Nicobar Islands': 380581,
      'Andhra Pradesh': 49577103,
      'Arunachal Pradesh': 1383727,
      'Assam': 31205576,
      'Bihar': 104099452,
      'Chandigarh': 1055450,
      'Chhattisgarh': 25545198,
      'Dadra and Nagar Haveli and Daman and Diu': 585764,
      'Delhi': 16787941,
      'Goa': 1458545,
      'Gujarat': 60439692,
      'Haryana': 25351462,
      'Himachal Pradesh': 6864602,
      'Jammu and Kashmir': 12267032,
      'Jharkhand': 32988134,
      'Karnataka': 61095297,
      'Kerala': 33406061,
      'Ladakh': 274000,
      'Lakshadweep': 64473,
      'Madhya Pradesh': 72626809,
      'Maharashtra': 112374333,
      'Manipur': 2570390,
      'Meghalaya': 2966889,
      'Mizoram': 1097206,
      'Nagaland': 1978502,
      'Odisha': 41974219,
      'Puducherry': 1247953,
      'Punjab': 27743338,
      'Rajasthan': 68548437,
      'Sikkim': 610577,
      'Tamil Nadu': 72147030,
      'Telangana': 35003674,
      'Tripura': 3673917,
      'Uttar Pradesh': 199812341,
      'Uttarakhand': 10086292,
      'West Bengal': 91276115      
    },
    allData: [],
    recentData: [],
    lastUpdated: new Date()
  }

});
