// components/singleDisplay/SingleDisplay.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    iconName: {
      type: String,
      value: 'plus-circle',
    },
    text: {
      type: String,
      value: '这里是内容'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    internalTap(e){
      this.triggerEvent('onTap', e)
    },
    onLoad(){
      
    }
  }
})
