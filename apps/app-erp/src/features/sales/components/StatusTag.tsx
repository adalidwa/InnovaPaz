import StatusTagBase from '../../../components/common/StatusTag';

interface StatusTagProps {
  text: string;
  variant?: 'normal' | 'success' | 'warning' | 'danger';
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
  variant = 'normal', // Default a 'normal' para que use el color turquesa
  ...props
}: StatusTagProps) {
  return <StatusTagBase text={text} variant={variant} {...props} />;
}

export default StatusTag;
