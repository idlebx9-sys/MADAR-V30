import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#151C32] rounded-xl border border-white/5 ${className}`} />
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center pb-6 border-b border-white/5">
      <div className="space-y-2">
        <SkeletonBox className="h-7 w-48" />
        <SkeletonBox className="h-4 w-72" />
      </div>
      <SkeletonBox className="h-10 w-36" />
    </div>

    {/* Metric Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-2xl bg-[#11182B] border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="w-8 h-8 rounded-xl" />
          </div>
          <SkeletonBox className="h-8 w-28" />
          <SkeletonBox className="h-3 w-36" />
        </div>
      ))}
    </div>

    {/* Table / Content Skeleton */}
    <div className="p-6 rounded-2xl bg-[#11182B] border border-white/5 space-y-4">
      <SkeletonBox className="h-6 w-40 mb-4" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-9 h-9 rounded-xl" />
            <div className="space-y-1.5">
              <SkeletonBox className="h-4 w-32" />
              <SkeletonBox className="h-3 w-48" />
            </div>
          </div>
          <SkeletonBox className="h-7 w-20" />
        </div>
      ))}
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="p-4 rounded-xl bg-[#11182B]/60 border border-white/5 flex items-center justify-between"
      >
        <div className="space-y-2 flex-1">
          <SkeletonBox className="h-4 w-1/3" />
          <SkeletonBox className="h-3 w-1/2" />
        </div>
        <SkeletonBox className="h-8 w-24 ml-4" />
      </div>
    ))}
  </div>
);
