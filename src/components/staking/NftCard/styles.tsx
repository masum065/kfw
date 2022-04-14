import { Checkbox } from 'antd';
import styled from 'styled-components';

export const NftRoot = styled('div')`
  min-height: 448px;
  text-align: center;
  h3 {
    font-size: 26px;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 5px;
  }
  p {
    font-size: 19px;
  }
  button {
    max-width: 100%;
  }
`;
export const NftImg = styled('img')`
  max-width: 100%;
`;
export const MultiplierBox = styled('p')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  margin: 0;
`;
export const ButtonGroup = styled('div')`
  align-items: center;
  flex-direction: column;
  gap: 5px;
  display: flex;
  width: 100%;

  button {
    letter-spacing: 10px;
    padding: 5px 0;

    width: 100%;
    border-radius: 0;
    font-weight: 700;
    text-shadow: 1px 2px 2px black;
  }
`;
export const SelectNFT = styled(Checkbox)`
  font-size: 18px;
  position: relative;
  background: #000;
  overflow: hidden;

  label {
    position: relative;
    &::before {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 100%;
      content: '';
      background: #ffffff63;
    }
  }
  .ant-checkbox {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -15px;
  }
  .ant-checkbox-inner {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .ant-checkbox-inner:after {
    position: absolute;
    top: 50%;
    left: 21.5%;
    display: table;
    width: 37.714286px;
    height: 75.142857px;
    border: 2px solid #fff;
    border-top: 0;
    border-left: 0;
    transform: rotate(45deg) scale(0) translate(-50%, -50%);
    opacity: 0;
    transition: all 0.1s cubic-bezier(0.71, -0.46, 0.88, 0.6), opacity 0.1s;
    content: ' ';
    z-index: 2;
  }
  .ant-checkbox-checked .ant-checkbox-inner:after {
    position: absolute;
    display: table;
    border: 20px solid #000;
    border-top: 0;
    border-left: 0;
    -webkit-transform: rotate(45deg) scale(1) translate(-50%, -50%);
    -ms-transform: rotate(45deg) scale(1) translate(-50%, -50%);
    transform: rotate(45deg) scale(1) translate(-50%, -50%);
    opacity: 1;
    -webkit-transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
    transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
    content: ' ';
    border-radius: 5px;
  }
  .ant-checkbox + span {
    padding: 0;
  }
  .ant-checkbox-inner {
    background-color: #1890ff00;
    border-color: #b7b7b700;
  }
`;

export const StyledNftItem = styled('div')`
  min-height: 270px;
  box-shadow: 0 0 7px #000000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  margin-bottom: 12px;

  button {
    letter-spacing: 3px;
  }

  .token-info {
    margin-bottom: 8px;
    label {
      &::before {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        content: '';
        background: #ffffff63;
      }
    }
    p {
      min-height: 45px;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 15px;
      margin-top: 5px;
      margin-bottom: 0px;
      font-weight: bold;
      line-height: 1.1;
      text-shadow: 0px 4px 4px #e02f29;
    }
  }

  .multiplier-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px;
    font-size: 12px;
    color: #fff;
  }
  img {
    max-width: 100%;
  }

  .earning {
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 155.1%;
    max-width: 173px;
    text-align: center;
    letter-spacing: 0.12em;
    text-transform: uppercase;

    color: #ffffff;

    text-shadow: 0px 4px 4px #000000;
  }
`;
