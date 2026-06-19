import React, { useState, useEffect, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { getStudentById } from '@/data/students';
import { alertsData, getAlertById } from '@/data/alerts';
import { formatTime, formatRelativeTime } from '@/utils';
import type { StudentInfo, AlertItem, CareRecord } from '@/types';

const StudentDetailPage: React.FC = () => {
  const router = useRouter();
  const studentId = router.params?.id || '';

  const [student, setStudent] = useState<StudentInfo | undefined>(getStudentById(studentId));

  useEffect(() => {
    const s = getStudentById(studentId);
    setStudent(s);
  }, [studentId]);

  const relatedAlerts = useMemo((): AlertItem[] => {
    if (!student) return [];
    const namePrefix = student.name.slice(0, 1);
    const matched: AlertItem[] = [];
    const careRelatedIds = new Set(
      student.careHistory
        .filter(c => c.relatedAlertId)
        .map(c => c.relatedAlertId as string)
    );
    careRelatedIds.forEach(id => {
      const alert = getAlertById(id);
      if (alert && !matched.find(m => m.id === alert.id)) {
        matched.push(alert);
      }
    });
    alertsData.forEach(alert => {
      const hasName = alert.relatedStudents.some(s => {
        const n = s.split('(')[0] || s;
        return n.startsWith(namePrefix) || n.includes(namePrefix);
      });
      const hasClass = alert.relatedClassIds.includes(student.classId);
      if ((hasName || (hasClass && student.recentAlertCount > 0)) && !matched.find(m => m.id === alert.id)) {
        matched.push(alert);
      }
    });
    return matched.slice(0, 6);
  }, [student]);

  const goToAlert = (alertId: string) => {
    Taro.navigateTo({
      url: `/pages/alert-detail/index?id=${alertId}`
    });
  };

  const handleCallPhone = () => {
    if (!student?.phone) {
      Taro.showToast({ title: '暂无联系电话', icon: 'none' });
      return;
    }
    Taro.makePhoneCall({
      phoneNumber: student.phone,
      fail: () => {
        Taro.showToast({ title: '拨号失败，请手动拨打', icon: 'none' });
      }
    });
  };

  const handleAddCareRecord = () => {
    if (!student) return;
    Taro.navigateTo({
      url: `/pages/add-record/index?studentId=${student.id}&studentName=${encodeURIComponent(student.name)}&classId=${student.classId}&className=${encodeURIComponent(student.className)}`
    });
  };

  if (!student) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '64rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '28rpx', color: '#909399' }}>未找到该学生信息</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.headerMain}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>{student.name.slice(0, 1)}</Text>
          </View>
          <View className={styles.headerInfo}>
            <View className={styles.headerName}>
              <Text className={styles.nameText}>{student.name}</Text>
            </View>
            <View className={styles.headerBadges}>
              <View className={styles.headerBadge}>
                <Text className={styles.headerBadgeText}>{student.riskLevelName}</Text>
              </View>
              <View className={styles.headerBadge}>
                <Text className={styles.headerBadgeText}>{student.gender}</Text>
              </View>
            </View>
            <Text className={styles.headerSubText}>{student.className} · {student.studentNo}</Text>
            <Text className={styles.headerSubText}>最近关怀：{formatRelativeTime(student.lastCareAt)}</Text>
            <View className={styles.headerTags}>
              {student.tags.length > 0 ? student.tags.map((tag, idx) => (
                <View key={idx} className={styles.personalTag}>
                  <Text className={styles.personalTagText}>{tag}</Text>
                </View>
              )) : (
                <View className={styles.personalTag}>
                  <Text className={styles.personalTagText}>暂无标签</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{student.recentAlertCount}</Text>
            <Text className={styles.statLabel}>关联舆情</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{student.careHistory.length}</Text>
            <Text className={styles.statLabel}>关怀记录</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{student.careHistory.filter(c => c.relatedAlertId).length}</Text>
            <Text className={styles.statLabel}>线索串联</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>基本信息</Text>
          </View>
          <View className={styles.infoGrid}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>学号</Text>
              <Text className={styles.infoValue}>{student.studentNo}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>班级</Text>
              <Text className={styles.infoValue}>{student.className}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>性别</Text>
              <Text className={styles.infoValue}>{student.gender}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>联系电话</Text>
              <Text className={styles.infoValue}>{student.phone}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>宿舍</Text>
              <Text className={styles.infoValue}>{student.dormitory}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>上次关怀</Text>
              <Text className={styles.infoValue}>{formatTime(student.lastCareAt)}</Text>
            </View>
          </View>
          <View className={styles.privacyTip}>
            <View className={styles.privacyTipIcon}>
              <Text className={styles.privacyTipIconText}>i</Text>
            </View>
            <Text className={styles.privacyTipText}>
              本记录仅用于辅导员日常关怀工作，严格遵守《个人信息保护法》及学校学生管理规定，不作任何监控用途。
            </Text>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>关联舆情线索</Text>
            <Text className={styles.cardCount}>{relatedAlerts.length} 条</Text>
          </View>
          {relatedAlerts.length > 0 ? (
            relatedAlerts.map((alert) => (
              <View key={alert.id} className={styles.alertItem} onClick={() => goToAlert(alert.id)}>
                <View className={styles.alertBadgeCol}>
                  <StatusBadge type="category" value={alert.category} />
                </View>
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
            ))
          ) : (
            <View className={styles.emptyAlerts}>
              <Text className={styles.emptyAlertsText}>暂无关联的舆情线索</Text>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>历史关怀记录</Text>
            <Text className={styles.cardCount}>{student.careHistory.length} 条</Text>
          </View>
          <View className={styles.timeline}>
            {student.careHistory.map((record: CareRecord) => (
              <View key={record.id} className={styles.careItem}>
                <View className={styles.careDot} />
                <View className={styles.careCard}>
                  <View className={styles.careHeader}>
                    <View className={styles.careType}>
                      <Text className={styles.careTypeText}>{record.typeName}</Text>
                    </View>
                    <Text className={styles.careTime}>{formatTime(record.createdAt, 'MM-DD HH:mm')}</Text>
                  </View>
                  <Text className={styles.careContent}>{record.content}</Text>
                  {record.relatedAlertId && (
                    <View className={styles.careLink} onClick={() => goToAlert(record.relatedAlertId!)}>
                      <Text className={styles.careLinkLabel}>关联：</Text>
                      <Text className={styles.careLinkText}>{record.relatedAlertTitle || '查看关联舆情'}</Text>
                      <Text className={styles.careLinkArrow}>›</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.btnSecondary} onClick={handleCallPhone}>
          <Text className={styles.btnSecondaryText}>拨打电话</Text>
        </View>
        <View className={styles.btnPrimary} onClick={handleAddCareRecord}>
          <Text className={styles.btnPrimaryText}>+ 新增关怀记录</Text>
        </View>
      </View>
    </View>
  );
};

export default StudentDetailPage;
