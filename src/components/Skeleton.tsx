import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '20px',
  rounded = false,
  animated = true,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const roundedClasses = rounded ? 'rounded' : '';
  const animatedClasses = animated ? 'animate-pulse' : '';
  
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${roundedClasses} ${animatedClasses} ${className}`}
      style={style}
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height="16px"
        width={index === lines - 1 ? '75%' : '100%'}
        rounded
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
    <Skeleton height="24px" width="60%" rounded className="mb-3" />
    <SkeletonText lines={3} className="mb-3" />
    <Skeleton height="32px" width="40%" rounded />
  </div>
);

export const SkeletonBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
    <Skeleton width={48} height={48} rounded />
    <div className="flex-1">
      <Skeleton height="20px" width="70%" rounded className="mb-2" />
      <Skeleton height="16px" width="50%" rounded />
    </div>
  </div>
);

export const SkeletonGameCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
    <Skeleton height="20px" width="80%" rounded className="mb-2" />
    <Skeleton height="16px" width="60%" rounded className="mb-3" />
    <div className="flex justify-between items-center">
      <Skeleton height="24px" width="30%" rounded />
      <Skeleton height="24px" width="20%" rounded />
    </div>
  </div>
); 