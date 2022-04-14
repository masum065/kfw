import axios from 'axios';
import Fuse from 'fuse.js';
import { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Select from 'react-select';
import kfw from '../../../assets/img/KFW-picture.png';
import { Card } from './Card/Card';
import { backgroundOptions, clothesOptions } from './filters';
import './gallery.scss';

const nfts = [
  {
    image: kfw,
    name: 'KFW #1023',
    rank: 1,
  },
  {
    image: kfw,
    name: 'KFW #1023',
    rank: 1,
  },
  {
    image: kfw,
    name: 'KFW #1023',
    rank: 1,
  },
];

const sortOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Rarity ↑', value: 'rare' },
  { label: 'Rarity ↓', value: 'common' },
  { label: 'Number ↑', value: 'highest' },
  { label: 'Number ↓', value: 'lowest' },
];

export const Gallery = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const [apesData, setApesData] = useState([]);
  const [initApesData, setInitApesData] = useState([]);
  const [tigersData, setTigersData] = useState([]);
  const [itemsToShow, setItemsToShow] = useState([]);
  const [numberFilters, setNumberFilters] = useState<number[] | number>([]);
  const [filtersEmpty, setFiltersEmpty] = useState(true);
  const [selectedNft, setSelectedNft] = useState(false);

  const [totalPages, setTotalPages] = useState(250);

  const [showFilters, setShowFilters] = useState(false);

  const bgFilterRef = useRef();
  const clothesFilterRef = useRef();
  const earringsFilterRef = useRef();
  const eyesFilterRef = useRef();
  const furFilterRef = useRef();
  const mouthFilterRef = useRef();
  const hatFilterRef = useRef();
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [pageNumber, setPageNumber] = useState(1);

  const [selectedTab, setSelectedTab] = useState('apes');

  const fuse = new Fuse(itemsToShow, {
    keys: ['name'],
  });

  const [filters, setFilters] = useState<any>({
    Background: [],
    Hat: [],
    Earrings: [],
    Mouth: [],
    Eyes: [],
    Fur: [],
    Clothes: [],
  });

  const fetchData = async () => {
    const apes = await axios.get('apes-data.json').then((data) => data.data);
    setInitApesData(apes);
    setTotalPages(Math.ceil(apes.length / 20));
    setApesData(apes);
    setItemsToShow(apes);
  };

  useEffect(() => {
    fetchData();
  }, []);

  //   const isFiltersClear = useCallback(() => {
  //     let hasValue = true;
  //     Object.keys(filters).forEach((key, i) => {
  //       if (filters[key].length > 0) hasValue = false;
  //     });
  //     setFiltersEmpty(hasValue);
  //     return hasValue;
  //   }, [filters]);

  const handleFiltersChanged = (newValue: any, action: any) => {
    if (action.action === 'clear') {
      setFilters({
        ...filters,
        [action.name]: [],
      });
    }
    //@ts-ignore
    const filterItems = newValue.map((f) => f.value);
    if (action.action === 'select-option') {
      setFilters({
        ...filters,
        [action.name]: filterItems,
      });
    }
    // setFiltersEmpty(isFiltersClear());
  };

  //@ts-ignore
  const handleSortBy = (newValue, list, setList) => {
    if (newValue.value === 'highest') {
      //@ts-ignore
      const sortdRes = JSON.parse(JSON.stringify(list)).sort((a, b) => {
        if (
          parseInt(a.name.split('#')[1], 10) >
          parseInt(b.name.split('#')[1], 10)
        )
          return -1;
        return 1;
      });
      setList(sortdRes);
    } else if (newValue.value === 'lowest') {
      //@ts-ignore
      const sortdRes = JSON.parse(JSON.stringify(list)).sort((a, b) => {
        if (
          parseInt(a.name.split('#')[1], 10) <
          parseInt(b.name.split('#')[1], 10)
        )
          return -1;
        return 1;
      });
      setList(sortdRes);
    } else if (newValue.value === 'default') {
      setList(list);
    } else if (newValue.value === 'rare') {
      //@ts-ignore
      const sortdRes = JSON.parse(JSON.stringify(list)).sort((a, b) => {
        if (parseInt(a.rarity, 10) > parseInt(b.rarity, 10)) return 1;
        return -1;
      });
      setList(sortdRes);
    } else if (newValue.value === 'common') {
      //@ts-ignore
      const sortdRes = JSON.parse(JSON.stringify(list)).sort((a, b) => {
        if (parseInt(a.rarity, 10) > parseInt(b.rarity, 10)) return -1;
        return 1;
      });
      setList(sortdRes);
    }
    setSortBy(newValue);
    setPageNumber(1);
  };

  useEffect(() => {
    // if (isFiltersClear()) {
    //   setNumberFilters(0);
    // //   handleSortBy(sortBy, apesData, setItemsToShow);
    //   setTotalPages(Math.ceil(apesData.length / 20));
    // } else {
    let numFilters = 0;
    Object.keys(filters).forEach((key) => {
      if (filters[key].length > 0) numFilters += 1;
    });
    const res = apesData.filter((ape, index) => {
      let isValid = true;
      Object.keys(filters).forEach((key, i) => {
        if (filters[key].length > 0 && isValid) {
          //@ts-ignore
          const attr = ape.attributes.find((a) => a.trait_type === key);
          //@ts-ignore
          if (filters[key].find((filter) => filter === attr.value)) {
            isValid = true;
          } else isValid = false;
        }
      });
      return isValid;
    });
    setNumberFilters(numFilters);
    handleSortBy(sortBy, res, setItemsToShow);
    setTotalPages(Math.ceil(res.length / 20));
    // }
    //   }, [apesData, filters, isFiltersClear, sortBy]);
  }, [apesData, filters, sortBy, search]);

  //   const clearFilters = () => {
  //     bgFilterRef.current?.clearValue();
  //     mouthFilterRef.current?.clearValue();
  //     eyesFilterRef.current?.clearValue();
  //     hatFilterRef.current?.clearValue();
  //     clothesFilterRef.current?.clearValue();
  //     furFilterRef.current?.clearValue();
  //     earringsFilterRef.current?.clearValue();

  //     setFilters({
  //       Background: [],
  //       Hat: [],
  //       Earrings: [],
  //       Mouth: [],
  //       Eyes: [],
  //       Fur: [],
  //     });

  //     setFiltersEmpty(true);
  //     setNumberFilters(0);
  //     setPageNumber(1);
  //   };

  const paginate = (action: string) => {
    if (action === 'next') {
      setPageNumber(pageNumber + 1);
    } else if (action === 'back') {
      setPageNumber(pageNumber - 1);
    } else if (action === 'first') {
      setPageNumber(1);
    } else if (action === 'last') {
      setPageNumber(totalPages);
    }
    window.scrollTo(0, 0);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  // filter by Search Result
  useEffect(() => {
    if (!search) {
      return;
    } else {
      setItemsToShow([...fuse?.search(search).map((item) => item.item)]);
    }
  }, [search]);

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (e.target[0].value) {
      setSearch(e.target[0].value);
    } else {
      setSearch('');
    }
  };

  return (
    <>
      <div className='contentContainer mt-5'>
        <div className='aboutContainerWrap' data-aos='fade-left'>
          <div className='container'>
            <h2 className='splitMainHeading'>
              House rarity <span>rankings</span>
            </h2>
            <div className='houseRankingsContainer'>
              <form onSubmit={handleSearch}>
                <div className='houseRankingFilter'>
                  <input
                    type='text'
                    className='houseRankingTextField'
                    placeholder='Search your NFT'
                  />
                  <button className='generalGreenBtn'>Search</button>
                  <button
                    className='generalGreenBtn'
                    data-bs-toggle='modal'
                    data-bs-target='#filterModal'
                    onClick={() => setShowModal(true)}
                  >
                    Filter
                  </button>
                </div>
              </form>
              <div className='houseRankingsBoxesWrap'>
                <div className='row'>
                  {itemsToShow.slice(0, 200).map((token, index) => (
                    <div className='col-md-2' key={index}>
                      <Card token={token} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal className='filterModal' show={showModal} onHide={handleClose}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'
            >
              <img src='assets/img/close-btn.png' alt='' />
            </button>
            <div className='modal-body'>
              <div className='filterSelectBoxMainWrap'>
                <form>
                  <div className='filterSelectionBox'>
                    <div className='leftToggleSelect'>
                      <p className='leftToggleAnchor'>Background</p>
                    </div>
                    <div className='rightToggleSelect'>
                      <Select
                        className='gallery__select'
                        name='Background'
                        options={backgroundOptions}
                        //   styles={customSelectStyles}
                        placeholder='Background'
                        isClearable
                        // components={{ Option: CustomOption, Control }}
                        isMulti
                        onChange={handleFiltersChanged}
                        //   ref={bgFilterRef}
                        isSearchable={false}
                      />
                    </div>
                  </div>
                  <div className='filterSelectionBox'>
                    <div className='leftToggleSelect'>
                      <p className='leftToggleAnchor'>Clothes</p>
                    </div>
                    <div className='rightToggleSelect'>
                      <Select
                        className='gallery__select'
                        name='Clothes'
                        options={clothesOptions}
                        //   styles={customSelectStyles}
                        placeholder='Clothes'
                        isClearable
                        //   components={{ Option: CustomOption, Control }}
                        isMulti
                        //   imgUrl="clothes-icon.png"
                        onChange={handleFiltersChanged}
                        //   ref={clothesFilterRef}
                        isSearchable={false}
                      />
                    </div>
                  </div>
                  <p
                    onClick={() => setShowModal(false)}
                    className='generalGreenBtn mautoBtn'
                  >
                    Cose
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* </div> */}
    </>
  );
};
