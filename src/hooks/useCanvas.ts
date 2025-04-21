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

  function canvasToTempFilePath() {
    if (!canvasCore.current) {
      throw new Error('Canvas has not been initialized yet')
    }
    return Taro.canvasToTempFilePath({
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

  return {
    draw,
    resize,
    canvasToTempFilePath
  }
}
