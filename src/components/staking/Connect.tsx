import { useWalletModal } from '@solana/wallet-adapter-ant-design';

export const Connect = () => {
  const { setVisible: setOpenWalletModal } = useWalletModal();
  //   const { disconnect, connected, publicKey } = useWallet();
  return (
    <div className='contentContainer'>
      <div className='aboutContainerWrap'>
        <div className='container'>
          <h2 className='splitMainHeading'>
            Warrior <span>Training</span>
          </h2>

          <div className='initContainer'>
            <div className='warriorTrainingTopWrap padbot300'>
              <h3>
                Please connect your wallet to begin your{' '}
                <strong>Warrior Training</strong>
              </h3>
              <div className='warriorDropdown'>
                <a
                  className='nav-link dropdown-toggle'
                  href='#'
                  id='navbarDropdown'
                  role='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  What is Warrior Training?
                </a>
                <ul className='dropdown-menu' aria-labelledby='navbarDropdown'>
                  <li className='dropdownMenuList'>
                    <p>
                      The KFW Training Arena is open. Earn KFW Tokens ($KFWT)
                      daily by sending your Warriors to train! Simply connect
                      your wallet and send (stake) your Kung Fu Warriors NFTs in
                      order to train with the Kung Fu Master. $KFWT earned can
                      be used for recruiting KFW and other partnership NFTs,
                      redeeming prizes/merchs, used in our gaming ecosystem,
                      etc.{' '}
                    </p>
                    <p>
                      <strong>Note:</strong> You can call back your Kung Fu
                      Warriors at any time. Accrued $KFWT is calculated daily
                      based on our House Rarity rankings and the number of KFWs
                      you have staked (see following):
                    </p>
                    <p>
                      <strong>
                        Daily Yield (KFWT) - based on NFT House Ranking
                      </strong>
                      <br />
                      <strong>Rank 1 to 165:</strong> 27.50
                      <br />
                      <strong>Rank 166 to 500:</strong> 23.50
                      <br />
                      <strong>Rank 501 to 1400:</strong> 21.50
                      <br />
                      <strong>Rank 1401 to 3000:</strong> 20.50
                      <br />
                      <strong>Rank 3001 to 5888:</strong> 20.00
                    </p>
                    <p>
                      Multiplier (# of KFWs in Training)
                      <br />
                      <strong>1-9 NFTs:</strong> 1.00 x<br />
                      <strong>10 - 19 NFTs:</strong> 1.05 x<br />
                      <strong>20 NFTs + :</strong> 1.10 x
                    </p>
                    <p>
                      For example, a KFW NFT Ranked #3500 held in a wallet that
                      has 10 NFTs staked would earn 20.00 * 1.05 = 21.00 KFWT
                      per day.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <div className='kfwConnectBox warriorImg'>
              <button
                onClick={() => setOpenWalletModal(true)}
                className='generalGreenBtn'
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
