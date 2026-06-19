import dayjs from 'dayjs';
import type { AlertCategory, AlertLevel, AlertStatus, RecordType, RecordStatus, StudentRiskLevel } from '@/types';

export const getCategoryLabel = (category: AlertCategory): string => {
  const map: Record<AlertCategory, string> = {
    life: '学生生活',
    exam: '考试安排',
    dormitory: '宿舍矛盾',
    scholarship: '奖助学金',
    psychology: '心理状态',
    conflict: '冲突纠纷'
  };
  return map[category] || '其他';
};

export const getLevelLabel = (level: AlertLevel): string => {
  const map: Record<AlertLevel, string> = {
    normal: '常规',
    warning: '预警',
    urgent: '紧急'
  };
  return map[level] || '常规';
};

export const getStatusLabel = (status: AlertStatus): string => {
  const map: Record<AlertStatus, string> = {
    pending: '待核实',
    processing: '核实中',
    resolved: '已解决'
  };
  return map[status] || '待核实';
};

export const getRecordTypeLabel = (type: RecordType): string => {
  const map: Record<RecordType, string> = {
    contact_classrep: '联系班委',
    visit_dorm: '进宿舍了解',
    report_office: '反馈学工办',
    talk_student: '学生谈话',
    notify_parent: '通知家长',
    other: '其他方式'
  };
  return map[type] || '其他方式';
};

export const getRecordStatusLabel = (status: RecordStatus): string => {
  const map: Record<RecordStatus, string> = {
    completed: '已完成',
    in_progress: '进行中',
    pending: '待跟进'
  };
  return map[status] || '待跟进';
};

export const getRiskLevelLabel = (level: StudentRiskLevel): string => {
  const map: Record<StudentRiskLevel, string> = {
    normal: '正常',
    focused: '重点关注',
    highrisk: '重点关怀'
  };
  return map[level] || '正常';
};

export const formatTime = (dateStr: string, format: string = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(dateStr).format(format);
};

export const formatRelativeTime = (dateStr: string): string => {
  const now = dayjs();
  const target = dayjs(dateStr);
  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatTime(dateStr, 'MM-DD');
};

export const getLevelColor = (level: AlertLevel): { bg: string; text: string } => {
  const map: Record<AlertLevel, { bg: string; text: string }> = {
    normal: { bg: '#E8F5E9', text: '#2E7D32' },
    warning: { bg: '#FFF3E0', text: '#E65100' },
    urgent: { bg: '#FFEBEE', text: '#C62828' }
  };
  return map[level] || map.normal;
};

export const getStatusColor = (status: AlertStatus): { bg: string; text: string } => {
  const map: Record<AlertStatus, { bg: string; text: string }> = {
    pending: { bg: '#FEF3C7', text: '#92400E' },
    processing: { bg: '#DBEAFE', text: '#1E40AF' },
    resolved: { bg: '#D1FAE5', text: '#065F46' }
  };
  return map[status] || map.pending;
};

export const getCategoryColor = (category: AlertCategory): { bg: string; text: string } => {
  const map: Record<AlertCategory, { bg: string; text: string }> = {
    life: { bg: '#E0F2FE', text: '#0369A1' },
    exam: { bg: '#FEF3C7', text: '#92400E' },
    dormitory: { bg: '#FCE7F3', text: '#9D174D' },
    scholarship: { bg: '#DBEAFE', text: '#1E40AF' },
    psychology: { bg: '#F3E8FF', text: '#6B21A8' },
    conflict: { bg: '#FEE2E2', text: '#991B1B' }
  };
  return map[category] || map.life;
};
