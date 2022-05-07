import { Select } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
const { Option } = Select;

const RpcDropdown = () => {
  const [selectedRpc, setSelectedRpc] = useState('');
  const options = [
    {
      label: 'SolPatrol (https://rpc.solpatrol.io/)',
      value: 'https://rpc.solpatrol.io/',
    },
    {
      label: 'GenesysGo (https://ssc-dao.genesysgo.net/)',
      value: 'https://pentacle.genesysgo.net/',
    },
    {
      label: 'Metaplex (https://api.metaplex.solana.com/)',
      value: 'https://api.metaplex.solana.com/',
    },
    {
      label: 'Solana (https://api.mainnet-beta.solana.com/)',
      value: 'https://api.mainnet-beta.solana.com/',
    },
    {
      label: 'Solana (https://api.devnet.solana.com/)',
      value: 'https://api.devnet.solana.com/',
    },
    {
      label: 'Serum (https://solana-api.projectserum.com/)',
      value: 'https://solana-api.projectserum.com/',
    },
  ];
  const handleChange = (value: string) => {
    localStorage.setItem('rpc', value);
    window.location.reload();
  };

  useEffect(() => {
    if (localStorage.getItem('rpc')) {
      setSelectedRpc(localStorage.getItem('rpc') as string);
    } else {
      setSelectedRpc(options[0].value);
      localStorage.setItem('rpc', options[0].value);
    }
  }, []);

  const Root = styled('div')`
    min-height: 40px;
    position: relative;
  `;
  return (
    // <Container>
    <Root>
      <Select
        defaultValue={selectedRpc}
        style={{
          width: 250,
          fontSize: '80%',
          position: 'fixed',
          right: 30,
          bottom: 20,
        }}
        onChange={handleChange}
      >
        {options.map((option) => (
          <Option value={option.value} key={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Root>
    // </Container>
  );
};

export default RpcDropdown;
