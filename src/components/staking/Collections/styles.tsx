import styled from 'styled-components';

export const Root = styled('section')`
  padding-bottom: 40px;
`;

export const CollectionMain = styled('div')`
  padding: 50px 0;
`;

export const GridContainer = styled('div')`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 140px;
  margin-top: 30px;
`;

export const ConnectInfo = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
`;

export const StakeTitle = styled('h2')`
  text-align: center;
  font-size: 30px;
  text-shadow: 0px 4px 4px #e02f29;
  letter-spacing: 5px;
  margin: 20px 0 40px;
  display: flex;
  flex-direction: column;
  height: 40vh;
  justify-content: center;
  align-items: center;
}
`;
export const StyledStackContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;

  .earing {
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

  @media only screen and (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }

  @media only screen and (max-width: 1200px) {
    gap: 20px;
  }

  @media only screen and (min-width: 992px) {
    flex-direction: row;
    align-items: flex-start;
  }
  @media only screen and (min-width: 1200px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

export const StyledSubTitle = styled('h4')`
  text-transform: uppercase;
  font-size: 25px;
  letter-spacing: 3px;
  text-shadow: 0px 4px 4px #e02f29;
  text-align: center;
  font-weight: 100;
`;
export const RootWrapper = styled('div')`
  padding: 30px;
  width: 700px;
  min-height: 400px;
  background: rgb(224 47 41 / 9%);
  border: 1px solid #000000;
  display: flex;
  justify-content: center;
  align-items: center;

  .info {
    font-size: 30px;
    text-align: center;

    a {
      margin-left: 10px;
      color: #ec453c;
      text-decoration: underline;
    }
  }

  @media only screen and (max-width: 700px) {
    width: 100% !important;
  }
  @media only screen and (max-width: 1200px) {
    width: 480px;
  }
  @media only screen and (min-width: 1200px) {
    width: 700px;
  }
`;
export const StyledNFTContainer = styled('div')`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;

  @media only screen and (max-width: 420px) {
    grid-template-columns: 1fr !important;
  }
  @media only screen and (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }

  @media only screen and (min-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

export const StyledClaimActionWrapper = styled('div')`
  position: fixed;
  bottom: 2%;
  left: 50%;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
  transform: translateX(-50%);
  z-index: 99;

  button {
    font-size: 18px;
    font-weight: 700;
    padding: 10px 30;

    @media screen and (max-width: 600px) {
      font-size: 13px;
      font-weight: 700;
      width: 300px;
    }
  }
`;
