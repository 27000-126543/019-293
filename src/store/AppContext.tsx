import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { CounselorInfo, AlertItem, VerifyRecord } from '@/types';
import { alertsData } from '@/data/alerts';
import { recordsData, addRecord as addRecordToData } from '@/data/records';

interface AppState {
  counselor: CounselorInfo | null;
  isFirstLaunch: boolean;
  alerts: AlertItem[];
  records: VerifyRecord[];
  setCounselor: (info: CounselorInfo) => void;
  completeFirstLaunch: () => void;
  addRecord: (record: Omit<VerifyRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAlertStatus: (alertId: string, status: AlertItem['status']) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const STORAGE_KEY_COUNSELOR = 'counselor_info';
const STORAGE_KEY_FIRST_LAUNCH = 'first_launch_done';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [counselor, setCounselorState] = useState<CounselorInfo | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [alerts, setAlerts] = useState<AlertItem[]>(alertsData);
  const [records, setRecords] = useState<VerifyRecord[]>(recordsData);

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
      console.error('[AppContext] 读取本地存储失败', e);
    }
  }, []);

  const setCounselor = (info: CounselorInfo) => {
    try {
      Taro.setStorageSync(STORAGE_KEY_COUNSELOR, JSON.stringify(info));
      setCounselorState(info);
      console.log('[AppContext] 辅导员信息已保存', info.name);
    } catch (e) {
      console.error('[AppContext] 保存辅导员信息失败', e);
    }
  };

  const completeFirstLaunch = () => {
    try {
      Taro.setStorageSync(STORAGE_KEY_FIRST_LAUNCH, 'true');
      setIsFirstLaunch(false);
      console.log('[AppContext] 首次启动引导已完成');
    } catch (e) {
      console.error('[AppContext] 保存首次启动状态失败', e);
    }
  };

  const addRecord = (record: Omit<VerifyRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord = addRecordToData(record);
    setRecords(prev => [newRecord, ...prev]);
    console.log('[AppContext] 核实记录已添加', newRecord.id);

    if (newRecord.alertId) {
      updateAlertStatus(newRecord.alertId, 'processing');
    }
  };

  const updateAlertStatus = (alertId: string, status: AlertItem['status']) => {
    const statusNameMap: Record<AlertItem['status'], string> = {
      pending: '待核实',
      processing: '核实中',
      resolved: '已解决'
    };
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, status, statusName: statusNameMap[status] } : a
    ));
    console.log('[AppContext] 提醒状态已更新', alertId, status);
  };

  const value = useMemo(() => ({
    counselor,
    isFirstLaunch,
    alerts,
    records,
    setCounselor,
    completeFirstLaunch,
    addRecord,
    updateAlertStatus
  }), [counselor, isFirstLaunch, alerts, records]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
