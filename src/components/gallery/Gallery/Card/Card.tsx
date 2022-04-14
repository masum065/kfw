interface IToken {
  name: string;
  src: string;
  rarity?: number | string;
}

interface Props {
  token: IToken;
}

export const Card = ({ token }: Props) => {
  //   const { name, src, rarity } = token;
  const { name, src } = token;
  return (
    <div className='insideHouseRankingBox'>
      <img src={src} alt='' />
      <p>{name}</p>
      {/* <span>Rank #{rarity}</span> */}
    </div>
  );
};
