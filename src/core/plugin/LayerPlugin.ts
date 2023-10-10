/*
 * @Author: 秦少卫
 * @Date: 2023-06-15 23:23:18
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-06-27 23:07:57
 * @Description: 图层调整插件
 */

import { fabric } from 'fabric';
import Editor from '../core';
import { t } from '@/language/index';
type IEditor = Editor;

class LayerPlugin {
  public canvas: fabric.Canvas;
  public editor: IEditor;
  static pluginName = 'LayerPlugin';
  static apis = ['up', 'upTop', 'down', 'downTop'];
  constructor(canvas: fabric.Canvas, editor: IEditor) {
    this.canvas = canvas;
    this.editor = editor;
  }

  _getWorkspace() {
    return this.canvas.getObjects().find((item) => item.id === 'workspace');
  }

  _workspaceSendToBack() {
    const workspace = this._getWorkspace();
    workspace && workspace.sendToBack();
  }

  up() {
    const actives = this.canvas.getActiveObjects();
    if (actives && actives.length === 1) {
      const activeObject = this.canvas.getActiveObjects()[0];
      activeObject && activeObject.bringForward();
      this._workspaceSendToBack();
    }
  }

  upTop() {
    const actives = this.canvas.getActiveObjects();
    if (actives && actives.length === 1) {
      const activeObject = this.canvas.getActiveObjects()[0];
      activeObject && activeObject.bringToFront();
      this._workspaceSendToBack();
    }
  }

  down() {
    const actives = this.canvas.getActiveObjects();
    if (actives && actives.length === 1) {
      const activeObject = this.canvas.getActiveObjects()[0];
      activeObject && activeObject.sendBackwards();
      this._workspaceSendToBack();
    }
  }

  downTop() {
    const actives = this.canvas.getActiveObjects();
    if (actives && actives.length === 1) {
      const activeObject = this.canvas.getActiveObjects()[0];
      activeObject && activeObject.sendToBack();
      this._workspaceSendToBack();
    }
  }

  contextMenu() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      return [
        {
          text: t('mouseMenu.layer'),
          hotkey: '❯',
          subitems: [
            {
              text: t('mouseMenu.up'),
              hotkey: 'key',
              onclick: () => this.up(),
            },
            {
              text: t('mouseMenu.down'),
              hotkey: 'key',
              onclick: () => this.down(),
            },
            {
              text: t('mouseMenu.upTop'),
              hotkey: 'key',
              onclick: () => this.upTop(),
            },
            {
              text: t('mouseMenu.downTop'),
              hotkey: 'key',
              onclick: () => this.downTop(),
            },
          ],
        },
      ];
      // return [{ text: '复制', hotkey: 'Ctrl+V', disabled: false, onclick: () => this.clone() }];
    }
  }

  destroy() {
    console.log('pluginDestroy');
  }
}

export default LayerPlugin;
