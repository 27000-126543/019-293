import type { College, Major, ClassInfo } from '@/types';

export const colleges: College[] = [
  { id: 'college_1', name: '信息工程学院' },
  { id: 'college_2', name: '经济管理学院' },
  { id: 'college_3', name: '外国语学院' },
  { id: 'college_4', name: '机械工程学院' },
  { id: 'college_5', name: '材料科学与工程学院' }
];

export const majors: Major[] = [
  { id: 'major_1', name: '计算机科学与技术', collegeId: 'college_1' },
  { id: 'major_2', name: '软件工程', collegeId: 'college_1' },
  { id: 'major_3', name: '电子信息工程', collegeId: 'college_1' },
  { id: 'major_4', name: '工商管理', collegeId: 'college_2' },
  { id: 'major_5', name: '会计学', collegeId: 'college_2' },
  { id: 'major_6', name: '金融学', collegeId: 'college_2' },
  { id: 'major_7', name: '英语', collegeId: 'college_3' },
  { id: 'major_8', name: '日语', collegeId: 'college_3' },
  { id: 'major_9', name: '机械设计制造', collegeId: 'college_4' },
  { id: 'major_10', name: '材料科学', collegeId: 'college_5' }
];

export const classes: ClassInfo[] = [
  { id: 'class_1', name: '计算机2301班', majorId: 'major_1', grade: '2023级', studentCount: 45 },
  { id: 'class_2', name: '计算机2302班', majorId: 'major_1', grade: '2023级', studentCount: 46 },
  { id: 'class_3', name: '计算机2201班', majorId: 'major_1', grade: '2022级', studentCount: 44 },
  { id: 'class_4', name: '软件工程2301班', majorId: 'major_2', grade: '2023级', studentCount: 48 },
  { id: 'class_5', name: '软件工程2302班', majorId: 'major_2', grade: '2023级', studentCount: 47 },
  { id: 'class_6', name: '软件工程2201班', majorId: 'major_2', grade: '2022级', studentCount: 45 },
  { id: 'class_7', name: '电子信息2301班', majorId: 'major_3', grade: '2023级', studentCount: 43 },
  { id: 'class_8', name: '电子信息2302班', majorId: 'major_3', grade: '2023级', studentCount: 44 },
  { id: 'class_9', name: '工商管理2301班', majorId: 'major_4', grade: '2023级', studentCount: 50 },
  { id: 'class_10', name: '会计学2301班', majorId: 'major_5', grade: '2023级', studentCount: 48 }
];

export const getMajorsByCollege = (collegeId: string): Major[] => {
  return majors.filter(m => m.collegeId === collegeId);
};

export const getClassesByMajor = (majorId: string): ClassInfo[] => {
  return classes.filter(c => c.majorId === majorId);
};

export const getClassesByIds = (classIds: string[]): ClassInfo[] => {
  return classes.filter(c => classIds.includes(c.id));
};

export const getClassById = (classId: string): ClassInfo | undefined => {
  return classes.find(c => c.id === classId);
};

export const getCollegeById = (collegeId: string): College | undefined => {
  return colleges.find(c => c.id === collegeId);
};

export const getMajorById = (majorId: string): Major | undefined => {
  return majors.find(m => m.id === majorId);
};
