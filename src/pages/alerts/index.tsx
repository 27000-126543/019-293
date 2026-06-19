import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useApp } from '@/store/AppContext';
import StatCard from '@/components/StatCard';
import AlertCard from '@/components/AlertCard';
import EmptyState from '@/components/EmptyState';
import type { AlertCategory, AlertStatus, AlertItem } from '@/types';

const categoryFilters: { key: AlertCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'life', label: '学生生活' },
  { key: 'exam', label: '考试安排' },
  { key: 'dormitory', label: '宿舍矛盾' },
  { key: 'scholarship', label: '奖助学金' },
  { key: 'psychology', label: '心理状态' },
  { key: 'conflict', label: '冲突纠纷' }
];

const statusFilters: { key: AlertStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部状态' },
  { key: 'pending', label: '待核实' },
  { key: 'processing', label: '核实中' },
  { key: 'resolved', label: '已解决' }
];

const AlertsPage: React.FC = () => {
  const { counselor, isFirstLaunch, getScopedAlerts, getAlertScopeStats, updateAlertStatus } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useDidShow(() => {
    if (isFirstLaunch && !counselor) {
      console.log('[AlertsPage] 首次启动，跳转到身份设置');
      Taro.redirectTo({ url: '/pages/setup/index' });
    }
  });

  const scopedAlerts = useMemo(() => getScopedAlerts(), [getScopedAlerts]);
  const stats = useMemo(() => getAlertScopeStats(), [getAlertScopeStats]);

  const filteredAlerts = useMemo(() => {
    return scopedAlerts.filter(alert => {
      if (categoryFilter !== 'all' && alert.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
      return true;
    });
  }, [scopedAlerts, categoryFilter, statusFilter]);

  const sortedAlerts = useMemo(() => {
    const levelOrder = { urgent: 0, warning: 1, normal: 2 };
    const statusOrder = { pending: 0, processing: 1, resolved: 2 };
    return [...filteredAlerts].sort((a, b) => {
      const levelDiff = levelOrder[a.level] - levelOrder[b.level];
      if (levelDiff !== 0) return levelDiff;
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredAlerts]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '已刷新', icon: 'success' });
    }, 800);
  };

  const goToSettings = () => {
    Taro.navigateTo({ url: '/pages/setup/index?edit=true' });
  };

  const handleQuickAddRecord = (alert: AlertItem) => {
    Taro.navigateTo({
      url: `/pages/add-record/index?alertId=${alert.id}&alertTitle=${encodeURIComponent(alert.title)}`
    });
  };

  const getCurrentDateStr = () => {
    const now = new Date();
    return `${now.getMonth() + 1}月${now.getDate()}日 周${['日','一','二','三','四','五','六'][now.getDay()]}`;
  };

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.headerSection}>
        <View className={styles.welcomeRow}>
          <View className={styles.welcomeText}>
            <Text className={styles.welcomeTitle}>
              {counselor ? `${counselor.name}，您好` : '辅导员您好'}
            </Text>
            <Text className={styles.welcomeSubtitle}>{getCurrentDateStr()} · 今日共发现 {stats.today} 条新线索</Text>
          </View>
          <View className={styles.settingsBtn} onClick={goToSettings}>
            <Text className={styles.settingsBtnText}>管理范围</Text>
          </View>
        </View>

        <View className={styles.statsGrid}>
          <StatCard
            title="今日新增"
            value={stats.today}
            subtitle="条线索"
            color="primary"
          />
          <StatCard
            title="待核实"
            value={stats.pending}
            subtitle="需处理"
            color="warning"
            highlight={stats.pending > 0}
          />
          <StatCard
            title="紧急事项"
            value={stats.urgent}
            subtitle="优先关注"
            color="danger"
            highlight={stats.urgent > 0}
          />
        </View>

        <View className={styles.filterSection}>
          <ScrollView
            className={styles.filterScroll}
            scrollX
            enhanced
            showScrollbar={false}
          >
            <View className={styles.filterList}>
              {categoryFilters.map(f => (
                <View
                  key={f.key}
                  className={classnames(
                    styles.filterChip,
                    categoryFilter === f.key && styles.filterChipActive
                  )}
                  onClick={() => setCategoryFilter(f.key)}
                >
                  <Text className={classnames(
                    styles.filterChipText,
                    categoryFilter === f.key && styles.filterChipTextActive
                  )}>
                    {f.label}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View className={styles.contentSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            {statusFilter === 'all' ? '舆情线索列表' : `${statusFilters.find(s => s.key === statusFilter)?.label}列表`}
          </Text>
          <Text className={styles.sectionCount}>{sortedAlerts.length} 条</Text>
        </View>

        <View style={{ marginBottom: '24rpx' }}>
          <ScrollView
            className={styles.filterScroll}
            scrollX
            enhanced
            showScrollbar={false}
          >
            <View className={styles.filterList}>
              {statusFilters.map(f => (
                <View
                  key={f.key}
                  className={classnames(
                    styles.filterChip,
                    statusFilter === f.key && styles.filterChipActive
                  )}
                  onClick={() => setStatusFilter(f.key)}
                >
                  <Text className={classnames(
                    styles.filterChipText,
                    statusFilter === f.key && styles.filterChipTextActive
                  )}>
                    {f.label}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {sortedAlerts.length > 0 ? (
          sortedAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAddRecord={handleQuickAddRecord}
            />
          ))
        ) : (
          <View className={styles.emptyWrapper}>
            <EmptyState
              icon="🔍"
              title={counselor?.classIds.length ? '当前管理范围暂无匹配的线索' : '请先设置管理范围'}
              description={counselor?.classIds.length ? '换个筛选条件，或稍后刷新查看' : '点击右上角「管理范围」选择负责的班级'}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default AlertsPage;
