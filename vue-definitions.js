// map code adapted from https://bl.ocks.org/officeofjane/d33d6ef783993b60b15a3fe0f8da1481

Vue.component('gridmap', {
  
  props: [],

  template: '<div id="map"></div>',

  methods: {
    drawGraph() {
      var config = {
        width : 960,
        height : 450,
        padding : 30,
        projection : d3.geoMercator(),
        duration : 1000,
        key:function(d){return d.properties.code; },
        grid : {
          GS: {x: 2, y: 4 },
          QH: {x: 1, y: 4 },
          GX: {x: 5, y: 7 },
          GZ: {x: 4, y: 6 },
          CQ: {x: 4, y: 5 },
          BJ: {x: 7, y: 3 },
          FJ: {x: 7, y: 6 },
          AH: {x: 6, y: 5 },
          GD: {x: 6, y: 7 },
          XZ: {x: 2, y: 5 },
          XJ: {x: 0, y: 3 },
          HI: {x: 6, y: 8 },
          NX: {x: 3, y: 4 },
          SN: {x: 4, y: 4 },
          SX: {x: 5, y: 4 },
          HB: {x: 5, y: 5 },
          HN: {x: 5, y: 6 },
          SC: {x: 3, y: 5 },
          YN: {x: 3, y: 6 },
          HE: {x: 6, y: 3 },
          HA: {x: 6, y: 4 },
          LN: {x: 7, y: 2 },
          SD: {x: 8, y: 3 },
          TJ: {x: 9, y: 3 },
          JX: {x: 6, y: 6 },
          JS: {x: 7, y: 4 },
          SH: {x: 8, y: 4 },
          ZJ: {x: 7, y: 5 },
          JL: {x: 8, y: 2 },
          NM: {x: 6, y: 2 },
          HK: {x: 9, y: 1 }    
        }
      };

      // svg container
      var svg = d3.select('#map')
        .append('svg')
        .attr('width',config.width)
        .attr('height',config.height);

      // colour scale
      var colours = d3.scaleQuantile()
        .range(['#ffffe0','#ffd59b','#ffa474','#f47461','#db4551','#b81b34','#8b0000']);

      var g2r = new geo2rect.draw();

      d3.queue()
        .defer(d3.json, "china.geojson")
        .defer(d3.csv, "electricity2015.csv", function(d) {
          d.value = +d.value;
          return d;
        })
        .await(ready);

      function ready(error, provinces, electricity) {
        var geojson = geo2rect.compute(provinces);
        g2r.config = config;
        g2r.data = geojson;
        g2r.svg = svg.append('g');
        g2r.draw();

        colours.domain(d3.extent(electricity, function(d) { return d.value; }))

        electricity.forEach(function(d) {
          d3.selectAll("svg .id-" + d.code)
            .style("fill", colours(d.value))
        })
      }

      d3.select('#map').on('click', function(){
        g2r.toggle();
        g2r.draw();
        // console.log(g2r.mode);
      });

    }
  },

  mounted() {
    this.drawGraph();
  },

  watch: {
  }

});

Vue.component('chart', {
  
  props: ['statedata', 'showchange'],

  template: '<div id="chart"></div>',

  methods: {
    drawGraph() {
      let xmax = this.statedata.map(e => e.positivityrate).reduce((a,b) => a > b ? a : b);
      xmax = 5*(Math.ceil(100*xmax/5))/100;

      if (this.showchange) {
        let xmax2 = this.statedata.map(e => e.pastpositivityrate).reduce((a,b) => a > b ? a : b);
        xmax2 = 5*(Math.ceil(100*xmax2/5))/100;
        xmax = Math.max(xmax, xmax2);
      }

      let data = this.statedata.sort((a,b) => parseFloat(b.positivityrate) - parseFloat(a.positivityrate));


      // set the dimensions and margins of the graph
      var margin = {top: 50, right: 30, bottom: 10, left: 150},
          width = 500 - margin.left - margin.right,
          height = 800 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      d3.selectAll("svg").remove();

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
        .text("What percentage of COVID tests are positive?");

      if (this.showchange) {

        // Lines
        svg.selectAll("myline")
          .data(data)
          .enter()
          .append("line")
            .attr("x1", function(d) { return x(d.pastpositivityrate); })
            .attr("x2", function(d) { return x(d.positivityrate); })
            .attr("y1", function(d) { return y(d.state); })
            .attr("y2", function(d) { return y(d.state); })
            .attr("stroke", "rgba(0,0,0,0.2)");

        // Circles of variable 1
        svg.selectAll("mycircle")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.pastpositivityrate); })
            .attr("cy", function(d) { return y(d.state); })
            .attr("r", "6")
            .style("fill", function(d) { return d.pastpositivityrate > 0.05 ? 'rgb(247,206,206)' : 'rgb(214,230,205)'; });

        // Circles of variable 2
        svg.selectAll("mycircle")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.positivityrate); })
            .attr("cy", function(d) { return y(d.state); })
            .attr("r", "6")
            .style("fill", function(d) { return d.positivityrate > 0.05 ? 'crimson' : '#378b37'; })

      } else {

        // Lines
        svg.selectAll("myline")
          .data(data)
          .enter()
          .append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", function(d) { return y(d.state); })
            .attr("y2", function(d) { return y(d.state); })
            .attr("stroke", "rgba(0,0,0,0.2)");

        // Circles
        svg.selectAll("mycircle")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", x(0))
            .attr("cy", function(d) { return y(d.state); })
            .attr("r", "5")
            .style("fill", function(d) { return d.positivityrate > 0.05 ? 'crimson' : '#378b37'; })


        // Change the X coordinates of line and circle
        svg.selectAll("circle")
          .transition()
          .duration(2000)
          .attr("cx", function(d) { return x(d.positivityrate); });

        svg.selectAll("line")
          .transition()
          .duration(2000)
          .attr("x1", function(d) { return x(d.positivityrate); });  

      }
    }
  },

  mounted() {
    this.drawGraph();
  },

  watch: {
    showchange() {
      this.drawGraph();
    }
  }

});

Vue.component('statetable', {
  props: ['statedata', 'showtestnumbers', 'showtrend'],
  template: `<div>
    <table>
      <tr>
        <th class="columntitle" @click="key = 'state'"><b>State or Union Territory</b></th>
        <th class="columntitle" @click="key = 'positivityrate'"><b>% Positive Tests</b> <br>(1 week average)</th>
        <th v-if="showtrend" class="columntitle" @click="key = 'change'"><b>Trend</b> <br>(1 week change)</th>
        <th v-if="showtestnumbers" class="columntitle" @click="key = 'weeklytestspercapita'"><b>Weekly Tests</b> <br>(per 1,000 people)</th>
      </tr>
      <tr v-for="(state,i) in sort(statedata,key)" :key="i">
        <td>{{state.state}}</td>
        <td>{{(100 * state.positivityrate).toFixed(1) + '%'}}</td>
        <td v-if="showtrend">
          <span :style="{color: state.change > 0 ? 'crimson' : '#378b37'}" v-if="Math.round(Math.abs(100*state.change)) > 0">
            <b>{{state.change > 0 ? '▲' : '▼'}}</b> {{(100 * state.change).toFixed(1) + '%'}}
          </span>
          <span v-else><span style="vertical-align: -0.25rem; super; font-size: 1.75rem;">≈</span> {{(100 * state.change).toFixed(1) + '%'}}</span>
        </td>
        <td v-if="showtestnumbers">{{(1000 * state.weeklytestspercapita).toFixed(1)}}</td>
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
            pastpositivityrate: pastTPR,
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
    lastUpdated: new Date(),
    showtestnumbers: false,
    showtrend: true,
    showchange: false
  }

});
