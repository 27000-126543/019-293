import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { useApp } from '@/store/AppContext';
import { formatTime, formatRelativeTime, getCategoryLabel } from '@/utils';
import type { AlertItem, CareRecord, VerifyRecord } from '@/types';

type TimelineTab = 'all' | 'care' | 'alert' | 'record';
type TimeRange = 'all' | 'week' | 'month';

const timelineTabs: { key: TimelineTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'care', label: '关怀记录' },
  { key: 'alert', label: '关联舆情' },
  { key: 'record', label: '核实记录' }
];

const timeRanges: { key: TimeRange; label: string }[] = [
  { key: 'all', label: '全部时间' },
  { key: 'week', label: '最近一周' },
  { key: 'month', label: '最近一月' }
];

interface TimelineEntry {
  id: string;
  type: 'care' | 'alert' | 'record';
  createdAt: string;
  typeName: string;
  typeColor: string;
  content: string;
  status?: string;
  statusName?: string;
  relatedAlertId?: string;
  relatedAlertTitle?: string;
  recordId?: string;
}

const StudentDetailPage: React.FC = () => {
  const router = useRouter();
  const { getStudentById, getScopedAlerts, getAlertById, getScopedRecords } = useApp();
  const studentId = router.params?.id || '';
  const [, forceTick] = useState(0);
  const [timelineTab, setTimelineTab] = useState<TimelineTab>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  useDidShow(() => { forceTick(t => t + 1); });

  const student = useMemo(() => getStudentById(studentId), [getStudentById, studentId, forceTick]);
  const scopedAlerts = useMemo(() => getScopedAlerts(), [getScopedAlerts, forceTick]);
  const scopedRecords = useMemo(() => getScopedRecords(), [getScopedRecords, forceTick]);

  const relatedAlerts = useMemo((): AlertItem[] => {
    if (!student) return [];
    const matched: AlertItem[] = [];
    const careRelatedIds = new Set(student.careHistory.filter(c => c.relatedAlertId).map(c => c.relatedAlertId as string));
    careRelatedIds.forEach(id => {
      const alert = getAlertById(id);
      if (alert && !matched.find(m => m.id === alert.id)) matched.push(alert);
    });
    const namePrefix = student.name.slice(0, 1);
    scopedAlerts.forEach(alert => {
      const hasName = alert.relatedStudents.some(s => { const n = s.split('(')[0] || s; return n.startsWith(namePrefix) || n.includes(namePrefix); });
      const hasClass = alert.relatedClassIds.includes(student.classId);
      if ((hasName || (hasClass && student.recentAlertCount > 0)) && !matched.find(m => m.id === alert.id)) matched.push(alert);
    });
    return matched.slice(0, 10);
  }, [student, scopedAlerts, getAlertById]);

  const studentRecords = useMemo((): VerifyRecord[] => {
    if (!student) return [];
    const namePrefix = student.name.slice(0, 1);
    return scopedRecords.filter(r =>
      r.relatedClassId === student.classId ||
      r.relatedStudents.some(s => s.includes(namePrefix) || student.name.includes(s.split('(')[0] || ''))
    );
  }, [student, scopedRecords]);

  const timelineEntries = useMemo((): TimelineEntry[] => {
    if (!student) return [];
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    const entries: TimelineEntry[] = [];

    if (timelineTab === 'all' || timelineTab === 'care') {
      student.careHistory.forEach(c => {
        entries.push({
          id: c.id,
          type: 'care',
          createdAt: c.createdAt,
          typeName: c.typeName,
          typeColor: '#1E88E5',
          content: c.content,
          relatedAlertId: c.relatedAlertId,
          relatedAlertTitle: c.relatedAlertTitle
        });
      });
    }

    if (timelineTab === 'all' || timelineTab === 'alert') {
      relatedAlerts.forEach(a => {
        entries.push({
          id: a.id,
          type: 'alert',
          createdAt: a.createdAt,
          typeName: getCategoryLabel(a.category),
          typeColor: '#FB8C00',
          content: a.title,
          status: a.status,
          statusName: a.statusName,
          relatedAlertId: a.id,
          relatedAlertTitle: a.title
        });
      });
    }

    if (timelineTab === 'all' || timelineTab === 'record') {
      studentRecords.forEach(r => {
        entries.push({
          id: r.id,
          type: 'record',
          createdAt: r.createdAt,
          typeName: r.typeName,
          typeColor: '#43A047',
          content: r.content,
          status: r.status,
          statusName: r.statusName,
          relatedAlertId: r.alertId,
          relatedAlertTitle: r.alertTitle,
          recordId: r.id
        });
      });
    }

    let filtered = entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (timeRange === 'week') {
      filtered = filtered.filter(e => (now - new Date(e.createdAt).getTime()) <= weekMs);
    } else if (timeRange === 'month') {
      filtered = filtered.filter(e => (now - new Date(e.createdAt).getTime()) <= monthMs);
    }

    return filtered;
  }, [student, relatedAlerts, studentRecords, timelineTab, timeRange]);

  const goToAlert = (alertId: string) => {
    Taro.navigateTo({ url: `/pages/alert-detail/index?id=${alertId}` });
  };

  const goToRecordDetail = (recordId: string) => {
    Taro.navigateTo({ url: `/pages/record-detail/index?id=${recordId}` });
  };

  const handleCallPhone = () => {
    if (!student?.phone) { Taro.showToast({ title: '暂无联系电话', icon: 'none' }); return; }
    Taro.makePhoneCall({ phoneNumber: student.phone, fail: () => { Taro.showToast({ title: '拨号失败', icon: 'none' }); } });
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
              <View className={styles.headerBadge}><Text className={styles.headerBadgeText}>{student.riskLevelName}</Text></View>
              <View className={styles.headerBadge}><Text className={styles.headerBadgeText}>{student.gender}</Text></View>
            </View>
            <Text className={styles.headerSubText}>{student.className} · {student.studentNo}</Text>
            <Text className={styles.headerSubText}>最近关怀：{formatRelativeTime(student.lastCareAt)}</Text>
            <View className={styles.headerTags}>
              {student.tags.length > 0 ? student.tags.map((tag, idx) => (
                <View key={idx} className={styles.personalTag}><Text className={styles.personalTagText}>{tag}</Text></View>
              )) : (
                <View className={styles.personalTag}><Text className={styles.personalTagText}>暂无标签</Text></View>
              )}
            </View>
          </View>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{relatedAlerts.length}</Text>
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
            <View className={styles.infoRow}><Text className={styles.infoLabel}>学号</Text><Text className={styles.infoValue}>{student.studentNo}</Text></View>
            <View className={styles.infoRow}><Text className={styles.infoLabel}>班级</Text><Text className={styles.infoValue}>{student.className}</Text></View>
            <View className={styles.infoRow}><Text className={styles.infoLabel}>性别</Text><Text className={styles.infoValue}>{student.gender}</Text></View>
            <View className={styles.infoRow}><Text className={styles.infoLabel}>联系电话</Text><Text className={styles.infoValue}>{student.phone}</Text></View>
            <View className={styles.infoRow}><Text className={styles.infoLabel}>宿舍</Text><Text className={styles.infoValue}>{student.dormitory}</Text></View>
            <View className={styles.infoRow}><Text className={styles.infoLabel}>上次关怀</Text><Text className={styles.infoValue}>{formatTime(student.lastCareAt)}</Text></View>
          </View>
          <View className={styles.privacyTip}>
            <View className={styles.privacyTipIcon}><Text className={styles.privacyTipIconText}>i</Text></View>
            <Text className={styles.privacyTipText}>本记录仅用于辅导员日常关怀工作，严格遵守《个人信息保护法》及学校学生管理规定，不作任何监控用途。</Text>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>动态时间轴</Text>
            <Text className={styles.cardCount}>{timelineEntries.length} 条</Text>
          </View>

          <ScrollView className={styles.filterBar} scrollX enhanced showScrollbar={false}>
            {timelineTabs.map(tab => (
              <View
                key={tab.key}
                className={classnames(styles.filterChip, timelineTab === tab.key && styles.filterChipActive)}
                onClick={() => setTimelineTab(tab.key)}
              >
                <Text className={classnames(styles.filterChipText, timelineTab === tab.key && styles.filterChipTextActive)}>{tab.label}</Text>
              </View>
            ))}
          </ScrollView>

          <View className={styles.timeFilter}>
            {timeRanges.map(tr => (
              <View
                key={tr.key}
                className={classnames(styles.timeChip, timeRange === tr.key && styles.timeChipActive)}
                onClick={() => setTimeRange(tr.key)}
              >
                <Text className={classnames(styles.timeChipText, timeRange === tr.key && styles.timeChipTextActive)}>{tr.label}</Text>
              </View>
            ))}
          </View>

          {timelineEntries.length > 0 ? (
            <View className={styles.timeline}>
              {timelineEntries.map(entry => (
                <View key={entry.id} className={styles.careItem}>
                  <View className={classnames(
                    entry.type === 'care' && styles.careDot,
                    entry.type === 'alert' && styles.alertDot,
                    entry.type === 'record' && styles.recordDot
                  )} />
                  <View
                    className={classnames(
                      styles.timelineCard,
                      (entry.type === 'alert' || entry.type === 'record') && styles.timelineCardClickable
                    )}
                    onClick={() => {
                      if (entry.type === 'alert' && entry.relatedAlertId) goToAlert(entry.relatedAlertId);
                      else if (entry.type === 'record' && entry.recordId) goToRecordDetail(entry.recordId);
                    }}
                  >
                    <View className={styles.timelineHeader}>
                      <View className={styles.timelineType} style={{ backgroundColor: `${entry.typeColor}15` }}>
                        <Text className={styles.timelineTypeText} style={{ color: entry.typeColor }}>{entry.typeName}</Text>
                      </View>
                      <Text className={styles.timelineTime}>{formatTime(entry.createdAt, 'MM-DD HH:mm')}</Text>
                    </View>
                    <Text className={styles.timelineContent}>{entry.content}</Text>
                    <View className={styles.timelineStatusRow}>
                      {entry.statusName && <StatusBadge type="alertStatus" value={entry.status as any} />}
                      {entry.relatedAlertTitle && entry.type !== 'alert' && (
                        <Text style={{ fontSize: '22rpx', color: '#1E88E5', marginLeft: '8rpx' }}>
                          关联：{entry.relatedAlertTitle.length > 15 ? entry.relatedAlertTitle.slice(0, 15) + '...' : entry.relatedAlertTitle}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptyTimeline}>
              <Text className={styles.emptyTimelineText}>
                {timeRange !== 'all' ? '当前时间段暂无记录，试试切换时间范围' : '暂无相关记录'}
              </Text>
            </View>
          )}
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
