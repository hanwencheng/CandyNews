// components/InputComponent/InputComponent.js
Component({
  /**
   * Component properties
   */
  properties: {
    type: {
      type: String,
      value: 'number',
    },
    placeholder: {
      type: String,
      value: 100,
    },
    text: {
      type: String,
      value: '这里是内容'
    }
  },

  /**
   * Component initial data
   */
  data: {

  },

  /**
   * Component methods
   */
  methods: {
    internalBlur(e) {
      this.triggerEvent('onBlur', e)
    },
  }
})
