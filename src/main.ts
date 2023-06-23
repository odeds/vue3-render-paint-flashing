import { nextTick, type Plugin } from 'vue'
import Worker from './worker?worker&inline'

type VueDomElement = Element & { __vueParentComponent?: any }

type PluginOptions = {
  startImmediately: boolean
  toggleOnOffKeybordProps: Pick<
    KeyboardEvent,
    'shiftKey' | 'altKey' | 'metaKey' | 'ctrlKey' | 'key'
  >
  canvasIdentifier: string
  uuidIdentifier: string
  color: string
  zIndex: string
}

const map = new Map<
  string,
  {
    elementsRef: WeakRef<VueDomElement>[]
  }
>()

let requestID: number

const worker = new Worker()

function getComponentUUID(element: VueDomElement) {
  return element.__vueParentComponent?.ctx.$options.uuid
}

function getComponentSiblingElements(
  uuid: string,
  nextElementSibling: VueDomElement
) {
  const siblingElements = [nextElementSibling]
  let el: VueDomElement | null = nextElementSibling

  while (el) {
    el = el.nextElementSibling as VueDomElement
    if (el) {
      const elUUID = getComponentUUID(el)
      if (elUUID !== uuid) break
      siblingElements.push(el)
    }
  }
  return siblingElements
}

function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T {
  let timerId: NodeJS.Timeout

  return function (this: any, ...args: any[]) {
    clearTimeout(timerId)

    timerId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  } as T
}

function createCanvas({
  canvasIdentifier,
  zIndex,
}: Pick<PluginOptions, 'canvasIdentifier' | 'zIndex'>) {
  const canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.zIndex = zIndex
  canvas.style.pointerEvents = 'none'
  canvas.dataset[canvasIdentifier] = ''
  return canvas
}

function registerComponent(uuid: string) {
  if (map.has(uuid)) return
  const componentOptions = {
    elementsRef: [],
  }
  map.set(uuid, componentOptions)
}

function registerElements(uuid: string, ...elems: VueDomElement[]) {
  const componentOptions = map.get(uuid)
  componentOptions.elementsRef = [
    ...elems.map((el) => new WeakRef(el)),
    ...componentOptions.elementsRef,
  ]
  map.set(uuid, componentOptions)
}

function isElementVisibleInWindow(
  rect: DOMRect,
  { windowHeight, windowWidth }: { windowHeight: number; windowWidth: number }
) {
  const topVisibleThreshold = -1
  const bottomVisibleThreshold = windowHeight - 1
  const leftVisibleThreshold = -1
  const rightVisibleThreshold = windowWidth - 1

  return (
    rect.top < bottomVisibleThreshold &&
    rect.bottom > topVisibleThreshold &&
    rect.left < rightVisibleThreshold &&
    rect.right > leftVisibleThreshold
  )
}

function addItems() {
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth

  for (const [uuid, componentOptions] of map) {
    for (const elRef of componentOptions.elementsRef) {
      const el = elRef.deref()
      if (!el) return

      const rect = el.getBoundingClientRect()

      if (isElementVisibleInWindow(rect, { windowHeight, windowWidth })) {
        const options = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }
        worker.postMessage({ type: 'addItem', uuid, options })
      }
    }
    componentOptions.elementsRef = []
  }

  requestID = requestAnimationFrame(addItems)
}

export function createRenderPaintFlashingPlugin(
  options: Partial<PluginOptions> = {}
): Plugin {
  return {
    install(app) {
      const {
        startImmediately = true,
        toggleOnOffKeybordProps = {
          shiftKey: true,
          key: 'T',
        },
        canvasIdentifier = 'vue3_rendering_canvas_identifier',
        uuidIdentifier = 'vue3_rendering_uuid_identifier',
        color = 'green',
        zIndex = '9999',
      } = options

      let isRunning = startImmediately

      const getCanvas = () =>
        document.querySelector(`[data-${canvasIdentifier}]`)

      const onResizeWindow = debounce(() => {
        stop()
        start()
      }, 150)

      app.mixin({
        beforeCreate() {
          if (!isRunning) return
          this.$options[uuidIdentifier] = crypto.randomUUID()
        },
        renderTriggered() {
          if (!isRunning) return
          const uuid = this.$options[uuidIdentifier]
          registerComponent(uuid)

          if (this.$el.nodeType === Node.TEXT_NODE) {
            const elements = getComponentSiblingElements(
              uuid,
              this.$el.nextElementSibling
            )

            registerElements(uuid, ...elements)
          } else if (this.$el.nodeType === Node.COMMENT_NODE) {
            nextTick(() => {
              if (this.$el.nodeType === Node.COMMENT_NODE) return
              registerElements(uuid, this.$el)
            })
          } else {
            registerElements(uuid, this.$el)
          }
        },
        unmounted() {
          const uuid = this.$options[uuidIdentifier]
          map.delete(uuid)
          worker.postMessage({ type: 'deleteItem', uuid })
        },
      })

      const start = () => {
        const canvas = createCanvas({ canvasIdentifier, zIndex })
        document.body.append(canvas)
        const offscreen = canvas.transferControlToOffscreen()
        worker.postMessage({ type: 'start', canvas: offscreen, color }, [
          offscreen,
        ])
        requestID = requestAnimationFrame(addItems)
        window.addEventListener('resize', onResizeWindow)
        isRunning = true
      }

      const stop = () => {
        worker.postMessage({ type: 'stop' })
        const canvas = getCanvas()
        canvas?.remove()
        cancelAnimationFrame(requestID)
        map.clear()
        window.removeEventListener('resize', onResizeWindow)
        isRunning = false
      }

      document.addEventListener('keyup', (event) => {
        const shouldToggle = Object.entries(toggleOnOffKeybordProps).every(
          ([key, value]) => event[key] === value
        )

        if (!shouldToggle) return

        const canvas = getCanvas()
        if (canvas) {
          stop()
        } else {
          start()
        }
      })

      if (startImmediately) {
        start()
      }
    },
  }
}
