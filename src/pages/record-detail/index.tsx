import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useApp } from '@/store/AppContext';
import { formatTime } from '@/utils';
import type { VerifyRecord } from '@/types';

const RecordDetailPage: React.FC = () => {
  const router = useRouter();
  const recordId = router.params?.id || '';
  const { getScopedRecords, getAlertById } = useApp();
  const [, forceTick] = useState(0);

  useDidShow(() => { forceTick(t => t + 1); });

  const scopedRecords = useMemo(() => getScopedRecords(), [getScopedRecords, forceTick]);
  const record = useMemo(() => scopedRecords.find(r => r.id === recordId), [scopedRecords, recordId, forceTick]);
  const relatedAlert = useMemo(() => record?.alertId ? getAlertById(record.alertId) : undefined, [record, getAlertById]);

  const goToAlert = (id: string) => { Taro.navigateTo({ url: `/pages/alert-detail/index?id=${id}` }); };

  if (!record) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '64rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '28rpx', color: '#909399' }}>未找到该记录</Text>
        </View>
      </View>
    );
  }

  const statusColor = record.status === 'completed' ? '#43A047' : record.status === 'in_progress' ? '#FB8C00' : '#909399';

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.headerBadges}>
          <View className={styles.headerBadge}><Text className={styles.headerBadgeText}>{record.typeName}</Text></View>
          <View className={styles.headerBadge} style={{ backgroundColor: `${statusColor}25` }}>
            <Text className={styles.headerBadgeText} style={{ color: statusColor }}>{record.statusName}</Text>
          </View>
        </View>
        <Text className={styles.headerContent}>{record.content}</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.cardHeader}><Text className={styles.cardTitle}>基本信息</Text></View>
          <View className={styles.infoGrid}>
            <View className={styles.infoRow}><Text className={styles.infoLabel}>记录类型</Text><Text className={styles.infoValue}>{record.typeName}</Text></View>
            <View className={styles.infoRow}><Text className={styles.infoLabel}>处理状态</Text><Text className={styles.infoValue} style={{ color: statusColor }}>{record.statusName}</Text></View>
            <View className={styles.infoRow}><Text className={styles.infoLabel}>辅导员</Text><Text className={styles.infoValue}>{record.counselorName}</Text></View>
            <View className={styles.infoRow}><Text className={styles.infoLabel}>所属班级</Text><Text className={styles.infoValue}>{record.relatedClassName}</Text></View>
            {record.relatedStudents.length > 0 && (
              <View className={styles.infoRow}><Text className={styles.infoLabel}>涉及学生</Text><Text className={styles.infoValue}>{record.relatedStudents.join('、')}</Text></View>
            )}
          </View>
        </View>

        {relatedAlert && (
          <View className={styles.card}>
            <View className={styles.cardHeader}><Text className={styles.cardTitle}>关联舆情提醒</Text></View>
            <View className={styles.relatedAlert} onClick={() => goToAlert(relatedAlert.id)}>
              <View className={styles.relatedAlertInfo}>
                <Text className={styles.relatedAlertLabel}>{relatedAlert.categoryName} · {relatedAlert.levelName}</Text>
                <Text className={styles.relatedAlertTitle}>{relatedAlert.title}</Text>
              </View>
              <Text className={styles.relatedAlertArrow}>›</Text>
            </View>
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.cardHeader}><Text className={styles.cardTitle}>状态记录</Text></View>
          <View className={styles.statusList}>
            <View className={styles.statusEntry}>
              <View className={classnames(styles.statusDot, styles.statusDotPrimary)} />
              <Text className={styles.statusText}>创建记录</Text>
              <Text className={styles.statusTime}>{formatTime(record.createdAt)}</Text>
            </View>
            {record.updatedAt !== record.createdAt && (
              <View className={styles.statusEntry}>
                <View className={classnames(styles.statusDot, styles.statusDotSuccess)} />
                <Text className={styles.statusText}>最近更新</Text>
                <Text className={styles.statusTime}>{formatTime(record.updatedAt)}</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}><Text className={styles.cardTitle}>记录内容</Text></View>
          <Text className={styles.fullContent}>{record.content}</Text>
        </View>
      </View>
    </View>
  );
};

export default RecordDetailPage;
