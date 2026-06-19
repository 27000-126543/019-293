import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = '还没有相关内容',
  icon = '📋'
}) => {
  return (
    <View className={styles.container}>
      <View className={styles.iconWrapper}>
        <Text className={styles.icon}>{icon}</Text>
      </View>
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.description}>{description}</Text>
    </View>
  );
};

export default EmptyState;
