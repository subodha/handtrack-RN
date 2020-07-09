import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
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
const previewHeight = 500;

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
    //const tensorDims = {height: 300, width: 400 };
    const tensorDims = {height: 500, width: 290 };

    const scale = {
      //height: styles.camera.height / tensorDims.height,
      //width: styles.camera.width / tensorDims.width,
      height: 1,
      width: 1,
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
    const {hands, scale, textureDims} = this.state;
    
    return hands.map((hand, i) => {
      // const {topLeft, bottomRight, probability} = face;
      // Render landmarks 
      

      //console.log(hand);
      const rate = 1;
      
       return <>
          <Svg height={previewHeight} width={previewWidth} viewBox={`0 0 290 500`} style={{ position: 'absolute', top: 100, left: 80, opacity: 0.5}}>
            <Circle cx={hand.landmarks[0][0] * rate} cy={hand.landmarks[0][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[1][0] * rate} cy={hand.landmarks[1][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[2][0] * rate} cy={hand.landmarks[2][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[3][0] * rate} cy={hand.landmarks[3][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[4][0] * rate} cy={hand.landmarks[4][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[5][0] * rate} cy={hand.landmarks[5][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[6][0] * rate} cy={hand.landmarks[6][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[7][0] * rate} cy={hand.landmarks[7][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[8][0] * rate} cy={hand.landmarks[8][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[9][0] * rate} cy={hand.landmarks[9][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[10][0] * rate} cy={hand.landmarks[10][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[11][0] * rate} cy={hand.landmarks[11][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[12][0] * rate} cy={hand.landmarks[12][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[13][0] * rate} cy={hand.landmarks[13][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[14][0] * rate} cy={hand.landmarks[14][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[15][0] * rate} cy={hand.landmarks[15][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[16][0] * rate} cy={hand.landmarks[16][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[17][0] * rate} cy={hand.landmarks[17][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[18][0] * rate} cy={hand.landmarks[18][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[19][0] * rate} cy={hand.landmarks[19][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            <Circle cx={hand.landmarks[20][0] * rate} cy={hand.landmarks[20][1] * rate} r="5" stroke="blue" strokeWidth="2.5" fill="green"/>
            {/* indexFinger */}
            <Line x1={hand.annotations.indexFinger[0][0]} y1={hand.annotations.indexFinger[0][0]} x2={hand.annotations.indexFinger[0][1]} y2={hand.annotations.indexFinger[0][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.indexFinger[1][0]} y1={hand.annotations.indexFinger[1][0]} x2={hand.annotations.indexFinger[1][1]} y2={hand.annotations.indexFinger[1][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.indexFinger[2][0]} y1={hand.annotations.indexFinger[2][0]} x2={hand.annotations.indexFinger[2][1]} y2={hand.annotations.indexFinger[2][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.indexFinger[3][0]} y1={hand.annotations.indexFinger[3][0]} x2={hand.annotations.indexFinger[3][1]} y2={hand.annotations.indexFinger[3][1]} style={{stroke:'green', strokeWidth:2}} />
            {/* middleFinger */}
            <Line x1={hand.annotations.middleFinger[0][0]} y1={hand.annotations.middleFinger[0][0]} x2={hand.annotations.middleFinger[0][1]} y2={hand.annotations.middleFinger[0][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.middleFinger[1][0]} y1={hand.annotations.middleFinger[1][0]} x2={hand.annotations.middleFinger[1][1]} y2={hand.annotations.middleFinger[1][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.middleFinger[2][0]} y1={hand.annotations.middleFinger[2][0]} x2={hand.annotations.middleFinger[2][1]} y2={hand.annotations.middleFinger[2][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.middleFinger[3][0]} y1={hand.annotations.middleFinger[3][0]} x2={hand.annotations.middleFinger[3][1]} y2={hand.annotations.middleFinger[3][1]} style={{stroke:'green', strokeWidth:2}} />
            {/* pinky */}
            <Line x1={hand.annotations.pinky[0][0]} y1={hand.annotations.pinky[0][0]} x2={hand.annotations.pinky[0][1]} y2={hand.annotations.pinky[0][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.pinky[1][0]} y1={hand.annotations.pinky[1][0]} x2={hand.annotations.pinky[1][1]} y2={hand.annotations.pinky[1][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.pinky[2][0]} y1={hand.annotations.pinky[2][0]} x2={hand.annotations.pinky[2][1]} y2={hand.annotations.pinky[2][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.pinky[3][0]} y1={hand.annotations.pinky[3][0]} x2={hand.annotations.pinky[3][1]} y2={hand.annotations.pinky[3][1]} style={{stroke:'green', strokeWidth:2}} />
            {/* ringFinger */}
            <Line x1={hand.annotations.ringFinger[0][0]} y1={hand.annotations.ringFinger[0][0]} x2={hand.annotations.ringFinger[0][1]} y2={hand.annotations.ringFinger[0][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.ringFinger[1][0]} y1={hand.annotations.ringFinger[1][0]} x2={hand.annotations.ringFinger[1][1]} y2={hand.annotations.ringFinger[1][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.ringFinger[2][0]} y1={hand.annotations.ringFinger[2][0]} x2={hand.annotations.ringFinger[2][1]} y2={hand.annotations.ringFinger[2][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.ringFinger[3][0]} y1={hand.annotations.ringFinger[3][0]} x2={hand.annotations.ringFinger[3][1]} y2={hand.annotations.ringFinger[3][1]} style={{stroke:'green', strokeWidth:2}} />
            {/* thumb */}
            <Line x1={hand.annotations.thumb[0][0]} y1={hand.annotations.thumb[0][0]} x2={hand.annotations.thumb[0][1]} y2={hand.annotations.thumb[0][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.thumb[1][0]} y1={hand.annotations.thumb[1][0]} x2={hand.annotations.thumb[1][1]} y2={hand.annotations.thumb[1][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.thumb[2][0]} y1={hand.annotations.thumb[2][0]} x2={hand.annotations.thumb[2][1]} y2={hand.annotations.thumb[2][1]} style={{stroke:'green', strokeWidth:2}} />
            <Line x1={hand.annotations.thumb[3][0]} y1={hand.annotations.thumb[3][0]} x2={hand.annotations.thumb[3][1]} y2={hand.annotations.thumb[3][1]} style={{stroke:'green', strokeWidth:2}} />
            
          {/* {console.log(hand.landmarks[0])} */}
            {/* {hand.landmarks.map(landmark => {
              <Circle cx={landmark[0]} cy={landmark[1]} r="1" stroke="blue" strokeWidth="2.5" fill="green"/>
            })} */}
          </Svg>
          <Text style={styles.textContainer} key={`faceInfo${i}`}>
            is hand probability: {hand.handInViewConfidence} | 
          </Text>
          </>
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
    height: '90%',
    backgroundColor: '#fff',
  },
  textContainer: {
    paddingLeft: 40
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
