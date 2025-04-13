import type { ITaroExtCanvas } from './types'
import Taro from '@tarojs/taro'
import { IMAGE_MODES } from './constant'

export class TaroExtCanvasBase {
  public static readonly designWidth = 750

  protected CanvasNode: Taro.Canvas
  protected ctx: CanvasRenderingContext2D

  private rpxRatio = 1
  private readonly clacToPxCache: Map<number | string, number>
  private readonly loadImageCache: Map<string, HTMLImageElement>
  private readonly canvasNaturalSize = {
    width: 0,
    height: 0
  }

  constructor(nodeRef: ITaroExtCanvas.CanvasNodeInfo) {
    const { windowWidth, pixelRatio } = Taro.getWindowInfo()
    this.rpxRatio = windowWidth / TaroExtCanvasBase.designWidth

    this.CanvasNode = nodeRef.node
    this.CanvasNode.width = nodeRef.width * pixelRatio
    this.CanvasNode.height = nodeRef.height * pixelRatio
    this.canvasNaturalSize.width = nodeRef.width
    this.canvasNaturalSize.height = nodeRef.height
    this.ctx = this.CanvasNode.getContext('2d') as CanvasRenderingContext2D
    this.ctx.scale(pixelRatio, pixelRatio)

    this.clacToPxCache = new Map()
    this.loadImageCache = new Map()
  }

  public updateCanvasSize(width: number, height: number) {
    this.CanvasNode.width = width
    this.CanvasNode.height = height
    this.canvasNaturalSize.width = width
    this.canvasNaturalSize.height = height
    this.clacToPxCache.clear()
  }

  /**
   * 返回一个包含图片展示的 data URI 。可以使用 type 参数其类型，默认为 PNG 格式。
   * @param {string} type
   * @param {number} encoderOptions
   * @returns {string}
   */
  public toDataURL(type: string = 'image/png', encoderOptions: number = 1): string {
    return this.CanvasNode.toDataURL(type, encoderOptions)
  }

  public getImageData(sx: number, sy: number, sw: number, sh: number, settings?: ImageDataSettings) {
    return this.ctx.getImageData(sx, sy, sw, sh, settings)
  }

  protected toPx(value: number | string): number {
    const cacheKey = typeof value === 'string' ? value : `${value}px`
    if (!this.clacToPxCache.has(cacheKey)) {
      let pxValue = 0
      if (typeof value === 'number') {
        pxValue = value * this.rpxRatio
      } else if (value.endsWith('rpx')) {
        pxValue = Number.parseFloat(value) * this.rpxRatio
      } else if (value.endsWith('px')) {
        pxValue = Number.parseFloat(value)
      } else if (value.endsWith('vw')) {
        pxValue = Number.parseFloat(value)
        pxValue = pxValue / 100 * this.canvasNaturalSize.width
      } else if (value.endsWith('vh')) {
        pxValue = Number.parseFloat(value)
        pxValue = pxValue / 100 * this.canvasNaturalSize.height
      } else {
        throw new Error(`Unsupported unit in toPx(): ${value}`)
      }

      this.clacToPxCache.set(cacheKey, pxValue)
    }

    return this.clacToPxCache.get(cacheKey)!
  }

  protected loadImage(CanvasNode: Taro.Canvas, url: string) {
    if (this.loadImageCache.has(url)) {
      return this.loadImageCache.get(url)!
    }
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = CanvasNode.createImage()
      image.src = url
      image.onerror = reject
      image.onload = () => {
        this.loadImageCache.set(url, image as HTMLImageElement)
        resolve(image as HTMLImageElement)
      }
    })
  }

  protected calculateImageDimensions(
    mode: keyof ITaroExtCanvas.DrawImageMode,
    imgWidth: number,
    imgHeight: number,
    containerWidth: number,
    containerHeight: number
  ) {
    const ratio = imgWidth / imgHeight
    const containerRatio = containerWidth / containerHeight

    let drawWidth = containerWidth
    let drawHeight = containerHeight
    let drawX = 0
    let drawY = 0
    let sx = 0
    let sy = 0
    let sWidth = imgWidth
    let sHeight = imgHeight

    switch (mode) {
      case IMAGE_MODES.aspectFit:
        if (containerRatio > ratio) {
          drawWidth = containerHeight * ratio
          drawX = (containerWidth - drawWidth) / 2
        } else {
          drawHeight = containerWidth / ratio
          drawY = (containerHeight - drawHeight) / 2
        }
        break

      case IMAGE_MODES.aspectFill:
        if (containerRatio > ratio) {
          sHeight = imgHeight
          sWidth = sHeight * containerRatio
          sx = (imgWidth - sWidth) / 2
        } else {
          sWidth = imgWidth
          sHeight = sWidth / containerRatio
          sy = (imgHeight - sHeight) / 2
        }
        break

      case IMAGE_MODES.widthFix:
        drawHeight = containerWidth / ratio
        break

      case IMAGE_MODES.heightFix:
        drawWidth = containerHeight * ratio
        break

      case IMAGE_MODES.top:
        sHeight = imgHeight * (containerWidth / imgWidth)
        break

      case IMAGE_MODES.bottom:
        sy = imgHeight - imgHeight * (containerWidth / imgWidth)
        sHeight = imgHeight * (containerWidth / imgWidth)
        break

      case IMAGE_MODES.center:
        if (containerRatio > ratio) {
          sy = (imgHeight - imgHeight * (containerWidth / imgWidth)) / 2
          sHeight = imgHeight * (containerWidth / imgWidth)
        } else {
          sx = (imgWidth - imgWidth * (containerHeight / imgHeight)) / 2
          sWidth = imgWidth * (containerHeight / imgHeight)
        }
        break

      case IMAGE_MODES.left:
        sWidth = imgWidth * (containerHeight / imgHeight)
        break

      case IMAGE_MODES.right:
        sx = imgWidth - imgWidth * (containerHeight / imgHeight)
        sWidth = imgWidth * (containerHeight / imgHeight)
        break
    }

    return {
      drawX, drawY, drawWidth, drawHeight,
      sx, sy, sWidth, sHeight
    }
  }

  protected wrapText(
    text: string,
    maxWidth: number,
    maxLines: number,
    overflow: string,
    indent: number,
    x: number,
    y: number,
    lineHeight: number
  ): ITaroExtCanvas.IWrapText[] {
    const words = text.split('')
    const lines: ITaroExtCanvas.IWrapText[] = []
    let currentLine = ''
    let currentWidth = 0
    for (let i = 0; i < words.length; i++) {
      const char = words[i]
      const charWidth = this.ctx.measureText(char).width
      const isFirstLine = lines.length === 0
      const actualMaxWidth = isFirstLine ? maxWidth - indent : maxWidth
      if (currentWidth + charWidth <= actualMaxWidth) {
        currentLine += char
        currentWidth += charWidth
      } else {
        const data = {
          text: currentLine,
          x: isFirstLine ? x + indent : x,
          y: y + lines.length * lineHeight
        }
        lines.push(data)
        if (lines.length >= maxLines) {
          if (overflow) {
            this.handleOverflow(lines, overflow, actualMaxWidth)
          }
          break
        }
        currentLine = char
        currentWidth = charWidth
      }
    }
    if (currentLine && lines.length < maxLines) {
      lines.push({
        text: currentLine,
        x: lines.length === 0 ? x + indent : x,
        y: y + lines.length * lineHeight
      })
    }
    return lines
  }

  protected handleOverflow(
    lines: ITaroExtCanvas.IWrapText[],
    overflow: string,
    maxLineWidth: number
  ) {
    if (overflow === 'clip') {
      // 不做处理，直接截断
      return
    }

    const lastLine = lines[lines.length - 1].text
    const ellipsis = overflow === 'ellipsis' ? '...' : overflow
    // 如果当前行还能加省略号
    if (this.ctx.measureText(lastLine + ellipsis).width <= maxLineWidth) {
      lines[lines.length - 1].text += lastLine
    } else {
      let ellipsisLine = lastLine
      while (ellipsisLine && this.ctx.measureText(ellipsisLine + ellipsis).width > maxLineWidth) {
        ellipsisLine = ellipsisLine.slice(0, -1)
      }
      lines[lines.length - 1].text = ellipsisLine + ellipsis
    }
  }

  protected calculateTriangleVertices(
    points: ITaroExtCanvas.TrianglePoint
  ): ITaroExtCanvas.Point[] {
    if (Array.isArray(points)) {
      return points.map<ITaroExtCanvas.Point>(v => ({ x: this.toPx(v.x), y: this.toPx(v.y) }))
    }
    const { mode } = points
    const center = {
      x: this.toPx(points.center.x),
      y: this.toPx(points.center.y)
    }

    // 等边三角形顶点计算
    if (mode === 'equilateral') {
      const size = this.toPx(points.size)
      const rotation = points.rotation || 0
      return [0, 1, 2].map(i => {
        const angle = rotation + i * (2 * Math.PI / 3) // 每个顶点相隔120度
        return {
          x: center.x + size * Math.cos(angle),
          y: center.y + size * Math.sin(angle)
        }
      })
    }

    if (mode === 'isosceles') {
      const base = this.toPx(points.base)
      const height = this.toPx(points.height)
      const direction = points.direction || 'up'

      switch (direction) {
        case 'up':
          return [
            { x: center.x, y: center.y - height / 2 }, // 顶点
            { x: center.x - base / 2, y: center.y + height / 2 }, // 右上角
            { x: center.x + base / 2, y: center.y + height / 2 }  // 右下角
          ]
        case 'down':
          return [
            { x: center.x, y: center.y + height / 2 },
            { x: center.x - base / 2, y: center.y - height / 2 },
            { x: center.x + base / 2, y: center.y - height / 2 }
          ]
        case 'left':
          return [
            { x: center.x - height / 2, y: center.y },
            { x: center.x + height / 2, y: center.y - base / 2 },
            { x: center.x + height / 2, y: center.y + base / 2 }
          ]
        case 'right':
          return [
            { x: center.x + height / 2, y: center.y },
            { x: center.x - height / 2, y: center.y - base / 2 },
            { x: center.x - height / 2, y: center.y + base / 2 }
          ]
        default:
          throw new Error(`Invalid direction: ${direction}`)
      }
    }
    return []
  }

  protected getTriangleBounds(points: ITaroExtCanvas.Point[]): ITaroExtCanvas.LastDrawPosition {
    const xCoords = points.map(p => p[0])
    const yCoords = points.map(p => p[1])

    const minX = Math.min(...xCoords) // 最左侧的 x
    const maxX = Math.max(...xCoords)
    const minY = Math.min(...yCoords) // 最上方的 y
    const maxY = Math.max(...yCoords)

    const w = maxX - minX // 宽度
    const h = maxY - minY // 高度

    // 左上角坐标 (minX, minY)
    const topLeftX = minX
    const topLeftY = minY

    return {
      x: topLeftX,  // 左上角 x
      y: topLeftY,  // 左上角 y
      w: w,        // 宽度
      h: h         // 高度
    }
  }
}
