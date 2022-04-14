import styled from 'styled-components';
import constants from '../../../constants';
import { useStack } from '../../../hooks/useStaking';

export const StakingCounter = () => {
  const { jungle } = useStack();

  const percentOf = (numA: number, numB: number) => {
    return (numA / numB) * 100;
  };

  const percent = percentOf(
    Number(jungle?.animalsStaked.toString()),
    constants.metadata.length
  ).toFixed(2);

  return (
    <Root>
      <StyledCounter>
        <h4>
          {percent !== null && Number(percent)}%{' '}
          <span>Students are staked</span>
        </h4>
        <p>
          {jungle?.animalsStaked.toString()}/{constants.metadata.length}
        </p>
      </StyledCounter>
      <div>
        <ProgressBar percentage={Number(percent)} />
      </div>
    </Root>
  );
};

interface IProgressProps {
  percentage: number;
}
const ProgressBar = ({ percentage }: IProgressProps) => {
  return (
    <StyledProgressbar>
      <div className='progress-bar-wrapper'>
        <div className='progress-bar' style={{ width: `${percentage}%` }} />
      </div>
    </StyledProgressbar>
  );
};

const Root = styled('div')`
  max-width: 50%;
  margin: 0 auto 10px;
  @media only screen and (max-width: 600px) {
    max-width: 100%;
    padding: 0 20px;
  }
  @media only screen and (min-width: 600px) {
    margin: 0 auto;
  }
`;

const StyledProgressbar = styled('div')`
  .progress-bar-wrapper {
    height: 45px;
    background-color: lightgrey;
    border-radius: 0px;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    border: 2px solid #830fff63;
    min-width: 750px;
    margin-bottom: 15px;

    @media only screen and (max-width: 1100px) {
      min-width: 500px;
    }
    @media only screen and (max-width: 768px) {
      min-width: 100%;
    }
  }

  .progress-bar {
    height: 100%;
    width: 0%;
    background-size: 1000px 400px;
    background-color: #ec453c;
    animation: progress-bar-animation;
    animation-duration: 18s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    transition: all 3s;
  }

  @keyframes progress-bar-animation {
    0% {
      background-position: 0 240px;
    }
    100% {
      background-position: 5000px 0;
    }
  }
`;

const StyledCounter = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -5px;

  h4 {
    font-size: 16px;
  }

  p {
    font-size: 20px;
    margin-bottom: 4px;
    @media only screen and (max-width: 600px) {
      display: none;
    }
  }
`;
