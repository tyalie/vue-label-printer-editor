class SettingsPlugin {
  static pluginName = 'Settings';
  static apis = [
    'setWidth',
    'setHeight',
    'getDimensions',
    'setMargin',
    'getMarginX',
    'getMarginY',
    'setFlexibilityX',
    'setFlexibilityY',
    'getFlexibilityX',
    'getFlexibilityY',
    'setAutoAlignDirection',
    'getAutoAlignDirection',
  ];

  width = 0;
  height = 128;
  flexibleX = true;
  flexibleY = false;
  marginX = 10;
  marginY = 10;
  autoAlignDirection: '' | 'X' | 'Y' = 'X';

  setWidth(width: number) {
    this.width = width;
  }

  setHeight(height: number) {
    this.height = height;
  }

  getDimensions() {
    return { width: this.width, height: this.height };
  }

  setMargin(x, y) {
    this.marginX = x;
    this.marginY = y;
  }

  getMarginX() {
    return this.marginX;
  }

  getMarginY() {
    return this.marginY;
  }

  setFlexibilityX(value: boolean) {
    this.flexibleX = value;
  }

  setFlexibilityY(value: boolean) {
    this.flexibleY = value;
  }

  getFlexibilityX() {
    return this.flexibleX;
  }

  getFlexibilityY() {
    return this.flexibleY;
  }

  setAutoAlignDirection(value: '' | 'X' | 'Y') {
    this.autoAlignDirection = value;
  }

  getAutoAlignDirection(value: boolean) {
    if (this.flexibleX && this.flexibleY) return '';

    return this.autoAlignDirection;
  }

  destroy() {
    console.log('pluginDestroy');
  }
}

export default SettingsPlugin;
