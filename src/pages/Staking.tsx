import { useWallet } from '@solana/wallet-adapter-react';
import { Collections } from '../components/staking/Collections/Collections';
import { Connect } from '../components/staking/Connect';
import RpcDropdown from '../components/staking/RpcDropdown';
import { MainLayout } from '../layouts/MainLayout';

const Staking = () => {
  const wallet = useWallet();
  return (
    // <Row justify='center'>
    <MainLayout>
      {wallet.connected ? 
      <Collections />
      : <Connect/> }

      <RpcDropdown/>
    </MainLayout>
    // <Root>
    //   <div className='bg' />
    //   {/* <Col span={16}> */}
    //   {/* <Collections /> */}
    //   <CollectionsV2 />
    //   <RpcDropdown />
    // </Root>
    // </Col>
    // </Row>
  );
};

export default Staking;
