import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import RecordCard from '@/components/RecordCard';
import StatusBadge from '@/components/StatusBadge';
import { getAlertById } from '@/data/alerts';
import { getRecordsByAlertId } from '@/data/records';
import { formatTime } from '@/utils';
import type { AlertItem, VerifyRecord, AlertStatus } from '@/types';

const AlertDetailPage: React.FC = () => {
  const router = useRouter();
  const alertId = router.params?.id || '';
  const { records, updateAlertStatus } = useApp();

  const [alert, setAlert] = useState<AlertItem | undefined>(getAlertById(alertId));
  const [alertRecords, setAlertRecords] = useState<VerifyRecord[]>([]);

  useEffect(() => {
    const a = getAlertById(alertId);
    setAlert(a);
    const recs = records.filter(r => r.alertId === alertId);
    setAlertRecords(recs.length > 0 ? recs : getRecordsByAlertId(alertId));
  }, [alertId, records]);

  const goToAddRecord = () => {
    Taro.navigateTo({
      url: `/pages/add-record/index?alertId=${alertId}&alertTitle=${encodeURIComponent(alert?.title || '')}`
    });
  };

  const handleMarkResolved = () => {
    if (!alert) return;
    Taro.showModal({
      title: '确认已解决',
      content: '确认此舆情提醒已核实并处理完成？',
      confirmText: '确认',
      success: (res) => {
        if (res.confirm && alert) {
          updateAlertStatus(alert.id, 'resolved');
          setAlert(prev => prev ? { ...prev, status: 'resolved', statusName: '已解决' } : prev);
          Taro.showToast({ title: '已标记为已解决', icon: 'success' });
        }
      }
    });
  };

  if (!alert) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '64rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '28rpx', color: '#909399' }}>未找到该提醒</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.headerBadges}>
          <View className={styles.headerBadge}>
            <Text className={styles.headerBadgeText}>{alert.categoryName}</Text>
          </View>
          <View className={styles.headerBadge}>
            <Text className={styles.headerBadgeText}>{alert.levelName}</Text>
          </View>
          <View className={styles.headerBadge}>
            <Text className={styles.headerBadgeText}>{alert.statusName}</Text>
          </View>
        </View>
        <Text className={styles.headerTitle}>{alert.title}</Text>
        <View className={styles.headerMeta}>
          <Text className={styles.headerMetaText}>
            {formatTime(alert.createdAt)} · 浏览 {alert.viewCount} 次
          </Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>事件描述</Text>
          <Text className={styles.contentText}>{alert.content}</Text>

          <View className={styles.screenshotSection}>
            <Text className={styles.screenshotLabel}>来源截图</Text>
            <View className={styles.screenshotImage}>
              <Image
                className={styles.screenshotImg}
                src={alert.sourceScreenshot}
                mode="aspectFill"
                onError={(e) => console.error('[AlertDetail] 图片加载失败', e)}
              />
            </View>
            <View className={styles.sourceInfo}>
              <Text className={styles.sourceText}>来源平台：{alert.sourcePlatform}</Text>
              <Text className={styles.sourceText}>采集时间：{formatTime(alert.sourceTime, 'MM-DD HH:mm')}</Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>关键词命中分析</Text>
          <View className={styles.sectionRow}>
            <View className={styles.keywordList}>
              {alert.keywordHits.map((kw, idx) => (
                <View key={idx} className={styles.keywordItem}>
                  <Text className={styles.keywordText}>{kw.keyword}</Text>
                  <Text className={styles.keywordCount}>×{kw.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>建议核实对象</Text>
          <View className={styles.sectionRow}>
            <View className={styles.targetList}>
              {alert.suggestedTargets.map((t, idx) => (
                <View key={idx} className={styles.targetItem}>
                  <Text className={styles.targetText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>关联信息</Text>
          <View className={styles.sectionRow}>
            <Text className={styles.rowLabel}>涉及班级</Text>
            <View className={styles.classList}>
              {alert.relatedClassNames.map((c, idx) => (
                <View key={idx} className={styles.classItem}>
                  <Text className={styles.classText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>

          {alert.relatedStudents.length > 0 && (
            <View className={styles.sectionRow}>
              <Text className={styles.rowLabel}>涉及学生</Text>
              <View className={styles.studentList}>
                {alert.relatedStudents.map((s, idx) => {
                  const name = s.split('(')[0] || s;
                  const desc = s.includes('(') ? s.match(/\((.+)\)/)?.[1] : '';
                  return (
                    <View key={idx} className={styles.studentItem}>
                      <View className={styles.studentAvatar}>
                        <Text className={styles.studentAvatarText}>{name.slice(0, 1)}</Text>
                      </View>
                      <View className={styles.studentInfo}>
                        <Text className={styles.studentName}>{name}</Text>
                        <Text className={styles.studentDesc}>{desc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <View className={styles.recordsSection}>
          <View className={styles.recordHeader}>
            <Text className={styles.recordTitle}>核实记录</Text>
            <Text className={styles.recordCount}>{alertRecords.length} 条</Text>
          </View>

          {alertRecords.length > 0 ? (
            alertRecords.map(record => (
              <RecordCard key={record.id} record={record} />
            ))
          ) : (
            <View className={styles.card}>
              <View className={styles.emptyRecords}>
                <Text className={styles.emptyRecordsText}>暂无核实记录，点击下方按钮开始记录</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.btnSecondary} onClick={handleMarkResolved}>
          <Text className={styles.btnSecondaryText}>标记已解决</Text>
        </View>
        <View className={styles.btnPrimary} onClick={goToAddRecord}>
          <Text className={styles.btnPrimaryText}>+ 添加核实记录</Text>
        </View>
      </View>
    </View>
  );
};

export default AlertDetailPage;
