/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * @Author: 秦少卫
 * @Date: 2023-06-20 13:06:31
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-07-04 23:37:07
 * @Description: 历史记录插件
 */

import { fabric } from 'fabric';
import Editor from '../core';
import { ref } from 'vue';
import { useRefHistory } from '@vueuse/core';
type IEditor = Editor;
// import { v4 as uuid } from 'uuid';

class HistoryPlugin {
  public canvas: fabric.Canvas;
  public editor: IEditor;
  static pluginName = 'HistoryPlugin';
  static apis = ['undo', 'redo', 'getHistory'];
  static events = ['historyInitSuccess'];
  public hotkeys: string[] = ['ctrl+z'];
  history: any;
  constructor(canvas: fabric.Canvas, editor: IEditor) {
    this.canvas = canvas;
    this.editor = editor;

    this._init();
  }

  _init() {
    this.history = useRefHistory(ref(this._get_data()), {
      capacity: 50,
    });
    this.canvas.on({
      'object:added': (event) => this._save(event),
      'object:modified': (event) => this._save(event),
      'object:removed': (event) => this._save(event),
    });
  }

  _get_data() {
    return this.editor.getJson();
  }

  getHistory() {
    return this.history;
  }
  _save(event) {
    // 过滤选择元素事件
    const isSelect = false && event.action === undefined && event.e;
    if (isSelect || !this.canvas) return;
    const workspace = this.canvas.getObjects().find((item) => item.id === 'workspace');
    if (!workspace) {
      return;
    }
    if (this.history.isTracking.value) {
      console.debug('History store', this._get_data());
      this.history.source.value = this._get_data();
    }
  }

  undo() {
    if (this.history.canUndo.value) {
      this.history.undo();
      this.renderCanvas();
    }
  }

  redo() {
    this.history.redo();
    this.renderCanvas();
  }

  renderCanvas = () => {
    this.history.pause();
    this.canvas.clear();
    this.canvas.loadFromJSON(this.history.source.value, () => {
      this.editor.emit('historyInitSuccess');
      this.canvas.renderAll();
      this.history.resume();
    });
  };

  // 快捷键扩展回调
  hotkeyEvent(eventName: string, e: any) {
    if (eventName === 'ctrl+z' && e.type === 'keydown') {
      this.undo();
    }
  }
  destroy() {
    console.log('pluginDestroy');
  }
}

export default HistoryPlugin;
