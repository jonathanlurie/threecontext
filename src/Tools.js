import * as THREE from 'three'

export const TYPED_ARRAY_LUT = {
  int8: Int8Array,
  int16: Int16Array,
  int32: Int32Array,
  uint8: Uint8Array,
  uint16: Uint16Array,
  uint32: Uint32Array,
  float32: Float32Array,
  float64: Float64Array
}


/**
 * Handy function to deal with option object we pass in argument of function.
 * Allows the return of a default value if the `optionName` is not available in
 * the `optionObj`
 * @param {Object} optionObj - the object that contain the options
 * @param {String} optionName - the name of the option desired, attribute of `optionObj`
 * @param {any} optionDefaultValue - default values to be returned in case `optionName` is not an attribute of `optionObj`
 */
export function getOption(optionObj, optionName, optionDefaultValue) {
  return (optionObj && optionName in optionObj) ? optionObj[optionName] : optionDefaultValue
}


/**
 * @private
 * Generate a cylinder with a starting point and en endpoint because
 * THREEjs does not provide that
 * @param {THREE.Vector3} vStart - the start position
 * @param {THREE.Vector3} vEnd - the end position
 * @param {Number} rStart - radius at the `vStart` position
 * @param {Number} rEnd - radius at the `vEnd` position
 * @param {Boolean} openEnd - cylinder has open ends if true, or closed ends if false
 * @return {THREE.CylinderBufferGeometry} the mesh containing a cylinder
 */
export function makeCylinder(vStart, vEnd, rStart, rEnd, openEnd) {
  const HALF_PI = Math.PI * 0.5
  const distance = vStart.distanceTo(vEnd)
  const position = vEnd.clone().add(vStart).divideScalar(2)

  const offsetPosition = new THREE.Matrix4()// a matrix to fix pivot position
  offsetPosition.setPosition(position)

  const cylinder = new THREE.CylinderBufferGeometry(rStart, rEnd, distance, 32, 1, openEnd)
  const orientation = new THREE.Matrix4()// a new orientation matrix to offset pivot
  orientation.multiply(offsetPosition) // test to add offset
  const offsetRotation = new THREE.Matrix4()// a matrix to fix pivot rotation
  orientation.lookAt(vStart, vEnd, new THREE.Vector3(0, 1, 0))// look at destination
  offsetRotation.makeRotationX(HALF_PI)// rotate 90 degs on X
  orientation.multiply(offsetRotation)// combine orientation with rotation transformations
  cylinder.applyMatrix(orientation)
  return cylinder
}


/**
 * Use a custom template with custom values to create a custom string
 * @example
 * let result = sprintf('hello, my name is ${firstname} ${lastname}.', {firstname: 'Johnny', lastname: 'Bravo'})
 * @param {string} template - the string template
 * @param {Object} data - key value pairs
 * @return {string} the formated string
 */
export function sprintf(template, data){
  let keys = Object.keys(data)
  let values = keys.map(k => data[k])
  return new Function(...keys, `return \`${template}\`;`)(...values)
}
