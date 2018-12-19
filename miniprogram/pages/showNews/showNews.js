// miniprogram/pages/showNews/showNews.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    address: '',
    current: 0,
    remained:0,
    title: '',
    secret: '',
    value:0,
    imgUrl: null,
  },

  onPreviewImage(e) {
    wx.previewImage({
      curret: this.data.imgUrl,
      urls: [this.data.imgUrl] // 需要预览的图片http链接列表
    })
  },

  onTapAddress(e){
    wx.setClipboardData({
      data: this.data.address,
      success(res) {
        wx.getClipboardData({
          success(res) {
            wx.showToast({
              icon: 'none',
              title: '地址已复制到剪切板'
            })
          }
        })
      }
    })
  },

  showAPIError(err) {
    console.log('[云端] [查询记录] 失败：' , err)
    return wx.showToast({
      icon: 'none',
      title: '[云端] [查询记录] 失败：' , err,
    });
  },

  getFromDatabase(address, callback){
    const db = wx.cloud.database()
    db.collection('posts').where({ address }).get({
      success: res => {
        const { address, benefit, imgUrl, text, title, secret,value } = res.data[0]
        this.setData({ address, benefit, imgUrl, text, title, secret, value })
        console.log('[数据库] [查询记录] 成功: ', this.data)
        callback();
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  getFromAPI(address){
    const url = `https://api.jingtum.com/v2/accounts/${address}/balances`
    wx.request({
      url,
      method: "GET",
      fail: this.showAPIError,
      success:  res => {
        const body = res.data;
        if (!body.success){
          if(body.message === 'Account not found.')
            return wx.showToast({
              icon: 'none',
              title: '地址尚未激活'
            })
          return console.log('err' + body.message);
        }
          
        
        const totalBalance = Number.parseFloat(body.balances[0].value);
        const freeze = Number.parseFloat(body.balances[0].freezed);
        const balance = totalBalance - freeze
        this.setData({current: balance})
        console.log('[云端] [查询记录] 成功: 余额', this.data)
      }
    })
  },

  payCandy(recevierAddress, value, isCurrentUser) {
    const url = `https://api.jingtum.com/v2/accounts/${this.data.address}/payments`
    console.log('this is', this.data)
    wx.request({
      url,
      method: "POST",
      data: {
        secret: this.data.secret,
        client_id: 'candyNews' + Date.now(),
        "payment": {
          "source": this.data.address,
          "destination": recevierAddress,
          "amount": {
            "value": value,
            "currency": 'SWT',
            "issuer": ''
          },
          "memos": ['糖果快讯微信小程序发放']
        }
      },
      fail: this.showAPIError,
      success: res => {
        const body = res.data;
        if (!body.success)
          return this.showAPIError(body.result);

        if(isCurrentUser){
          wx.showToast({
            icon: 'none',
            title: `成功收到${value}SWTC糖果`
          })
        }
        console.log('糖果支付成功', body)
      }
    })
  },

  queryId(openid, callback) {
    const db = wx.cloud.database()
    db.collection('users').where({ openid }).get({
      success: res => {
        const benefitAddress = res.data[0].address
        console.log('[数据库] [查询用户] 成功: ', benefitAddress)
        callback(benefitAddress);
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  payCandyToBoth(benefitAddress){
    console.log('benefit address is ', benefitAddress)
    console.log('this address is ', this.globalData.address)
    if (this.globalData.address === benefitAddress)
      return;
    this.payCandy(benefitAddress, this.data.value * this.data.benefit, false)
    this.payCandy(this.globalData.address, this.data.value * (1 - this.data.benefit), true)
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(option) {
    var that = this;
    console.log('data is', option)
    this.getFromAPI(option.address)
    this.getFromDatabase(option.address, () => {
      if (option.openid !== null) {
        this.queryId(option.openid, this.payCandyToBoth)
      }
    })
   

    wx.showShareMenu({
      withShareTicket: true,
      success: (res)=> {
        console.log('share res is', res)
      },
      fail: this.showAPIError
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function (options) {

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
  onShareAppMessage: function (options) {
    const { from, target, webViewUrl} = options;
    const openid = app.globalData.openid
    console.log('转发openid is:', openid)
    // if(this.data.current < this.data.value){
    //   return wx.showToast({
    //     icon: 'none',
    //     title: '剩余糖果过少，请向地址补充糖果'
    //   })
    // }
    return {
      title: this.data.title + ' 剩余糖果：' + this.data.current + ' 阅读奖励：' + this.data.value ,
      path: `pages/showNews?openid=${openid}&address=${this.data.address}`,
      imageUrl: '../../logo.png',
    }
  }
})