import * as THREE from 'three'
import TrackballControls from './thirdparty/TrackballControls'
import OrbitControls from './thirdparty/OrbitControls'
import EventManager from '@jonathanlurie/eventmanager'
import { getOption } from './Tools'


/**
 * ThreeContext creates a WebGL context using Threejs. It also handle mouse control with two possible logics (orbit or trackball)
 * An event can be associated to a ThreeContext instance: `raycast` with the method
 * `.on("raycast", function(hits){...})` where `hits` is the object list being raycasted.
 */
export class ThreeContext extends EventManager {
  /**
   * Constuctor
   * @param {DOMObject} div - the div object as a DOM element.
   * @param {Object} options - the options parameters
   * @param {boolean}   options.webgl2 - enable WebGL2 if `true` (default: `false`)
   * @param {boolean}   options.embedLight - embeds the light into the camera if `true` (default: `false`)
   * @param {boolean}   options.antialias - enables antialias if `true` (default: `true`)
   * @param {boolean}   options.showAxisHelper - show the axis helper at (0, 0, 0) when `true` (default: `false`)
   * @param {number}    options.axisHelperSize - length of the the 3 axes of the helper (default: `100`)
   * @param {Object}    options.cameraPosition - init position of the camera (default: `{x: 0, y: 0, z: 100}`)
   * @param {Object}    options.cameraLookAt - init position to look at (default: `{x: 0, y: 0, z: 0}`)
   * @param {string}    options.controlType - `'orbit'`: locked poles or `'trackball'`: free rotations (default: `'trackball'`)
   * @param {boolean}   options.raycastOnDoubleClick - perform a raycast when double clicking (default: `true`). If some object from the scene are raycasted, the event 'raycast' is emitted with the list of intersected object from the scene as argument.
   */
  constructor(div = null, options) {
    super()
    const that = this

    if (!div) {
      throw new Error('The ThreeContext needs a div object')
    }

    this._requestFrameId = null

    // init scene
    this._scene = new THREE.Scene()

    // init camera
    this._camera = new THREE.PerspectiveCamera(27, div.clientWidth / div.clientHeight, 1, 50000)
    let camPos = getOption(options, 'cameraPosition', {x: 0, y: 0, z: 100})
    this._camera.position.x = camPos.x
    this._camera.position.y = camPos.y
    this._camera.position.z = camPos.z
    this._scene.add(this._camera)

    // adding some light
    this._ambiantLight = new THREE.AmbientLight(0x444444)
    this._scene.add(this._ambiantLight)
    this._directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    if(getOption(options, 'embedLight', true)){
      this._camera.add(this._directionalLight)
    }else{
      this._scene.add(this._directionalLight)
    }

    // add some axis helper
    this._axesHelper = new THREE.AxesHelper( getOption(options, 'axisHelperSize', 100) )
    this._axesHelper.visible = getOption(options, 'showAxisHelper', true)
    this._scene.add(this._axesHelper)

    // init the renderer
    this._renderer = null
    if(getOption(options, 'webgl2', false)){
      let canvas = document.createElement('canvas')
      div.appendChild(canvas)
      let context = canvas.getContext('webgl2', {
        preserveDrawingBuffer: true,
        alpha: true,
        antialias: getOption(options, 'antialias', true),
      })

      this._renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        context: context
      })
    } else {
      this._renderer = new THREE.WebGLRenderer({
        antialias: getOption(options, 'antialias', true),
        alpha: true,
        preserveDrawingBuffer: true
      })
    }

    this._renderer.setClearColor(0xffffff, 0)
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(div.clientWidth, div.clientHeight)
    this._renderer.gammaInput = true
    this._renderer.gammaOutput = true
    div.appendChild(this._renderer.domElement)

    // all the necessary for raycasting
    this._raycaster = new THREE.Raycaster()
    this._raycastMouse = new THREE.Vector2()

    function onMouseMove(event) {
      const elem = that._renderer.domElement
      const rect = elem.getBoundingClientRect()
      const relX = event.clientX - rect.left
      const relY = event.clientY - rect.top
      that._raycastMouse.x = (relX / that._renderer.domElement.clientWidth) * 2 - 1
      that._raycastMouse.y = -(relY / that._renderer.domElement.clientHeight) * 2 + 1
    }

    this._renderer.domElement.addEventListener('mousemove', onMouseMove, false)

    if(getOption(options, 'raycastOnDoubleClick', false)){
      this._renderer.domElement.addEventListener('dblclick', () => {
        this.performRaycast({
          parent: that._scene,
          emitEvent: true
        })
      }, false)
    }


    // mouse controls
    let controlType = getOption(options, 'controlType', 'trackball')
    this._controls = null
    if(controlType === 'trackball'){
      this._controls = new TrackballControls(this._camera, this._renderer.domElement)
      this._controls.rotateSpeed = 3
    } else if(controlType === 'orbit'){
      this._controls = new OrbitControls(this._camera, this._renderer.domElement)
    }
    //this._controls.addEventListener('change', this.render.bind(this))

    let cameraLookAt = getOption(options, 'cameraLookAt', {x: 0, y: 0, z: 0})
    this.lookAtxyz(cameraLookAt.x, cameraLookAt.y, cameraLookAt.z)

    window.addEventListener('resize', () => {
      that._camera.aspect = div.clientWidth / div.clientHeight
      that._camera.updateProjectionMatrix()
      that._renderer.setSize(div.clientWidth, div.clientHeight)

      // this actually applies only to trackball control
      try{
        that._controls.handleResize()
      } catch(e){}
    }, false)

    this._animate()
  }


  /**
   * Get the default AmbientLight
   * @return {THREE.AmbientLight}
   */
  getAmbientLight(){
    return this._ambiantLight
  }


  /**
   * Get the default directional light
   * @return {THREE.DirectionalLight}
   */
  getDirectionalLight(){
    return this._directionalLight
  }


  /**
   * Adds a Thorus knot to the scene.
   * @return {THREE.Mesh}
   */
  addSampleShape() {
    const geometry = new THREE.TorusKnotBufferGeometry(10, 3, 100, 16)
    const material = new THREE.MeshPhongMaterial({ color: Math.ceil(Math.random() * 0xffff00) })
    const torusKnot = new THREE.Mesh(geometry, material)
    this.getScene().add(torusKnot)
    // this.render()

    // let geometry2 = new THREE.SphereBufferGeometry( 10, 32, 32 );
    // let material2 = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    // let mesh2 = new THREE.Mesh( geometry2, material2 );
    // this._scene.add(mesh2)

    return torusKnot
  }


  addSampleShape2(){
    let geometry = new THREE.SphereBufferGeometry( 10, 32, 32 );
    let material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    let mesh = new THREE.Mesh( geometry, material );
    this.getScene().add(mesh)
  }


  /**
   * Get the axes helper
   * @return {THREE.Mesh}
   */
  getAxesHelper(){
    return this._axesHelper
  }

  /**
   * Get the scene, mainly so that we can externalize things from this file
   * @return {THREE.Scene}
   */
  getScene() {
    return this._scene
  }


  /**
   * Get the camera
   * @return {THREE.Camera}
   */
  getCamera() {
    return this._camera
  }


  /**
   * Since we are using Controls, applying the lookat just on the camera in not enough
   * @param {THREE.Vector3} pos - a position to look at
   */
  lookAt(pos) {
    this._controls.target = pos
  }


  lookAtxyz(x, y, z) {
    this._controls.target.set(x, y, z)
  }

  /**
   * Get the scene object
   * @return {THREE.Scene}
   */
  getScene() {
    return this._scene
  }


  /**
   * Get the field of view angle of the camera, in degrees
   * @return {Number}
   */
  getCameraFieldOfView() {
    return this._camera.fov
  }


  /**
   * Define the camera field of view, in degrees
   * @param {Number} fov - the fov
   */
  setCameraFieldOfView(fov) {
    this._camera.fov = fov
    this._camera.updateProjectionMatrix()
    //this.render()
  }


  /**
   * @private
   * deals with rendering and updating the controls
   */
  _animate() {
    this._requestFrameId = requestAnimationFrame(this._animate.bind(this))
    this._controls.update()
    this.render()
  }


  /**
   * @private
   * Render the scene
   */
  render() {
    this._renderer.render(this._scene, this._camera)
  }


  /**
   * Throw a ray from the camera to the pointer, potentially intersect some element.
   * Can emit the event `raycast` with the section instance as argument
   * @param {Object}  options - the option object
   * @param {boolean} options.emitEvent - Throw the event `'raycast'` with the intersected objects in arguments (default: `false`, the result is returned)
   * @param {THREE.Object3D} options.parent - the raycast will be performed recursively on all the children of this object (default: `this._scene`)
   * @return {array|null} an array of interections or null if none
   */
  performRaycast(options) {
    let emitEvent = getOption(options, 'emitEvent', false)
    let parent = getOption(options, 'parent', this._scene)

    // update the picking ray with the camera and mouse position
    this._raycaster.setFromCamera(this._raycastMouse, this._camera)

    // calculate objects intersecting the picking ray
    const intersects = this._raycaster.intersectObject(parent, true)

    if (intersects.length) {
      if(emitEvent){
        this.emit('raycast', [intersects])
      }
      return intersects
    }
    return null
  }


  /**
   * Get the png image data as base64, in order to later display it in a <img> markup
   */
  getScreenshot() {
    const strMime = 'image/png'
    // let strDownloadMime = "image/octet-stream"
    const imgData = this._renderer.domElement.toDataURL(strMime)
    // imgData.replace(strMime, strDownloadMime)
    return imgData
  }


  /**
   * Kills the scene, interaction, animation and reset all objects to null
   */
  destroy() {
    this._controls.dispose()
    cancelAnimationFrame(this._requestFrameId)
    this._camera = null
    this._controls = null
    this._scene = null
    this._renderer.domElement.remove()
    this._renderer = null
  }
}

export default ThreeContext
