import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import type { CounselorInfo, AlertItem, VerifyRecord, StudentInfo, CareRecord, ClassStats, OverviewStats } from '@/types';
import { alertsData as defaultAlerts } from '@/data/alerts';
import { recordsData as defaultRecords } from '@/data/records';
import { studentsData as defaultStudents, classStatsData } from '@/data/students';

const STORAGE_KEY_COUNSELOR = 'counselor_info';
const STORAGE_KEY_FIRST_LAUNCH = 'first_launch_done';
const STORAGE_KEY_ALERTS = 'alerts_data';
const STORAGE_KEY_RECORDS = 'records_data';
const STORAGE_KEY_STUDENTS = 'students_data';

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = Taro.getStorageSync(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[Storage] 读取 ${key} 失败，使用默认值`, e);
  }
  return fallback;
};

const writeStorage = <T,>(key: string, data: T): void => {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[Storage] 写入 ${key} 失败`, e);
  }
};

interface AlertScopeStats {
  today: number;
  pending: number;
  processing: number;
  resolved: number;
  urgent: number;
}

interface RecordScopeStats {
  total: number;
  week: number;
  completed: number;
  inProgress: number;
  pending: number;
}

interface AppState {
  counselor: CounselorInfo | null;
  isFirstLaunch: boolean;
  alerts: AlertItem[];
  records: VerifyRecord[];
  students: StudentInfo[];
  setCounselor: (info: CounselorInfo) => void;
  completeFirstLaunch: () => void;
  addRecord: (record: Omit<VerifyRecord, 'id' | 'createdAt' | 'updatedAt'>) => VerifyRecord;
  updateAlertStatus: (alertId: string, status: AlertItem['status']) => void;
  addCareRecord: (studentId: string, careRecord: Omit<CareRecord, 'id' | 'createdAt'>) => void;
  getScopedAlerts: () => AlertItem[];
  getScopedRecords: () => VerifyRecord[];
  getScopedStudents: () => StudentInfo[];
  getAlertScopeStats: () => AlertScopeStats;
  getRecordScopeStats: () => RecordScopeStats;
  getScopedOverviewStats: () => OverviewStats;
  getScopedClassStats: () => ClassStats[];
  getStudentById: (id: string) => StudentInfo | undefined;
  getAlertById: (id: string) => AlertItem | undefined;
  getRecordsByAlertId: (alertId: string) => VerifyRecord[];
  resetAllData: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [counselor, setCounselorState] = useState<CounselorInfo | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [records, setRecords] = useState<VerifyRecord[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);

  useEffect(() => {
    try {
      const storedCounselor = Taro.getStorageSync(STORAGE_KEY_COUNSELOR);
      const launchDone = Taro.getStorageSync(STORAGE_KEY_FIRST_LAUNCH);
      if (storedCounselor) {
        setCounselorState(JSON.parse(storedCounselor));
      }
      if (launchDone) {
        setIsFirstLaunch(false);
      }
    } catch (e) {
      console.error('[AppContext] 读取初始存储失败', e);
    }
    setAlerts(readStorage<AlertItem[]>(STORAGE_KEY_ALERTS, defaultAlerts));
    setRecords(readStorage<VerifyRecord[]>(STORAGE_KEY_RECORDS, defaultRecords));
    setStudents(readStorage<StudentInfo[]>(STORAGE_KEY_STUDENTS, defaultStudents));
  }, []);

  const scopeClassIds = useMemo((): string[] => {
    return counselor?.classIds ?? [];
  }, [counselor]);

  const setCounselor = useCallback((info: CounselorInfo) => {
    try {
      Taro.setStorageSync(STORAGE_KEY_COUNSELOR, JSON.stringify(info));
      setCounselorState(info);
      console.log('[AppContext] 辅导员信息已保存', info.name, '负责班级:', info.classIds.length);
    } catch (e) {
      console.error('[AppContext] 保存辅导员信息失败', e);
    }
  }, []);

  const completeFirstLaunch = useCallback(() => {
    try {
      Taro.setStorageSync(STORAGE_KEY_FIRST_LAUNCH, 'true');
      setIsFirstLaunch(false);
    } catch (e) {
      console.error('[AppContext] 保存首次启动状态失败', e);
    }
  }, []);

  const addRecord = useCallback((record: Omit<VerifyRecord, 'id' | 'createdAt' | 'updatedAt'>): VerifyRecord => {
    const newRecord: VerifyRecord = {
      ...record,
      id: `record_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRecords(prev => {
      const next = [newRecord, ...prev];
      writeStorage(STORAGE_KEY_RECORDS, next);
      return next;
    });
    console.log('[AppContext] 核实记录已添加并持久化', newRecord.id);

    if (newRecord.alertId) {
      updateAlertStatusLocal(newRecord.alertId, 'processing');
    }
    return newRecord;
  }, []);

  const updateAlertStatusLocal = useCallback((alertId: string, status: AlertItem['status']) => {
    const statusNameMap: Record<AlertItem['status'], string> = {
      pending: '待核实',
      processing: '核实中',
      resolved: '已解决'
    };
    setAlerts(prev => {
      const next = prev.map(a =>
        a.id === alertId ? { ...a, status, statusName: statusNameMap[status] } : a
      );
      writeStorage(STORAGE_KEY_ALERTS, next);
      return next;
    });
    console.log('[AppContext] 提醒状态已更新并持久化', alertId, status);
  }, []);

  const updateAlertStatus = useCallback((alertId: string, status: AlertItem['status']) => {
    updateAlertStatusLocal(alertId, status);
  }, [updateAlertStatusLocal]);

  const addCareRecord = useCallback((studentId: string, careRecord: Omit<CareRecord, 'id' | 'createdAt'>) => {
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id !== studentId) return s;
        const newCare: CareRecord = {
          ...careRecord,
          id: `care_${studentId}_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        const updatedCareHistory = [newCare, ...s.careHistory];
        const relatedAlertCount = updatedCareHistory.filter(c => c.relatedAlertId).length;
        return {
          ...s,
          careHistory: updatedCareHistory,
          lastCareAt: newCare.createdAt,
          recentAlertCount: Math.max(s.recentAlertCount, relatedAlertCount)
        };
      });
      writeStorage(STORAGE_KEY_STUDENTS, next);
      console.log('[AppContext] 学生关怀记录已更新并持久化', studentId);
      return next;
    });
  }, []);

  const getScopedAlerts = useCallback((): AlertItem[] => {
    if (scopeClassIds.length === 0) return alerts;
    return alerts.filter(a =>
      a.relatedClassIds.some(cid => scopeClassIds.includes(cid))
    );
  }, [alerts, scopeClassIds]);

  const getScopedRecords = useCallback((): VerifyRecord[] => {
    if (scopeClassIds.length === 0) return records;
    return records.filter(r => scopeClassIds.includes(r.relatedClassId));
  }, [records, scopeClassIds]);

  const getScopedStudents = useCallback((): StudentInfo[] => {
    if (scopeClassIds.length === 0) return students;
    return students.filter(s => scopeClassIds.includes(s.classId));
  }, [students, scopeClassIds]);

  const getStudentById = useCallback((id: string): StudentInfo | undefined => {
    return students.find(s => s.id === id);
  }, [students]);

  const getAlertById = useCallback((id: string): AlertItem | undefined => {
    return alerts.find(a => a.id === id);
  }, [alerts]);

  const getRecordsByAlertId = useCallback((alertId: string): VerifyRecord[] => {
    return records.filter(r => r.alertId === alertId);
  }, [records]);

  const getAlertScopeStats = useCallback((): AlertScopeStats => {
    const scoped = getScopedAlerts();
    const today = new Date();
    return {
      today: scoped.filter(a => new Date(a.createdAt).toDateString() === today.toDateString()).length,
      pending: scoped.filter(a => a.status === 'pending').length,
      processing: scoped.filter(a => a.status === 'processing').length,
      resolved: scoped.filter(a => a.status === 'resolved').length,
      urgent: scoped.filter(a => a.level === 'urgent' && a.status !== 'resolved').length
    };
  }, [getScopedAlerts]);

  const getRecordScopeStats = useCallback((): RecordScopeStats => {
    const scoped = getScopedRecords();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      total: scoped.length,
      week: scoped.filter(r => new Date(r.createdAt).getTime() > weekAgo).length,
      completed: scoped.filter(r => r.status === 'completed').length,
      inProgress: scoped.filter(r => r.status === 'in_progress').length,
      pending: scoped.filter(r => r.status === 'pending').length
    };
  }, [getScopedRecords]);

  const getScopedClassStats = useCallback((): ClassStats[] => {
    if (scopeClassIds.length === 0) return classStatsData;
    const scopedAlerts = getScopedAlerts();
    const scopedRecords = getScopedRecords();
    const scopedStudents = getScopedStudents();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return classStatsData
      .filter(c => scopeClassIds.includes(c.classId))
      .map(c => {
        const classAlerts = scopedAlerts.filter(a => a.relatedClassIds.includes(c.classId));
        const classRecords = scopedRecords.filter(r => r.relatedClassId === c.classId);
        const classFocused = scopedStudents.filter(s =>
          s.classId === c.classId && s.riskLevel !== 'normal'
        );
        const today = new Date().toDateString();
        return {
          ...c,
          todayAlerts: classAlerts.filter(a => new Date(a.createdAt).toDateString() === today).length,
          pendingAlerts: classAlerts.filter(a => a.status === 'pending').length,
          resolvedAlerts: classAlerts.filter(a => a.status === 'resolved').length,
          focusedStudents: classFocused.length,
          weeklyRecords: classRecords.filter(r => new Date(r.createdAt).getTime() > weekAgo).length
        };
      });
  }, [scopeClassIds, getScopedAlerts, getScopedRecords, getScopedStudents]);

  const getScopedOverviewStats = useCallback((): OverviewStats => {
    const alertStats = getAlertScopeStats();
    const recordStats = getRecordScopeStats();
    const scopedStudents = getScopedStudents();
    const classStats = getScopedClassStats();
    return {
      totalAlertsToday: alertStats.today,
      pendingAlerts: alertStats.pending,
      processingAlerts: alertStats.processing,
      resolvedAlerts: alertStats.resolved,
      weeklyRecords: recordStats.week,
      focusedStudents: scopedStudents.filter(s => s.riskLevel !== 'normal').length,
      classStats
    };
  }, [getAlertScopeStats, getRecordScopeStats, getScopedStudents, getScopedClassStats]);

  const resetAllData = useCallback(() => {
    Taro.removeStorageSync(STORAGE_KEY_ALERTS);
    Taro.removeStorageSync(STORAGE_KEY_RECORDS);
    Taro.removeStorageSync(STORAGE_KEY_STUDENTS);
    Taro.removeStorageSync(STORAGE_KEY_COUNSELOR);
    Taro.removeStorageSync(STORAGE_KEY_FIRST_LAUNCH);
    setAlerts(defaultAlerts);
    setRecords(defaultRecords);
    setStudents(defaultStudents);
    setCounselorState(null);
    setIsFirstLaunch(true);
    console.log('[AppContext] 所有数据已重置为默认');
  }, []);

  const value = useMemo((): AppState => ({
    counselor,
    isFirstLaunch,
    alerts,
    records,
    students,
    setCounselor,
    completeFirstLaunch,
    addRecord,
    updateAlertStatus,
    addCareRecord,
    getScopedAlerts,
    getScopedRecords,
    getScopedStudents,
    getAlertScopeStats,
    getRecordScopeStats,
    getScopedOverviewStats,
    getScopedClassStats,
    getStudentById,
    getAlertById,
    getRecordsByAlertId,
    resetAllData
  }), [
    counselor, isFirstLaunch, alerts, records, students,
    setCounselor, completeFirstLaunch, addRecord, updateAlertStatus, addCareRecord,
    getScopedAlerts, getScopedRecords, getScopedStudents,
    getAlertScopeStats, getRecordScopeStats, getScopedOverviewStats, getScopedClassStats,
    getStudentById, getAlertById, getRecordsByAlertId, resetAllData
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
