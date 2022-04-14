import logo from '../../assets/img/logo.svg';
import './Navigation.scss';

export const Navigation = () => {
  return (
    <header className='topHeader'>
      <div className='insideHeader'>
        <div className='container'>
          <nav className='navbar navbar-expand-lg namobileHidevbar-light'>
            <a className='navbar-brand' href='index.html'>
              <img src={logo} />
            </a>
            <button
              className='navbar-toggler'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#navbarSupportedContent'
              aria-controls='navbarSupportedContent'
              aria-expanded='false'
              aria-label='Toggle navigation'
            >
              <span className='navbar-toggler-icon'></span>
            </button>
            <div
              className='collapse navbar-collapse'
              id='navbarSupportedContent'
            >
              <ul className='navbar-nav mr-auto'>
                <li className='nav-item active'>
                  <a className='nav-link' href='about.html'>
                    About
                  </a>
                </li>
                <li className='nav-item'>
                  <a className='nav-link' href='road-map.html'>
                    Road Map
                  </a>
                </li>
                <li className='nav-item'>
                  <a className='nav-link' href='initiatives.html'>
                    Initiatives
                  </a>
                </li>
                <li className='nav-item dropdown-hover'>
                  <a
                    className='nav-link dropdown-toggle'
                    href='#'
                    id='navbarDropdown'
                    role='button'
                    data-bs-toggle='dropdown'
                    aria-expanded='false'
                  >
                    Rarities
                  </a>
                  <ul
                    className='dropdown-menu'
                    aria-labelledby='navbarDropdown'
                  >
                    <li>
                      <a className='dropdown-item' href='warrior-rarities.html'>
                        Overview
                      </a>
                    </li>
                    <li>
                      <a className='dropdown-item' href='attribute-tiers.html'>
                        Attribute Tiers
                      </a>
                    </li>
                    <li>
                      <a className='dropdown-item' href='house-rankings.html'>
                        House Rankings
                      </a>
                    </li>
                  </ul>
                </li>
                <li className='nav-item dropdown-hover'>
                  <a
                    className='nav-link dropdown-toggle activeLink'
                    href='#'
                    id='navbarDropdown'
                    role='button'
                  >
                    Staking / Utilities
                  </a>
                  <ul className='dropdown-menu'>
                    <li>
                      <a
                        className='dropdown-item'
                        href='kfw-training-overview.html'
                      >
                        Overview
                      </a>
                    </li>
                    <li>
                      <a className='dropdown-item' href='warrior-training.html'>
                        Warrior Training
                      </a>
                    </li>
                    <li>
                      <a className='dropdown-item' href='recruit-warrior.html'>
                        Recruit a Warrior
                      </a>
                    </li>
                    <li>
                      <a
                        className='dropdown-item'
                        href='mysterious-warrior.html'
                      >
                        A Mysterious Warrior
                      </a>
                    </li>
                  </ul>
                </li>
                <li className='nav-item'>
                  <a className='nav-link' href='#_'>
                    Hiyah! Duel
                  </a>
                </li>
                <li className='nav-item'>
                  <a className='nav-link' href='faq.html'>
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
