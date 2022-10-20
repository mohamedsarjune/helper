import * as THREE from 'three'
// Points for fingers
const fingerJoints = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
  };
  
  // Infinity Gauntlet Style
  const style = {
    0: { color: "yellow", size: 15 },
    1: { color: "gold", size: 6 },
    2: { color: "green", size: 10 },
    3: { color: "gold", size: 6 },
    4: { color: "gold", size: 6 },
    5: { color: "purple", size: 10 },
    6: { color: "gold", size: 6 },
    7: { color: "gold", size: 6 },
    8: { color: "gold", size: 6 },
    9: { color: "blue", size: 10 },
    10: { color: "gold", size: 6 },
    11: { color: "gold", size: 6 },
    12: { color: "gold", size: 6 },
    13: { color: "red", size: 10 },
    14: { color: "gold", size: 6 },
    15: { color: "gold", size: 6 },
    16: { color: "gold", size: 6 },
    17: { color: "orange", size: 10 },
    18: { color: "gold", size: 6 },
    19: { color: "gold", size: 6 },
    20: { color: "gold", size: 6 },
  };
  
  // Drawing function
  export const drawHand = (predictions, ctx) => {
    // Check if we have predictions
    if (predictions.length > 0) {
      // Loop through each prediction
      predictions.forEach((prediction) => {
        // Grab landmarks
        const landmarks = prediction.landmarks;
  
        // Loop through fingers
        for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
          let finger = Object.keys(fingerJoints)[j];
          //  Loop through pairs of joints
          for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
            // Get pairs of joints
            const firstJointIndex = fingerJoints[finger][k];
            const secondJointIndex = fingerJoints[finger][k + 1];
  
            // Draw path
            ctx.beginPath();
            ctx.moveTo(
              landmarks[firstJointIndex][0],
              landmarks[firstJointIndex][1]
            );
            ctx.lineTo(
              landmarks[secondJointIndex][0],
              landmarks[secondJointIndex][1]
            );
            ctx.strokeStyle = "plum";
            ctx.lineWidth = 4;
            ctx.stroke();
          }
        }
  
        // Loop through landmarks and draw em
        for (let i = 0; i < landmarks.length; i++) {
          // Get x point
          const x = landmarks[i][0];
          // Get y point
          const y = landmarks[i][1];
          // Start drawing
          ctx.beginPath();
          ctx.arc(x, y, style[i]["size"], 0, 3 * Math.PI);
  
          // Set line color
          ctx.fillStyle = style[i]["color"];
          ctx.fill();
        }
      });
    }
  };

  export const drawRect = (detections, ctx) =>{
    // Loop through each prediction
    detections.forEach(prediction => {
  
      // Extract boxes and classes
      const [x, y, width, height] = prediction['bbox']; 
      const text = prediction['class']; 
  
      // Set styling
      const color = Math.floor(Math.random()*16777215).toString(16);
      ctx.strokeStyle = '#' + color
      ctx.font = '18px Arial';
  
      // Draw rectangles and text
      ctx.beginPath();   
      ctx.fillStyle = '#' + color
      ctx.fillText(text, x, y);
      ctx.rect(x, y, width, height); 
      ctx.stroke();
    });
  }


  export const cropImage = (detections, ctx,webcamRef,canvasRef) => {
    const canvasUrl = webcamRef.current.getScreenshot();
    // Create an anchor, and set the href value to our data URL
    const createEl = document.getElementById('cardCaptureImageMobile')
    createEl.src = canvasUrl;
      console.debug('Sarjune Canvas', canvasUrl);
      detections.forEach(prediction => {
          const destCanvas = document.createElement('canvas');
                 // Extract boxes and classes
        const [x, y, width, height] = prediction['bbox']; 
        const text = prediction['class']; 
        // Set styling
        ctx.drawImage(
          createEl,
          x,y,width,height,
          0,0,width,height
        );
          console.debug('Sarjune dataCanvas', ctx);
          document.getElementById('cardCaptureImageMobile').src = canvasRef.toDataURL();
          console.debug('Sarjune dataCanvas', canvasRef.toDataURL());
      });

      }

      export const model3dPoints = (predictions, ctx,callBack,camera,videoWidth,videoHeight) => {
        // Check if we have predictions
        let a ,b,x1,x2;
        if (predictions.length > 0) {
          // Loop through each prediction
          predictions.forEach((prediction) => {
            // Grab landmarks
            const annotations = prediction?.annotations || {};
            [a, b] = annotations?.indexFinger[0] || [];
            const [p, q] = annotations?.pinky[0] || [];
            const [x, y] = annotations?.palmBase[0] || [];

            const o = p -a;
            console.log(o);

            x1 = (x+p+a) /3;
            x2 = (y+q+b) /3;
            console.log("final",x1,x2); 
            ctx.beginPath();
            ctx.arc(a, b,10, 0, 3 * Math.PI);
          ctx.fillStyle = "orange";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 3 * Math.PI);
          ctx.fillStyle = "yellow";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p, q, 10, 0, 3 * Math.PI);
          ctx.fillStyle = "white";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x1, x2, 15, 0, 3 * Math.PI);
          ctx.fillStyle = "green";
          ctx.fill();
          });
        }
        if(x1>0) {
        return plot3dPoints(camera,x1,x2,videoWidth,videoHeight);
        } else {
          return {}
        }
      };

      const plot3dPoints = (camera,x,y,videoWidth,videoHeight) => {
        // camera passed is not working
        var vec = new THREE.Vector3(); 
        var pos = new THREE.Vector3(); 

        vec.set(
            ( x/ videoWidth ) * 2 - 0.6,
            - ( y / videoHeight ) * 2 + 1,
            0.5 );
        vec.unproject( camera );

        vec.sub( camera.position ).normalize();

        var distance = - camera.position.z / vec.z;

        pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );
        return vec;
      }
