import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import type { VerifyRecord } from '@/types';
import { formatRelativeTime } from '@/utils';

interface RecordCardProps {
  record: VerifyRecord;
}

const RecordCard: React.FC<RecordCardProps> = ({ record }) => {
  const goToAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (record.alertId) {
      Taro.navigateTo({ url: `/pages/alert-detail/index?id=${record.alertId}` });
    }
  };

  const goToDetail = () => {
    Taro.navigateTo({ url: `/pages/record-detail/index?id=${record.id}` });
  };

  return (
    <View className={styles.card} onClick={goToDetail}>
      <View className={styles.cardHeader}>
        <View className={styles.headerLeft}>
          <StatusBadge type="recordType" value={record.type} />
          <View className={styles.badgeSpacing} />
          <StatusBadge type="recordStatus" value={record.status} />
        </View>
        <Text className={styles.time}>{formatRelativeTime(record.createdAt)}</Text>
      </View>

      {record.alertTitle && (
        <View className={styles.alertLink} onClick={goToAlert}>
          <Text className={styles.alertLinkLabel}>关联事项：</Text>
          <Text className={styles.alertLinkText}>{record.alertTitle}</Text>
          <Text className={styles.alertLinkArrow}>›</Text>
        </View>
      )}

      <Text className={styles.content}>{record.content}</Text>

      <View className={styles.cardFooter}>
        <View className={styles.footerInfo}>
          <Text className={styles.counselor}>{record.counselorName}</Text>
          <Text className={styles.dividerDot}>·</Text>
          <Text className={styles.className}>{record.relatedClassName}</Text>
        </View>
        {record.relatedStudents.length > 0 && (
          <View className={styles.students}>
            <Text className={styles.studentsText}>
              涉及：{record.relatedStudents.slice(0, 2).join('、')}
              {record.relatedStudents.length > 2 ? ` 等${record.relatedStudents.length}人` : ''}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RecordCard;
