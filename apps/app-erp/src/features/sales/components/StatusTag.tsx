import StatusTagBase from '../../../components/common/StatusTag';

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

function StatusTag({ text, ...props }: StatusTagProps) {
  return <StatusTagBase text={text} {...props} />;
}

export default StatusTag;
