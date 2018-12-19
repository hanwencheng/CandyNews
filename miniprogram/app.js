//app.js

const app = getApp()

App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {}
  },
  onShow: function(options) {
    console.log('app show ' , options)

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=wxcba29eacf0d9c293&secret=SECRET&js_code=JSCODE&grant_type=authorization_code`


    // wx.getShareInfo({
    //   shareTicket: options.shareTicket,
    //   success: res=>{
    //     console.log('share info is', res)
    //     var  encrypt  =  res.encryptedData
    //     var  iv = res.iv
    //   }
    // })
  }
})
