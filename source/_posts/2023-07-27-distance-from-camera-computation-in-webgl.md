---
title: distance-from-camera-computation-in-webgl
categories:
  - programming
date: 2023-07-27 07:15:53
tags:
  - webgl
---

When implementing fog in webgl, the key point is how to calculate the distance from the object to the eye/camera. It depends on whether you want precise or approximate value for it.

1. Precise value
   
   It is just the distance between 2 points(one is camera) in 3D space. We have several ways to express it:

   - Both the camera and object are in `world coordinate system`

     ```glsl
     // vertex shader
     attribute vec4 a_position;
     uniform mat4 u_modelMatrix; // model matrix for object
     uniform vec4 u_cameraWorldPos; // camera pos in WC
     vary float v_dist;
     void main() {
        gl_Position = u_mvpMatrix * a_position;
        v_dist = distance(u_modelMatrix * a_position, u_cameraWorldPos);
     }
     ```

   - The object is in `view coordinate system` whose origin is the camera
     
     ```glsl
     // vertex shader
     attribute vec4 a_position;
     uniform mat4 u_modelMatrix; // model matrix for object
     uniform mat4 u_viewMatrix;  // view matrix for object
     vary float v_dist;
     void main() {
        gl_Position = u_mvpMatrix * a_position;

        vec4 viewPos = u_viewMatrix.u_modelMatrix * a_position;
        v_dist = length(viewPos.xyz);
     }
     ```

2. Approximate value

   We commonly use `z` value as the approximate value for the distance. We also have several ways to express it.

   - In `VC(view coordinate system)`

      ```glsl
      gl_Position = u_mvpMatrix * a_position;
      // z is negative in VC, the camera is looking in -z direction
      vec4 viewPos = u_viewMatrix.u_modelMatrix * a_position;
      v_dist = -viewPos.z;

      // OR if you review the perspective project matrix, 
      // you will find that the ultimate w value is just -z, so:
      v_dist = gl_Position.w;
      
      ```

    - In `window coordinate system`, `z` value is between 0 and 1 and we can just use it.

      ```glsl
      // fragment shader
      dist = gl_FragCoord.z;
      ```
      This is the cheapest one!