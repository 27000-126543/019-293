import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useApp } from '@/store/AppContext';
import StatCard from '@/components/StatCard';
import StudentCard from '@/components/StudentCard';
import EmptyState from '@/components/EmptyState';

const OverviewPage: React.FC = () => {
  const { counselor, getScopedOverviewStats, getScopedStudents } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [, forceTick] = useState(0);

  useDidShow(() => {
    forceTick(t => t + 1);
  });

  const stats = useMemo(() => getScopedOverviewStats(), [getScopedOverviewStats, counselor]);

  const allScopedStudents = useMemo(() => getScopedStudents(), [getScopedStudents, counselor]);
  const focusedStudents = useMemo(
    () => allScopedStudents.filter(s => s.riskLevel !== 'normal'),
    [allScopedStudents]
  );
  const highRiskStudents = useMemo(
    () => allScopedStudents.filter(s => s.riskLevel === 'highrisk'),
    [allScopedStudents]
  );

  const trendData = useMemo(() => {
    const days = ['一', '二', '三', '四', '五', '六', '日'];
    return days.map((day, i) => ({
      label: `周${day}`,
      value: Math.max(1, Math.round(stats.pendingAlerts / 2 + Math.random() * 5 + i))
    }));
  }, [stats.pendingAlerts]);

  const maxTrendValue = Math.max(...trendData.map(d => d.value));

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '已刷新', icon: 'success' });
      forceTick(t => t + 1);
    }, 800);
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
          {counselor
            ? `负责 ${counselor.classIds.length} 个班级 · 共关注 ${focusedStudents.length} 名学生`
            : '请先在管理范围设置中选择负责的班级'
          }
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
            value={focusedStudents.length}
            subtitle={`含${highRiskStudents.length}名重点关怀`}
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
            <Text className={styles.sectionMore}>共 {stats.classStats.length} 个班级</Text>
          </View>

          {stats.classStats.length > 0 ? (
            <View className={styles.classList}>
              {stats.classStats.map(cls => (
                <View key={cls.classId} className={styles.classItem} onClick={() => {
                  Taro.navigateTo({ url: `/pages/class-detail/index?classId=${cls.classId}&className=${encodeURIComponent(cls.className)}` });
                }}>
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
          ) : (
            <View className={styles.emptyWrapper}>
              <EmptyState
                icon="🏫"
                title="暂无管理范围的班级数据"
                description="前往「提醒列表」右上角「管理范围」设置负责的班级"
              />
            </View>
          )}
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
            focusedStudents.map(student => (
              <StudentCard key={student.id} student={student} />
            ))
          ) : (
            <View className={styles.emptyWrapper}>
              <EmptyState
                icon="👥"
                title={counselor?.classIds.length ? '当前范围暂无重点关注学生' : '请先设置管理范围'}
                description={counselor?.classIds.length
                  ? '继续做好日常巡查，及时发现需要关怀的同学'
                  : '设置管理范围后，仅显示负责班级的重点学生'
                }
              />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default OverviewPage;
