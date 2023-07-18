---
title: webgl-coordinate
categories:
  - programming
date: 2023-07-18 13:48:42
tags:
  - webgl
---
# WebGL coordinates tips
1. Fragment shader only accepts a normalized and **left-handed** cube. Each axis begins from `-1` to `1` and any contents out of it will be cut out. As to lefted-handed, it means positive z axis points into the screen and points with bigger z will be in the back of points with smaller z. 
    ![cube](../images/norm_cube.png)

    So it is the vertex shader's responsibility to output *positions* within this normalized cube with any way.
    
2. We(vertex shader) usually take 4 steps to output this normalized cube:
    
    1. modeling in **local coordinate system**
    2. transformation with *model matrix*(`translate(),rotate(),scale()`) to get positions in **world coordinates**
    3. set up the camara with *view matrix*(`lookAt()`) to get positions in **view coordinate**
    4. projection(orthogonal or perspective) with *projection matrix*(`setOrtho(), setPerspective()`) to get positions in **clipping coordinate**(i.e. ***the normalized cube***)
    
        For step 1 ~ step 3, we use *right-handed coordinate* in general. In step 4, positions are transformed from right-handed to left-handed clipping coordinate. From now on, WebGL takes in charge. It maps positions in the normalized cube(positions out of it will be cut out) to the cavans, using z-value(usually be re-mapped from (-1, 1) to (0, 1), i.e. 0 represents the device's screen) for depth test:
        
        ![final display](../images/final_step.png)
