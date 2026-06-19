import type { AlertItem, AlertCategory, AlertLevel, AlertStatus } from '@/types';

const generateAlert = (
  id: string,
  title: string,
  category: AlertCategory,
  categoryName: string,
  level: AlertLevel,
  content: string,
  sourcePlatform: string,
  keywords: { keyword: string; count: number }[],
  targets: string[],
  classIds: string[],
  classNames: string[],
  students: string[]
): AlertItem => ({
  id,
  title,
  category,
  categoryName,
  level,
  levelName: level === 'normal' ? '常规' : level === 'warning' ? '预警' : '紧急',
  status: ['pending', 'processing', 'resolved', 'pending', 'pending'][parseInt(id.split('_')[1]) % 5] as AlertStatus,
  statusName: '',
  content,
  sourceScreenshot: `https://picsum.photos/id/${20 + parseInt(id.split('_')[1])}/600/400`,
  sourcePlatform,
  sourceTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 3).toISOString(),
  keywordHits: keywords,
  suggestedTargets: targets,
  relatedClassIds: classIds,
  relatedClassNames: classNames,
  relatedStudents: students,
  createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 2).toISOString(),
  viewCount: Math.floor(Math.random() * 20)
});

export const alertsData: AlertItem[] = [
  generateAlert(
    'alert_1',
    '期末考试安排讨论引发焦虑',
    'exam',
    '考试安排',
    'warning',
    '最近班级群里都在讨论期末周的考试安排，有多名同学表示时间太紧复习不过来，担心多门考试安排在同一天会影响发挥，情绪比较焦虑。',
    '班级微信群',
    [
      { keyword: '期末考试', count: 15 },
      { keyword: '复习不完', count: 8 },
      { keyword: '焦虑', count: 5 }
    ],
    ['学习委员', '班长', '各宿舍长'],
    ['class_1', 'class_2'],
    ['计算机2301班', '计算机2302班'],
    ['张同学(计2301)', '李同学(计2301)']
  ),
  generateAlert(
    'alert_2',
    '宿舍休息时间噪音纠纷',
    'dormitory',
    '宿舍矛盾',
    'urgent',
    '宿舍3号楼402室同学反映，同宿舍舍友夜间经常打游戏到凌晨两三点，严重影响其他同学休息，已沟通多次未果，情绪激动。',
    '校园论坛匿名板块',
    [
      { keyword: '宿舍噪音', count: 6 },
      { keyword: '打游戏', count: 10 },
      { keyword: '休息不好', count: 4 }
    ],
    ['402宿舍全体成员', '宿舍楼管'],
    ['class_4'],
    ['软件工程2301班'],
    ['王同学(软2301)', '赵同学(软2301)']
  ),
  generateAlert(
    'alert_3',
    '奖学金评选结果异议',
    'scholarship',
    '奖助学金',
    'warning',
    '部分同学对本次国家奖学金评选结果有异议，认为评选标准不够透明，有同学绩点更高但未入选。',
    '班级QQ群',
    [
      { keyword: '奖学金', count: 12 },
      { keyword: '不公平', count: 3 },
      { keyword: '绩点', count: 7 }
    ],
    ['班级评议小组', '班长'],
    ['class_3', 'class_6'],
    ['计算机2201班', '软件工程2201班'],
    ['刘同学(计2201)']
  ),
  generateAlert(
    'alert_4',
    '食堂饭菜质量吐槽增多',
    'life',
    '学生生活',
    'normal',
    '最近一周有多名同学在校园贴吧反映二食堂饭菜质量下降，价格上涨，排队时间过长，希望学校能改善。',
    '校园贴吧',
    [
      { keyword: '食堂', count: 20 },
      { keyword: '饭菜', count: 15 },
      { keyword: '贵', count: 8 }
    ],
    ['生活委员'],
    ['class_1', 'class_4', 'class_7'],
    ['计算机2301班', '软件工程2301班', '电子信息2301班'],
    []
  ),
  generateAlert(
    'alert_5',
    '某同学发表情绪低落言论',
    'psychology',
    '心理状态',
    'urgent',
    '某同学在个人社交账号连续多天发表消极言论，表示压力很大、对未来迷茫，有失眠情况，需要重点关注。',
    '朋友圈截图',
    [
      { keyword: '压力大', count: 4 },
      { keyword: '睡不着', count: 3 },
      { keyword: '没意思', count: 2 }
    ],
    ['本人', '舍友', '心理委员'],
    ['class_5'],
    ['软件工程2302班'],
    ['陈同学(软2302)']
  ),
  generateAlert(
    'alert_6',
    '两宿舍同学因小事起争执',
    'conflict',
    '冲突纠纷',
    'warning',
    '篮球场旁两拨同学因篮球场地使用问题发生口角，差点升级为肢体冲突，被周围同学劝开。',
    '同学私信反馈',
    [
      { keyword: '吵架', count: 3 },
      { keyword: '篮球场', count: 5 },
      { keyword: '动手', count: 1 }
    ],
    ['在场同学', '双方宿舍长'],
    ['class_2', 'class_8'],
    ['计算机2302班', '电子信息2302班'],
    ['孙同学(计2302)', '周同学(电2302)']
  ),
  generateAlert(
    'alert_7',
    '考研相关咨询需求集中',
    'life',
    '学生生活',
    'normal',
    '大三班级群有较多同学询问考研准备建议，希望组织经验分享会，了解往届考研情况。',
    '专业年级群',
    [
      { keyword: '考研', count: 25 },
      { keyword: '经验分享', count: 6 },
      { keyword: '复习计划', count: 9 }
    ],
    ['学习委员', '往届学长学姐'],
    ['class_3', 'class_6'],
    ['计算机2201班', '软件工程2201班'],
    []
  ),
  generateAlert(
    'alert_8',
    '兼职信息安全提醒',
    'life',
    '学生生活',
    'warning',
    '有人在多个班级群发布高额兼职信息，疑似诈骗，已有同学咨询是否可信，需要及时提醒。',
    'QQ群转发',
    [
      { keyword: '兼职', count: 8 },
      { keyword: '日结', count: 5 },
      { keyword: '押金', count: 3 }
    ],
    ['各班宣传委员'],
    ['class_1', 'class_2', 'class_4', 'class_5'],
    ['计算机2301班', '计算机2302班', '软件工程2301班', '软件工程2302班'],
    []
  ),
  generateAlert(
    'alert_9',
    '四级英语备考压力大',
    'exam',
    '考试安排',
    'normal',
    '距离四级考试还有一个月，不少同学表示词汇量不够、听力听不懂，焦虑情绪蔓延。',
    '英语学习群',
    [
      { keyword: '四级', count: 18 },
      { keyword: '听力', count: 11 },
      { keyword: '词汇', count: 9 }
    ],
    ['英语课代表', '学习委员'],
    ['class_7', 'class_8', 'class_9'],
    ['电子信息2301班', '电子信息2302班', '工商管理2301班'],
    []
  ),
  generateAlert(
    'alert_10',
    '助学金申请材料疑问多',
    'scholarship',
    '奖助学金',
    'normal',
    '本次助学金申请期间，很多同学对所需材料和申请流程有疑问，需要统一说明。',
    '班委工作群',
    [
      { keyword: '助学金', count: 14 },
      { keyword: '材料', count: 8 },
      { keyword: '流程', count: 5 }
    ],
    ['各生活委员'],
    ['class_1', 'class_4', 'class_9', 'class_10'],
    ['计算机2301班', '软件工程2301班', '工商管理2301班', '会计学2301班'],
    []
  ),
  generateAlert(
    'alert_11',
    '宿舍卫生检查结果不满意',
    'dormitory',
    '宿舍矛盾',
    'normal',
    '部分宿舍对上周卫生检查结果有异议，认为评分标准不统一，与宿管沟通态度不好。',
    '宿舍长群',
    [
      { keyword: '卫生检查', count: 7 },
      { keyword: '评分', count: 5 },
      { keyword: '不公平', count: 2 }
    ],
    ['相关宿舍长'],
    ['class_2', 'class_5'],
    ['计算机2302班', '软件工程2302班'],
    []
  ),
  generateAlert(
    'alert_12',
    '某学生多日未正常上课',
    'life',
    '学生生活',
    'urgent',
    '据任课老师反馈，一名同学已连续3天未到课，舍友称其一直在宿舍，情绪不佳，不与人交流。',
    '任课老师反馈',
    [
      { keyword: '旷课', count: 3 },
      { keyword: '不出宿舍', count: 2 },
      { keyword: '不说话', count: 1 }
    ],
    ['本人', '舍友', '家长'],
    ['class_3'],
    ['计算机2201班'],
    ['吴同学(计2201)']
  )
];

alertsData.forEach(alert => {
  const statusMap: Record<AlertStatus, string> = {
    pending: '待核实',
    processing: '核实中',
    resolved: '已解决'
  };
  alert.statusName = statusMap[alert.status];
});

export const getAlertsByCategory = (category?: AlertCategory): AlertItem[] => {
  if (!category) return alertsData;
  return alertsData.filter(a => a.category === category);
};

export const getAlertsByStatus = (status?: AlertStatus): AlertItem[] => {
  if (!status) return alertsData;
  return alertsData.filter(a => a.status === status);
};

export const getAlertById = (id: string): AlertItem | undefined => {
  return alertsData.find(a => a.id === id);
};
