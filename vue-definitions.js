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
  },

  methods: {
  },

  computed: {
  },

  data: {
  }

});
