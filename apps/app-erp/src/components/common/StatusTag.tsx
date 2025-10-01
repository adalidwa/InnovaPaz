import React from 'react';
import '../../assets/styles/theme.css';
import './StatusTag.css';

interface StatusTagProps {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  uppercase?: boolean;
  className?: string;
}

function StatusTag({
  text,
  backgroundColor = 'var(--pri-100)',
  textColor = 'var(--pri-800)',
  width = 80,
  height = 20,
  radius = 15,
  uppercase = false,
  className = '',
}: StatusTagProps) {
  const toUnit = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);

  const style = {
    ['--st-bg' as any]: backgroundColor,
    ['--st-color' as any]: textColor,
    ['--st-width' as any]: toUnit(width),
    ['--st-height' as any]: toUnit(height),
    ['--st-radius' as any]: toUnit(radius),
    ['--st-transform' as any]: uppercase ? 'uppercase' : 'none',
  } as React.CSSProperties;

  return (
    <span className={`status-tag ${className}`} style={style}>
      {text}
    </span>
  );
}

export default StatusTag;
