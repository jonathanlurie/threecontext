let threedeediv = document.getElementById( 'threedeediv' )
let info = document.getElementById( 'info' )
let pathList = document.getElementById( 'path-list' )

// Some matrices to test the world coordinates
const TEST_MATRICES = {
  IDENTITY: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  BIG_OFFSET: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1000, 2000, 3000, 1],
  HALF_OFFSET: [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, -660, 400, -570, 1],
  NON_ISO_SCALING: [3, 0, 0, 0, 0, 10, 0, 0, 0, 0, 5, 0, 0, 0, 0, 1],
  NON_ISO_SCALING_2: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.3, 0, 10, 20, 30, 1],
  ROTATION_ONLY:  [1, 0, 0, 0, 0, 0.5000000000000001, 0.8660254037844386, 0, 0, -0.8660254037844386, 0.5000000000000001, 0, 0, 0, 0, 1], // PI/3
  ROTATION_BIG_OFFSET: [1, 0, 0, 0, 0, 0.5000000000000001, 0.8660254037844386, 0, 0, -0.8660254037844386, 0.5000000000000001, 0, 1000, 2000, 3000, 1],
  MULTI_ROTATION: [0.5270378633297923, -0.3972330787924597, -0.7512902047343827, 0, -0.642032960086751, 0.39309216146920933, -0.6582341762273587, 0, 0.5567986788588956, 0.8292674078393101, -0.04786227654907482, 0, 4024.56886636522, 5411.01638392107, 280.7824934491489, 1]
}

let datasetConfig = {
  "data_type": "uint8",
  "num_channels": 1,
  "voxelToWorld": TEST_MATRICES.IDENTITY,
  "scales": [
    {
      "chunk_sizes": [
        [
          64,
          64,
          64
        ]
      ],
      "encoding": "raw",
      "key": "10um",
      "resolution": [
        10000,
        10000,
        10000
      ],
      "size": [
        1320,
        800,
        1140
      ],
      "voxel_offset": [
        0,
        0,
        0
      ]
    },
    {
      "chunk_sizes": [
        [
          64,
          64,
          64
        ]
      ],
      "encoding": "raw",
      "key": "20um",
      "resolution": [
        20000,
        20000,
        20000
      ],
      "size": [
        660,
        400,
        570
      ],
      "voxel_offset": [
        0,
        0,
        0
      ]
    },
    {
      "chunk_sizes": [
        [
          64,
          64,
          64
        ]
      ],
      "encoding": "raw",
      "key": "40um",
      "resolution": [
        40000,
        40000,
        40000
      ],
      "size": [
        330,
        200,
        285
      ],
      "voxel_offset": [
        0,
        0,
        0
      ]
    },
    {
      "chunk_sizes": [
        [
          64,
          64,
          64
        ]
      ],
      "encoding": "raw",
      "key": "80um",
      "resolution": [
        80000,
        80000,
        80000
      ],
      "size": [
        165,
        100,
        143
      ],
      "voxel_offset": [
        0,
        0,
        0
      ]
    },
    {
      "chunk_sizes": [
        [
          64,
          64,
          64
        ]
      ],
      "encoding": "raw",
      "key": "160um",
      "resolution": [
        160000,
        160000,
        160000
      ],
      "size": [
        83,
        50,
        72
      ],
      "voxel_offset": [
        0,
        0,
        0
      ]
    }
  ],
  "type": "image"
}

let slicer = new threeoctreeplane.Slicer({
  parent: threedeediv
})

let vdc = slicer.getVolumeDatasetCollection()
let allenAverageModel = vdc.createVolumeDataset(
  'http://127.0.0.1:8080/{datasetName}/{lodName}/{xStart}-{xEnd}_{yStart}-{yEnd}_{zStart}-{zEnd}',
  // 'https://datasets.jonathanlurie.fr/{datasetName}/{lodName}/{xStart}-{xEnd}_{yStart}-{yEnd}_{zStart}-{zEnd}',
  'allen_10um_8bit',
  datasetConfig
)


let planeCollection = slicer.getPlaneCollection()

let plane = planeCollection.getPlane()

plane.on('beforeChange', function(){
  slicer.resetDownloadQueue()
})

console.log(allenAverageModel)

// plane.setShaderId('dev')
// limit the max level of detail to render
// allenAverageModel.setLodMaxIntersection(1)

slicer.focusOnDataset(/* dataset name or use default */)
slicer.showDatasetBox(/* dataset name or use default */)
slicer.adaptPlaneToDataset(/* dataset name or use default */)

let worldBoundaries = allenAverageModel.getWorldBoundaries()
let worldBoundariesSize = worldBoundaries.getSize()
let planeScale = plane.getScale()
let largestSide = Math.max(planeScale.x, planeScale.y, planeScale.z)
let planePosition = plane.getPosition()


// init the UI elements on top right
let gui = new dat.GUI()
let param = {
  scale: largestSide,
  contrast: 1.0,
  brightness: 0.0,
  colormaps: plane.getCurrentColormap(),
  helpers: plane.getHelperVisibility(),
  LOD: allenAverageModel.getLodMaxIntersection(),
  align: function(){
    plane.alignOnVoxelSpace()
  },
}

gui.add(param, 'scale', 1, largestSide*1.5, 1)
.onChange(function(s){
  plane.setScale(s, s, s)
})

gui.add(param, 'contrast', 0.001, 5, 0.1)
.onChange(function(c){
  plane.setContrast(c)
})

gui.add(param, 'brightness', -2, 2, 0.01)
.onChange(function(b){
  plane.setBrightness(b)
})

gui.add(param, 'colormaps', plane.getColormapStyles())
.onChange(function(c){
  plane.useColormap(c)
})

gui.add(param, 'helpers')
.onChange(function(v){
  plane.setHelperVisibility(v)
})

gui.add(param, 'LOD', 0, allenAverageModel.getNumberOfLOD()-1, 1)
.onFinishChange(function(lod){
  allenAverageModel.setLodMaxIntersection(lod)
  slicer.computeIntersectedCuboids(plane, allenAverageModel.getName(), false)
})

gui.add(param, 'align').name('align on voxel')


// the sliding zone at the bottom of the sceen
function initSliders () {
  let sliders = document.querySelectorAll('.staticSlider')
  let cursorPosition = 0
  let sliderDown = false

  sliders.forEach(function(slider){
    slider.addEventListener('mousedown', function(e){
      sliderDown = true
      cursorPosition = e.screenX
    })
    slider.addEventListener('mouseup', function(e){
      sliderDown = false
    })
    slider.addEventListener('mousemove', function(e){
      if (!sliderDown)
        return

      let d = e.screenX - cursorPosition
      cursorPosition = e.screenX

      let method = e.target.getAttribute('method')
      let ratio = parseFloat(e.target.getAttribute('ratio'))
      plane[method](ratio * d)

    })
  })
}

initSliders()



// init the keyboard interaction
let infoDiv = document.getElementById('info')
let keyBeingPressed = {}
let mouseBeingPressed = false

document.addEventListener("keydown", event => {
  keyBeingPressed[event.code] = true
})

document.addEventListener("keyup", event => {
  keyBeingPressed[event.code] = false
  infoDiv.innerHTML = 'Press <code>Ctrl</code> and hover on the volume to display the voxel value.'
})

threedeediv.addEventListener('mousedown', event => {
  mouseBeingPressed = true
}, false)

threedeediv.addEventListener('mouseup', event => {
  mouseBeingPressed = false
}, false)

threedeediv.addEventListener('mousemove', event => {
  if(mouseBeingPressed)
    return

  if(keyBeingPressed.ControlLeft){
    slicer.getValueAtPointer(null, function(datasetName, position, LOD, voxelValue){
      // OUT
      if(voxelValue === null){
        infoDiv.innerHTML = '(You are out!)'
        return
      }

      let x = (~~(position.x * 100))/100
      let y = (~~(position.y * 100))/100
      let z = (~~(position.z * 100))/100

      let toPrint = `
      dataset: <b>${datasetName}</b></br>
      LOD: <b>${LOD}</b></br>
      [${x}, ${y}, ${z}]</br>
      <span class="large-text">${voxelValue}</span>
      `.trim()
      infoDiv.innerHTML = toPrint
    })
  }
}, false)
