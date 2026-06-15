<template>
  <div
    class="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col"
  >
    <!-- TOPBAR -->
    <header
      class="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4 shrink-0"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"
        ></div>

        <h1 class="font-bold text-lg tracking-wide">
          Podpivas Engine Editor
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="toolbar-btn"
          @click="saveProject"
        >
          Save Project
        </button>

        <label class="toolbar-btn cursor-pointer">
          Load Project

          <input
            type="file"
            accept=".json"
            class="hidden"
            @change="loadProject"
          />
        </label>

        <label class="toolbar-btn cursor-pointer">
          Import Assets

          <input
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="importAssets"
          />
        </label>
      </div>
    </header>

    <!-- MAIN -->
    <div class="flex flex-1 overflow-hidden">

      <!-- LEFT -->
      <aside
        class="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col"
      >
        <div class="panel-title">
          Project Explorer
        </div>

        <!-- PROJECT SETTINGS -->
        <div
          class="p-3 border-b border-zinc-800 flex flex-col gap-3"
        >
          <div>
            <label class="input-label">
              Project Name
            </label>

            <input
              v-model="projectSettings.map_name"
              class="editor-input"
            />
          </div>

          <div>
            <label class="input-label">
              Background Color
            </label>

            <input
              type="color"
              v-model="projectSettings.bgColor"
              class="w-full h-12 rounded-xl overflow-hidden"
              @input="updateBackgroundColor"
            />
          </div>
        </div>

        <!-- ASSETS -->
        <div
          class="p-2 border-b border-zinc-800 overflow-auto"
        >
          <div class="text-xs text-zinc-500 mb-2">
            Assets
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="asset in assets"
              :key="asset.id"
              class="flex flex-col gap-1"
            >
              <input
                v-model="asset.assetName"
                class="editor-input text-xs"
              />

              <button
                draggable="true"
                @dragstart="startAssetDrag(asset)"
                class="asset-item"
              >
                {{ asset.assetName }}
              </button>
            </div>
          </div>
        </div>

        <!-- HIERARCHY -->
        <div class="panel-title">
          Scene
        </div>

        <div
          class="p-2 flex flex-col gap-2 overflow-auto"
        >
          <div class="flex gap-2">
            <button
              class="toolbar-btn flex-1"
              @click="addEmptyObject"
            >
              + Add
            </button>

            <button
              class="toolbar-btn flex-1"
              @click="duplicateSelected"
            >
              Duplicate
            </button>

            <button
              class="delete-btn flex-1"
              @click="deleteSelected"
            >
              Delete
            </button>
          </div>

          <button
            v-for="object in sceneObjects"
            :key="object.uuid"
            @click="selectObject(object)"
            @dblclick="focusObject(object)"
            class="scene-item"
            :class="{
              'bg-blue-600 text-white':
              selectedObject?.uuid === object.uuid
            }"
          >
            <div
              class="flex items-center justify-between"
            >
              <span>
                {{ object.name }}
              </span>

              <span class="text-xs opacity-50">
                sprite
              </span>
            </div>
          </button>
        </div>
      </aside>

      <!-- VIEWPORT -->
      <main
        class="flex-1 relative overflow-hidden"
        @dragover.prevent
        @drop="dropAssetIntoViewport"
      >
        <canvas
          ref="rendererCanvas"
          class="absolute inset-0 w-full h-full"
          @wheel.prevent="zoomViewport"
          @mousedown="startCameraDrag"
          @mouseup="stopCameraDrag"
          @mouseleave="stopCameraDrag"
          @mousemove="moveCamera"
        ></canvas>

        <!-- OVERLAY -->
        <div
          class="absolute top-4 left-4 flex flex-col gap-2 z-10"
        >
          <div class="overlay-card">
            Objects:
            {{ sceneObjects.length }}
          </div>
        </div>
      </main>

      <!-- INSPECTOR -->
      <aside
        class="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col"
      >
        <div class="panel-title">
          Inspector
        </div>

        <div
          v-if="selectedObject"
          class="p-4 flex flex-col gap-4 overflow-auto"
        >
          <div>
            <label class="input-label">
              Name
            </label>

            <input
              v-model="selectedObject.name"
              class="editor-input"
            />
          </div>

          <div>
            <label class="input-label">
              Asset ID
            </label>

            <input
              v-model="selectedObject.asset"
              class="editor-input"
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="input-label">
                X
              </label>

              <input
                type="number"
                v-model.number="selectedObject.position.x"
                class="editor-input"
              />
            </div>

            <div>
              <label class="input-label">
                Y
              </label>

              <input
                type="number"
                v-model.number="selectedObject.position.y"
                class="editor-input"
              />
            </div>
          </div>

          <div>
            <label class="input-label">
              Scale
            </label>

            <input
              type="range"
              min="0.01"
              max="2"
              step="0.01"
              v-model.number="selectedObject.scale"
              class="w-full"
            />
          </div>

          <div>
            <label class="input-label">
              Rotation
            </label>

            <input
              type="range"
              min="-6.28"
              max="6.28"
              step="0.01"
              v-model.number="selectedObject.rotation.z"
              class="w-full"
            />
          </div>

          <div>
            <label class="input-label">
              Color
            </label>

            <input
              type="color"
              v-model="selectedObject.color"
              class="w-full h-12 rounded-xl overflow-hidden"
            />
          </div>
        </div>
      </aside>
    </div>

    <!-- STATUSBAR -->
    <footer
      class="h-9 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between px-4 text-xs text-zinc-400 shrink-0"
    >
      <div class="flex items-center gap-6">
        <div>
          Objects:
          {{ sceneObjects.length }}
        </div>

        <div>
          Camera:
          X {{ camera.x.toFixed(2) }}
          |
          Y {{ camera.y.toFixed(2) }}
        </div>

        <div>
          Zoom:
          {{ camera.zoom.toFixed(2) }}
        </div>
      </div>

      <div>
        v0.1 alpha
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  watch
} from 'vue'

const rendererCanvas = ref(null)

const assets = reactive([])

const sceneObjects = reactive([])

const selectedObject = ref(null)

const draggedAsset = ref(null)

const projectSettings =
  reactive({
    map_name:
      'Untitled',

    bgColor:
      '#09090b'
  })

const camera = reactive({
  x: 0,
  y: 0,
  zoom: 1
})

let gl
let shaderProgram
let vertexBuffer
let uvBuffer

let isDraggingCamera = false

let lastMouseX = 0
let lastMouseY = 0

function uuid() {

  return Math.random()
    .toString(36)
    .slice(2)
}

watch(
  () => selectedObject.value?.asset,
  (newAssetId) => {

    if (!selectedObject.value) return

    const asset = assets.find(
      a => a.assetName === newAssetId
    )

    if (!asset) return

    const img = new Image()

    img.onload = () => {

      selectedObject.value.textureWidth = img.width
      selectedObject.value.textureHeight = img.height

      const maxDimension =
        Math.max(
          img.width,
          img.height
        )

      selectedObject.value.scale =
        0.35
    }

    img.src = asset.url
  }
)

function createSpriteObject(name) {

  return {

    uuid: uuid(),

    name,

    asset: name,

    texture: null,

    glTexture: null,

    textureWidth: 256,
    textureHeight: 256,

    color: '#ffffff',

    position: {

      x: 0,
      y: 0,
      z: 0
    },

    rotation: {

      x: 0,
      y: 0,
      z: 0
    },

    scale: 0.25
  }
}

function addEmptyObject() {

  const object =
    createSpriteObject(
      `Object ${sceneObjects.length + 1}`
    )

  sceneObjects.push(object)

  selectedObject.value = object
}

function selectObject(object) {
  selectedObject.value = object
}

function duplicateSelected() {

  if (!selectedObject.value) return

  const source =
    selectedObject.value

  const copy = {

    ...structuredClone(source),

    uuid: uuid(),

    name:
      source.name + ' Copy',

    position: {

      x:
        source.position.x + 0.1,

      y:
        source.position.y + 0.1,

      z:
        source.position.z
    }
  }

  sceneObjects.push(copy)

  selectedObject.value = copy
}

function deleteSelected() {

  if (!selectedObject.value) return

  const index =
    sceneObjects.findIndex(
      o =>
        o.uuid ===
        selectedObject.value.uuid
    )

  if (index !== -1) {
    sceneObjects.splice(index, 1)
  }

  selectedObject.value = null
}

function focusObject(object) {

  camera.x =
    -object.position.x

  camera.y =
    -object.position.y

  camera.zoom = 2
}

function startAssetDrag(asset) {
  draggedAsset.value = asset
}

function importAssets(event) {

  const files =
    Array.from(
      event.target.files
    )

  files.forEach(file => {

    const url =
      URL.createObjectURL(file)

    assets.push({

      id: uuid(),

      name: file.name,

      assetName:
        file.name.split('.')[0],

      url
    })
  })
}

async function createTexture(url) {

  return new Promise(resolve => {

    const image = new Image()

    image.onload = () => {

      const texture =
        gl.createTexture()

      gl.bindTexture(
        gl.TEXTURE_2D,
        texture
      )

      gl.pixelStorei(
        gl.UNPACK_FLIP_Y_WEBGL,
        true
      )

      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      )

      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        gl.CLAMP_TO_EDGE
      )

      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        gl.CLAMP_TO_EDGE
      )

      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR
      )

      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.LINEAR
      )

      resolve({

        texture,

        width:
          image.width,

        height:
          image.height
      })
    }

    image.src = url
  })
}

async function dropAssetIntoViewport(event) {

  if (!draggedAsset.value) return

  const rect =
    rendererCanvas.value
      .getBoundingClientRect()

  const x =
    (((event.clientX - rect.left)
      / rect.width) * 2 - 1)

  const y =
    -((((event.clientY - rect.top)
      / rect.height) * 2 - 1))

  const textureData =
    await createTexture(
      draggedAsset.value.url
    )

  sceneObjects.push({

    uuid: uuid(),

    name:
      draggedAsset.value.assetName,

    asset:
      draggedAsset.value.assetName,

    texture:
      draggedAsset.value.url,

    glTexture:
      textureData.texture,

    textureWidth:
      textureData.width,

    textureHeight:
      textureData.height,

    color: '#ffffff',

    position: {

      x,
      y,
      z: 0
    },

    rotation: {

      x: 0,
      y: 0,
      z: 0
    },

    scale: 0.25
  })
}

function createShader(type, source) {

  const shader =
    gl.createShader(type)

  gl.shaderSource(shader, source)

  gl.compileShader(shader)

  return shader
}

function initWebGL() {

  gl =
    rendererCanvas.value
      .getContext('webgl2')

  gl.enable(gl.BLEND)

  gl.blendFunc(
    gl.SRC_ALPHA,
    gl.ONE_MINUS_SRC_ALPHA
  )

  const vertexShaderSource =
`#version 300 es

in vec2 position;
in vec2 uv;

uniform vec2 offset;
uniform float rotation;
uniform vec2 size;

out vec2 vUv;

void main() {

  float s = sin(rotation);
  float c = cos(rotation);

  mat2 rot = mat2(
    c, -s,
    s, c
  );

  vec2 pos =
    rot * (position * size);

  gl_Position = vec4(
    pos + offset,
    0.0,
    1.0
  );

  vUv = uv;
}`

  const fragmentShaderSource =
`#version 300 es

precision mediump float;

uniform sampler2D tex;
uniform bool useTexture;
uniform vec3 color;

in vec2 vUv;

out vec4 outColor;

void main() {

  vec4 base =
    vec4(color, 1.0);

  if(useTexture) {

    vec4 texColor =
      texture(tex, vUv);

    outColor =
      texColor * base;

  } else {

    outColor = base;
  }
}`

  const vertexShader =
    createShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    )

  const fragmentShader =
    createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    )

  shaderProgram =
    gl.createProgram()

  gl.attachShader(
    shaderProgram,
    vertexShader
  )

  gl.attachShader(
    shaderProgram,
    fragmentShader
  )

  gl.linkProgram(shaderProgram)

  const vertices =
    new Float32Array([

      -0.5, -0.5,
       0.5, -0.5,
      -0.5,  0.5,

      -0.5,  0.5,
       0.5, -0.5,
       0.5,  0.5
    ])

  const uvs =
    new Float32Array([

      0, 0,
      1, 0,
      0, 1,

      0, 1,
      1, 0,
      1, 1
    ])

  vertexBuffer =
    gl.createBuffer()

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    vertexBuffer
  )

  gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
  )

  uvBuffer =
    gl.createBuffer()

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    uvBuffer
  )

  gl.bufferData(
    gl.ARRAY_BUFFER,
    uvs,
    gl.STATIC_DRAW
  )

  updateBackgroundColor()
}

function resizeCanvas() {

  const canvas =
    rendererCanvas.value

  canvas.width =
    canvas.clientWidth

  canvas.height =
    canvas.clientHeight

  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  )
}

function hexToRgb(hex) {

  const bigint =
    parseInt(
      hex.slice(1),
      16
    )

  return {

    r:
      ((bigint >> 16) & 255)
      / 255,

    g:
      ((bigint >> 8) & 255)
      / 255,

    b:
      (bigint & 255)
      / 255
  }
}

function updateBackgroundColor() {

  if (!gl) return

  const rgb =
    hexToRgb(
      projectSettings.bgColor
    )

  gl.clearColor(
    rgb.r,
    rgb.g,
    rgb.b,
    1
  )
}

function render() {

  requestAnimationFrame(render)

  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(shaderProgram)

  const positionLocation =
    gl.getAttribLocation(
      shaderProgram,
      'position'
    )

  const uvLocation =
    gl.getAttribLocation(
      shaderProgram,
      'uv'
    )

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    vertexBuffer
  )

  gl.enableVertexAttribArray(
    positionLocation
  )

  gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  )

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    uvBuffer
  )

  gl.enableVertexAttribArray(
    uvLocation
  )

  gl.vertexAttribPointer(
    uvLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  )

  sceneObjects.forEach(object => {

    const matchedAsset =
      assets.find(
        asset =>
          asset.assetName ===
          object.asset
      )

    if (
      matchedAsset &&
      !object.glTexture
    ) {

      createTexture(
        matchedAsset.url
      ).then(textureData => {

        object.texture =
          matchedAsset.url

        object.glTexture =
          textureData.texture

        object.textureWidth =
          textureData.width

        object.textureHeight =
          textureData.height
      })
    }

    const offsetLocation =
      gl.getUniformLocation(
        shaderProgram,
        'offset'
      )

    const rotationLocation =
      gl.getUniformLocation(
        shaderProgram,
        'rotation'
      )

    const colorLocation =
      gl.getUniformLocation(
        shaderProgram,
        'color'
      )

    const texLocation =
      gl.getUniformLocation(
        shaderProgram,
        'tex'
      )

    const sizeLocation =
      gl.getUniformLocation(
        shaderProgram,
        'size'
      )

    const useTextureLocation =
      gl.getUniformLocation(
        shaderProgram,
        'useTexture'
      )

    const WORLD_SCALE = 0.01

    gl.uniform2f(
      offsetLocation,
      (object.position.x + camera.x) * WORLD_SCALE * camera.zoom,
      (object.position.y + camera.y) * WORLD_SCALE * camera.zoom
    )

    const canvasAspect =
      rendererCanvas.value.width /
      rendererCanvas.value.height

    const width =
      object.textureWidth || 256

    const height =
      object.textureHeight || 256

    const maxDimension =
      Math.max(width, height)

    const normalizedWidth =
      width / maxDimension

    const normalizedHeight =
      height / maxDimension

    const finalWidth =
      normalizedWidth
      * object.scale
      * camera.zoom

    const finalHeight =
      normalizedHeight
      * object.scale
      * camera.zoom

    gl.uniform2f(
      sizeLocation,
      finalWidth / canvasAspect,
      finalHeight
    )

    gl.uniform1f(
      rotationLocation,
      object.rotation.z
    )

    const rgb =
      hexToRgb(
        object.color
      )

    gl.uniform3f(
      colorLocation,
      rgb.r,
      rgb.g,
      rgb.b
    )

    if (object.glTexture) {

      gl.activeTexture(
        gl.TEXTURE0
      )

      gl.bindTexture(
        gl.TEXTURE_2D,
        object.glTexture
      )

      gl.uniform1i(
        texLocation,
        0
      )

      gl.uniform1i(
        useTextureLocation,
        1
      )

    } else {

      gl.uniform1i(
        useTextureLocation,
        0
      )
    }

    gl.drawArrays(
      gl.TRIANGLES,
      0,
      6
    )
  })
}

function zoomViewport(event) {

  if (event.deltaY > 0) {
    camera.zoom *= 0.9
  } else {
    camera.zoom *= 1.1
  }

  camera.zoom =
    Math.max(
      0.1,
      Math.min(camera.zoom, 8)
    )
}

function startCameraDrag(event) {

  isDraggingCamera = true

  lastMouseX = event.clientX
  lastMouseY = event.clientY
}

function stopCameraDrag() {
  isDraggingCamera = false
}

function moveCamera(event) {

  if (!isDraggingCamera) return

  const deltaX =
    event.clientX - lastMouseX

  const deltaY =
    event.clientY - lastMouseY

  camera.x +=
    deltaX / 500
    / camera.zoom

  camera.y -=
    deltaY / 500
    / camera.zoom

  lastMouseX = event.clientX
  lastMouseY = event.clientY
}

function saveProject() {

  const data = {

    map_name:
      projectSettings.map_name,

    bgColor:
      projectSettings.bgColor,

    objects:
      sceneObjects.map(object => ({

        name:
          object.name,

        asset:
          object.asset,

        x:
          object.position.x,

        y:
          object.position.y,

        scale:
          object.scale,

        rotation:
          object.rotation.z,

        color:
          object.color
      }))
  }

  const blob = new Blob(
    [
      JSON.stringify(
        data,
        null,
        2
      )
    ],
    {
      type:
        'application/json'
    }
  )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  link.href = url

  link.download =
    `${projectSettings.map_name}.json`

  link.click()
}

function loadProject(event) {

  const file =
    event.target.files[0]

  if (!file) return

  const reader =
    new FileReader()

  reader.onload = () => {

    const json =
      JSON.parse(reader.result)

    sceneObjects.splice(0)

    projectSettings.map_name =
      json.map_name

    projectSettings.bgColor =
      json.bgColor

    updateBackgroundColor()

    json.objects.forEach(item => {

      sceneObjects.push({

        uuid: uuid(),

        name:
          item.name,

        asset:
          item.asset,

        texture: null,

        glTexture: null,

        textureWidth: 256,
        textureHeight: 256,

        color:
          item.color || '#ffffff',

        position: {

          x:
            item.x,

          y:
            item.y,

          z: 0
        },

        rotation: {

          x: 0,
          y: 0,

          z:
            item.rotation || 0
        },

        scale:
          item.scale || 0.25
      })
    })
  }

  reader.readAsText(file)
}

onMounted(() => {

  initWebGL()

  resizeCanvas()

  window.addEventListener(
    'resize',
    resizeCanvas
  )

  render()
})
</script>

<style scoped>
.toolbar-btn {
  @apply px-4 py-2 rounded-xl transition text-sm hover:opacity-80;
  background: rgba(63,63,70,0.9);
  color: white;
}

.panel-title {
  @apply h-12 border-b border-zinc-800 flex items-center px-4 font-semibold text-sm;
}

.scene-item {
  @apply text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition;
}

.editor-input {
  @apply w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 outline-none focus:border-blue-500;
}

.input-label {
  @apply text-xs text-zinc-400 mb-1 block;
}

.overlay-card {
  @apply bg-zinc-900/90 backdrop-blur px-3 py-2 rounded-xl border border-zinc-800 text-sm;
}

.asset-item {
  @apply w-full text-left px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm;
}

.delete-btn {
  @apply px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 transition text-sm;
}
</style>