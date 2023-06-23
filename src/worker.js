/**
 * @typedef {Object} RenderOptions
 * @property {number} top
 * @property {number} left
 * @property {number} width
 * @property {number} height
 * @property {number | undefined} startTimestamp
 */

/** @type {OffscreenCanvas} */
let canvas
/** @type {OffscreenCanvasRenderingContext2D} */
let ctx
/** @type {string} */
let color
/** @type {number} */
let requestID
/** @type {Record<string, Set<RenderOptions>>} */
const renderMap = {}

/**
 * @param {Record<string, unknown>} a
 * @param {Record<string, unknown>} b
 * @returns {boolean}
 */
function areEqualShallow(a, b) {
  for (var key in a) {
    if (a[key] !== b[key]) {
      return false
    }
  }
  return true
}

/**
 * @param {string} key
 * @param {Record<string, any>} obj
 * @returns {Record<string, any>}
 */
function omit(key, obj) {
  const { [key]: omitted, ...rest } = obj
  return rest
}

/**
 * @param {object} data
 * @param {OffscreenCanvas} data.canvas
 * @param {string} data.color
 */
const onStart = (data) => {
  canvas = data.canvas
  ctx = canvas.getContext('2d')
  color = data.color

  /**
   * @param {number} timestamp
   */
  function render(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const curSet of Object.values(renderMap)) {
      for (const options of curSet) {
        if (!options.startTimestamp) {
          options.startTimestamp = timestamp
        }
        const elapsed = timestamp - options.startTimestamp
        const { left, top, width, height } = options
        ctx.globalAlpha = Math.min((elapsed / 500) * 0.25, 0.25)
        ctx.lineWidth = 1
        ctx.fillStyle = color
        ctx.fillRect(left, top, width, height)
        ctx.globalAlpha = 1
        ctx.strokeStyle = color
        ctx.strokeRect(left, top, width, height)
        if (elapsed > 500) {
          curSet.delete(options)
        }
      }
    }

    requestID = requestAnimationFrame(render)
  }

  requestID = requestAnimationFrame(render)
}

/**
 * @param {object} data
 * @param {string} data.uuid
 * @param {RenderOptions} data.options
 */
const onAddItem = (data) => {
  const options = data.options
  const uuid = data.uuid

  if (!renderMap[uuid]) {
    renderMap[uuid] = new Set()
  }

  const existingOption = Array.from(renderMap[uuid]).find((o) =>
    areEqualShallow(omit('startTimestamp', o), options)
  )

  if (existingOption) {
    delete existingOption.startTimestamp
    return
  }

  renderMap[uuid].add(options)
}

/**
 * @param {object} data
 * @param {string} data.uuid
 */
const onDeleteItem = (data) => {
  const uuid = data.uuid
  if (!renderMap[uuid]) return
  renderMap[uuid].clear()
  delete renderMap[uuid]
}

const onStop = () => {
  cancelAnimationFrame(requestID)
  canvas = undefined
  ctx = undefined
  requestID = undefined
  for (const key in renderMap) {
    delete renderMap[key]
  }
}

onmessage = (evt) => {
  /** @type {"start" | "addItem" | "deleteItem" | "stop"} */
  const type = evt.data.type
  const data = evt.data

  if (type === 'start') {
    onStart(data)
  } else if (type === 'addItem') {
    onAddItem(data)
  } else if (type === 'deleteItem') {
    onDeleteItem(data)
  } else if (type === 'stop') {
    onStop()
  }
}
