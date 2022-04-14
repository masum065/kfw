import React from 'react';
import { components } from 'react-select';

// @ts-ignore
export function CustomOption({ children, innerProps, isDisabled, ...props }) {
  return !isDisabled ? (
    <div>
      {children} ({props.data.rarity})
    </div>
  ) : null;
}

// @ts-ignore
export function Control({ children, selectProps, ...props }) {
  return (
    // @ts-ignore
    <components.Control {...props}>
      <img width='20px' src={selectProps.imgUrl} alt='option' />
      {children}
    </components.Control>
  );
}
