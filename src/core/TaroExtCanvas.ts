import type { ITaroExtCanvas } from './types'
import { TaroExtCanvasBase } from './TaroExtCanvasBase'
import { IMAGE_MODES } from './constant'

export class TaroExtCanvas extends TaroExtCanvasBase {
  private readonly lastDrawPosition: ITaroExtCanvas.LastDrawPosition = { x: 0, y: 0, w: 0, h: 0 }

  constructor(nodeRef: ITaroExtCanvas.CanvasNodeInfo) {
    super(nodeRef)
  }

  public getCanvasNode() {
    return this.CanvasNode
  }

  private saveLastDrawPosition(x: number, y: number, w: number, h: number) {
    this.lastDrawPosition.x = x
    this.lastDrawPosition.y = y
    this.lastDrawPosition.h = h
    this.lastDrawPosition.w = w
  }

  public async draw(data: ITaroExtCanvas.DrawData[]) {
    if (!data || !Array.isArray(data)) {
      return console.warn(`Please input the correct DrawData`)
    }
    if (data.length === 0) {
      return
    }
    this.clean()
    for (const option of data) {
      switch (option.type) {
        case 'IMAGE':
          await this.drawImage(option)
          break
        case 'TEXT':
          this.drawText(option)
          break
        case 'TRIANGLE':
          this.drawTriangle(option)
          break
        case 'RECTANGLE':
          this.drawRectangle(option)
          break
        case 'CIRCLE':
          this.drawCircle(option)
          break
        default:
          console.warn(`Unrecognized type ${option}`)
      }
    }
  }


  /**
   * 清空画布
   */
  public clean() {
    this.ctx.clearRect(0, 0, this.CanvasNode.width, this.CanvasNode.height)
    this.saveLastDrawPosition(0, 0, 0, 0)
  }

  /**
   * 绘制图片（支持多种显示模式和圆角效果）
   * 
   * @param {Object} options 图片绘制配置
   * @param {string} options.url 图片资源地址（支持本地路径/网络URL/base64）
   * @param {number} options.x 绘制区域左上角x坐标（单位：px）
   * @param {number} options.y 绘制区域左上角y坐标（单位：px）
   * @param {number} [options.w] 绘制宽度（单位：px），不设置时使用图片原始宽度
   * @param {number} [options.h] 绘制高度（单位：px），不设置时使用图片原始高度
   * @param {string} [options.mode='scaleToFill'] 图片显示模式：
   *   - 'scaleToFill'：拉伸填充（默认）
   *   - 'aspectFit'：保持宽高比缩放
   *   - 'aspectFill'：保持宽高比填充
   *   - 'center'：居中不缩放
   *   - 'top'：顶部居中
   *   - 'bottom'：底部居中
   *   - 'left'：左侧居中
   *   - 'right'：右侧居中
   *   - 'topLeft'：左上角
   *   - 'topRight'：右上角
   *   - 'bottomLeft'：左下角
   *   - 'bottomRight'：右下角
   * @param {number} [options.radius=0] 圆角半径（单位：px），0表示直角
   * @param {number} [options.opacity=1] 透明度（0-1）
   * 
   * @example
   * // 绘制圆角头像（居中裁剪）
   * await drawImage({
   *   url: '/assets/avatar.jpg',
   *   x: 100,
   *   y: 100,
   *   w: 150,
   *   h: 150,
   *   mode: 'aspectFill',
   *   radius: 75,
   *   opacity: 0.9
   * });
   * 
   * @example
   * // 绘制原始大小的图片
   * await drawImage({
   *   url: 'https://example.com/image.png',
   *   x: 0,
   *   y: 0
   * });
   * 
   * @async
   * @throws {Error} 当图片加载失败时抛出异常
   * @see IMAGE_MODES 查看所有可用的图片模式常量
   */
  public async drawImage({
    url,
    x,
    y,
    w,
    h,
    mode = IMAGE_MODES.scaleToFill,
    radius = 0,
    opacity = 1
  }: ITaroExtCanvas.DrawImageOption) {
    try {
      this.ctx.save()
      this.ctx.globalAlpha = opacity
      const image = await this.loadImage(this.CanvasNode, url)
      x = this.toPx(x)
      y = this.toPx(y)
      w = this.toPx(w)
      h = this.toPx(h)
      radius = this.toPx(radius)

      if (radius > 0) {
        this.createRoundRectPath(x, y, w, h, radius)
        this.ctx.clip()
      }
      const {
        drawX, drawY, drawWidth, drawHeight,
        sx, sy, sWidth, sHeight
      } = this.calculateImageDimensions(mode, image.width, image.height, w, h)

      const adjustedDrawX = x + drawX
      const adjustedDrawY = y + drawY
      const cutModes: Array<keyof ITaroExtCanvas.DrawImageMode> = [
        IMAGE_MODES.aspectFill,
        IMAGE_MODES.top,
        IMAGE_MODES.bottom,
        IMAGE_MODES.center,
        IMAGE_MODES.left,
        IMAGE_MODES.right
      ]
      if (cutModes.includes(mode)) {
        this.ctx.drawImage(
          image,
          sx, sy, sWidth, sHeight,
          adjustedDrawX, adjustedDrawY, drawWidth, drawHeight
        )
      } else {
        this.ctx.drawImage(
          image,
          adjustedDrawX, adjustedDrawY, drawWidth, drawHeight
        )
      }
      this.saveLastDrawPosition(
        adjustedDrawX,
        adjustedDrawY,
        drawWidth,
        drawHeight
      )
      this.ctx.restore()
    } catch (err) {
      console.warn('DrawImage captured an error: ', err)
    }
  }

  /**
   * 绘制文本（支持自动换行和文本溢出处理）
   * 
   * @param {Object} options 文本绘制配置
   * @param {string} options.value 要绘制的文本内容
   * @param {number} options.x 文本起始x坐标（单位：px）
   * @param {number} options.y 文本起始y坐标（单位：px）
   * @param {number} [options.maxNum=1] 最大显示行数（当文本超出时生效）
   * @param {number} [options.maxLineWidth=200] 单行最大宽度（单位：px，超出会自动换行）
   * @param {number} [options.lineHeight] 行高（单位：px），默认值为字体大小的1.2倍
   * @param {number} [options.fontSize=12] 字体大小（单位：px）
   * @param {string} [options.fontFamily='Sans-serif'] 字体家族
   * @param {string} [options.fontWeight='normal'] 字重（normal|bold|100-900）
   * @param {string} [options.color='#000000'] 文本颜色
   * @param {number} [options.indent=0] 首行缩进（单位：px）
   * @param {string} [options.overflow='ellipsis'] 文本溢出处理方式：
   *     - 'ellipsis': 显示省略号（默认）
   *     - 'clip': 直接裁剪
   *     - 'xxx': 自定义
   * @param {string} [options.textAlign='left'] 水平对齐方式（left|center|right）
   * @param {string} [options.textBaseline='middle'] 垂直对齐方式（top|middle|bottom）
   * 
   * @example
   * // 绘制自动换行文本
   * drawText({
   *   value: '这是一段会换行的长文本内容...',
   *   x: 20,
   *   y: 50,
   *   maxLineWidth: 150,
   *   fontSize: 14,
   *   color: '#333'
   * });
   * 
   * @example
   * // 绘制单行省略文本
   * drawText({
   *   value: '超出显示范围的文本会被截断',
   *   x: 10,
   *   y: 100,
   *   maxNum: 1,
   *   maxLineWidth: 100,
   *   overflow: 'ellipsis'
   * });
   */
  public drawText({
    value,
    x,
    y,
    maxNum = 1,
    maxLineWidth = 200,
    lineHeight,
    fontSize = 12,
    fontFamily = 'Sans-serif',
    fontWeight = 'normal',
    color = '#000000',
    indent = 0,
    overflow = 'ellipsis',
    textAlign = 'left',
    textBaseline = 'middle',
  }: ITaroExtCanvas.DrawTextOption) {
    x = this.toPx(x)
    y = this.toPx(y)
    maxLineWidth = this.toPx(maxLineWidth)
    indent = this.toPx(indent)
    lineHeight = lineHeight ? this.toPx(lineHeight) : fontSize * 1.2

    this.ctx.save()
    this.ctx.fillStyle = color
    this.ctx.textAlign = textAlign
    this.ctx.textBaseline = textBaseline
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`

    const textFirstWidth = this.ctx.measureText(value).width
    if (textFirstWidth + indent <= maxLineWidth) {
      this.ctx.fillText(value, x + indent, y, maxLineWidth)
      this.saveLastDrawPosition(x, y, textFirstWidth, y + lineHeight)
    } else {
      const lines = this.wrapText(
        value,
        maxLineWidth,
        maxNum,
        overflow,
        indent,
        x,
        y,
        lineHeight
      )
      lines.forEach((item: any) => {
        this.ctx.fillText(item.text, item.x, item.y)
      })
      this.saveLastDrawPosition(x, y, textFirstWidth, lines[lines.length - 1].y + lineHeight)
    }
    this.ctx.restore()
  }

  /**
   * 绘制三角形（支持普通三角形和等边三角形）
   * 
   * @param {Object} options 绘制配置
   * @param {Array<{x: number, y: number}>|Object} options.points 顶点坐标或等边三角形配置
   * @param {Array} options.points.vertices 自定义三角形的三个顶点坐标（当未指定mode时）
   * @param {string} [options.points.mode] 特殊模式："equilateral"表示等边三角形
   * @param {Object} options.points.center 等边三角形中心点（mode=equilateral时必需）
   * @param {number} options.points.center.x 中心点x坐标
   * @param {number} options.points.center.y 中心点y坐标
   * @param {number} options.points.size 等边三角形边长（mode=equilateral时必需）
   * @param {number} [options.points.rotation=0] 旋转角度（弧度，mode=equilateral时有效）
   * @param {boolean} [options.fill=true] 是否填充
   * @param {string} [options.fillStyle='#000000'] 填充颜色
   * @param {boolean} [options.stroke=false] 是否描边
   * @param {string} [options.strokeStyle='#000000'] 描边颜色
   * @param {number} [options.lineWidth=1] 描边线宽（单位：px）
   * @param {number[]} [options.lineDash=[]] 虚线模式数组（如[5, 3]表示5px实线+3px空白）
   * @param {Object} [options.shadow] 阴影配置
   * @param {string} options.shadow.color 阴影颜色
   * @param {number} options.shadow.blur 阴影模糊度
   * @param {number} options.shadow.offsetX 阴影水平偏移
   * @param {number} options.shadow.offsetY 阴影垂直偏移
   * @param {number} [options.opacity=1] 透明度（0-1）
   * 
   * @example
   * // 绘制自定义三角形
   * drawTriangle({
   *   points: [
   *     { x: 100, y: 50 },
   *     { x: 50, y: 150 },
   *     { x: 150, y: 150 }
   *   ],
   *   fillStyle: 'red'
   * });
   * 
   * @example
   * // 绘制等边三角形
   * drawTriangle({
   *   points: {
   *     mode: 'equilateral',
   *     center: { x: 200, y: 200 },
   *     size: 100,
   *     rotation: Math.PI/4 // 旋转45度
   *   },
   *   stroke: true,
   *   strokeStyle: 'blue'
   * });
   */
  public drawTriangle({
    points,
    fill = true,
    fillStyle = '#000000',
    stroke = false,
    strokeStyle = '#000000',
    lineWidth = 1,
    lineDash = [],
    shadow,
    opacity = 1
  }: ITaroExtCanvas.DrawTriangleOption) {
    lineWidth = this.toPx(lineWidth)
    lineDash = lineDash.map(v => this.toPx(v))
    this.ctx.save()
    this.ctx.globalAlpha = opacity
    if (shadow) {
      this.ctx.shadowColor = shadow.color
      this.ctx.shadowBlur = shadow.blur
      this.ctx.shadowOffsetX = shadow.offsetX
      this.ctx.shadowOffsetY = shadow.offsetY
    }
    const vertices = this.calculateTriangleVertices(points)
    this.ctx.beginPath()
    this.ctx.moveTo(vertices[0].x, vertices[0].y)
    this.ctx.lineTo(vertices[1].x, vertices[1].y)
    this.ctx.lineTo(vertices[2].x, vertices[2].y)
    this.ctx.closePath()

    if (fill) {
      this.ctx.fillStyle = fillStyle
      this.ctx.fill()
    }
    if (stroke) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      if (lineDash.length > 0) {
        this.ctx.setLineDash(lineDash)
      }
      this.ctx.stroke()
    }
    const triangleBounds = this.getTriangleBounds(vertices)
    this.saveLastDrawPosition(triangleBounds.x, triangleBounds.y, triangleBounds.w, triangleBounds.h)
    this.ctx.restore()
  }

  /**
   * 绘制矩形（支持直角和圆角）
   * 
   * @param {Object} options 绘制配置
   * @param {number} options.x 矩形左上角 x 坐标（单位：px）
   * @param {number} options.y 矩形左上角 y 坐标（单位：px）
   * @param {number} options.w 矩形宽度（单位：px）
   * @param {number} options.h 矩形高度（单位：px）
   * @param {boolean} [options.fill=true] 是否填充矩形
   * @param {string} [options.fillStyle='#000000'] 填充颜色
   * @param {boolean} [options.stroke=false] 是否描边
   * @param {string} [options.strokeStyle='#000000'] 描边颜色
   * @param {number} [options.lineWidth=1] 描边线宽（单位：px）
   * @param {number[]} [options.lineDash=[]] 虚线模式数组（如 [5, 3]）
   * @param {Object} [options.shadow] 阴影配置
   * @param {string} options.shadow.color 阴影颜色
   * @param {number} options.shadow.blur 阴影模糊度
   * @param {number} options.shadow.offsetX 阴影水平偏移
   * @param {number} options.shadow.offsetY 阴影垂直偏移
   * @param {number} [options.opacity=1] 透明度（0-1）
   * @param {number} [options.radius=0] 圆角半径（单位：px），0 表示直角
   * 
   * @example
   * // 绘制蓝色圆角矩形带阴影
   * await drawRectangle({
   *   x: 10,
   *   y: 10,
   *   w: 100,
   *   h: 50,
   *   fillStyle: 'blue',
   *   radius: 5,
   *   shadow: {
   *     color: 'rgba(0,0,0,0.5)',
   *     blur: 10,
   *     offsetX: 2,
   *     offsetY: 2
   *   }
   * });
   * 
   * @returns 
   */
  public drawRectangle({
    x,
    y,
    w,
    h,
    fill = true,
    fillStyle = '#000000',
    stroke = false,
    strokeStyle = '#000000',
    lineWidth = 1,
    lineDash = [],
    shadow,
    opacity = 1,
    radius = 0
  }: ITaroExtCanvas.DrawRectangleOption) {
    x = this.toPx(x)
    y = this.toPx(y)
    w = this.toPx(w)
    h = this.toPx(h)
    lineWidth = this.toPx(lineWidth)
    radius = this.toPx(radius)
    lineDash = lineDash.map(v => this.toPx(v))

    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.globalAlpha = opacity

    if (shadow) {
      this.ctx.shadowColor = shadow.color
      this.ctx.shadowBlur = shadow.blur
      this.ctx.shadowOffsetX = shadow.offsetX
      this.ctx.shadowOffsetY = shadow.offsetY
    }
    if (radius > 0) {
      this.createRoundRectPath(x, y, w, h, radius)
    } else {
      this.ctx.rect(x, y, w, h)
    }

    if (stroke) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      if (lineDash.length > 0) {
        this.ctx.setLineDash(lineDash)
      }
      this.ctx.stroke()
    }

    if (fill) {
      this.ctx.fillStyle = fillStyle
      this.ctx.fill()
    }

    this.saveLastDrawPosition(x, y, w, h)
    this.ctx.restore()
  }

  /**
   * 绘制圆形（或圆弧）
   * @param {ITaroExtCanvas.DrawCircleOption} options 绘制配置
   * @param {number} options.x 圆心x坐标
   * @param {number} options.y 圆心y坐标
   * @param {number} options.radius 半径
   * @param {boolean} [options.fill=true] 是否填充
   * @param {string} [options.fillStyle='#000000'] 填充颜色
   * @param {boolean} [options.stroke=false] 是否描边
   * @param {string} [options.strokeStyle='#000000'] 描边颜色
   * @param {number} [options.lineWidth=1] 描边宽度
   * @param {number[]} [options.lineDash=[]] 虚线模式数组
   * @param {Object} [options.shadow] 阴影配置
   * @param {number} [options.opacity=1] 透明度（0-1）
   * @param {number} [options.startAngle=0] 起始角度（弧度）
   * @param {number} [options.endAngle=Math.PI*2] 结束角度（弧度）
   * @param {boolean} [options.anticlockwise=false] 是否逆时针绘制
   * @example
   * // 绘制一个红色实心圆
   * drawCircle({
   *   x: 100,
   *   y: 100,
   *   radius: 50,
   *   fillStyle: 'red'
   * })
   */
  public async drawCircle({
    x,
    y,
    radius,
    fill = true,
    fillStyle = '#000000',
    stroke = false,
    strokeStyle = '#000000',
    lineWidth = 1,
    lineDash = [],
    shadow,
    opacity = 1,
    startAngle = 0,
    endAngle = Math.PI * 2,
    anticlockwise = false
  }: ITaroExtCanvas.DrawCircleOption) {
    x = this.toPx(x)
    y = this.toPx(y)
    lineWidth = this.toPx(lineWidth)
    radius = this.toPx(radius)
    lineDash = lineDash.map(v => this.toPx(v))
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.globalAlpha = opacity
    if (shadow) {
      this.ctx.shadowColor = shadow.color
      this.ctx.shadowBlur = shadow.blur
      this.ctx.shadowOffsetX = shadow.offsetX
      this.ctx.shadowOffsetY = shadow.offsetY
    }
    this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
    if (fill) {
      this.ctx.fillStyle = fillStyle
      this.ctx.fill()
    }

    if (stroke) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      if (lineDash.length > 0) {
        this.ctx.setLineDash(lineDash)
      }
      this.ctx.stroke()
    }

    this.saveLastDrawPosition(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    )
    this.ctx.restore()
  }

  /**
   * 创建圆角矩形路径（不包含实际绘制操作）
   * 
   * @param {number} x - 矩形左上角 x 坐标（单位：px）
   * @param {number} y - 矩形左上角 y 坐标（单位：px）
   * @param {number} w - 矩形宽度（单位：px）
   * @param {number} h - 矩形高度（单位：px）
   * @param {number} r - 圆角半径（单位：px），值为 0 时绘制直角矩形
   * 
   * @example
   * // 创建 100x50 圆角矩形路径（圆角半径10）
   * createRoundRectPath(0, 0, 100, 50, 10);
   * ctx.fill(); // 需要手动填充或描边
   * 
   * @private
   * @memberof TaroExtCanvas
   */
  private createRoundRectPath(x: number, y: number, w: number, h: number, r: number) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + r, y)
    this.ctx.arcTo(x + w, y, x + w, y + h, r)
    this.ctx.arcTo(x + w, y + h, x, y + h, r)
    this.ctx.arcTo(x, y + h, x, y, r)
    this.ctx.arcTo(x, y, x + w, y, r)
    this.ctx.closePath()
  }
}

export default TaroExtCanvas
