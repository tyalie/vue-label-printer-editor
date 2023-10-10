/*
 * @Author: Sophie Tyalie
 * @Date: 2023-10-10
 * @Description: Plugin for automatically align and ordering of elements
 */

import { fabric } from 'fabric';
import { throttle } from 'lodash-es';
import Editor from '../core';
type IEditor = Editor;

class AutomaticAlignPlugin {
  public canvas: fabric.Canvas;
  public editor: IEditor;
  private isEditing: boolean;
  static pluginName = 'AutomaticAlignPlugin';
  static apis = ['_autoAlign'];

  constructor(canvas: fabric.Canvas, editor: IEditor) {
    this.canvas = canvas;
    this.editor = editor;
    this.isEditing = false;
    this.isRotating = false;

    this._registerListeners();
  }

  _registerListeners() {
    this.canvas.on('before:render', () => this._editSemaphore(() => this._autoAlign()));
    this.canvas.on('object:rotating', () => (this.isRotating = true));
    this.canvas.on('mouse:up', () => (this.isRotating = false));
  }

  _editSemaphore(fn) {
    if (this.isEditing) return;
    this.isEditing = true;
    try {
      fn();
    } finally {
      this.isEditing = false;
    }
  }

  _autoAlign() {
    // we state changes during rotation, because it makes the ui buggy
    if (this.isRotating) return;

    const defaultWorkspace = this.canvas.getObjects().find((item) => item.id === 'workspace');
    const selectables = this.canvas.getObjects().filter((e) => e.selectable || e.isEditing);

    if (selectables.some((e) => e.group)) return;

    let getPoint;
    let getSize;
    let intPos = 0;

    switch (this.editor.getAutoAlignDirection()) {
      case 'X':
        getPoint = (o, v) =>
          new fabric.Point(v + getSize(o) / 2, defaultWorkspace.getCenterPoint().y);
        getSize = (o) => o.getBoundingRect(true, true).width;
        intPos = editor.getMarginX();
        break;
      case 'Y':
        getPoint = (o, v) =>
          new fabric.Point(defaultWorkspace.getCenterPoint().x, v + getSize(o) / 2);
        getSize = (o) => o.getBoundingRect(true, true).height;
        intPos = editor.getMarginY();
        break;
      default:
        return;
    }

    // disable render trigger while we edit the positions
    this.canvas.renderOnAddRemove = false;
    selectables.forEach((obj) => {
      const pos = getPoint(obj, intPos);
      obj.setPositionByOrigin(pos, 'center', 'center');
      intPos += getSize(obj);
    });
    this.canvas.renderOnAddRemove = true;
  }
}

export default AutomaticAlignPlugin;
