import React from 'react';
import { Navigation } from '../common/Navigation/Navigation';

interface Props {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: Props) => {
  return (
    <div>
      <Navigation />
      {children}
    </div>
  );
};
