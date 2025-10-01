import React from 'react';
import '../../assets/styles/theme.css';
import './TitleDescription.css';

type Align = 'left' | 'center' | 'right';

type WeightName = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

interface TitleDescriptionProps {
  title: string;
  description: string;
  titleSize?: number | string;
  descriptionSize?: number | string;
  titleWeight?: WeightName | number;
  descriptionWeight?: WeightName | number;
  align?: Align;
  spacing?: number | string;
  maxWidth?: number | string;
  titleColor?: string;
  descriptionColor?: string;
  className?: string;
}

function TitleDescription({
  title,
  description,
  titleSize = 39,
  descriptionSize = 20,
  titleWeight = 'bold',
  descriptionWeight = 'light',
  align = 'left',
  spacing = '0.5rem',
  maxWidth = '100%',
  titleColor = 'var(--pri-900)',
  descriptionColor = 'var(--pri-700)',
  className = '',
}: TitleDescriptionProps) {
  const toPx = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);

  const toWeight = (w: WeightName | number) => {
    if (typeof w === 'number') return w.toString();
    switch (w) {
      case 'light':
        return '300';
      case 'normal':
        return '400';
      case 'medium':
        return '500';
      case 'semibold':
        return '600';
      case 'bold':
      default:
        return '700';
    }
  };

  const classes = ['td-wrapper', `td-align-${align}`, className].filter(Boolean).join(' ');

  const style = {
    ['--td-title-size' as any]: toPx(titleSize),
    ['--td-description-size' as any]: toPx(descriptionSize),
    ['--td-title-weight' as any]: toWeight(titleWeight),
    ['--td-description-weight' as any]: toWeight(descriptionWeight),
    ['--td-spacing' as any]: toPx(spacing),
    ['--td-max-width' as any]: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    ['--td-title-color' as any]: titleColor,
    ['--td-description-color' as any]: descriptionColor,
  } as React.CSSProperties;

  return (
    <div className={classes} style={style}>
      <h2 className='td-title'>{title}</h2>
      <p className='td-description'>{description}</p>
    </div>
  );
}

export default TitleDescription;
