import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import type { AlertItem } from '@/types';
import { formatRelativeTime } from '@/utils';

interface AlertCardProps {
  alert: AlertItem;
  onAddRecord?: (alert: AlertItem) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onAddRecord }) => {
  const goToDetail = () => {
    Taro.navigateTo({
      url: `/pages/alert-detail/index?id=${alert.id}`
    });
  };

  const handleAddRecord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddRecord) {
      onAddRecord(alert);
    } else {
      Taro.navigateTo({
        url: `/pages/add-record/index?alertId=${alert.id}&alertTitle=${encodeURIComponent(alert.title)}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={goToDetail}>
      <View className={styles.cardHeader}>
        <View className={styles.headerBadges}>
          <StatusBadge type="category" value={alert.category} />
          <View className={styles.badgeSpacing} />
          <StatusBadge type="level" value={alert.level} />
          <View className={styles.badgeSpacing} />
          <StatusBadge type="alertStatus" value={alert.status} />
        </View>
        <Text className={styles.time}>{formatRelativeTime(alert.createdAt)}</Text>
      </View>

      <Text className={styles.title}>{alert.title}</Text>
      <Text className={styles.content}>{alert.content}</Text>

      <View className={styles.metaRow}>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>来源：</Text>
          <Text className={styles.metaValue}>{alert.sourcePlatform}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>涉及：</Text>
          <Text className={styles.metaValue}>{alert.relatedClassNames.join('、')}</Text>
        </View>
      </View>

      {alert.keywordHits.length > 0 && (
        <View className={styles.keywords}>
          <Text className={styles.keywordsLabel}>命中关键词：</Text>
          <View className={styles.keywordsList}>
            {alert.keywordHits.slice(0, 3).map((kw, idx) => (
              <View key={idx} className={styles.keywordTag}>
                <Text className={styles.keywordText}>{kw.keyword}</Text>
                <Text className={styles.keywordCount}>×{kw.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.cardFooter}>
        <View className={styles.suggested}>
          <Text className={styles.suggestedLabel}>建议核实：</Text>
          <Text className={styles.suggestedValue}>{alert.suggestedTargets.slice(0, 2).join('、')}</Text>
        </View>
        <View className={styles.addAction} onClick={handleAddRecord}>
          <Text className={styles.addActionText}>+ 记录</Text>
        </View>
      </View>
    </View>
  );
};

export default AlertCard;
