import type { ITaroExtCanvas } from './types'
import { TaroExtCanvasBase } from './TaroExtCanvasBase'
import Taro from '@tarojs/taro'

export class TaroExtCanvas extends TaroExtCanvasBase {
  protected CanvasNode: Taro.Canvas

  public getCanvasNode() {
    return this.CanvasNode
  }

  constructor(nodeRef: ITaroExtCanvas.CanvasNodeInfo) {
    super()

    const { pixelRatio } = Taro.getWindowInfo()
    this.CanvasNode = nodeRef.node
    this.CanvasNode.width = nodeRef.width * pixelRatio
    this.CanvasNode.height = nodeRef.height * pixelRatio
    this.canvasNaturalSize.width = nodeRef.width
    this.canvasNaturalSize.height = nodeRef.height
    this.ctx = this.CanvasNode.getContext('2d') as CanvasRenderingContext2D
    this.ctx.scale(pixelRatio, pixelRatio)
  }

  public updateCanvasSize(width: number, height: number) {
    const { pixelRatio } = Taro.getWindowInfo()
    this.CanvasNode.width = width * pixelRatio
    this.CanvasNode.height = height * pixelRatio
    this.ctx = this.CanvasNode.getContext('2d') as CanvasRenderingContext2D
    this.ctx.scale(pixelRatio, pixelRatio)

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
}

export default TaroExtCanvas
