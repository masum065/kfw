import { createGlobalStyle } from 'styled-components';

export const Styles = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Graduate&display=swap');
    body,
    html,
    a {
        color: #fff;
        font-family: 'Graduate', cursive;
    }
    body {
        margin:0;
        padding:0;
        border: 0;
        outline: 0;
        background: #211c1c;
        overflow-x: hidden;
        font-family: 'Graduate', cursive; 

    }
    a:hover {
        color: #fff;
    }
    input,
    textarea {
        border-radius: 4px;
        border: 0;
        background: rgb(241, 242, 243);
        transition: all 0.3s ease-in-out;  
        outline: none;
        width: 100%;  
        padding: 1rem 1.25rem;

        :focus-within {
            background: none;
            box-shadow: #2e186a 0px 0px 0px 1px;
        }
    }
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        color: #fff !important;
        font-size: 70px;
        line-height: 1.18;
        font-family: 'Graduate', cursive;
        font-weight: 800;

        @media only screen and (max-width: 890px) {
          font-size: 47px;
        }
      
        @media only screen and (max-width: 414px) {
          font-size: 32px;
        }
    }
    p {
        color: #fff;
        font-size: 21px;        
        line-height: 1.41;
    }
    h1 {
        font-weight: 600;
    }
    a {
        text-decoration: none;
        outline: none;
        color: #2E186A;

        :hover {
            color: #2e186a;
        }
    }
    *:focus {
        outline: none;
    }
    .about-block-image svg {
        text-align: center;
    }
    .ant-drawer-body {
        display: flex;
        flex-direction: column;
        text-align: left;
        padding-top: 1.5rem;
    }
    .ant-drawer-content-wrapper {
        width: 300px !important;
    }
`;
