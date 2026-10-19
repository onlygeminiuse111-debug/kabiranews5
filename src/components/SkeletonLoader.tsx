import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Hero Skeleton Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Left Hero Card */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#16191f] border border-gray-200/80 dark:border-gray-800/80 p-4 overflow-hidden space-y-4">
          <div className="aspect-16/9 w-full rounded-xl skeleton-shimmer"></div>
          <div className="space-y-2">
            <div className="h-6 w-3/4 rounded-md skeleton-shimmer"></div>
            <div className="h-4 w-full rounded-md skeleton-shimmer"></div>
            <div className="h-4 w-2/3 rounded-md skeleton-shimmer"></div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="h-4 w-24 rounded skeleton-shimmer"></div>
            <div className="h-4 w-20 rounded skeleton-shimmer"></div>
          </div>
        </div>

        {/* Right Side Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="h-24 rounded-xl bg-white dark:bg-[#16191f] border border-gray-200/80 dark:border-gray-800/80 p-3 flex gap-3">
            <div className="w-24 h-full rounded-lg skeleton-shimmer shrink-0"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-full rounded skeleton-shimmer"></div>
              <div className="h-3 w-1/2 rounded skeleton-shimmer"></div>
            </div>
          </div>

          <div className="h-24 rounded-xl bg-white dark:bg-[#16191f] border border-gray-200/80 dark:border-gray-800/80 p-3 flex gap-3">
            <div className="w-24 h-full rounded-lg skeleton-shimmer shrink-0"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-full rounded skeleton-shimmer"></div>
              <div className="h-3 w-1/2 rounded skeleton-shimmer"></div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#16191f] border border-gray-200/80 dark:border-gray-800/80 p-4 space-y-3">
            <div className="h-4 w-1/3 rounded skeleton-shimmer"></div>
            <div className="h-3 w-full rounded skeleton-shimmer"></div>
            <div className="h-3 w-5/6 rounded skeleton-shimmer"></div>
            <div className="h-3 w-4/5 rounded skeleton-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-2xl bg-white dark:bg-[#16191f] border border-gray-200/80 dark:border-gray-800/80 p-4 space-y-3">
            <div className="aspect-16/10 w-full rounded-xl skeleton-shimmer"></div>
            <div className="h-5 w-5/6 rounded skeleton-shimmer"></div>
            <div className="h-4 w-full rounded skeleton-shimmer"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
