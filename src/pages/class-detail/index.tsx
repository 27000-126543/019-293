import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { useApp } from '@/store/AppContext';
import { formatTime, formatRelativeTime, getCategoryLabel } from '@/utils';
import type { AlertItem, VerifyRecord, StudentInfo } from '@/types';

const ClassDetailPage: React.FC = () => {
  const router = useRouter();
  const classId = router.params?.classId || '';
  const className = router.params?.className ? decodeURIComponent(router.params.className) : '';
  const { getScopedAlerts, getScopedRecords, getScopedStudents } = useApp();
  const [, forceTick] = useState(0);

  useDidShow(() => { forceTick(t => t + 1); });

  const scopedAlerts = useMemo(() => getScopedAlerts(), [getScopedAlerts, forceTick]);
  const scopedRecords = useMemo(() => getScopedRecords(), [getScopedRecords, forceTick]);
  const scopedStudents = useMemo(() => getScopedStudents(), [getScopedStudents, forceTick]);

  const classAlerts = useMemo(() => scopedAlerts.filter(a => a.relatedClassIds.includes(classId)), [scopedAlerts, classId]);
  const classRecords = useMemo(() => scopedRecords.filter(r => r.relatedClassId === classId), [scopedRecords, classId]);
  const classStudents = useMemo(() => scopedStudents.filter(s => s.classId === classId), [scopedStudents, classId]);
  const focusedStudents = useMemo(() => classStudents.filter(s => s.riskLevel !== 'normal'), [classStudents]);

  const goToAlert = (id: string) => Taro.navigateTo({ url: `/pages/alert-detail/index?id=${id}` });
  const goToRecord = (id: string) => Taro.navigateTo({ url: `/pages/record-detail/index?id=${id}` });
  const goToStudent = (id: string) => Taro.navigateTo({ url: `/pages/student-detail/index?id=${id}` });

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>{className}</Text>
        <Text className={styles.headerSubtitle}>共 {classStudents.length} 名学生 · {focusedStudents.length} 名重点关注</Text>
        <View className={styles.headerStats}>
          <View className={styles.headerStatItem}>
            <Text className={styles.headerStatValue}>{classAlerts.filter(a => a.status !== 'resolved').length}</Text>
            <Text className={styles.headerStatLabel}>待处理线索</Text>
          </View>
          <View className={styles.headerStatItem}>
            <Text className={styles.headerStatValue}>{classRecords.length}</Text>
            <Text className={styles.headerStatLabel}>走访记录</Text>
          </View>
          <View className={styles.headerStatItem}>
            <Text className={styles.headerStatValue}>{focusedStudents.length}</Text>
            <Text className={styles.headerStatLabel}>重点学生</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>舆情线索</Text>
            <Text className={styles.sectionCount}>{classAlerts.length} 条</Text>
          </View>
          {classAlerts.length > 0 ? classAlerts.map(alert => (
            <View key={alert.id} className={styles.alertItem} onClick={() => goToAlert(alert.id)}>
              <View className={styles.alertBadgeCol}><StatusBadge type="category" value={alert.category} /></View>
              <View className={styles.alertInfo}>
                <Text className={styles.alertTitle}>{alert.title}</Text>
                <View className={styles.alertMeta}>
                  <Text className={styles.alertMetaText}>{alert.levelName}</Text>
                  <Text className={styles.alertMetaText}>{alert.statusName}</Text>
                  <Text className={styles.alertMetaText}>{formatRelativeTime(alert.createdAt)}</Text>
                </View>
              </View>
              <Text className={styles.alertArrow}>›</Text>
            </View>
          )) : (
            <View className={styles.emptySection}><Text className={styles.emptyText}>暂无关联的舆情线索</Text></View>
          )}
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>走访记录</Text>
            <Text className={styles.sectionCount}>{classRecords.length} 条</Text>
          </View>
          {classRecords.length > 0 ? classRecords.map(record => (
            <View key={record.id} className={styles.recordItem} onClick={() => goToRecord(record.id)}>
              <View className={styles.recordInfo}>
                <View className={styles.recordType}><Text className={styles.recordTypeText}>{record.typeName}</Text></View>
                <Text className={styles.recordContent}>{record.content}</Text>
                <Text className={styles.recordMeta}>{record.counselorName} · {formatRelativeTime(record.createdAt)}</Text>
              </View>
              <Text className={styles.recordArrow}>›</Text>
            </View>
          )) : (
            <View className={styles.emptySection}><Text className={styles.emptyText}>暂无走访记录</Text></View>
          )}
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>重点学生</Text>
            <Text className={styles.sectionCount}>{focusedStudents.length} 名</Text>
          </View>
          {focusedStudents.length > 0 ? focusedStudents.map(student => (
            <View key={student.id} className={styles.studentItem} onClick={() => goToStudent(student.id)}>
              <View className={styles.studentAvatar}><Text className={styles.studentAvatarText}>{student.name.slice(0, 1)}</Text></View>
              <View className={styles.studentInfo}>
                <Text className={styles.studentName}>{student.name}</Text>
                <Text className={styles.studentTags}>{student.riskLevelName} · {student.tags.slice(0, 2).join('、')}</Text>
              </View>
              <Text className={styles.studentArrow}>›</Text>
            </View>
          )) : (
            <View className={styles.emptySection}><Text className={styles.emptyText}>暂无重点关注学生</Text></View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ClassDetailPage;
