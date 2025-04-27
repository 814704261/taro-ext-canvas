export namespace ITaroExtCanvas {
  export interface CanvasNodeInfo extends Taro.NodesRef.BoundingClientRectCallbackResult, Taro.NodesRef.NodeCallbackResult {
    node: Taro.Canvas
  }

  /**
   * 绘画类型
   */
  export interface DRAW_TYPE {
    /** 图片 */
    IMAGE: 'IMAGE'
    /** 文本 */
    TEXT: 'TEXT'
    /** \n换行文本 */
    WRAP_TEXT: 'WRAP_TEXT'
    /** 三角形 */
    TRIANGLE: 'TRIANGLE'
    /** 矩形 */
    RECTANGLE: 'RECTANGLE'
    /** 圆形 */
    CIRCLE: 'CIRCLE'
  }

  export interface DrawOption {
    type: keyof DRAW_TYPE
    x: number | string
    y: number | string
  }

  /** 图片模式 */
  export interface DrawImageMode {
    /** 缩放模式，不保持纵横比缩放图片，使图片的宽高完全拉伸至填满 image 元素 */
    scaleToFill: 'scaleToFill'
    /** 缩放模式，保持纵横比缩放图片，使图片的长边能完全显示出来。也就是说，可以完整地将图片显示出来。 */
    aspectFit: 'aspectFit'
    /** 缩放模式，保持纵横比缩放图片，只保证图片的短边能完全显示出来。也就是说，图片通常只在水平或垂直方向是完整的，另一个方向将会发生截取。 */
    aspectFill: 'aspectFill'
    /** 缩放模式，宽度不变，高度自动变化，保持原图宽高比不变 */
    widthFix: 'widthFix'
    /** 缩放模式，高度不变，宽度自动变化，保持原图宽高比不变 */
    heightFix: 'heightFix'
    /** 裁剪模式，不缩放图片，只显示图片的顶部区域 */
    top: 'top'
    /** 裁剪模式，不缩放图片，只显示图片的底部区域 */
    bottom: 'bottom'
    /** 裁剪模式，不缩放图片，只显示图片的中间区域 */
    center: 'center'
    /** 裁剪模式，不缩放图片，只显示图片的左边区域 */
    left: 'left'
    /** 裁剪模式，不缩放图片，只显示图片的右边区域 */
    right: 'right'
  }

  export interface LastDrawPosition {
    /** x 坐标 */
    x: number
    /** y 坐标 */
    y: number
    /** 宽 */
    w: number
    /** 高 */
    h: number
  }


  export interface DrawImageOption extends DrawOption {
    type: DRAW_TYPE['IMAGE']

    /** 图片资源地址 */
    url: string
    /** 宽度 */
    w: number | string
    /** 高度 */
    h: number | string
    /** 模式 */
    mode?: keyof DrawImageMode
    /** 圆角 */
    radius?: number
    /** 不透明度 - 默认值 1 */
    opacity?: number
    /** 当图片加载失败时是否抛出错误 - 默认 false */
    throwError?: boolean
  }


  export interface IWrapText {
    text: string
    x: number
    y: number
  }

  export interface DrawTextOption extends DrawOption {
    type: DRAW_TYPE['TEXT']

    /** 文本内容 */
    value: string
    /** 行数 - 默认 1 */
    maxNum?: number
    /** 文本最大宽度 - 默认值 200 */
    maxLineWidth?: number | string
    /** 行高 - 未指定时默认为字体的1.2倍 */
    lineHeight?: number
    /** 字体大小 - 默认值 12 */
    fontSize?: number
    /** 字体 - 默认值 Sans-serif */
    fontFamily?: string
    /** 字重 - 默认值 normal */
    fontWeight?: string
    /** 文字颜色 - 默认值 #000000 */
    color?: string
    /** 文本缩进 */
    indent?: number | string
    /** 溢出文本提示行为 */
    overflow?: string | 'ellipsis' | 'clip'
    /** 文本对齐方式 - 默认值 left */
    textAlign?: CanvasRenderingContext2D["textAlign"]
    /** 文本基线对齐方式 - 默认值 middle */
    textBaseline?: CanvasRenderingContext2D["textBaseline"]
  }

  export interface DrawWrapTextOption extends DrawOption {
    type: DRAW_TYPE['WRAP_TEXT']

    /** 文本内容 */
    value: string
    /** 行数 - 默认 1 */
    maxNum?: number
    /** 文本最大宽度 - 默认值 200 */
    maxLineWidth?: number | string
    /** 行高 - 未指定时默认为字体的1.2倍 */
    lineHeight?: number
    /** 字体大小 - 默认值 12 */
    fontSize?: number
    /** 字体 - 默认值 Sans-serif */
    fontFamily?: string
    /** 字重 - 默认值 normal */
    fontWeight?: string
    /** 文字颜色 - 默认值 #000000 */
    color?: string
    /** 文本缩进 */
    indent?: number | string
    /** 溢出文本提示行为 */
    overflow?: string | 'ellipsis' | 'clip'
    /** 文本对齐方式 - 默认值 left */
    textAlign?: CanvasRenderingContext2D["textAlign"]
    /** 文本基线对齐方式 - 默认值 middle */
    textBaseline?: CanvasRenderingContext2D["textBaseline"]
  }

  export interface Point {
    x: number
    y: number
  }

  /** 等边三角形坐标 */
  export interface EquilateralPoint {
    mode: 'equilateral'
    /** 中心点坐标 */
    center: Point
    /** 边长 */
    size: number
    /** 旋转角度（弧度制） */
    rotation?: number
  }

  /** 等腰三角形坐标 */
  export interface IsoscelesPoint {
    mode: 'isosceles'
    /** 底边长度 */
    base: number
    /** 高度 */
    height: number
    /** 方向 */
    direction?: 'up' | 'down' | 'left' | 'right'
    /** 中心点坐标 */
    center: Point
  }

  export type TrianglePoint = [Point, Point, Point] | EquilateralPoint | IsoscelesPoint

  export interface ShadowConfig {
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }

  interface DrawShapeOption {
    /** 填充 */
    fill?: boolean
    /** 填充样式 */
    fillStyle?: string | CanvasGradient | CanvasPattern
    /** 描边 */
    stroke?: boolean
    /** 描边样式 */
    strokeStyle?: string | CanvasGradient | CanvasPattern
    /** 描边线段宽度 */
    lineWidth?: number
    /** 虚线模式（如 [5, 3]） */
    lineDash?: number[]
    /** 阴影配置 */
    shadow?: ShadowConfig
    /** 不透明度 */
    opacity?: number
    /** 圆角 */
    radius?: number
  }

  export interface DrawTriangleOption extends DrawShapeOption {
    type: DRAW_TYPE['TRIANGLE']

    /** 三角形顶点坐标 三种模式任选其一 */
    points: TrianglePoint
  }

  export interface DrawRectangleOption extends DrawShapeOption, DrawOption {
    type: DRAW_TYPE['RECTANGLE']

    /** 宽 */
    w: number | string
    /** 高 */
    h: number | string
  }

  export interface DrawCircleOption extends DrawShapeOption, DrawOption {
    type: DRAW_TYPE['CIRCLE']

    /** 半径 */
    radius: number
    /** 起始角度，默认0 */
    startAngle?: number
    /** 结束角度，默认2π (360deg) */
    endAngle?: number
    /** 是否逆时针，默认false */
    anticlockwise?: boolean
  }

  export type DrawData =
    DrawImageOption |
    DrawTextOption |
    DrawTriangleOption |
    DrawRectangleOption |
    DrawCircleOption |
    DrawWrapTextOption


  export interface CalcWrapTextHeightOptions {
    text: string
    maxWidth: number
    maxLine?: number
    hasBreak?: boolean
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    lineHeight?: number
    onPostCalculate?(result: number, ctx: CanvasRenderingContext2D, canvas: Taro.Canvas): number
  }
}

