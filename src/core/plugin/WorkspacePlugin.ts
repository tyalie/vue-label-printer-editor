/*
 * @Author: 秦少卫
 * @Date: 2023-06-27 12:26:41
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-07-05 00:34:38
 * @Description: 画布区域插件
 */

import { fabric } from 'fabric';
import Editor from '../core';
import { throttle } from 'lodash-es';
import { calculateWorkspacePos } from '@/utils/utils';
type IEditor = Editor;

class WorkspacePlugin {
  public canvas: fabric.Canvas;
  public editor: IEditor;
  static pluginName = 'WorkspacePlugin';
  static events = ['sizeChange'];
  static apis = ['big', 'small', 'auto', 'one', 'setSize'];
  workspaceEl: HTMLElement;
  workspace: null | fabric.Rect;
  option: any;
  constructor(canvas: fabric.Canvas, editor: IEditor) {
    this.canvas = canvas;
    this.editor = editor;
    this.init({
      width: 100,
      height: 128,
      flexibleX: true,
      flexibleY: false,
      marginX: 10,
      marginY: 10,
    });
  }

  init(option) {
    const workspaceEl = document.querySelector('#workspace') as HTMLElement;
    if (!workspaceEl) {
      throw new Error('element #workspace is missing, plz check!');
    }
    this.workspaceEl = workspaceEl;
    this.workspace = null;
    this.option = option;
    this._initBackground();
    this._initWorkspace();
    this._initResizeObserve();
    this._bindWheel();
    this._bindMove();

    this.editor.on('historyInitSuccess', () => {
      this.setSize(this.option.width, this.option.height, true);
    });
  }

  // hookImportBefore() {
  //   return new Promise((resolve, reject) => {
  //     resolve();
  //   });
  // }

  hookImportAfter() {
    return new Promise((resolve) => {
      const workspace = this.canvas.getObjects().find((item) => item.id === 'workspace');
      if (workspace) {
        workspace.set('selectable', false);
        workspace.set('hasControls', false);
        this.setSize(workspace.width, workspace.height);
        this.editor.emit('sizeChange', workspace.width, workspace.height);
      }

      resolve();
    });
  }

  hookSaveAfter() {
    return new Promise((resolve) => {
      this.auto();
      resolve(true);
    });
  }

  // 初始化背景
  _initBackground() {
    this.canvas.backgroundImage = '';
    this.canvas.setWidth(this.workspaceEl.offsetWidth);
    this.canvas.setHeight(this.workspaceEl.offsetHeight);
  }

  // 初始化画布
  _initWorkspace() {
    const backplane = new fabric.Rect({
      fill: 'rgba(255,255,255,1)',
      width: this.option.width,
      height: this.option.height,
      id: 'back',
    });

    const outline = new fabric.Rect({
      fill: 'transparent',
      stroke: 'gray',
      strokeWidth: 0.5,
      strokeDashArray: [2, 4],
      width: 0,
      height: 0,
      id: 'outline',
    });

    const workspace = new fabric.Group([backplane, outline], { id: 'workspace' }, false);

    workspace.set('selectable', false);
    workspace.set('hasControls', false);
    workspace.hoverCursor = 'default';

    this.canvas.add(workspace);
    this.canvas.sendToBack(workspace);
    this.workspace = workspace;

    this.canvas.renderAll();
    this.auto();
  }

  /**
   * 设置画布中心到指定对象中心点上
   * @param {Object} obj 指定的对象
   */
  setCenterFromObject(obj: fabric.Rect) {
    const { canvas } = this;
    const objCenter = obj.getCenterPoint();
    const viewportTransform = canvas.viewportTransform;
    if (canvas.width === undefined || canvas.height === undefined || !viewportTransform) return;
    viewportTransform[4] = canvas.width / 2 - objCenter.x * viewportTransform[0];
    viewportTransform[5] = canvas.height / 2 - objCenter.y * viewportTransform[3];
    canvas.setViewportTransform(viewportTransform);
    canvas.renderAll();
  }

  // 初始化监听器
  _initResizeObserve() {
    const resizeObserver = new ResizeObserver(
      throttle(() => {
        this.auto();
      }, 50)
    );
    resizeObserver.observe(this.workspaceEl);
  }

  setFlexibility(flexX: boolean, flexY: boolean) {
    this.option.flexibleX = flexX;
    this.option.flexibleY = flexY;
    _resizeToFit();
  }

  setSize(width: number, height: number, init = true) {
    if (!init && this.option.width == width && this.option.height == height) return;

    if (init) this._initBackground();

    this.option.width = width;
    this.option.height = height;
    // 重新设置workspac

    if (init) {
      this.workspace = this.canvas
        .getObjects()
        .find((item) => item.id === 'workspace') as fabric.Rect;
    }

    const back = this.workspace.getObjects()[0];
    back.set('left', -width / 2);
    back.set('top', -height / 2);
    back.set('width', width);
    back.set('height', height);

    const outline = this.workspace.getObjects()[1];
    outline.set('left', -width / 2 + this.option.marginX);
    outline.set('top', -height / 2 + this.option.marginY);
    outline.set('width', width - this.option.marginX * 2);
    outline.set('height', height - this.option.marginY * 2);

    this.workspace.set('width', width);
    this.workspace.set('height', height);

    this.canvas.requestRenderAll();
  }

  setZoomAuto(scale: number, cb?: (left?: number, top?: number) => void) {
    const { workspaceEl } = this;
    const width = workspaceEl.offsetWidth;
    const height = workspaceEl.offsetHeight;
    this.canvas.setWidth(width);
    this.canvas.setHeight(height);
    const center = this.canvas.getCenter();
    this.canvas.setViewportTransform(fabric.iMatrix.concat());
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), scale);
    if (!this.workspace) return;
    this.setCenterFromObject(this.workspace);

    if (cb) cb(this.workspace.left, this.workspace.top);
  }

  _getScale() {
    const viewPortWidth = this.workspaceEl.offsetWidth;
    const viewPortHeight = this.workspaceEl.offsetHeight;
    // 按照宽度
    if (viewPortWidth / viewPortHeight < this.option.width / this.option.height) {
      return viewPortWidth / this.option.width;
    } // 按照宽度缩放
    return viewPortHeight / this.option.height;
  }

  // 放大
  big() {
    let zoomRatio = this.canvas.getZoom();
    zoomRatio += 0.05;
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
  }

  // 缩小
  small() {
    let zoomRatio = this.canvas.getZoom();
    zoomRatio -= 0.05;
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(
      new fabric.Point(center.left, center.top),
      zoomRatio < 0 ? 0.01 : zoomRatio
    );
  }

  // 自动缩放
  auto() {
    const scale = this._getScale();
    this.setZoomAuto(scale - 0.08);
  }

  // 1:1 放大
  one() {
    this.setZoomAuto(0.8 - 0.08);
    this.canvas.requestRenderAll();
  }

  _bindWheel() {
    this.canvas.on('mouse:wheel', function (this: fabric.Canvas, opt) {
      const delta = opt.e.deltaY;
      let zoom = this.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      const center = this.getCenter();
      this.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  _bindMove() {
    this.canvas.on(
      'after:render',
      throttle(() => this._resizeToFit(), 50)
    );
  }

  _resizeToFit() {
    if (!(this.option.flexibleX || this.option.flexibleY)) return;

    const max_x =
      Math.max(
        ...this.canvas
          .getObjects()
          .map((e) => (e.id == 'workspace' ? 0 : calculateWorkspacePos(e, 'right', 'center').x))
      ) +
      this.option.marginX * 2;
    const max_y =
      Math.max(
        ...this.canvas
          .getObjects()
          .map((e) => (e.id == 'workspace' ? 0 : calculateWorkspacePos(e, 'center', 'bottom').y))
      ) +
      this.option.marginY * 2;

    this.setSize(
      Math.ceil(this.option.flexibleX ? max_x : this.option.width),
      Math.ceil(this.option.flexibleY ? max_y : this.option.height),
      false
    );
    this.editor.emit('sizeChange', this.option.width, this.option.height);
  }

  destroy() {
    console.log('pluginDestroy');
  }
}

export default WorkspacePlugin;
