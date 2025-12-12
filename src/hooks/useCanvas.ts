import Taro, { nextTick } from '@tarojs/taro'
import { useEffect, useRef } from 'react'
import { ITaroExtCanvas, TaroExtCanvas } from '../core/index'

export const useCanvas = (id: string) => {
  const canvasCore = useRef<TaroExtCanvas>()

  useEffect(() => {
    init()
  }, [id])

  function init() {
    nextTick(() => {
      Taro.createSelectorQuery()
        .select(`#${id}`)
        .fields({ size: true, node: true })
        .exec((res) => {
          if (!res[0]) {
            return
          }
          canvasCore.current = new TaroExtCanvas(res[0])
        })
    })
  }

  function draw(data: ITaroExtCanvas.DrawData[]) {
    if (!canvasCore.current) {
      throw new Error('Canvas has not been initialized yet')
    }
    return canvasCore.current.draw(data)
  }

  function canvasToTempFilePath(option: Partial<Taro.canvasToTempFilePath.Option> = {}) {
    if (!canvasCore.current) {
      throw new Error('Canvas has not been initialized yet')
    }
    return Taro.canvasToTempFilePath({
      ...option,
      canvasId: id,
      canvas: canvasCore.current.getCanvasNode()
    })
  }

  function resize() {
    return new Promise<void>((resolve, reject) => {
      nextTick(() => {
        Taro.createSelectorQuery()
          .select(`#${id}`)
          .fields({ size: true, node: true })
          .exec((res) => {
            const node = res[0]
            if (!node) {
              reject(new Error('not found canvas instance'))
              return
            }
            if (!canvasCore.current) {
              canvasCore.current = new TaroExtCanvas(node)
            } else {
              canvasCore.current.updateCanvasSize(node.width, node.height)
            }
            resolve()
          })
      })
    })
  }

  /**
   * 计算文本高度
   * @param {Object} options 计算文本高度配置
   * @param {string} options.text 文本内容
   * @param {number} options.tmaxWidth 最长宽度
   * @param {boolean} options.hasBreak 是否处理换行符 默认 false
   * @param {number} options.fontSize 字体大小 - 默认 12px
   * @param {string} options.fontFamily 字体 - 默认 Sans-serif
   * @param {string} options.fontWeight 字重 - 默认 normal
   * @param {number} options.lineHeight 行高 - 默认 字体大小 * 1.2
   * @param {Function} options.onPostCalculate 计算结果回调 - 会在计算完成后被调用，并将计算结果和 ctx 与 canvas 节点传入，然后回调返回的新值会作为最终结果
   * @returns {number}
   */
  function calcWrapTextHeight(options: ITaroExtCanvas.CalcWrapTextHeightOptions): number {
    if (!canvasCore.current) {
      throw new Error('calcWrapTextHeight error: Canvas has not been initialized yet')
    }
    return canvasCore.current.calcWrapTextHeight(options)
  }

  /**
   * 测量文本
   * @param options
   * @returns
   */
  function measureText(options: ITaroExtCanvas.MeasureTextOptions) {
    if (!canvasCore.current) {
      throw new Error('calcWrapTextHeight error: Canvas has not been initialized yet')
    }
    return canvasCore.current.measureText(options)
  }

  return {
    draw,
    resize,
    canvasToTempFilePath,
    calcWrapTextHeight,
    measureText
  }
}
