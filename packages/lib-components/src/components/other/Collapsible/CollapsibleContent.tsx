import { FC, PropsWithChildren } from 'react';
import { useCollapsibleContext } from './CollapsibleContext';
import { styled } from '../../../styled';

const Container = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['1']};
  hyphens: auto;

  p {
    hypens: auto;
  }
`;

export const CollapsibleContent: FC<PropsWithChildren> = ({ children }) => {
  const { open } = useCollapsibleContext();

  if (!open) {
    return null;
  }

  return <Container aria-expanded={open}>{children}</Container>;
};
