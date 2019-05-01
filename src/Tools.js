import * as THREE from 'three'

/**
 * @private
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
