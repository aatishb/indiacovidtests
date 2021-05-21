Vue.component('statetable', {
  props: ['statedata'],
  template: `<div>
    <table>
      <tr>
        <th class="columntitle" @click="key = 'state'"><b>State / Union Territory</b></th>
        <th class="columntitle" @click="key = 'positivityrate'"><b>Percentage of Positive Tests</b> (in the past week)</th>
        <th class="columntitle" @click="key = 'change'"><b>Trend</b> <br>(1 week change)</th>
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

// custom graph component
Vue.component('graph', {

  props: ['traces', 'layout'],

  template: '<div ref="graph" class="graph"></div>',

  methods: {

    updateGraph() {
      let traces = JSON.parse(JSON.stringify(this.traces));
      let layout = JSON.parse(JSON.stringify(this.layout));
      Plotly.react(this.$refs.graph, traces, layout);
    },

  },

  mounted() {
    Plotly.newPlot(this.$refs.graph, [], {}, {responsive: true});
    if (this.traces) {
      this.updateGraph();
    }
  },

  watch: {
    traces(val, oldVal) {
      this.updateGraph();
    }
  }

});

// global data
let app = new Vue({

  el: '#root',

  mounted() {
    Plotly.d3.csv('https://raw.githubusercontent.com/aatishb/indiatestpositivitydata/main/statedata.csv', data => {

      //this.lastUpdated = data.slice(-1)[0]['Date'];

      let [y, m, d] = data.slice(-1)[0]['Date'].split('-');
      this.lastUpdated = new Date(y,m - 1,d);

      let recentData = [];

      for (let state of this.states) {
        let stateData = data.filter(e => e['State'] == state.toUpperCase());
        if (stateData.length > 7) {
          let recentTPR = stateData.slice(-1)[0]['Test Positivity Rate'];
          let pastTPR = stateData.slice(-8,-7)[0]['Test Positivity Rate'];
          recentData.push({
            state: state,
            positivityrate: recentTPR,
            change: recentTPR - pastTPR
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
      return this.recentData.filter(e => e.positivityrate > 0.05);
    },

    statesWithLowPositivity() {
      return this.recentData.filter(e => e.positivityrate <= 0.05);
    },

  },

  data: {
    states: ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
    allData: [],
    recentData: [],
    lastUpdated: new Date()
  }

});
