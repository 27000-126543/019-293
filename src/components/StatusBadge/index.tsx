import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { AlertCategory, AlertLevel, AlertStatus, StudentRiskLevel, RecordType, RecordStatus } from '@/types';
import { getCategoryColor, getLevelColor, getStatusColor, getCategoryLabel, getLevelLabel, getStatusLabel, getRecordTypeLabel, getRecordStatusLabel, getRiskLevelLabel } from '@/utils';

interface StatusBadgeProps {
  type: 'category' | 'level' | 'alertStatus' | 'recordType' | 'recordStatus' | 'riskLevel';
  value: AlertCategory | AlertLevel | AlertStatus | RecordType | RecordStatus | StudentRiskLevel;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  let label = '';
  let bgColor = '';
  let textColor = '';

  switch (type) {
    case 'category': {
      const colors = getCategoryColor(value as AlertCategory);
      label = getCategoryLabel(value as AlertCategory);
      bgColor = colors.bg;
      textColor = colors.text;
      break;
    }
    case 'level': {
      const colors = getLevelColor(value as AlertLevel);
      label = getLevelLabel(value as AlertLevel);
      bgColor = colors.bg;
      textColor = colors.text;
      break;
    }
    case 'alertStatus': {
      const colors = getStatusColor(value as AlertStatus);
      label = getStatusLabel(value as AlertStatus);
      bgColor = colors.bg;
      textColor = colors.text;
      break;
    }
    case 'recordType': {
      label = getRecordTypeLabel(value as RecordType);
      bgColor = '#E3F2FD';
      textColor = '#1565C0';
      break;
    }
    case 'recordStatus': {
      label = getRecordStatusLabel(value as RecordStatus);
      const statusColorMap: Record<RecordStatus, { bg: string; text: string }> = {
        completed: { bg: '#D1FAE5', text: '#065F46' },
        in_progress: { bg: '#DBEAFE', text: '#1E40AF' },
        pending: { bg: '#FEF3C7', text: '#92400E' }
      };
      bgColor = statusColorMap[value as RecordStatus].bg;
      textColor = statusColorMap[value as RecordStatus].text;
      break;
    }
    case 'riskLevel': {
      label = getRiskLevelLabel(value as StudentRiskLevel);
      const riskColorMap: Record<StudentRiskLevel, { bg: string; text: string }> = {
        normal: { bg: '#E8F5E9', text: '#2E7D32' },
        focused: { bg: '#FFF3E0', text: '#E65100' },
        highrisk: { bg: '#FFEBEE', text: '#C62828' }
      };
      bgColor = riskColorMap[value as StudentRiskLevel].bg;
      textColor = riskColorMap[value as StudentRiskLevel].text;
      break;
    }
  }

  return (
    <View
      className={classnames(styles.badge, size === 'md' && styles.badgeMd)}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <Text className={styles.badgeText}>{label}</Text>
    </View>
  );
};

export default StatusBadge;
