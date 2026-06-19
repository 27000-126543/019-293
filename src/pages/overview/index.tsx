import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useApp } from '@/store/AppContext';
import StatCard from '@/components/StatCard';
import StudentCard from '@/components/StudentCard';
import EmptyState from '@/components/EmptyState';
import { classStatsData, getFocusedStudents, getHighRiskStudents, getOverviewStats } from '@/data/students';
import type { ClassStats } from '@/types';

const OverviewPage: React.FC = () => {
  const { counselor, alerts, records } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const overview = getOverviewStats();
    const today = new Date().toDateString();
    return {
      totalAlerts: alerts.length,
      pendingAlerts: alerts.filter(a => a.status === 'pending').length,
      processingAlerts: alerts.filter(a => a.status === 'processing').length,
      resolvedAlerts: alerts.filter(a => a.status === 'resolved').length,
      weeklyRecords: records.filter(r => {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return new Date(r.createdAt).getTime() > weekAgo;
      }).length,
      focusedStudents: getFocusedStudents().length,
      highRiskStudents: getHighRiskStudents().length,
      classCount: classStatsData.length
    };
  }, [alerts, records]);

  const focusedStudents = useMemo(() => getFocusedStudents(), []);
  const highRiskStudents = useMemo(() => getHighRiskStudents(), []);

  const trendData = useMemo(() => {
    const days = ['一', '二', '三', '四', '五', '六', '日'];
    return days.map((day, i) => ({
      label: `周${day}`,
      value: 5 + Math.floor(Math.random() * 15) + i * 2
    }));
  }, []);

  const maxTrendValue = Math.max(...trendData.map(d => d.value));

  const handleRefresh = () => {
    setRefreshing(true);
    console.log('[OverviewPage] 刷新数据');
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

  const goToStudentDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/student-detail/index?id=${id}` });
  };

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <Text className={styles.headerTitle}>班级概览</Text>
        <Text className={styles.headerSubtitle}>
          {counselor ? `负责 ${counselor.classNames.length} 个班级 · 共关注 ${focusedStudents.length} 名学生` : '了解您负责班级的整体情况'}
        </Text>

        <View className={styles.statsGrid}>
          <StatCard
            title="待处理线索"
            value={stats.pendingAlerts}
            subtitle="条需关注"
            color="warning"
            highlight={stats.pendingAlerts > 0}
          />
          <StatCard
            title="核实中"
            value={stats.processingAlerts}
            subtitle="条处理中"
            color="info"
          />
          <StatCard
            title="本周走访"
            value={stats.weeklyRecords}
            subtitle="次记录"
            color="success"
          />
          <StatCard
            title="重点学生"
            value={stats.focusedStudents}
            subtitle={`含${stats.highRiskStudents}名重点关怀`}
            color="danger"
          />
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.trendSection}>
          <View className={styles.trendCard}>
            <Text className={styles.trendTitle}>本周舆情线索趋势</Text>
            <View className={styles.trendBars}>
              {trendData.map((item, idx) => (
                <View key={idx} className={styles.trendBarWrap}>
                  <View
                    className={styles.trendBar}
                    style={{ height: `${(item.value / maxTrendValue) * 140}rpx` }}
                  />
                  <Text className={styles.trendLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>班级数据</Text>
            <Text className={styles.sectionMore}>共 {stats.classCount} 个班级</Text>
          </View>

          <View className={styles.classList}>
            {classStatsData.slice(0, 5).map(cls => (
              <View key={cls.classId} className={styles.classItem}>
                <View className={styles.classHeader}>
                  <Text className={styles.className}>{cls.className}</Text>
                  <Text className={styles.classCount}>{cls.totalStudents}人</Text>
                </View>
                <View className={styles.classStats}>
                  <View className={styles.classStat}>
                    <Text className={styles.classStatValue} style={{ color: '#FB8C00' }}>
                      {cls.pendingAlerts}
                    </Text>
                    <Text className={styles.classStatLabel}>待处理</Text>
                  </View>
                  <View className={styles.classStatDivider} />
                  <View className={styles.classStat}>
                    <Text className={styles.classStatValue} style={{ color: '#43A047' }}>
                      {cls.resolvedAlerts}
                    </Text>
                    <Text className={styles.classStatLabel}>已解决</Text>
                  </View>
                  <View className={styles.classStatDivider} />
                  <View className={styles.classStat}>
                    <Text className={styles.classStatValue} style={{ color: '#E53935' }}>
                      {cls.focusedStudents}
                    </Text>
                    <Text className={styles.classStatLabel}>重点关注</Text>
                  </View>
                  <View className={styles.classStatDivider} />
                  <View className={styles.classStat}>
                    <Text className={styles.classStatValue} style={{ color: '#1E88E5' }}>
                      {cls.weeklyRecords}
                    </Text>
                    <Text className={styles.classStatLabel}>本周记录</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.riskHeader}>
            <Text className={styles.riskTitle}>重点学生关联记录</Text>
            <View className={styles.riskCount}>
              <View className={classnames(styles.riskBadge, styles.riskBadgeHigh)}>
                <Text>重点关怀 {highRiskStudents.length}</Text>
              </View>
              <View className={classnames(styles.riskBadge, styles.riskBadgeFocus)}>
                <Text>重点关注 {focusedStudents.length - highRiskStudents.length}</Text>
              </View>
            </View>
          </View>

          <Text style={{ fontSize: '24rpx', color: '#909399', marginBottom: '24rpx', display: 'block' }}>
            将公开舆情中的求助、抱怨、冲突线索与日常关怀事项串联，非监控用途
          </Text>

          {focusedStudents.length > 0 ? (
            focusedStudents.slice(0, 6).map(student => (
              <StudentCard key={student.id} student={student} />
            ))
          ) : (
            <View className={styles.emptyWrapper}>
              <EmptyState
                icon="👥"
                title="暂无重点关注学生"
                description="继续做好日常巡查，及时发现需要关怀的同学"
              />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default OverviewPage;
