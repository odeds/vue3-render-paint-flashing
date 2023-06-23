# vue3-render-paint-flashing

A Vue 3 plugin that enhances component development by visually indicating re-renders on the screen. The Render Paint Flashing Plugin highlights components that are being re-rendered during the development process. It is a helpful tool for identifying performance bottlenecks and optimizing your Vue applications.

## Motivation

Inspired by the Chrome DevTools Rendering paint flashing panel, the Render Paint Flashing Plugin aims to optimize performance in Vue applications. By visually highlighting re-rendered components, developers gain valuable insights into potential performance bottlenecks.

## API

### `createRenderPaintFlashingPlugin()`

The `createRenderPaintFlashingPlugin` function is the main entry point for using the Render Paint Flashing Plugin. It returns a Vue plugin object that can be installed in your Vue 3 application.

```javascript
import { createApp } from 'vue';

const app = createApp(...);

if (process.env.NODE_ENV === 'development') {
  import('render-paint-flashing-plugin').then(({ createRenderPaintFlashingPlugin }) => {
    app.use(createRenderPaintFlashingPlugin());
  });
}

app.mount('#app');
```

### Plugin Options

| Name                      | Description                                                                         | Default                              |
| ------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| `startImmediately`        | Determines whether the plugin should start immediately upon installation.           | `true`                               |
| `toggleOnOffKeybordProps` | Keyboard event properties used to toggle the plugin on and off.                     | `{ shiftKey: true,  key: 'T' }`      |
| `canvasIdentifier`        | Identifier for the canvas element used to display the render paint flashing effect. | `'vue3_rendering_canvas_identifier'` |
| `uuidIdentifier`          | Identifier for uniquely identifying components during the flashing effect.          | `'vue3_rendering_uuid_identifier'`   |
| `color`                   | The color used for highlighting re-rendered components.                             | `'green'`                            |
| `zIndex`                  | The CSS `z-index` value for the canvas element.                                     | `'9999'`                             |
