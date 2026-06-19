import type { VerifyRecord, RecordType, RecordStatus } from '@/types';

const types: RecordType[] = ['contact_classrep', 'visit_dorm', 'report_office', 'talk_student', 'notify_parent', 'other'];
const statuses: RecordStatus[] = ['completed', 'in_progress', 'pending'];

const typeContents: Record<RecordType, string[]> = {
  contact_classrep: [
    '已联系班长和学习委员，了解班级整体复习状态，确认焦虑同学范围。',
    '已与宿舍长沟通，了解近期宿舍动态和潜在矛盾点。',
    '与各班班委召开短会，强调班级舆情关注的重要性。'
  ],
  visit_dorm: [
    '走访3号楼402宿舍，与双方同学分别谈话，调解噪音问题。',
    '晚查寝时顺访重点宿舍，与同学们聊生活近况，气氛良好。',
    '走访多个宿舍了解食堂反馈情况，收集具体意见。'
  ],
  report_office: [
    '已将奖学金评选异议反馈至学工办，等待复核处理。',
    '汇报学生心理异常情况，已协调心理咨询中心介入。',
    '校园诈骗风险已上报，学工办统一发布防骗提醒。'
  ],
  talk_student: [
    '与情绪低落同学一对一谈话，了解到是学业压力和家庭原因，持续关注中。',
    '与旷课同学深入交流，确认是沉迷游戏，已制定帮扶计划。',
    '与冲突双方分别谈话，已达成初步和解。'
  ],
  notify_parent: [
    '已通知旷课学生家长，家校联合监督学生返校上课。',
    '告知心理异常学生家长情况，建议假期带孩子做心理咨询。',
    '已联系重点学生家长，沟通近期学生在校表现。'
  ],
  other: [
    '组织班级心理健康主题班会，普及情绪疏导方法。',
    '协调宿管部门调整卫生检查时间，提前发布检查标准。',
    '联合学生会举办考研经验分享会，邀请5位学长学姐交流。'
  ]
};

const generateRecord = (
  id: string,
  type: RecordType,
  status: RecordStatus,
  alertId?: string,
  alertTitle?: string,
  students: string[] = [],
  classId: string = 'class_1',
  className: string = '计算机2301班'
): VerifyRecord => {
  const typeNameMap: Record<RecordType, string> = {
    contact_classrep: '联系班委',
    visit_dorm: '进宿舍了解',
    report_office: '反馈学工办',
    talk_student: '学生谈话',
    notify_parent: '通知家长',
    other: '其他方式'
  };
  const statusNameMap: Record<RecordStatus, string> = {
    completed: '已完成',
    in_progress: '进行中',
    pending: '待跟进'
  };
  const contents = typeContents[type];
  const content = contents[parseInt(id.split('_')[1]) % contents.length];

  const createdAt = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString();
  const updatedAt = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 1).toISOString();

  const statusHistory: { status: RecordStatus; statusName: string; time: string; note?: string }[] = [];
  if (status === 'pending') {
    statusHistory.push({ status: 'pending', statusName: statusNameMap.pending, time: createdAt, note: '创建记录' });
  } else if (status === 'in_progress') {
    statusHistory.push({ status: 'pending', statusName: statusNameMap.pending, time: createdAt, note: '创建记录' });
    statusHistory.push({ status: 'in_progress', statusName: statusNameMap.in_progress, time: updatedAt, note: '开始核实' });
  } else {
    statusHistory.push({ status: 'pending', statusName: statusNameMap.pending, time: createdAt, note: '创建记录' });
    statusHistory.push({ status: 'in_progress', statusName: statusNameMap.in_progress, time: new Date(new Date(createdAt).getTime() + 3600 * 1000).toISOString(), note: '开始核实' });
    statusHistory.push({ status: 'completed', statusName: statusNameMap.completed, time: updatedAt, note: '处理完成' });
  }

  return {
    id,
    alertId,
    alertTitle,
    type,
    typeName: typeNameMap[type],
    status,
    statusName: statusNameMap[status],
    content,
    counselorName: '王老师',
    relatedStudents: students,
    relatedClassId: classId,
    relatedClassName: className,
    createdAt,
    updatedAt,
    statusHistory,
    attachments: []
  };
};

export const recordsData: VerifyRecord[] = [
  generateRecord('record_1', 'contact_classrep', 'completed', 'alert_1', '期末考试安排讨论引发焦虑', ['学习委员-李明'], 'class_1', '计算机2301班'),
  generateRecord('record_2', 'visit_dorm', 'completed', 'alert_2', '宿舍休息时间噪音纠纷', ['王同学(软2301)', '赵同学(软2301)'], 'class_4', '软件工程2301班'),
  generateRecord('record_3', 'report_office', 'in_progress', 'alert_3', '奖学金评选结果异议', ['刘同学(计2201)'], 'class_3', '计算机2201班'),
  generateRecord('record_4', 'talk_student', 'completed', 'alert_5', '某同学发表情绪低落言论', ['陈同学(软2302)'], 'class_5', '软件工程2302班'),
  generateRecord('record_5', 'notify_parent', 'completed', 'alert_12', '某学生多日未正常上课', ['吴同学(计2201)'], 'class_3', '计算机2201班'),
  generateRecord('record_6', 'talk_student', 'in_progress', 'alert_6', '两宿舍同学因小事起争执', ['孙同学(计2302)', '周同学(电2302)'], 'class_2', '计算机2302班'),
  generateRecord('record_7', 'other', 'completed', 'alert_8', '兼职信息安全提醒', [], 'class_1', '计算机2301班'),
  generateRecord('record_8', 'contact_classrep', 'completed', 'alert_10', '助学金申请材料疑问多', ['生活委员-张蕾'], 'class_9', '工商管理2301班'),
  generateRecord('record_9', 'visit_dorm', 'completed', '', '', [], 'class_7', '电子信息2301班'),
  generateRecord('record_10', 'other', 'completed', 'alert_7', '考研相关咨询需求集中', [], 'class_6', '软件工程2201班'),
  generateRecord('record_11', 'contact_classrep', 'pending', 'alert_9', '四级英语备考压力大', [], 'class_8', '电子信息2302班'),
  generateRecord('record_12', 'visit_dorm', 'pending', 'alert_11', '宿舍卫生检查结果不满意', [], 'class_5', '软件工程2302班'),
  generateRecord('record_13', 'talk_student', 'completed', '', '', ['李同学(计2301)'], 'class_1', '计算机2301班'),
  generateRecord('record_14', 'report_office', 'completed', '', '', [], 'class_4', '软件工程2301班'),
  generateRecord('record_15', 'contact_classrep', 'completed', 'alert_4', '食堂饭菜质量吐槽增多', [], 'class_1', '计算机2301班')
];

export const getRecordsByAlertId = (alertId: string): VerifyRecord[] => {
  return recordsData.filter(r => r.alertId === alertId);
};

export const getRecordsByType = (type?: RecordType): VerifyRecord[] => {
  if (!type) return recordsData;
  return recordsData.filter(r => r.type === type);
};

export const getRecordsByStatus = (status?: RecordStatus): VerifyRecord[] => {
  if (!status) return recordsData;
  return recordsData.filter(r => r.status === status);
};

export const getRecordsByStudent = (studentName: string): VerifyRecord[] => {
  return recordsData.filter(r => r.relatedStudents.includes(studentName));
};

export const addRecord = (record: Omit<VerifyRecord, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): VerifyRecord => {
  const now = new Date();
  const nowStr = now.toISOString();
  const statusNameMap: Record<RecordStatus, string> = {
    completed: '已完成',
    in_progress: '进行中',
    pending: '待跟进'
  };
  const statusHistory: VerifyRecord['statusHistory'] = [];
  if (record.status === 'pending') {
    statusHistory.push({ status: 'pending', statusName: statusNameMap.pending, time: nowStr, note: '创建记录' });
  } else if (record.status === 'in_progress') {
    statusHistory.push({ status: 'pending', statusName: statusNameMap.pending, time: nowStr, note: '创建记录' });
    statusHistory.push({ status: 'in_progress', statusName: statusNameMap.in_progress, time: nowStr, note: '开始核实处理' });
  } else {
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const halfHourAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    statusHistory.push({ status: 'pending', statusName: statusNameMap.pending, time: oneHourAgo, note: '创建记录' });
    statusHistory.push({ status: 'in_progress', statusName: statusNameMap.in_progress, time: halfHourAgo, note: '开始核实处理' });
    statusHistory.push({ status: 'completed', statusName: statusNameMap.completed, time: nowStr, note: '处理完成' });
  }
  const newRecord: VerifyRecord = {
    ...record,
    id: `record_${Date.now()}`,
    createdAt: record.status === 'completed' ? statusHistory[0].time : nowStr,
    updatedAt: nowStr,
    statusHistory
  };
  recordsData.unshift(newRecord);
  return newRecord;
};
