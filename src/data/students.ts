import type { StudentInfo, StudentRiskLevel, OverviewStats, ClassStats } from '@/types';

const generateCareHistory = (studentId: string, count: number) => {
  const types = [
    { type: 'talk', typeName: '谈心谈话' },
    { type: 'academic', typeName: '学业帮扶' },
    { type: 'psychology', typeName: '心理关怀' },
    { type: 'life', typeName: '生活关怀' },
    { type: 'family', typeName: '家校沟通' }
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `care_${studentId}_${i}`,
    type: types[i % types.length].type,
    typeName: types[i % types.length].typeName,
    content: [
      '了解近期学习和生活状态，给予鼓励和支持。',
      '针对学业困难制定辅导计划，安排学长帮扶。',
      '发现情绪波动，耐心倾听并提供心理疏导建议。',
      '关注宿舍生活情况，协调解决生活困难。',
      '与家长电话沟通，反馈学生在校表现，形成家校合力。'
    ][i % 5],
    relatedAlertId: i % 3 === 0 ? `alert_${(i % 12) + 1}` : undefined,
    relatedAlertTitle: i % 3 === 0 ? ['期末考试安排讨论引发焦虑', '某同学发表情绪低落言论', '宿舍休息时间噪音纠纷'][i % 3] : undefined,
    createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 * (3 + Math.floor(Math.random() * 10))).toISOString()
  }));
};

const generateStudent = (
  id: string,
  name: string,
  studentNo: string,
  gender: '男' | '女',
  classId: string,
  className: string,
  riskLevel: StudentRiskLevel,
  tags: string[],
  alertCount: number
): StudentInfo => {
  const riskMap: Record<StudentRiskLevel, string> = {
    normal: '正常',
    focused: '重点关注',
    highrisk: '重点关怀'
  };
  const dormBuildings = ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼'];
  return {
    id,
    name,
    studentNo,
    gender,
    classId,
    className,
    phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    dormitory: `${dormBuildings[parseInt(id.split('_')[1]) % 5]}${String(Math.floor(Math.random() * 500) + 100).padStart(3, '0')}`,
    riskLevel,
    riskLevelName: riskMap[riskLevel],
    tags,
    recentAlertCount: alertCount,
    lastCareAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 14).toISOString(),
    careHistory: generateCareHistory(id, riskLevel === 'highrisk' ? 8 : riskLevel === 'focused' ? 5 : 2)
  };
};

export const studentsData: StudentInfo[] = [
  generateStudent('stu_1', '张明远', '2023010101', '男', 'class_1', '计算机2301班', 'focused', ['学业压力', '性格内向'], 2),
  generateStudent('stu_2', '李思琪', '2023010102', '女', 'class_1', '计算机2301班', 'normal', [], 1),
  generateStudent('stu_3', '王浩然', '2023010103', '男', 'class_1', '计算机2301班', 'normal', [], 0),
  generateStudent('stu_4', '陈雨欣', '2023010104', '女', 'class_2', '计算机2302班', 'focused', ['家庭困难', '勤工助学'], 1),
  generateStudent('stu_5', '刘子豪', '2023010105', '男', 'class_2', '计算机2302班', 'normal', [], 1),
  generateStudent('stu_6', '孙梦瑶', '2023010106', '女', 'class_2', '计算机2302班', 'normal', [], 0),
  generateStudent('stu_7', '周子轩', '2023010201', '男', 'class_4', '软件工程2301班', 'focused', ['宿舍矛盾', '作息不规律'], 2),
  generateStudent('stu_8', '吴俊杰', '2023010202', '男', 'class_4', '软件工程2301班', 'highrisk', ['沉迷游戏', '旷课多', '心理状态'], 3),
  generateStudent('stu_9', '郑雅婷', '2023010203', '女', 'class_4', '软件工程2301班', 'normal', [], 0),
  generateStudent('stu_10', '陈志远', '2023010204', '男', 'class_5', '软件工程2302班', 'highrisk', ['情绪低落', '社交障碍', '失眠'], 4),
  generateStudent('stu_11', '黄诗涵', '2023010205', '女', 'class_5', '软件工程2302班', 'focused', ['失恋', '学业退步'], 1),
  generateStudent('stu_12', '林宇辰', '2023010206', '男', 'class_5', '软件工程2302班', 'normal', [], 1),
  generateStudent('stu_13', '何嘉豪', '2023010301', '男', 'class_3', '计算机2201班', 'highrisk', ['考研焦虑', '家庭变故', '身体欠佳'], 3),
  generateStudent('stu_14', '罗晓雯', '2023010302', '女', 'class_3', '计算机2201班', 'focused', ['奖学金争议'], 2),
  generateStudent('stu_15', '谢文博', '2023010303', '男', 'class_3', '计算机2201班', 'normal', [], 0)
];

export const getFocusedStudents = (): StudentInfo[] => {
  return studentsData.filter(s => s.riskLevel === 'focused' || s.riskLevel === 'highrisk');
};

export const getHighRiskStudents = (): StudentInfo[] => {
  return studentsData.filter(s => s.riskLevel === 'highrisk');
};

export const getStudentsByClass = (classId: string): StudentInfo[] => {
  return studentsData.filter(s => s.classId === classId);
};

export const getStudentById = (id: string): StudentInfo | undefined => {
  return studentsData.find(s => s.id === id);
};

export const getStudentByName = (name: string): StudentInfo | undefined => {
  return studentsData.find(s => name.startsWith(s.name));
};

export const classStatsData: ClassStats[] = [
  { classId: 'class_1', className: '计算机2301班', totalStudents: 45, todayAlerts: 2, pendingAlerts: 1, resolvedAlerts: 8, focusedStudents: 2, weeklyRecords: 5 },
  { classId: 'class_2', className: '计算机2302班', totalStudents: 46, todayAlerts: 1, pendingAlerts: 1, resolvedAlerts: 6, focusedStudents: 1, weeklyRecords: 3 },
  { classId: 'class_3', className: '计算机2201班', totalStudents: 44, todayAlerts: 3, pendingAlerts: 2, resolvedAlerts: 5, focusedStudents: 3, weeklyRecords: 7 },
  { classId: 'class_4', className: '软件工程2301班', totalStudents: 48, todayAlerts: 2, pendingAlerts: 2, resolvedAlerts: 4, focusedStudents: 2, weeklyRecords: 6 },
  { classId: 'class_5', className: '软件工程2302班', totalStudents: 47, todayAlerts: 1, pendingAlerts: 1, resolvedAlerts: 3, focusedStudents: 2, weeklyRecords: 4 },
  { classId: 'class_6', className: '软件工程2201班', totalStudents: 45, todayAlerts: 0, pendingAlerts: 0, resolvedAlerts: 7, focusedStudents: 0, weeklyRecords: 3 }
];

export const overviewStatsData: OverviewStats = {
  totalAlertsToday: 9,
  pendingAlerts: 7,
  processingAlerts: 3,
  resolvedAlerts: 33,
  weeklyRecords: 28,
  focusedStudents: 10,
  classStats: classStatsData
};

export const getOverviewStats = (): OverviewStats => {
  return overviewStatsData;
};
