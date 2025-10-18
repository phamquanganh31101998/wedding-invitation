import CountdownErrorBoundary from './CountdownErrorBoundary';
import CountdownTimer from './CountdownTimer';

interface IProps {
  targetDate: Date;
}

const CountdownSection = ({ targetDate }: IProps) => {
  return (
    <CountdownErrorBoundary>
      <CountdownTimer targetDate={targetDate} />
    </CountdownErrorBoundary>
  );
};

export default CountdownSection;
