**ThreeContext** provide a WebGL environment ready to use, leveraging Threejs and adding some features to it. The [example file](https://github.com/jonathanlurie/threecontext/blob/master/examples/index.html) (see [live demo](http://me.jonathanlurie.fr/threecontext/examples/)) shows how to use the *umd* bundled version, though it is mostly for importing into a *ES* project and use as a base for your project.

## Installation
`npm install --save threecontext`

## Usage
Again, this is made to import in your project. To be instantiated, ThreeContext needs a `<div>` object. In addition, it can also take an `options` object:

```javascript
import ThreeContext from 'threecontext'

// ...
// The div you want to display your WebGL context in
let myDiv = document.getElementById('myDiv3D')

// The option object, you don't have to provide this one
let options = {
  webgl2: true,            // enable WebGL2 if `true` (default: false)
  embedLight: false,       // embeds the light into the camera if true (default: false)
  antialias: false,        // enables antialias if true (default: true)
  showAxisHelper: true,    // shows the axis helper at (0, 0, 0) when true (default: false)
  axisHelperSize: 100,     // length of the the 3 axes of the helper (default: 100)
  controlType: 'orbit',    // 'orbit': locked poles or 'trackball': free rotations (default: 'trackball')
  cameraPosition: {x: 0, y:0, z: 1000}, // inits position of the camera (default: {x: 0, y: 0, z: 100})
  cameraLookAt: {x: 0, y: 0, z: 0},     // inits position to look at (default: {x: 0, y: 0, z: 0})
  raycastOnDoubleClick: true,           // performs a raycast when double clicking (default: `true`).
                                        // If some object from the scene are raycasted, the event 'raycast'
                                        // is emitted with the list of intersected object from the scene as argument.
}

// Instanciating the context
let myThreeCtx = new ThreeContext(myDiv, options)

// Optionally, you can show a torus knot, simply to make sure your context is properly setup
myThreeCtx.addSampleShape()
```

Starting from here, few convenience methods are available to get the `THREE.Scene` or any object instantiated by *ThreeContext*. You will find the [full documentation here](http://me.jonathanlurie.fr/threecontext/doc/).

## Events
For the moment, a single event can be emitted by an instance of ThreeContext: *raycast*. In this context, *casting a ray* means we perform an intersection between the mouse pointer and an object (and recursively, with this object's children). Let's see how this work:

``` javascript

// ...


myThreeCtx.on('raycast', function(hits){

  // display in console some info about each hit
  hits.forEach(hit => {
    console.log(`Distance: ${hit.distance}`)
    console.log(`At position [${hit.point.x}, ${hit.point.y}, ${hit.point.z}]`)
    console.log('Object:', hit.object)
  })
  
})
```
