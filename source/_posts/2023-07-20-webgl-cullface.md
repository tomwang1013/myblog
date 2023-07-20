---
title: webgl-cullface
categories:
  - programming
date: 2023-07-20 11:04:07
tags:
  - webgl
---

Say we has a triangle as follows:
```
       v0
      /  \
     /    \
    v1————v2
```
And we pass it to webgl in the order of `(v0, v1, v2)`, i.e. `counter-clockwise(CCW)`.

Whether this triangle is drawn(rasterized) depends on 3 factors:

1. Whether the triangle is `front facing` or `back facing`

    To determine it, firstly we use the following formula to compute its area:

    ![compute area](../images/area-compute.png)

    `i⊕1` is `(i+1) mod n`. The interpretation of the sign of this value is controlled with:

    ```glsl
    void FrontFace( enum dir );
    ```
    Setting dir to CCW (corresponding to counter-clockwise orientation of the projected polygon in window coordinates) indicates that the sign of a should be reversed prior to use. Setting dir to CW (corresponding to clockwise orientation)uses the sign of a is as computed above. Front face determination requires one bit of state, and is *initially set to CCW*.

    If the sign of the area computed by equation 3.4 (including the possible reversal of this sign as indicated by the last call to `FrontFace`) is `positive`, the polygon is `front facing`; otherwise, it is back facing

2. Whether face culling is turned on or off

    This is controlled by `gl.enable/disable(gl.CULL_FACE)` which is disabled by default.

3. The mode of face culling

    If face culling is turned on, we can controll which face to cull by calling:

    ```glsl
    void CullFace( enum mode );
    ```

    mode is a symbolic constant: one of FRONT, BACK or FRONT_AND_BACK, which is BACK by default.

After all the above values are known, Front facing triangles are rasterized if either culling is disabled or the CullFace mode is BACK while back facing polygons are rasterized only if either culling is disabled or the CullFace mode is FRONT.