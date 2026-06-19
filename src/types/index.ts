export interface College {
  id: string;
  name: string;
}

export interface Major {
  id: string;
  name: string;
  collegeId: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  majorId: string;
  grade: string;
  studentCount: number;
}

export interface CounselorInfo {
  name: string;
  collegeId: string;
  majorIds: string[];
  classIds: string[];
  collegeName: string;
  majorNames: string[];
  classNames: string[];
}

export type AlertCategory = 'life' | 'exam' | 'dormitory' | 'scholarship' | 'psychology' | 'conflict';

export type AlertLevel = 'normal' | 'warning' | 'urgent';

export type AlertStatus = 'pending' | 'processing' | 'resolved';

export interface KeywordHit {
  keyword: string;
  count: number;
}

export interface AlertItem {
  id: string;
  title: string;
  category: AlertCategory;
  categoryName: string;
  level: AlertLevel;
  levelName: string;
  status: AlertStatus;
  statusName: string;
  content: string;
  sourceScreenshot: string;
  sourcePlatform: string;
  sourceTime: string;
  keywordHits: KeywordHit[];
  suggestedTargets: string[];
  relatedClassIds: string[];
  relatedClassNames: string[];
  relatedStudents: string[];
  createdAt: string;
  viewCount: number;
}

export type RecordType = 'contact_classrep' | 'visit_dorm' | 'report_office' | 'talk_student' | 'notify_parent' | 'other';

export type RecordStatus = 'completed' | 'in_progress' | 'pending';

export interface VerifyRecord {
  id: string;
  alertId?: string;
  alertTitle?: string;
  type: RecordType;
  typeName: string;
  status: RecordStatus;
  statusName: string;
  content: string;
  counselorName: string;
  relatedStudents: string[];
  relatedClassId: string;
  relatedClassName: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
}

export type StudentRiskLevel = 'normal' | 'focused' | 'highrisk';

export interface StudentInfo {
  id: string;
  name: string;
  studentNo: string;
  gender: '男' | '女';
  classId: string;
  className: string;
  phone: string;
  dormitory: string;
  riskLevel: StudentRiskLevel;
  riskLevelName: string;
  tags: string[];
  recentAlertCount: number;
  lastCareAt: string;
  careHistory: CareRecord[];
}

export interface CareRecord {
  id: string;
  type: string;
  typeName: string;
  content: string;
  relatedAlertId?: string;
  relatedAlertTitle?: string;
  createdAt: string;
}

export interface ClassStats {
  classId: string;
  className: string;
  totalStudents: number;
  todayAlerts: number;
  pendingAlerts: number;
  resolvedAlerts: number;
  focusedStudents: number;
  weeklyRecords: number;
}

export interface OverviewStats {
  totalAlertsToday: number;
  pendingAlerts: number;
  processingAlerts: number;
  resolvedAlerts: number;
  weeklyRecords: number;
  focusedStudents: number;
  classStats: ClassStats[];
}
