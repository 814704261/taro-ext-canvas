import Taro from '@tarojs/taro'
import { TaroExtCanvasBase } from './TaroExtCanvasBase'

/**
 * 离屏 canvas 
 * 基础库 2.16.1 开始支持，低版本需做兼容处理
 */
export class TaroExtOffscreenCanvas extends TaroExtCanvasBase {
  protected CanvasNode: Taro.OffscreenCanvas

  constructor(options: Taro.createOffscreenCanvas.Option) {
    super()
    this.CanvasNode = Taro.createOffscreenCanvas(options)
    this.ctx = this.CanvasNode.getContext(options.type || '2d') as CanvasRenderingContext2D
    this.canvasNaturalSize.width = options.width ?? 0
    this.canvasNaturalSize.height = options.height ?? 0
  }

  public updateCanvasSize(width: number, height: number) {
    this.CanvasNode.width = width
    this.CanvasNode.height = height
    this.ctx = this.CanvasNode.getContext('2d') as CanvasRenderingContext2D

    this.canvasNaturalSize.width = width
    this.canvasNaturalSize.height = height
    this.clacToPxCache.clear()
  }

  /**
   * 返回一个包含图片展示的 data URI 。可以使用 type 参数其类型，默认为 PNG 格式
   * @param type 图片格式，默认为 image/png
   * @param encoderOptions 在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略。返回值
   * @returns 
   */
  public toDataURL(type = 'image/png', encoderOptions = 1): string {
    // @ts-ignore
    return this.CanvasNode.toDataURL(type, encoderOptions)
  }
}

export default TaroExtOffscreenCanvas
