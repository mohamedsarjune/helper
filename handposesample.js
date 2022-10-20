// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load handpose with triangle DONE
// 6. Detect function DONE
// 7. 3D points Done
// 8. show models

import React, { Suspense, useRef, useState, useEffect } from "react";
import model from './model.glb';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import '@tensorflow/tfjs-backend-webgl';
import Webcam from "react-webcam";
import "./App.css";
import { model3dPoints } from "./util";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

function useWindowSize() {
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); 
  return windowSize;
}
const Scene = (props) => {
  console.log("sarjune")
  return (
    <>
      <Canvas 
      style={{
        position: "absolute",
        marginLeft: "auto",
        marginRight: "auto",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        textAlign: "center",
        zindex: 100,
      }}id="sar">
        <Suspense fallback={null}>
          {/* Normal directional light */}
          <ambientLight color="white" intensity={0.5} />
          <directionalLight color="white" intensity={1} />
          <Model id="arary" position={props.position}></Model>
        </Suspense>
      </Canvas>
    </>
  );
};

const Model = (props) => {
  console.log("props",props.position)
  const [rotation, setRotation] = useState([0, 0, 1.5]);
  const gltf = useLoader(GLTFLoader, model)

  return (
    <>

      <primitive key={model} position={props.position} object={gltf.scene} scale={4.5} rotation={rotation} />
    </>
  );
};


function Handpose() {
  let camera;
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const ThreeRef = () => {
    camera = useThree((state) => state.camera)
  };
  const size = useWindowSize();
  console.log("size",size)
  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net)
    }, 500);
  };
  const [showModel, setShowModel] = useState(false);
  const [position, setPosition] = useState([]);

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      console.log(hand);

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      const pos = model3dPoints(hand, ctx, setShowModel, camera,videoWidth,videoHeight);
      if (!isNaN(pos?.x)) {
        setPosition([pos.x, pos.y, pos.z]);
        setShowModel(true);
      } else {
        setShowModel(false);
      }
      console.log(pos)
    }
  };

  runHandpose();

  return (
    <>
      <Webcam
        id="videoElement"
        audio={false}
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          textAlign: "center",
          zindex: 9,
          width: size.width,
          height: size.height,
        }}
        screenshotFormat="image/jpeg"
        width={size.width}
        height={size.height}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          textAlign: "center",
          zindex: 9,
          width: size.width,
          height: size.height,
        }}
      />
      <Canvas
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          textAlign: "center",
          zindex: 9,
          width: size.width,
          height: size.height,
        }}
      > <ThreeRef />
      </Canvas >
      {showModel && <Scene style={{
        textAlign: "center",
        zindex: 100
      }} id="sarjune"
      position={position}
        ></Scene>}
    </>
  );
}

export default Handpose;
