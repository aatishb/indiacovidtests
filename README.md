---
permalink: /about.html
---

**[India Test Tracker](https://aatishb.com/indiatesttracker/)** is an interactive website that lists & visualizes COVID testing data provided by the Indian Government.

# Data Source
The state data is provided by [covid19india.org](https://api.covid19india.org/) and the district data is provided by the Indian [Ministry of Health](https://www.mohfw.gov.in/).

If you're looking for the raw data behind this visualization, head over to the [data repository](https://github.com/aatishb/indiatestpositivitydata).

# Credits & License
India Test Tracker is developed by [Aatish Bhatia](https://aatishb.com/). The code is available on [GitHub](https://github.com/aatishb/indiatesttracker).

With thanks to Shekhar Bhatia, Upasana Roy, Arkarup Banerjee, Prasun Mahanti, Manu Prakash, Harsha Devulapalli, and [IndiaCovidSOS](https://www.indiacovidsos.org/) members for helpful feedback & ideas.

The charts & graphs build on starter code from the [D3.js Graph Gallery](https://www.d3-graph-gallery.com/index.html) by Yan Holtz.

The map visualization builds on [this map](https://bl.ocks.org/officeofjane/d33d6ef783993b60b15a3fe0f8da1481) by Jane Pong.

This website uses the following javascript libraries:

- [d3.js](https://d3js.org/) for graphing
- [vue.js](https://vuejs.org/) for interactivity
- [turf.js](https://turfjs.org/) for analyzing map data
- [d3.geo2rect](https://github.com/sebastian-meier/d3.geo2rect) for morphing between the map & tile grid
- [d3-legend](https://d3-legend.susielu.com/) for the map legend

All code in this repository with no prior license is published under the open source [MIT License](https://github.com/aatishb/indiatesttracker/blob/main/LICENSE).
