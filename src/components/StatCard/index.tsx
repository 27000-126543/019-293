import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  highlight?: boolean;
  onClick?: () => void;
}

const colorMap = {
  primary: {
    bg: 'linear-gradient(135deg, #1E88E5 0%, #42A5F5 100%)',
    text: '#ffffff'
  },
  success: {
    bg: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)',
    text: '#ffffff'
  },
  warning: {
    bg: 'linear-gradient(135deg, #FB8C00 0%, #FFA726 100%)',
    text: '#ffffff'
  },
  danger: {
    bg: 'linear-gradient(135deg, #E53935 0%, #EF5350 100%)',
    text: '#ffffff'
  },
  info: {
    bg: 'linear-gradient(135deg, #00ACC1 0%, #26C6DA 100%)',
    text: '#ffffff'
  }
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color = 'primary',
  highlight = false,
  onClick
}) => {
  const colors = colorMap[color];

  return (
    <View
      className={classnames(styles.card, highlight && styles.highlight)}
      style={highlight ? { background: colors.bg } : undefined}
      onClick={onClick}
    >
      <Text
        className={classnames(styles.title, highlight && styles.titleLight)}
      >
        {title}
      </Text>
      <View className={styles.valueRow}>
        <Text
          className={classnames(styles.value, highlight && styles.valueLight)}
          style={!highlight ? { color: colors.bg.includes('1E88E5') ? '#1E88E5' : undefined } : undefined}
        >
          {value}
        </Text>
      </View>
      {subtitle && (
        <Text
          className={classnames(styles.subtitle, highlight && styles.subtitleLight)}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default StatCard;
