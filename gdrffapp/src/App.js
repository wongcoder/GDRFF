import React, { Component } from 'react';
import './App.css';
import 'ol/ol.css'
import { Map, View } from 'ol'
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'
import OSM from 'ol/source/OSM' // imports open street map as a view
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'
import {Circle as CircleStyle, Icon, Style, Fill, Stroke} from 'ol/style.js';
import { circular as circularPolygon } from 'ol/geom/Polygon.js'
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import image from './data/icon.png'
import {easeOut} from 'ol/easing.js';
import {unByKey} from 'ol/Observable.js';
import TextFields from './formcomponent'
import servername from './const'
import Button from '@material-ui/core/Button';


const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
});

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
    information: "rffMarker1",
    geometry: new Point(fromLonLat(this.state.rff1)),
  })
  rffMarker2 = new Feature({
    // type: 'icon',
    information: "rffMarker2",
    geometry: new Point(fromLonLat(this.state.rff2)),
  })
  rffMarker3 = new Feature({
    // type: 'icon',
    information: "rffMarker3",
    geometry: new Point(fromLonLat(this.state.rff3)),
  })
  
  imageStyle = new Style({
    image: new Icon({
      src: image,
      size: [1000, 1000],
      // the scale factor
      scale: 0.05
    })
  })

  iconStyle = this.imageStyle

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
      this.vectorAlertLayer,
      this.vectorLayer,
    ],
    view: new View({
      center: fromLonLat(this.state.center),
      zoom: 10
    })
  })
  
  // Study arrow syntax and callbacks if you don't understand the fetch request below
  getJsonFromServer() {
    fetch(`${servername}/getjson`)
    .then(res => res.json())
    .then(data=>{
      if(data != null) {
        for(let element of data) {
          if(element.jsonstring.df != null) {
            if(element.jsonstring.df.lob != null) {
              // Parse the json points to receive json data.
              let stringConverter = element.jsonstring.df.lob
              let floatStringArray = stringConverter.split(',')
              let latitude = parseFloat(floatStringArray[0])
              let longitude = parseFloat(floatStringArray[1])
              let longLat = fromLonLat([longitude, latitude])
  
              // Create a new feature on OpenLayers
              let newFeature = new Feature({
                geometry: new Point(longLat),
                information: element.jsonstring
              })
              // newFeature.setStyle(this.iconStyle)
              let newArray = this.state.features
              newArray.push(newFeature)
              this.setState({
                features: newArray
              })
              console.log("this is the json string", element.jsonstring)
              console.log(newFeature)
              console.log(newFeature.getProperties())
              this.vectorAlerts.addFeature(newFeature)
            }
            else console.log('lob was null. JSON must be broken:', element)
          }
          else console.log("data.df was empty. Consider fixing json string?", element)
        }
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
    let radius = 20000
    let edgeCount = 64
    let rffMarkerRing1 = circularPolygon(this.state.rff1, radius, edgeCount)
    let rffMarkerRing2 = circularPolygon(this.state.rff2, radius, edgeCount)
    let rffMarkerRing3 = circularPolygon(this.state.rff3, radius, edgeCount)
    let newFeature1 = rffMarkerRing1.clone().transform('EPSG:4326', 'EPSG:3857')
    let newFeature2 = rffMarkerRing2.clone().transform('EPSG:4326', 'EPSG:3857')
    let newFeature3 = rffMarkerRing3.clone().transform('EPSG:4326', 'EPSG:3857')

    this.vectorAlertLayer.getSource().addFeature(new Feature(newFeature1))
    this.vectorAlertLayer.getSource().addFeature(new Feature(newFeature2))
    this.vectorAlertLayer.getSource().addFeature(new Feature(newFeature3))
    this.getJsonFromServer()
    // console.log('This is the servername', servername)
  }

  render() {
    const { classes } = this.props 
    return (
      <div className="App">
        <div id="map" className="map"></div>
        <pre id="info">{this.state.currentFeatureText}</pre>
        <Button onClick={()=>this.getJsonFromServer()}>Refresh Data</Button>
        <TextFields></TextFields>

      </div>
    )
  }
}

export default App;
