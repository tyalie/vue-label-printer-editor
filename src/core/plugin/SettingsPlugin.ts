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
  ];

  width = 0;
  height = 0;
  flexibleX = true;
  flexibleY = true;
  marginX = 10;
  marginY = 10;

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

  destroy() {
    console.log('pluginDestroy');
  }
}

export default SettingsPlugin;
