import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Textarea, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useApp } from '@/store/AppContext';
import { classes } from '@/data/organizations';
import { getRecordTypeLabel } from '@/utils';
import type { RecordType, RecordStatus } from '@/types';

const quickTypes: { type: RecordType; label: string; icon: string }[] = [
  { type: 'contact_classrep', label: '联系班委', icon: '👥' },
  { type: 'visit_dorm', label: '进宿舍了解', icon: '🏠' },
  { type: 'report_office', label: '反馈学工办', icon: '📋' },
  { type: 'talk_student', label: '学生谈话', icon: '💬' },
  { type: 'notify_parent', label: '通知家长', icon: '📞' },
  { type: 'other', label: '其他方式', icon: '📝' }
];

const statusOptions: { status: RecordStatus; label: string }[] = [
  { status: 'completed', label: '已完成' },
  { status: 'in_progress', label: '进行中' },
  { status: 'pending', label: '待跟进' }
];

const templates: Record<RecordType, string[]> = {
  contact_classrep: [
    '已联系班长，了解班级整体情况',
    '已召开班委短会，部署相关工作',
    '学习委员反馈情况正常'
  ],
  visit_dorm: [
    '晚查寝走访，学生状态良好',
    '走访相关宿舍，调解矛盾',
    '深入宿舍了解生活情况'
  ],
  report_office: [
    '已反馈至学工办，等待处理',
    '情况已上报，协调相关部门',
    '已报备学院领导'
  ],
  talk_student: [
    '一对一谈心谈话，情绪稳定',
    '了解具体情况，给予心理疏导',
    '已制定帮扶计划'
  ],
  notify_parent: [
    '已电话告知家长相关情况',
    '家校沟通良好，共同关注',
    '家长表示配合工作'
  ],
  other: [
    '组织主题班会进行教育',
    '协调相关部门处理',
    '持续跟进观察'
  ]
};

const AddRecordPage: React.FC = () => {
  const router = useRouter();
  const { addRecord, addCareRecord, counselor } = useApp();

  const alertId = router.params?.alertId || '';
  const alertTitle = router.params?.alertTitle ? decodeURIComponent(router.params.alertTitle) : '';
  const urlStudentId = router.params?.studentId || '';
  const urlStudentName = router.params?.studentName ? decodeURIComponent(router.params.studentName) : '';
  const urlClassId = router.params?.classId || '';
  const urlClassName = router.params?.className ? decodeURIComponent(router.params.className) : '';

  const [selectedType, setSelectedType] = useState<RecordType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<RecordStatus>('completed');
  const [content, setContent] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(urlClassId);
  const [studentsText, setStudentsText] = useState(urlStudentName);

  useEffect(() => {
    if (urlClassId) {
      setSelectedClassId(urlClassId);
    } else if (counselor && counselor.classIds.length > 0) {
      setSelectedClassId(counselor.classIds[0]);
    }
  }, [urlClassId, counselor]);

  const availableClasses = useMemo(() => {
    if (counselor && counselor.classIds.length > 0) {
      return classes.filter(c => counselor.classIds.includes(c.id));
    }
    return classes.slice(0, 6);
  }, [counselor]);

  const canSubmit = selectedType && content.trim().length >= 5;

  const handleSelectClass = () => {
    Taro.showActionSheet({
      itemList: availableClasses.map(c => c.name),
      success: (res) => {
        const selected = availableClasses[res.tapIndex];
        if (selected) {
          setSelectedClassId(selected.id);
        }
      }
    });
  };

  const getSelectedClassName = () => {
    if (urlClassName && selectedClassId === urlClassId) return urlClassName;
    const cls = classes.find(c => c.id === selectedClassId);
    return cls?.name || '';
  };

  const applyTemplate = (template: string) => {
    setContent(prev => {
      if (!prev) return template;
      return prev + (prev.endsWith('。') || prev.endsWith('') ? '' : '；') + template;
    });
  };

  const handleClearAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    Taro.navigateBack();
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请完善记录内容（至少5字）', icon: 'none' });
      return;
    }

    const cls = classes.find(c => c.id === selectedClassId);
    const className = cls?.name || availableClasses[0]?.name || '计算机2301班';
    const finalClassId = selectedClassId || cls?.id || availableClasses[0]?.id || 'class_1';
    const typeName = getRecordTypeLabel(selectedType as RecordType);
    const statusNameMap: Record<RecordStatus, string> = {
      completed: '已完成',
      in_progress: '进行中',
      pending: '待跟进'
    };

    const relatedStudents = studentsText
      .split(/[,，、\s]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newVerifyRecord = addRecord({
      alertId: alertId || undefined,
      alertTitle: alertTitle || undefined,
      type: selectedType as RecordType,
      typeName,
      status: selectedStatus,
      statusName: statusNameMap[selectedStatus],
      content: content.trim(),
      counselorName: counselor?.name || '辅导员',
      relatedStudents,
      relatedClassId: finalClassId,
      relatedClassName: className,
      attachments: []
    });

    if (urlStudentId) {
      addCareRecord(urlStudentId, {
        type: selectedType as any,
        typeName,
        content: content.trim(),
        relatedAlertId: alertId || undefined,
        relatedAlertTitle: alertTitle || undefined
      });
      console.log('[AddRecord] 关怀记录同步写入学生档案', urlStudentId);
    } else if (relatedStudents.length > 0) {
      console.log('[AddRecord] 记录涉及学生（未匹配学生ID）', relatedStudents);
    }

    console.log('[AddRecord] 记录已提交', {
      id: newVerifyRecord.id,
      type: selectedType,
      status: selectedStatus,
      alertId,
      studentId: urlStudentId,
      classId: finalClassId
    });

    Taro.showToast({
      title: urlStudentId ? '已保存关怀记录' : '记录已保存',
      icon: 'success'
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 800);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>
          {urlStudentId ? '新增关怀记录' : '添加核实记录'}
        </Text>
        <Text className={styles.headerSubtitle}>
          {urlStudentId
            ? `关联学生：${urlStudentName}${urlClassName ? `（${urlClassName}）` : ''}`
            : '记录每一次走访工作，便于追溯'
          }
        </Text>
      </View>

      <View className={styles.form}>
        {(alertTitle || urlStudentId) && (
          <View className={styles.relatedAlert}>
            <View className={styles.relatedAlertInfo}>
              {alertTitle && (
                <>
                  <Text className={styles.relatedAlertLabel}>关联舆情</Text>
                  <Text className={styles.relatedAlertTitle}>{alertTitle}</Text>
                </>
              )}
              {urlStudentId && (
                <View style={{ marginTop: alertTitle ? '16rpx' : 0 }}>
                  <Text className={styles.relatedAlertLabel}>
                    {alertTitle ? '' : '关怀对象'}
                  </Text>
                  <Text className={styles.relatedAlertTitle}>
                    {urlStudentName} {urlClassName ? `· ${urlClassName}` : ''}
                  </Text>
                </View>
              )}
            </View>
            <Text className={styles.relatedAlertClear} onClick={handleClearAlert}>取消</Text>
          </View>
        )}

        <View className={styles.card}>
          <Text className={styles.cardTitle}>记录方式</Text>
          <View className={styles.quickTypes}>
            {quickTypes.map(item => (
              <View
                key={item.type}
                className={classnames(
                  styles.quickType,
                  selectedType === item.type && styles.quickTypeActive
                )}
                onClick={() => setSelectedType(item.type)}
              >
                <Text className={styles.quickTypeIcon}>{item.icon}</Text>
                <Text className={classnames(
                  styles.quickTypeLabel,
                  selectedType === item.type && styles.quickTypeLabelActive
                )}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          <View className={styles.statusSection}>
            <Text className={styles.inputLabel}>处理状态</Text>
            <View className={styles.statusOptions}>
              {statusOptions.map(opt => (
                <View
                  key={opt.status}
                  className={classnames(
                    styles.statusOption,
                    selectedStatus === opt.status && styles.statusOptionActive,
                    selectedStatus === opt.status && opt.status === 'completed' && styles.statusOptionActiveComplete,
                    selectedStatus === opt.status && opt.status === 'pending' && styles.statusOptionActivePending
                  )}
                  onClick={() => setSelectedStatus(opt.status)}
                >
                  <Text className={classnames(
                    styles.statusText,
                    selectedStatus === opt.status && styles.statusTextActive,
                    selectedStatus === opt.status && opt.status === 'completed' && styles.statusTextActiveComplete,
                    selectedStatus === opt.status && opt.status === 'pending' && styles.statusTextActivePending
                  )}>
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>记录内容</Text>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>核实详情</Text>
            <Textarea
              className={styles.textArea}
              placeholder={urlStudentId ? '请描述本次关怀的具体情况、谈话内容和后续安排...' : '请描述核实的具体情况、处理过程和结果...'}
              placeholderStyle="color: #C0C4CC"
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={500}
            />
            <Text className={styles.textCount}>{content.length}/500</Text>
          </View>

          {selectedType && templates[selectedType] && (
            <View className={styles.quickTemplates}>
              <Text className={styles.quickTemplatesTitle}>快捷填写模板（点击插入）：</Text>
              <View className={styles.templateList}>
                {templates[selectedType].map((tpl, idx) => (
                  <View key={idx} className={styles.templateChip} onClick={() => applyTemplate(tpl)}>
                    <Text className={styles.templateChipText}>+ {tpl}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>关联信息</Text>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>所属班级</Text>
            <View className={styles.classSelect} onClick={handleSelectClass}>
              <Text className={classnames(
                styles.classSelectText,
                !selectedClassId && styles.classSelectPlaceholder
              )}>
                {getSelectedClassName() || '点击选择班级'}
              </Text>
            </View>
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>涉及学生（多个用逗号分隔，选填）</Text>
            <Textarea
              className={styles.studentsInput}
              placeholder="如：张三, 李四"
              placeholderStyle="color: #C0C4CC"
              value={studentsText}
              onInput={(e) => setStudentsText(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.btnCancel} onClick={handleCancel}>
          <Text className={styles.btnCancelText}>取消</Text>
        </View>
        <View
          className={classnames(styles.btnSubmit, !canSubmit && styles.btnSubmitDisabled)}
          onClick={handleSubmit}
        >
          <Text className={styles.btnSubmitText}>
            {urlStudentId ? '保存关怀记录' : '保存记录'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AddRecordPage;
