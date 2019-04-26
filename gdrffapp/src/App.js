import React, { Component } from 'react';
import './App.css';
import 'ol/ol.css'
import { Map, View } from 'ol'
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'
import OSM from 'ol/source/OSM' // imports open street map as a view
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'
import {Circle as CircleStyle, Icon, Style, Fill, Stroke} from 'ol/style.js';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import image from './data/icon.png'


class App extends Component {
  state = {
    rff1: [-87.921045, 30.238719],
    rff2: [-87.899646, 30.562203],
    rff3: [-88.107891, 30.418700],
    center: [-87.921045, 30.458719],
    features: [],
  }

  rffMarker1 = new Feature({
    // type: 'icon',
    geometry: new Point(fromLonLat(this.state.rff1)),
  })
  rffMarker2 = new Feature({
    // type: 'icon',
    geometry: new Point(fromLonLat(this.state.rff2)),
  })
  rffMarker3 = new Feature({
    // type: 'icon',
    geometry: new Point(fromLonLat(this.state.rff3)),
  })
  

  iconStyle = new Style({
    image: new Icon({
      src: image,
      size: [1000, 1000],
      // the scale factor
      scale: 0.05
    })
  })

  vectorSource = new VectorSource({
    features: [this.rffMarker1, this.rffMarker2, this.rffMarker3]
  })
  vectorLayer = new VectorLayer({
    source: this.vectorSource,
    renderBuffer: 200
  })

  olmap = new Map({
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      this.vectorLayer,
    ],
    view: new View({
      center: fromLonLat(this.state.center),
      zoom: 10
    })
  })
  
  // Study arrow syntax and callbacks if you don't understand the fetch request below
  getJsonFromServer() {
    fetch('http://ec2-18-220-62-10.us-east-2.compute.amazonaws.com:3000/getjson')
    .then(res => res.json())
    .then(data=>{
      if(data.jsonstring != null) {
        if(data.jsonstring.df != null) {
          if(data.jsonstring.df.lob != null) {
            let stringConverter = data.jsonstring.df.lob
            let floatStringArray = stringConverter.split(',')
            let latitude = parseFloat(floatStringArray[0])
            let longitude = parseFloat(floatStringArray[1])
            let longLat = fromLonLat([longitude, latitude])
            let newArray = this.state.features
            // newArray.append
            // this.setState({

            // })
            console.log(longLat)
          }
          else {
            console.log('lob was null. JSON must be broken:', data)
          }
        }
        else {
          console.log("data.df was empty. Consider fixing json string?", data)
        }
      }
      else {
        console.log("data had returned null")
      }
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.features != prevState.features) {

    }
  }
  componentDidMount() {
    this.rffMarker1.setStyle(this.iconStyle)
    this.rffMarker2.setStyle(this.iconStyle)
    this.rffMarker3.setStyle(this.iconStyle)
    console.log(this.vectorLayer.getSource().getFeatures())
    this.olmap.setTarget('map')
    this.olmap.renderSync()
    this.getJsonFromServer()
  }
  render() {
    
    return (
      <div className="App">
        <div id="map" className="map"></div>
      </div>
    );
  }
}

export default App;
