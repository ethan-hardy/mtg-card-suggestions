import _ from 'lodash';

class KeyPressHelper {
  constructor() {
    this.keyListeners = {};

    // onkeypress doesn't work for arrow keys
    document.onkeydown = ((e) => {
      this.keyPressed(e);
    });
  }

  keyPressed(e) {
    if (!_.isArray(this.keyListeners[e.key])) { return; }

    for (const listener of this.keyListeners[e.key]) {
      listener(e);
    }
  }

  registerKeyListener = (key, onKeyPress) => {
    if (!_.isString(key) || !_.isFunction(onKeyPress)) {
      throw new TypeError(
        `Expected key: String, onKeyPress: Function -- got key: ${typeof key}, onKeyPress: ${typeof onKeyPress}`);
    }
    this.keyListeners[key] = this.keyListeners[key] || [];
    this.keyListeners[key].push(onKeyPress);
  }
}

const keyPressHelper = new KeyPressHelper();

export default keyPressHelper;
