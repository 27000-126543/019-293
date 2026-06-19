import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useApp } from '@/store/AppContext';
import { colleges, majors, classes, getMajorsByCollege, getClassesByMajor, getCollegeById, getMajorById } from '@/data/organizations';
import type { CounselorInfo } from '@/types';

const SetupPage: React.FC = () => {
  const router = useRouter();
  const { counselor, setCounselor, completeFirstLaunch, isFirstLaunch } = useApp();
  const isEdit = router.params?.edit === 'true';

  const [name, setName] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [selectedMajorIds, setSelectedMajorIds] = useState<string[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  useEffect(() => {
    if (counselor && isEdit) {
      setName(counselor.name);
      setSelectedCollegeId(counselor.collegeId);
      setSelectedMajorIds(counselor.majorIds);
      setSelectedClassIds(counselor.classIds);
    }
  }, [counselor, isEdit]);

  const availableMajors = useMemo(() => {
    if (!selectedCollegeId) return [];
    return getMajorsByCollege(selectedCollegeId);
  }, [selectedCollegeId]);

  const availableClasses = useMemo(() => {
    if (selectedMajorIds.length === 0) return [];
    return selectedMajorIds.flatMap(mid => getClassesByMajor(mid));
  }, [selectedMajorIds]);

  const selectedClassNames = useMemo(() => {
    return classes
      .filter(c => selectedClassIds.includes(c.id))
      .map(c => c.name);
  }, [selectedClassIds]);

  const selectedMajorNames = useMemo(() => {
    return majors
      .filter(m => selectedMajorIds.includes(m.id))
      .map(m => m.name);
  }, [selectedMajorIds]);

  const canSubmit = name.trim() && selectedCollegeId && selectedMajorIds.length > 0 && selectedClassIds.length > 0;

  const toggleMajor = (majorId: string) => {
    setSelectedMajorIds(prev => {
      const exists = prev.includes(majorId);
      let newMajors: string[];
      if (exists) {
        newMajors = prev.filter(id => id !== majorId);
      } else {
        newMajors = [...prev, majorId];
      }
      const newClassIds = newMajors.flatMap(mid => getClassesByMajor(mid).map(c => c.id));
      setSelectedClassIds(prev => prev.filter(id => newClassIds.includes(id)));
      return newMajors;
    });
  };

  const toggleClass = (classId: string) => {
    setSelectedClassIds(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      }
      return [...prev, classId];
    });
  };

  const selectAllClassesOfMajor = (majorId: string) => {
    const classIdsOfMajor = getClassesByMajor(majorId).map(c => c.id);
    const allSelected = classIdsOfMajor.every(id => selectedClassIds.includes(id));
    if (allSelected) {
      setSelectedClassIds(prev => prev.filter(id => !classIdsOfMajor.includes(id)));
    } else {
      setSelectedClassIds(prev => Array.from(new Set([...prev, ...classIdsOfMajor])));
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请完善所有信息', icon: 'none' });
      return;
    }

    const college = getCollegeById(selectedCollegeId);
    const info: CounselorInfo = {
      name: name.trim(),
      collegeId: selectedCollegeId,
      majorIds: selectedMajorIds,
      classIds: selectedClassIds,
      collegeName: college?.name || '',
      majorNames: selectedMajorNames,
      classNames: selectedClassNames
    };

    setCounselor(info);
    console.log('[SetupPage] 辅导员信息已保存', info);

    Taro.showToast({ title: '保存成功', icon: 'success' });

    setTimeout(() => {
      if (!isEdit) {
        completeFirstLaunch();
        Taro.switchTab({ url: '/pages/alerts/index' });
      } else {
        Taro.navigateBack();
      }
    }, 800);
  };

  return (
    <View className={styles.page}>
      {isEdit ? (
        <View className={styles.editHeader}>
          <Text className={styles.editTitle}>管理范围设置</Text>
          <Text className={styles.editSubtitle}>更新您负责的学院、专业和班级信息</Text>
        </View>
      ) : (
        <View className={styles.hero}>
          <View className={styles.heroIcon}>
            <Text className={styles.heroIconText}>👋</Text>
          </View>
          <Text className={styles.heroTitle}>欢迎使用舆情巡查系统</Text>
          <Text className={styles.heroSubtitle}>
            请先设置您负责的管理范围{'\n'}以便为您推送相关班级的舆情提醒
          </Text>
        </View>
      )}

      <View className={isEdit ? styles.editContent : styles.form}>
        {isEdit && counselor && (
          <View className={styles.currentInfo}>
            <Text className={styles.currentLabel}>当前信息</Text>
            <Text className={styles.currentValue}>
              {counselor.name} · {counselor.collegeName}
            </Text>
            <View className={styles.divider} />
            <Text className={styles.currentLabel}>负责专业</Text>
            <Text className={styles.currentValue}>
              {counselor.majorNames.join('、')}
            </Text>
            <View className={styles.divider} />
            <Text className={styles.currentLabel}>负责班级</Text>
            <Text className={styles.currentValue}>
              {counselor.classNames.join('、')}
            </Text>
          </View>
        )}

        <View className={styles.card}>
          <Text className={styles.cardLabel}>基本信息</Text>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>辅导员姓名</Text>
            <Input
              className={styles.textInput}
              placeholder="请输入您的姓名"
              placeholderClass={styles.pickerPlaceholder}
              value={name}
              onInput={(e) => setName(e.detail.value)}
            />
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>所属学院</Text>
            <View className={styles.optionList}>
              {colleges.map(college => (
                <View
                  key={college.id}
                  className={classnames(
                    styles.optionChip,
                    selectedCollegeId === college.id && styles.optionChipActive
                  )}
                  onClick={() => {
                    setSelectedCollegeId(college.id);
                    setSelectedMajorIds([]);
                    setSelectedClassIds([]);
                  }}
                >
                  <Text className={classnames(
                    styles.optionChipText,
                    selectedCollegeId === college.id && styles.optionChipTextActive
                  )}>
                    {college.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardLabel}>负责专业（可多选）</Text>
          {availableMajors.length > 0 ? (
            <>
              <View className={styles.optionList}>
                {availableMajors.map(major => (
                  <View
                    key={major.id}
                    className={classnames(
                      styles.optionChip,
                      selectedMajorIds.includes(major.id) && styles.optionChipActive
                    )}
                    onClick={() => toggleMajor(major.id)}
                  >
                    <Text className={classnames(
                      styles.optionChipText,
                      selectedMajorIds.includes(major.id) && styles.optionChipTextActive
                    )}>
                      {major.name}
                    </Text>
                  </View>
                ))}
              </View>
              {selectedMajorIds.length > 0 && (
                <View className={styles.selectedSummary}>
                  <Text className={styles.selectedSummaryText}>
                    已选择 {selectedMajorIds.length} 个专业：{selectedMajorNames.join('、')}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text className={styles.multiSelectTip}>请先选择所属学院</Text>
          )}
        </View>

        <View className={styles.card}>
          <Text className={styles.cardLabel}>负责班级（可多选）</Text>
          {availableClasses.length > 0 ? (
            <>
              {selectedMajorIds.map(majorId => {
                const majorClasses = getClassesByMajor(majorId);
                const major = getMajorById(majorId);
                const allSelected = majorClasses.every(c => selectedClassIds.includes(c.id));
                return (
                  <View key={majorId} style={{ marginBottom: '32rpx' }}>
                    <View
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16rpx'
                      }}
                    >
                      <Text style={{ fontSize: '26rpx', color: '#606266', fontWeight: 500 }}>
                        {major?.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: '24rpx',
                          color: allSelected ? '#43A047' : '#1E88E5'
                        }}
                        onClick={() => selectAllClassesOfMajor(majorId)}
                      >
                        {allSelected ? '取消全选' : '全选'}
                      </Text>
                    </View>
                    <View className={styles.optionList}>
                      {majorClasses.map(cls => (
                        <View
                          key={cls.id}
                          className={classnames(
                            styles.optionChip,
                            selectedClassIds.includes(cls.id) && styles.optionChipActive
                          )}
                          onClick={() => toggleClass(cls.id)}
                        >
                          <Text className={classnames(
                            styles.optionChipText,
                            selectedClassIds.includes(cls.id) && styles.optionChipTextActive
                          )}>
                            {cls.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
              {selectedClassIds.length > 0 && (
                <View className={styles.selectedSummary}>
                  <Text className={styles.selectedSummaryText}>
                    已选择 {selectedClassIds.length} 个班级
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text className={styles.multiSelectTip}>请先选择负责专业</Text>
          )}
        </View>
      </View>

      <View className={styles.footer}>
        <View
          className={classnames(styles.submitBtn, !canSubmit && styles.submitBtnDisabled)}
          onClick={handleSubmit}
        >
          <Text className={styles.submitBtnText}>
          {isEdit ? '保存修改' : '开始使用'}
        </Text>
        </View>
      </View>
    </View>
  );
};

export default SetupPage;
