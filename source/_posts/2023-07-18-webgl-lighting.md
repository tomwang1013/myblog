---
title: webgl-lighting
categories:
  - programming
date: 2023-07-18 15:38:47
tags:
  - webgl
---

# light sources

  ## directional light

  Light is coming uniformly from one direction independently of the object position. The object's color depends on 3 parts:
  - light color
  - light direction
  - surface direction(`normal`)
  - object's original color

  ![theta](../images/directional_light.png)

  let `theta` be the angle of `reverse of light direction` and `surface direction`, then:

  ```
  reflection color = light color x original color x cos(theta)
  ```

  ## point light

  Same as directional light with only one difference: the light direction is on longer fixed. It points from light's position to object's position. So we need to calculate each vertex's light direction(usually do it in `fragment shader`). 

  ![point light](../images/point-light.png)

  ## ambient light

  In reality, we can see objects without point light or sunshine. That's what ambient light do. Calculation of ambient reflection color is very simple:

  ```
  reflection color = light color x original color
  ```

  We see the same color from all directions.

  
  ## spot light

  Point light goes in all directions from that point while spot light has a limit range. Within that range we light the same as point light otherwise we don't light at all. We set a specific direction for the spot light with a angle range symmetrically distributing around it. From this angle limit, we compute a `dot` limit.

  ![spot light](../images/spot-light.png)

  ```glsl
  dotFromDirection = dot(surfaceToLight, -lightDirection)
  if (dotFromDirection >= limitInDotSpace) {
    // do the lighting like point light
  }
  ```

# reflection types
  ## diffuse reflection

  For rough surfaces, the light reflects uniformly in all directions, i.e. we see the same color from all directions. This is `diffuse reflection` which is used in `directional light` and `point light`.

  ## specular reflection

  As opposed to diffuse reflection, if the surface is shiny like a mirror, it looks brightest from a special direction:

  ![specular reflection](../images/specular-highlights.png)

  The computation of specular reflection color is as follows:

  ![specular computation](../images/specular-compute.png)

  ```glsl
  float specular = dot(normal, halfVector);
  gl_FragColor.rgb += specular * specular_color;
  ```
