import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useApp } from '@/store/AppContext';
import RecordCard from '@/components/RecordCard';
import EmptyState from '@/components/EmptyState';
import type { RecordType, RecordStatus } from '@/types';

const typeFilters: { key: RecordType | 'all'; label: string }[] = [
  { key: 'all', label: '全部类型' },
  { key: 'contact_classrep', label: '联系班委' },
  { key: 'visit_dorm', label: '进宿舍了解' },
  { key: 'report_office', label: '反馈学工办' },
  { key: 'talk_student', label: '学生谈话' },
  { key: 'notify_parent', label: '通知家长' },
  { key: 'other', label: '其他方式' }
];

const statusTabs: { key: RecordStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'completed', label: '已完成' },
  { key: 'in_progress', label: '进行中' },
  { key: 'pending', label: '待跟进' }
];

const RecordsPage: React.FC = () => {
  const { counselor, getScopedRecords, getRecordScopeStats, addRecord } = useApp();
  const [typeFilter, setTypeFilter] = useState<RecordType | 'all'>('all');
  const [statusTab, setStatusTab] = useState<RecordStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const scopedRecords = useMemo(() => getScopedRecords(), [getScopedRecords]);
  const stats = useMemo(() => getRecordScopeStats(), [getRecordScopeStats]);

  const filteredRecords = useMemo(() => {
    return scopedRecords.filter(r => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (statusTab !== 'all' && r.status !== statusTab) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [scopedRecords, typeFilter, statusTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '已刷新', icon: 'success' });
    }, 800);
  };

  const goToAddRecord = () => {
    Taro.navigateTo({ url: '/pages/add-record/index' });
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
        <Text className={styles.pageTitle}>核实记录</Text>
        <Text className={styles.pageSubtitle}>
          {counselor
            ? `${counselor.collegeName} · 管理 ${counselor.classIds.length} 个班级，记录每一次走访`
            : '记录每一次走访，留下可追溯的痕迹'
          }
        </Text>

        <View className={styles.statsRow}>
          <View className={styles.statBox}>
            <Text className={styles.statBoxValue} style={{ color: '#1E88E5' }}>{stats.total}</Text>
            <Text className={styles.statBoxLabel}>累计记录</Text>
          </View>
          <View className={styles.statBox}>
            <Text className={styles.statBoxValue} style={{ color: '#FB8C00' }}>{stats.week}</Text>
            <Text className={styles.statBoxLabel}>本周新增</Text>
          </View>
          <View className={styles.statBox}>
            <Text className={styles.statBoxValue} style={{ color: '#43A047' }}>{stats.completed}</Text>
            <Text className={styles.statBoxLabel}>已完成</Text>
          </View>
        </View>

        <View className={styles.filterBar}>
          <ScrollView
            className={styles.filterScroll}
            scrollX
            enhanced
            showScrollbar={false}
          >
            <View className={styles.filterList}>
              {typeFilters.map(f => (
                <View
                  key={f.key}
                  className={classnames(
                    styles.filterChip,
                    typeFilter === f.key && styles.filterChipActive
                  )}
                  onClick={() => setTypeFilter(f.key)}
                >
                  <Text className={classnames(
                    styles.filterChipText,
                    typeFilter === f.key && styles.filterChipTextActive
                  )}>
                    {f.label}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            {statusTab === 'all' ? '全部记录' : `${statusTabs.find(s => s.key === statusTab)?.label}记录`}
          </Text>
          <View className={styles.addBtn} onClick={goToAddRecord}>
            <Text className={styles.addBtnText}>+ 新增记录</Text>
          </View>
        </View>

        <View className={styles.tabsWrapper}>
          <ScrollView
            className={styles.tabScroll}
            scrollX
            enhanced
            showScrollbar={false}
          >
            <View className={styles.tabList}>
              {statusTabs.map(tab => (
                <View
                  key={tab.key}
                  className={classnames(
                    styles.tabItem,
                    statusTab === tab.key && styles.tabItemActive
                  )}
                  onClick={() => setStatusTab(tab.key)}
                >
                  <Text className={classnames(
                    styles.tabText,
                    statusTab === tab.key && styles.tabTextActive
                  )}>
                    {tab.label}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <RecordCard key={record.id} record={record} />
          ))
        ) : (
          <View className={styles.emptyWrapper}>
            <EmptyState
              icon="📝"
              title={counselor?.classIds.length ? '当前范围暂无核实记录' : '请先设置管理范围'}
              description={counselor?.classIds.length
                ? '点击右上角「新增记录」开始记录您的工作'
                : '设置管理范围后，仅显示负责班级的记录'
              }
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default RecordsPage;
