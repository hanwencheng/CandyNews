// miniprogram/pages/createNews/createNews.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    text: "",
    imgUrl: null,
    value:100,
    benefit: 0.1,
    title: "标题"
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    if (!app.globalData.openid) {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          app.globalData.openid = res.result.openid
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '获取 openid 失败，请检查是否有部署 login 云函数',
          })
          console.log('[云函数] [login] 获取 openid 失败，请检查是否有部署云函数，错误信息：', err)
        }
      })
    }
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  onTextAreaBlur: function(e){
    this.setData({
      text:e.detail.value
    })
  },

  onTitleBlur: function (e) {
    this.setData({
      title: e.detail.value
    })
  },

  onBenifitBlur: function(e) {
    console.log('benefit is', e.detail.value)
    const parsedNumber = Number.parseFloat(e.detail.value)
    if (parsedNumber == 'NaN' || parsedNumber < 0 || parsedNumber > 1)
      return wx.showToast({
        icon: 'none',
        title: '请输入一个大于0小于1的数字作为转发收益比例',
      });
    console.log('number is', parsedNumber)
    this.setData({
      benefit: parsedNumber
    })
  },

  onValueBlur: function(e) {
    console.log('value is', e.detail.value)
    const parsedNumber = Number.parseFloat(e.detail.value)
    if (parsedNumber == 'NaN' || parsedNumber < 0)
      return wx.showToast({
        icon: 'none',
        title: '请输入一个大于0的数字作为查看的糖果收益',
      });
    this.setData({
      value: parsedNumber
    })
  },

  validateData: function(e) {
    if(this.data.value === 0)
      return false;

    return true;
  },

  onSubmitTap: function() {
    console.log("data object is", this.data)
    var that = this
    if(!this.validateData())
      return wx.showToast({
        icon: 'none',
        title: '请再检查一下输入数据',
      });
    
    const url = `https://api.jingtum.com/v2/wallet/new`
    wx.request({
      url,
      method:"GET",
      fail: function(err) {
        console.log('err in create account', err)
        return wx.showToast({
          icon: 'none',
          title: '账号创建错误' + err,
        });
      },
      success: function(res) {
        const body = res.data;
        const { secret, address } = body.wallet
        const current = 0, remained = 0
        const submitObject = Object.assign({
          secret, address, current, remained
        }, that.data)
        delete submitObject['__webviewId__']
        const db = wx.cloud.database()
        db.collection('posts').add({
          data: submitObject,
          success: res => {
            console.log('save id is', res._id)
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '新增记录失败'
            })
            console.error('[数据库] [新增记录] 失败：', err)
          }
        });
        wx.navigateTo({
          url: `../showNews/showNews?address=${address}`
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    const that = this
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        console.log('file path ', filePath)

        // 上传图片
        const fileSuffixRegex = /\.[^.]+?$/
        const fileFullNameRegex = /\.\w+\.\w+$/
        const cloudPath = app.globalData.openid + '/' + filePath.match(fileFullNameRegex)[0].substring(1)
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            that.setData({
              imgUrl: res.fileID
            })

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath


            // wx.navigateTo({
            //   url: '../storageConsole/storageConsole'
            // })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})