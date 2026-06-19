import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import type { StudentInfo } from '@/types';
import { formatRelativeTime } from '@/utils';

interface StudentCardProps {
  student: StudentInfo;
  compact?: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, compact = false }) => {
  const goToDetail = () => {
    Taro.navigateTo({
      url: `/pages/student-detail/index?id=${student.id}`
    });
  };

  const getAvatarText = () => {
    return student.name.slice(0, 1);
  };

  const avatarColor = student.gender === '男' ? '#1E88E5' : '#EC4899';

  if (compact) {
    return (
      <View className={styles.compactCard} onClick={goToDetail}>
        <View className={styles.avatarSmall} style={{ backgroundColor: avatarColor }}>
          <Text className={styles.avatarTextSmall}>{getAvatarText()}</Text>
        </View>
        <View className={styles.compactInfo}>
          <View className={styles.compactNameRow}>
            <Text className={styles.nameSmall}>{student.name}</Text>
            <StatusBadge type="riskLevel" value={student.riskLevel} />
          </View>
          <Text className={styles.compactMeta}>{student.className} · {student.studentNo}</Text>
        </View>
        <Text className={styles.alertCountBadge}>
          {student.recentAlertCount}条线索
        </Text>
      </View>
    );
  }

  return (
    <View className={styles.card} onClick={goToDetail}>
      <View className={styles.cardLeft}>
        <View className={styles.avatar} style={{ backgroundColor: avatarColor }}>
          <Text className={styles.avatarText}>{getAvatarText()}</Text>
        </View>
      </View>

      <View className={styles.cardCenter}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{student.name}</Text>
          <StatusBadge type="riskLevel" value={student.riskLevel} />
        </View>

        <Text className={styles.meta}>{student.className} · {student.gender} · {student.studentNo}</Text>

        {student.tags.length > 0 && (
          <View className={styles.tags}>
            {student.tags.slice(0, 3).map((tag, idx) => (
              <View key={idx} className={styles.tag}>
                <Text className={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{student.recentAlertCount}</Text>
            <Text className={styles.statLabel}>相关线索</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{student.careHistory.length}</Text>
            <Text className={styles.statLabel}>关怀记录</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statLabelSmall}>上次关怀</Text>
            <Text className={styles.statText}>{formatRelativeTime(student.lastCareAt)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default StudentCard;
