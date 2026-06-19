export default defineAppConfig({
  pages: [
    'pages/alerts/index',
    'pages/records/index',
    'pages/overview/index',
    'pages/setup/index',
    'pages/alert-detail/index',
    'pages/add-record/index',
    'pages/student-detail/index',
    'pages/record-detail/index',
    'pages/class-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E88E5',
    navigationBarTitleText: '舆情巡查',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#909399',
    selectedColor: '#1E88E5',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/alerts/index',
        text: '提醒列表'
      },
      {
        pagePath: 'pages/records/index',
        text: '核实记录'
      },
      {
        pagePath: 'pages/overview/index',
        text: '班级概览'
      }
    ]
  }
})
