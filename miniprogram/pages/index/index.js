//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    newsList: [],
    address: null,
    scanOpen: false,
    inputAddress: '',
    isFetching: true,
  },

  onRemoveListItem: function(event){
    const id = event.currentTarget.dataset.id
    console.log('id is', id)
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          const db = wx.cloud.database()
          const newList = that.data.newsList.filter((item) => {
            return item._id !== id
          })
          that.setData({
            newsList: newList
          })
          db.collection('posts').doc(id).remove({
            success(res) {
              console.log('[云端][删除数据] 成功：', res.data)
            },
            fail(err){
              console.log('[云端][删除数据] 失败：', err)
            }
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  getNewsList: function(openid) {
    const db = wx.cloud.database()
    db.collection('posts').where({ _openid:openid }).get({
      success: res => {
        console.log('get posts res is', res)
        this.setData({
          newsList: res.data,
          isFetching: false,
        })
      },
      fail: err=> {
        wx.showToast({
          icon: 'none',
          title: '查询历史列表失败'
        }),
        this.setData({isFetching: false})
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  getUserAddress: function (openid) {
    const db = wx.cloud.database()
    db.collection('users').where({ openid }).get({
      success: res => {
        console.log('get Address res is', res)
        if(res.data.length === 0)
          return;
        const address = res.data[0]
        this.setData({address, isFetching: false});
        app.globalData.address = address;
        console.log('[数据库] [查询记录] 成功: ', address)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        this.setData({isFetching: false});
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  onScanButton: function(){
    this.setData({
      scanOpen: true,
    });
  },

  onConfirmButton: function() {
    const address = this.data.inputAddress
    if (!this.validateAddress(address))
      return wx.showToast({
        icon: 'none',
        title: '请输入一个正确的地址',
      });
    const db = wx.cloud.database();
    db.collection('users').add({
      data: {
        openid: app.globalData.openid,
        address,
      },
      success: res => {
        console.log('save id is', res._id)
        this.setData({
          address: address,
        })
        app.globalData.address = address
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    });
  },

  onInputAddress: function(e){
    this.setData({
      inputAddress: e.detail.value
    })
  },

  getOpenid: function(callback) {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('login res', res)
        const openid = res.result.openid
        console.log('[云函数] [login] user openid: ', openid )
        app.globalData.openid = openid
        callback(openid)
      }
    })
  },

  onScanError: function(e){
    console.log('bar code scanned, error', e)
  },

  validateAddress: function(address){
    if (typeof address !== 'string')
      return false

    const regex = /^j[0-9A-Za-z]{32,33}$/
    const matchResult = address.match(regex)
    if(matchResult)
      return true
  },
  
  onBarcodeScanned: function(res){
    console.log('bar code scanned,', res)
    const address = res.detail.result;
    if(this.validateAddress(address)){
      this.setData({
        scanOpen: false,
        inputAddress: address,
      })
    }
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

   this.getOpenid((openid)=>{
     this.getUserAddress(openid)
     this.getNewsList(openid)
   })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }, fail: err => {
      console.error('[云函数] [login] 调用失败', err)
      }
    })
  },


  onCreateNewsTap: function(e) {
    wx.navigateTo({
      url: '../createNews/createNews',
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
})

