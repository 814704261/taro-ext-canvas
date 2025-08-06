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


## 前言

该库所有的测试均以微信小程序环境为准，其它环境未测试，如发现 bug 请提 Issue

### Canvas 适配原理

小程序中使用 rpx 单位, 可以根据屏幕宽度进行自适应。规定屏幕宽为750rpx。如在 iPhone6 上，屏幕宽度为375px，共有750个物理像素，则750rpx = 375px = 750物理像素，1rpx = 0.5px = 1物理像素。

但是实际的渲染大小是以 px 为单位，所以需要统一单位，如果你的canvas组件使用rpx单位设置宽高，那所有的单位应该都用rpx，如果使用px为单位，则使用px。

#### 使用rpx单位 example

```js
import { useCanvas } from 'taro-ext-canvas'
const canvas = useCanvas('example')

// 默认传入的数值都为 rpx (坐标， 宽高， 行高)
canvas.draw([
  {
    type: 'IMAGE',
    x: 0,
    y: 0,
    w: 100,
    h: 100
  }
])

```

```wxml
<Canvas id='example' type='2d'></Canvas>
```

```wxss
#example {
  width: 750rpx;
  height: 900rpx;
}
```

#### 使用px单位 example

```js
import { useCanvas } from 'taro-ext-canvas'
const canvas = useCanvas('example')

// 可以传入一个携带单位的数值，具体支持哪些单位可看后文介绍
canvas.draw([
  {
    type: 'IMAGE',
    x: 0,
    y: 0,
    w: '100px',
    h: '100px'
  }
])

```

```wxml
<Canvas id='example' type='2d'></Canvas>
```

```wxss
#example {
  width: 375Px;
  height: 450Px;
}
```


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