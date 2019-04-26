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
import {easeOut} from 'ol/easing.js';
import {unByKey} from 'ol/Observable.js';


class App extends Component {
  state = {
    rff1: [-87.921045, 30.238719],
    rff2: [-87.899646, 30.562203],
    rff3: [-88.107891, 30.418700],
    center: [-87.921045, 30.458719],
    features: [],
    currentValue: ''
  }

  rffMarker1 = new Feature({
    // type: 'icon',
    information: "what the fuck",
    geometry: new Point(fromLonLat(this.state.rff1)),
  })
  rffMarker2 = new Feature({
    // type: 'icon',
    information: "what the fuck",
    geometry: new Point(fromLonLat(this.state.rff2)),
  })
  rffMarker3 = new Feature({
    // type: 'icon',
    information: "what the fuck",
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

  vectorAlerts = new VectorSource({
    features: this.state.features
  })
  vectorAlertLayer = new VectorLayer({
    source:this.vectorAlerts
  })

  olmap = new Map({
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      this.vectorLayer,
      this.vectorAlertLayer,
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
            // Parse the json points to receive json data.
            let stringConverter = data.jsonstring.df.lob
            let floatStringArray = stringConverter.split(',')
            let latitude = parseFloat(floatStringArray[0])
            let longitude = parseFloat(floatStringArray[1])
            let longLat = fromLonLat([longitude, latitude])

            // Create a new feature on OpenLayers
            let newFeature = new Feature({
              geometry: new Point(longLat),
              information: data.jsonstring
            })
            // newFeature.setStyle(this.iconStyle)
            let newArray = this.state.features
            newArray.push(newFeature)
            this.setState({
              features: newArray
            })
            console.log(newFeature)
            console.log(newFeature.getProperties())
            this.vectorAlerts.addFeature(newFeature)
          }
          else console.log('lob was null. JSON must be broken:', data)
        }
        else console.log("data.df was empty. Consider fixing json string?", data)
      }
      else console.log("data had returned null")
    })
  }

  showInfo(event) {
    var features = this.olmap.getFeaturesAtPixel(event.pixel);
    if (!features) {
      this.setState({
        currentFeatureText: ''
      })
      return;
    }
    var properties = features[0].getProperties();
    console.log(properties.information)
    this.setState({
      currentFeatureText: JSON.stringify(properties.information, null, 2)
    })
    console.log(this.state.currentFeatureText)
  }

  flash(feature) {
    var start = new Date().getTime();
    var listenerKey = this.olmap.on('postcompose', animate);

    function animate(event) {
      let duration = 3000
      var vectorContext = event.vectorContext;
      var frameState = event.frameState;
      var flashGeom = feature.getGeometry().clone();
      var elapsed = frameState.time - start;
      var elapsedRatio = elapsed / duration;
      // radius will be 5 at start and 30 at end.
      var radius = easeOut(elapsedRatio) * 25 + 5;
      var opacity = easeOut(1 - elapsedRatio);

      var style = new Style({
        image: new CircleStyle({
          radius: radius,
          stroke: new Stroke({
            color: 'rgba(255, 0, 0, ' + opacity + ')',
            width: 0.25 + opacity
          })
        })
      });

      vectorContext.setStyle(style);
      vectorContext.drawGeometry(flashGeom);
      if (elapsed > duration) {
        unByKey(listenerKey);
        return;
      }
    }
  }
  componentDidMount() {
    this.rffMarker1.setStyle(this.iconStyle)
    this.rffMarker2.setStyle(this.iconStyle)
    this.rffMarker3.setStyle(this.iconStyle)
    console.log(this.vectorLayer.getSource().getFeatures())
    this.olmap.setTarget('map')
    this.olmap.renderSync()
    this.olmap.on('click', this.showInfo.bind(this))
    // this.vectorAlerts.on('addfeature', this.flash.bind(this))
    this.getJsonFromServer()
  }

  render() {
    return (
      <div className="App">
        <div id="map" className="map">
          <pre id="info">
            {this.state.currentFeatureText}
          </pre>
        </div>
      </div>
    );
  }
}

export default App;
