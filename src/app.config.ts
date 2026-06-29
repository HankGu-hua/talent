export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/practice/index',
    'pages/question-bank/index',
    'pages/profile/index',
    'pages/result/index',
    'pages/question-detail/index',
    'pages/legal/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#eef4ff',
    navigationBarTitleText: '太灵面试练习助手',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#7b8496',
    selectedColor: '#2f6bff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/practice/index',
        text: '模拟'
      },
      {
        pagePath: 'pages/question-bank/index',
        text: '练习库'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
