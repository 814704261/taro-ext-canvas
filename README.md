# Taro Ext Canvas

[![npm version](https://img.shields.io/npm/v/taro-ext-canvas.svg)](https://npmjs.com/package/taro-ext-canvas)
[![License](https://img.shields.io/npm/l/taro-ext-canvas.svg)](https://github.com/814704261/taro-ext-canvas/blob/master/LICENSE)

Enhanced Canvas component for Taro framework, providing rich drawing capabilities with simplified API.

## Features

- 🖼️ **Image Drawing**: Supports multiple display modes (scaleToFill, aspectFit, aspectFill, etc.) with rounded corners
- ✏️ **Text Rendering**: Auto-wrapping, ellipsis for overflow, multi-line support
- 🔺 **Shape Drawing**: Triangle (including equilateral), rectangle (rounded corners), circle/arc
- 🎨 **Styling Options**: Fill, stroke, shadows, opacity, dashed lines
- 📐 **Precision Layout**: Pixel-perfect positioning and sizing
- 🌈 **Performance Optimized**: Efficient drawing operations

## Installation

```bash
# Using npm
npm install taro-ext-canvas

# Using yarn
yarn add taro-ext-canvas
```

## Basic Usage

```typescript
import Taro from '@tarojs/taro'
import { TaroExtCanvas } from 'taro-ext-canvas'

// Get canvas node reference
const canvas = await Taro.createSelectorQuery().select('#myCanvas').node()

// Create instance
const extCanvas = new TaroExtCanvas(canvas)

// Draw content
await extCanvas.draw([
  {
    type: 'RECTANGLE',
    x: 10,
    y: 10,
    w: 100,
    h: 60,
    fillStyle: '#4a90e2',
    radius: 8,
    shadow: {
      color: 'rgba(0,0,0,0.2)',
      blur: 8,
      offsetX: 2,
      offsetY: 2
    }
  },
  {
    type: 'TEXT',
    value: 'Hello Taro!',
    x: 20,
    y: 40,
    fontSize: 16,
    color: '#ffffff'
  }
])
```

## API Documentation

### Core Methods

#### `draw(data: DrawData[])`
Main drawing method that accepts an array of drawing instructions.

Supported types:
- `IMAGE`: Draw images with various display modes
- `TEXT`: Draw text with auto-wrapping and overflow handling
- `TRIANGLE`: Draw triangles (including equilateral)
- `RECTANGLE`: Draw rectangles (with rounded corners)
- `CIRCLE`: Draw circles or arcs

#### `clean()`
Clear the entire canvas.

### Drawing Methods

#### `drawImage(options)`
Draw an image with various display modes and rounded corners.

```typescript
await extCanvas.drawImage({
  url: 'https://xxx.com/assets/avatar.jpg',
  x: 100,
  y: 100,
  w: 150,
  h: 150,
  mode: 'aspectFill',
  radius: 75,
  opacity: 0.9
})
```

#### `drawText(options)`
Draw text with auto-wrapping and overflow handling.

```typescript
extCanvas.drawText({
  value: 'This is a long text that will wrap automatically',
  x: 20,
  y: 50,
  maxLineWidth: 150,
  fontSize: 14,
  color: '#333'
})
```

#### `drawTriangle(options)`
Draw triangles (custom or equilateral).

```typescript
// Custom triangle
extCanvas.drawTriangle({
  points: [
    { x: 100, y: 50 },
    { x: 50, y: 150 },
    { x: 150, y: 150 }
  ],
  fillStyle: 'red'
})

// Equilateral triangle
extCanvas.drawTriangle({
  points: {
    mode: 'equilateral',
    center: { x: 200, y: 200 },
    size: 100,
    rotation: Math.PI/4 // 45 degrees
  },
  stroke: true,
  strokeStyle: 'blue'
})
```

#### `drawRectangle(options)`
Draw rectangles with optional rounded corners.

```typescript
extCanvas.drawRectangle({
  x: 10,
  y: 10,
  w: 100,
  h: 50,
  fillStyle: 'blue',
  radius: 5,
  shadow: {
    color: 'rgba(0,0,0,0.5)',
    blur: 10,
    offsetX: 2,
    offsetY: 2
  }
})
```

#### `drawCircle(options)`
Draw circles or arcs.

```typescript
extCanvas.drawCircle({
  x: 100,
  y: 100,
  radius: 50,
  fillStyle: 'red',
  startAngle: 0,
  endAngle: Math.PI, // Half circle
  stroke: true,
  strokeStyle: '#000'
})
```

## Image Display Modes

The following image display modes are supported (via `IMAGE_MODES` constant):

- `scaleToFill`: Stretch to fill (default)
- `aspectFit`: Keep aspect ratio while fitting within bounds
- `aspectFill`: Keep aspect ratio while filling bounds
- `center`: Center without scaling
- `top`: Top center
- `bottom`: Bottom center
- `left`: Left center
- `right`: Right center
- `topLeft`: Top-left corner
- `topRight`: Top-right corner
- `bottomLeft`: Bottom-left corner
- `bottomRight`: Bottom-right corner

## Examples



## License

MIT © [DevonCorey]