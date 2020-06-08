import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as handpose from '@tensorflow-models/handpose';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import {cameraWithTensors, fetch, decodeJpeg} from '@tensorflow/tfjs-react-native';

const TensorCamera = cameraWithTensors(Camera);
const AUTORENDER = true;
let frameCount = 0;
const makePredictionEveryNFrames = 3;

// Position of camera preview.
const previewLeft = 40;
const previewTop = 40;
const previewWidth = 290;
const previewHeight = 440;


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTfReady: false,
      cameraType: Camera.Constants.Type.front,
      lastShape: 'none',
      hands: [],
      mobilenetClasses: [],
    };

    this.handleImageTensorReady = this.handleImageTensorReady.bind(this);
  }

  async loadHandposeModel() {
    return await handpose.load();
  }

  async componentDidMount() {    
    await tf.ready();
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    let textureDims;
    if (Platform.OS === 'ios') {
      textureDims = { height: 1920,width: 1080 };
    } else {
      textureDims = { height: 1200, width: 1600 };
    }
    const tensorDims = {height: 300, width: 400 };

    const scale = {
      height: styles.camera.height / tensorDims.height,
      width: styles.camera.width / tensorDims.width,
    }

    const handposeModel = await this.loadHandposeModel();

    this.setState({
      isTfReady: true,
      permissionsStatus: status,
      handDetector: handposeModel,
      textureDims,
      tensorDims,
      scale,

    });
  }

  async handleImageTensorReady(images) {
    const loop = async () => {         
      if (this.state.handDetector != null) {                
        if(frameCount % makePredictionEveryNFrames === 0) {
          const imageTensor = images.next().value;
          const returnTensors = false;          
          const hands = await this.state.handDetector.estimateHands(
            imageTensor, returnTensors);
          tf.dispose(imageTensor);          
          this.setState({hands});
          //console.log(hands);
        }
      }
      frameCount += 1;
      frameCount = frameCount % makePredictionEveryNFrames;
      this.rafID = requestAnimationFrame(loop);
    };

    loop();
  }

  componentWillUnmount() {
    if(this.rafID) {
      cancelAnimationFrame(this.rafID);
    }
  }

  renderInitialization() {
    return (
      <View style={styles.container}>
        <Text>Initializaing TensorFlow.js!</Text>
        <Text>tf.version {tf.version_core}</Text>
        <Text>tf.backend {tf.getBackend()}</Text>        
      </View>
    );
  }

  renderHandsDebugInfo() {
    const {hands} = this.state;
    
    return hands.map((hand, i) => {
    console.log(hand);
    //   const {topLeft, bottomRight, probability} = face;
      
       return <Text style={styles.textContainer} key={`faceInfo${i}`}>
         is hand probability: {hand.handInViewConfidence} | 
         {
         /* 
         TL: [{topLeft[0].toFixed(1)}, {topLeft[1].toFixed(1)}] |
          BR: [{bottomRight[0].toFixed(1)}, {bottomRight[1].toFixed(1)}]
        */
        }
         </Text>
   });
  }

  renderMain() {
    const {textureDims, hands, tensorDims} = this.state;

    const camView = <View style={styles.cameraContainer}>
      <TensorCamera
        // Standard Camera props
        style={styles.camera}
        type={this.state.cameraType}
        zoom={0}
        // tensor related props
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={tensorDims.height}
        resizeWidth={tensorDims.width}
        resizeDepth={3}
        onReady={this.handleImageTensorReady}
        autorender={AUTORENDER}
      />      
    </View>;

   
    return (
      <View>
        {camView}
        <Text style={styles.textContainer}>tf.version {tf.version_core}</Text>
        <Text style={styles.textContainer}>tf.backend {tf.getBackend()}</Text>
        {/* <Text style={styles.textContainer}># hands detected: {hands.length}</Text> */}
        {/* {this.renderBoundingBoxes()} */}
        {this.renderHandsDebugInfo()}
      </View>
    );
  }

  renderBoundingBoxes() {
    const {hands, scale} = this.state;
    // On android the bounding boxes need to be mirrored horizontally
    const flipHorizontal = Platform.OS === 'ios' ? false : true;
    return hands.map((hand, i) => {
      const {topLeft, bottomRight} = face;
      const bbLeft = (topLeft[0] * scale.width);      
      const boxStyle = Object.assign({}, styles.bbox, {
        left: flipHorizontal ? (previewWidth - bbLeft) - previewLeft :  bbLeft + previewLeft,
        top: (topLeft[1] * scale.height) + 20,
        width: (bottomRight[0] - topLeft[0]) * scale.width,
        height: (bottomRight[1] - topLeft[1]) * scale.height,
      });

      return <View style={boxStyle} key={`face${i}`}></View>      
    1});
  }

  render() {
    const {isTfReady} = this.state;
    return (
      isTfReady ? this.renderMain() : this.renderInitialization()
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cameraContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100%',
    height: '85%',
    backgroundColor: '#fff',
  },
  textContainer: {
    paddingLeft: 30
  },
  camera : {
    position:'absolute',
    left: previewLeft,
    top: previewTop,
    width: previewWidth,
    height: previewHeight,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  },
  bbox: {
    position:'absolute',
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 0,
  },
});
