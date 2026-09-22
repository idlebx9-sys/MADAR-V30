import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '../ui/Card.tsx';

interface ChartsProps {
  analytics?: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
    requestsCount: number;
  }>;
}

export const DashboardCharts: React.FC<ChartsProps> = ({ analytics }) => {
  const data =
    analytics && analytics.length > 0
      ? analytics
      : [
          { date: '15 سبت', views: 32, uniqueVisitors: 21, requestsCount: 2 },
          { date: '16 أحد', views: 41, uniqueVisitors: 29, requestsCount: 3 },
          { date: '17 إثنين', views: 49, uniqueVisitors: 34, requestsCount: 4 },
          { date: '18 ثلوث', views: 56, uniqueVisitors: 39, requestsCount: 5 },
          { date: '19 أربعاء', views: 63, uniqueVisitors: 45, requestsCount: 6 },
        ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visitors Trend (Area Chart) */}
      <Card className="lg:col-span-2 text-right border-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">آخر 5 أيام</span>
            <CardTitle className="text-sm font-bold text-white">
              حركة الزيارات اليومية للموقع
            </CardTitle>
          </div>
        </CardHeader>
        <div className="h-64 w-full pt-4" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C3CE1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6C3CE1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#11182B',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  textAlign: 'right',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="إجمالي المشاهدات"
                stroke="#6C3CE1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#violetGradient)"
              />
              <Area
                type="monotone"
                dataKey="uniqueVisitors"
                name="الزوار الفعليين"
                stroke="#00D4FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cyanGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Marriage Requests Count (Bar Chart) */}
      <Card className="text-right border-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#22C55E] font-semibold">معدل التقديم</span>
            <CardTitle className="text-sm font-bold text-white">طلبات الزواج الواردة</CardTitle>
          </div>
        </CardHeader>
        <div className="h-64 w-full pt-4" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#11182B',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  textAlign: 'right',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="requestsCount" name="عدد الطلبات" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
