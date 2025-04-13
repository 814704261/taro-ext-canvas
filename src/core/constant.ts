import { ITaroExtCanvas } from './types'

export const DRAW_TYPE: ITaroExtCanvas.DRAW_TYPE = {
  IMAGE: 'IMAGE',
  TEXT: 'TEXT',
  TRIANGLE: 'TRIANGLE',
  RECTANGLE: 'RECTANGLE',
  CIRCLE: 'CIRCLE'
}

export const IMAGE_MODES: ITaroExtCanvas.DrawImageMode = {
  scaleToFill: 'scaleToFill',
  aspectFit: 'aspectFit',
  aspectFill: 'aspectFill',
  widthFix: 'widthFix',
  heightFix: 'heightFix',
  top: 'top',
  bottom: 'bottom',
  center: 'center',
  left: 'left',
  right: 'right'
}

