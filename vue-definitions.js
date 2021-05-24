// map code adapted from https://bl.ocks.org/officeofjane/d33d6ef783993b60b15a3fe0f8da1481

Vue.component('gridmap', {
  
  props: ['statedata'],

  template: `<div>
    <div id="blurb"></div>
    <div id="map"></div>
    <div style="display: flex; flex-direction: row; justify-content: center;">
      <button v-if="g2r !== null" @click="toggle" style="margin-bottom: 1rem;">Show {{g2r.mode == 'geo' ? 'Grid' : 'Map'}}</button>
    </div>
  </div>
  `,

  methods: {
    toggle() { // todo: debounce
        this.g2r.toggle();
        if (this.g2r.mode == 'geo') {
          d3.selectAll('.label').style('visibility', 'hidden');
          setTimeout(function() {
            d3.selectAll('.label').style('visibility', 'hidden');          
          }, 1000);
        } else {
          setTimeout(function() {
            d3.selectAll('.label').style('visibility', 'visible');          
          }, 1000);
        }
        this.g2r.draw();     
        //console.log(this.g2r.mode);
    },

    drawGraph() {

      var config = {
        width : 660,
        height : 660,
        padding : 5,
        projection : d3.geoMercator(),
        duration : 1000,
        key:function(d){return d.properties.st_nm; },
        grid : {
          'Andaman and Nicobar Islands': {x:8,y:7, abbr: 'AN'},
          'Andhra Pradesh': {x:3,y:5, abbr: 'AP'},
          'Arunachal Pradesh': {x:8,y:1, abbr: 'AR'},
          'Assam': {x:7,y:2, abbr: 'AS'},
          'Bihar': {x:5,y:2, abbr: 'BR'},
          'Chandigarh': {x:2,y:1, abbr: 'CH'},
          'Chhattisgarh': {x:3,y:3, abbr: 'CT'},
          'Dadra and Nagar Haveli and Daman and Diu': {x:1,y:4, abbr: 'DNDD'},
          'Delhi': {x:3,y:2, abbr: 'DL'},
          'Goa': {x:2,y:5, abbr: 'GA'},
          'Gujarat': {x:0,y:3, abbr: 'GJ'},
          'Haryana': {x:2,y:2, abbr: 'HR'},
          'Himachal Pradesh': {x:3,y:1, abbr: 'HP'},
          'Jammu and Kashmir': {x:2,y:0, abbr: 'JK'},
          'Jharkhand': {x:5,y:3, abbr: 'JH'},
          'Karnataka': {x:2,y:6, abbr: 'KA'},
          'Kerala': {x:2,y:7, abbr: 'KL'},
          'Ladakh': {x:3,y:0, abbr: 'LA'},
          'Lakshadweep': {x:0,y:7, abbr: 'LD'},
          'Madhya Pradesh': {x:2,y:3, abbr: 'MP'},
          'Maharashtra': {x:2,y:4, abbr: 'MH'},
          'Manipur': {x:8,y:3, abbr: 'MN'},
          'Meghalaya': {x:7,y:3, abbr: 'ML'},
          'Mizoram': {x:8,y:4, abbr: 'MZ'},
          'Nagaland': {x:8,y:2, abbr: 'NL'},
          'Odisha': {x:4,y:3, abbr: 'OR'},
          'Puducherry': {x:3,y:6, abbr: 'PY'},
          'Punjab': {x:1,y:2, abbr: 'PB'},
          'Rajasthan': {x:1,y:3, abbr: 'RJ'},
          'Sikkim': {x:6,y:1, abbr: 'SK'},
          'Tamil Nadu': {x:3,y:7, abbr: 'TN'},
          'Telangana': {x:3,y:4, abbr: 'TG'},
          'Tripura': {x:7,y:4, abbr: 'TR'},
          'Uttar Pradesh': {x:4,y:2, abbr: 'UP'},
          'Uttarakhand': {x:4,y:1, abbr: 'UT'},
          'West Bengal': {x:6,y:2, abbr: 'WB'}
        }
      };


      // set the dimensions and margins of the graph
      var margin = {top: 30, right: 0, bottom: 0, left: 0},
          width = 660,
          height = 660;

      d3.selectAll("svg").remove();

      var svg = d3.select("#map")
        .append("svg")
          .attr("viewBox", '0 0 ' + String(width + margin.left + margin.right) + ' ' + String(height + margin.top + margin.bottom))
          .style('fill','transparent')
          .style('stroke', 'black');

    svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", 1.25 * margin.top)
        .text("What Percentage of COVID Tests are Positive?")
        .style('fill', 'black')
        .style('stroke', 'none')
        .style('font-size', '1.25rem')
        .style("font-family", "serif");

      var x = d3.scaleLinear()
        .domain([-0.5, 8.5])
        .range([ 0, width]);

      var y = d3.scaleLinear()
        .domain([-0.5, 8.5])
        .range([ 0, height]);

      // create a tooltip
      var tooltip = d3.select("#blurb")
        .append("div")
        .attr("class", "tooltip")
        .style('border','2px solid rgb(40, 20, 70)')
        .style('color','rgb(40, 20, 70)')
        .style('background-color','lightgoldenrodyellow')
        .style("padding", "0.75rem")
        .style("margin-top", "1rem")
        .style("max-height", "5rem")
        .style('transition', 'max-height 0.2s ease-in')
        .style('-webkit-transition', 'max-height 0.2s ease-in')
        .style('-moz-transition', 'max-height 0.2s ease-in')
        .style('overflow', 'hidden')
        .html("👉🏽 Hover/Click on State for More Information");

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(state) {
        if (state) {
          tooltip.style("max-height", "15rem").html('<b>' + state.state + "</b><br>% Positive Tests: <b>" + state.positivityratestring 
            + '</b><br>Weekly Change: <b>' + state.changestring
            + '</b><br>Weekly Tests (per 1K people): <b>' + state.weeklytestspercapitastring) + '</b>';
        }
      };

      let statedata = this.statedata;

      // colour scale
      var colors = d3.scaleQuantile()
        .range(['#ffffe0','#ffd59b','#ffa474','#f47461','#db4551','#b81b34','#8b0000']);

      let g2r = new geo2rect.draw();
      this.g2r = g2r;

      d3.json('india.geojson', function(err, data){
        var geojson = geo2rect.compute(data);

        g2r.config = config;
        g2r.data = geojson;
        g2r.svg = svg.append('g')
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        g2r.draw();

        colors.domain([0,0.35]);

        statedata.forEach(function(d) {
          d3.selectAll("svg .id-" + d.state.replaceAll(' ', '.'))
            .style("fill", colors(d.positivityrate))
            .on("mouseover", () => mouseover(d))
            .on("click", () => mouseover(d));
        });

        Object.keys(config.grid).forEach(function(d) {

          let state = config.grid[d];
          let data = statedata.filter(e => e.state == d)[0];

          svg.append("text")
              .attr("class", "label")
              .attr("text-anchor", "middle")
              .attr("x", x(state.x))
              .attr("y", y(1 + state.y))
              .text(state.abbr)
              .style('font-size', '1.25rem')
              .style('fill', 'black')
              .style('stroke', 'none')
              .style('visibility', 'hidden')
              .on("mouseover", () => mouseover(data))
              .on("click", () => mouseover(data));

          });

        g2r.toggle();
        setTimeout(function() {
          d3.selectAll('.label').style('visibility', 'visible');          
        }, 1000);
        g2r.draw();

      });

    }
  },

  mounted() {
    this.drawGraph();
  },

  watch: {
  },

  data() {
    return {
      g2r: null,
    }
  }

});

Vue.component('chart', {
  
  props: ['statedata', 'selected'],

  template: '<div id="chart"></div>',

  methods: {
    drawGraph() {

      let xmax;

      if (this.selected == 'positivityrate') {
        xmax = this.statedata.map(e => e.positivityrate).reduce((a,b) => a > b ? a : b);
        xmax = 5*(Math.ceil(100*xmax/5))/100;

      } else if (this.selected == 'change') {
        xmax = this.statedata.map(e => e.positivityrate).reduce((a,b) => a > b ? a : b);
        xmax = 5*(Math.ceil(100*xmax/5))/100;
        let xmax2 = this.statedata.map(e => e.pastpositivityrate).reduce((a,b) => a > b ? a : b);
        xmax2 = 5*(Math.ceil(100*xmax2/5))/100;
        xmax = Math.max(xmax, xmax2);
      } else if (this.selected == 'weeklytestspercapita') {
        xmax = 50;        
      }

      let data = this.selected == 'weeklytestspercapita' ? this.statedata.sort((a,b) => parseFloat(b.weeklytestspercapita) - parseFloat(a.weeklytestspercapita)) : this.statedata.sort((a,b) => parseFloat(b.positivityrate) - parseFloat(a.positivityrate));


      // set the dimensions and margins of the graph
      var margin = {top: 50, right: 30, bottom: 10, left: 150},
          width = 500 - margin.left - margin.right,
          height = 800 - margin.top - margin.bottom;

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

        if (this.selected == 'weeklytestspercapita') {
          svg.append("g")
            .attr("transform", "translate(0,0)")
            .call(d3.axisTop(x));
        } else {
          svg.append("g")
            .attr("transform", "translate(0,0)")
            .call(d3.axisTop(x).tickFormat(d3.format(".0%")));          
        }

      if (this.selected == 'change' || this.selected == 'positivityrate') {
        svg.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", x(0.05))
                .attr("height", height)
                .style("fill", 'rgba(0,255,0,0.25)');
      }

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
        .text(this.selected == 'weeklytestspercapita' ? "Number of Weekly Tests (per 1,000 people)" : "What Percentage of COVID Tests are Positive?")
        .style("font-family", "serif");

      if (this.selected == 'change') {

        // Lines
        svg.selectAll()
          .data(data)
          .enter()
          .append("line")
            .attr("x1", function(d) { return x(d.pastpositivityrate); })
            .attr("x2", function(d) { return x(d.positivityrate); })
            .attr("y1", function(d) { return y(d.state); })
            .attr("y2", function(d) { return y(d.state); })
            .attr("stroke", "rgba(0,0,0,0.2)");

        // Circles of variable 1
        svg.selectAll()
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.pastpositivityrate); })
            .attr("cy", function(d) { return y(d.state); })
            .attr("r", "6")
            .style("fill", function(d) { return d.pastpositivityrate > 0.05 ? 'rgb(247,206,206)' : 'rgb(214,230,205)'; });

        // Circles of variable 2
        svg.selectAll()
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.positivityrate); })
            .attr("cy", function(d) { return y(d.state); })
            .attr("r", "6")
            .style("fill", function(d) { return d.positivityrate > 0.05 ? 'crimson' : '#378b37'; })

      } else if (this.selected == 'positivityrate') {

        // Lines
        let mylines = svg.selectAll()
          .data(data)
          .enter()
          .append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", function(d) { return y(d.state); })
            .attr("y2", function(d) { return y(d.state); })
            .attr("stroke", "rgba(0,0,0,0.2)");

        // Circles
        let mycircles = svg.selectAll()
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", x(0))
            .attr("cy", function(d) { return y(d.state); })
            .attr("r", "6")
            .style("fill", function(d) { return d.positivityrate > 0.05 ? 'crimson' : '#378b37'; })


        // Change the X coordinates of line and circle
        mycircles.transition()
          .duration(2000)
          .attr("cx", function(d) { return x(d.positivityrate); });

        mylines.transition()
          .duration(2000)
          .attr("x1", function(d) { return x(d.positivityrate); });  

      } else if (this.selected == 'weeklytestspercapita') {

        // Lines
        let mylines = svg.selectAll()
          .data(data)
          .enter()
          .append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", function(d) { return y(d.state); })
            .attr("y2", function(d) { return y(d.state); })
            .attr("stroke", "rgba(0,0,0,0.2)");

        // Circles
        let mycircles = svg.selectAll()
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", x(0))
            .attr("cy", function(d) { return y(d.state); })
            .attr("r", "6")
            .style("fill", function(d) { return 1000 * d.weeklytestspercapita < 10 ? 'crimson' : '#378b37'; })


        // Change the X coordinates of line and circle
        mycircles.transition()
          .duration(2000)
          .attr("cx", function(d) { return x(1000 * d.weeklytestspercapita); });

        mylines.transition()
          .duration(2000)
          .attr("x1", function(d) { return x(1000 * d.weeklytestspercapita); });  

      }
    }
  },

  mounted() {
    this.drawGraph();
  },

  watch: {
    selected() {
      this.drawGraph();
    }
  }

});

Vue.component('statetable', {
  props: ['statedata', 'showtestnumbers', 'showtrend'],
  template: `<div>
    <table>
      <tr>
        <th class="columntitle" @click="changekey('state')"><b>State or Union Territory</b> <span v-if="key == 'state'">{{(sortorder[key]) ? '▼' : '▲'}}</span></th>
        <th class="columntitle" @click="changekey('positivityrate')"><b>% Positive Tests</b> <span v-if="key == 'positivityrate'">{{(sortorder[key]) ? '▼' : '▲'}}</span> <br><span class="light">(1 week average)</span></th>
        <th v-if="showtrend" class="columntitle" @click="changekey('change')"><b>Trend</b> <span v-if="key == 'change'">{{(sortorder[key]) ? '▼' : '▲'}}</span> <br><span class="light">(1 week change)</span></th>
        <th v-if="showtestnumbers" class="columntitle" @click="changekey('weeklytestspercapita')"><b>Weekly Tests</b> <span v-if="key == 'weeklytestspercapita'">{{(sortorder[key]) ? '▼' : '▲'}}</span><br><span class="light">(per 1,000 people)</span></th>
      </tr>
      <tr v-for="(state,i) in sort(statedata, key)" :key="i">
        <td>{{state.state}}</td>
        <td>{{state.positivityratestring}}</td>
        <td v-if="showtrend">
          <span :style="{color: state.change > 0 ? 'crimson' : '#378b37'}" v-if="Math.round(Math.abs(100*state.change)) > 0">
            <b>{{state.change > 0 ? '▲' : '▼'}}</b> {{state.changestring}}
          </span>
          <span v-else><span style="vertical-align: -0.25rem; super; font-size: 1.75rem;">≈</span> {{state.changestring}}</span>
        </td>
        <td v-if="showtestnumbers">{{state.weeklytestspercapitastring}}</td>
      </tr>
    </table> 
  </div>`,

  methods: {
    changekey(key) {
      this.key = key;
      this.sortorder[key] = !this.sortorder[key];
      // restore other column sort to default
      for (let k of Object.keys(this.sortorder)) {
        if (k !== key) {
          this.sortorder[k] = false;
        }
      }
    },

    sort(data, key) {
      if(key == 'state') {
        return this.sortorder[key] ? this.statedata.sort((a,b) => a[key] > b[key] ? 1 : -1) : this.statedata.sort((a,b) => a[key] > b[key] ? 1 : -1).reverse();
      } else {
        return this.sortorder[key] ? this.statedata.sort((a,b) => parseFloat(b[key]) - parseFloat(a[key])) : this.statedata.sort((a,b) => parseFloat(b[key]) - parseFloat(a[key])).reverse();        
      }
    }

  },

  data() {
    return {
      key: 'positivityrate',
      sortorder: {
        'state': false,
        'positivityrate': true,
        'change': false,
        'weeklytestspercapita': false,        
      }
    };
  },

});

// global data
let app = new Vue({

  el: '#root',

  mounted() {
    d3.csv('https://raw.githubusercontent.com/aatishb/indiatestpositivitydata/main/statedata.csv', data => {

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
            positivityratestring: (100 * recentTPR).toFixed(1) + '%',
            pastpositivityrate: pastTPR,
            change: recentTPR - pastTPR,
            changestring: ((100 * (recentTPR - pastTPR)).toFixed(1) + '%').replace('-','−'), //long minus sign            
            weeklytestspercapita: weeklytestspercapita,
            weeklytestspercapitastring: (1000 * weeklytestspercapita).toFixed(1)
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
    showchange: false,
    expand: false,
    selectedChart: 'positivityrate',
    options: [
      { text: 'Percentage of Positive Tests', value: 'positivityrate' },
      { text: 'Trend (1 week change)', value: 'change' },
      { text: 'Weekly Tests (per 1,000 people)', value: 'weeklytestspercapita' }
    ]


  }

});
