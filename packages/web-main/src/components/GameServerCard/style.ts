import { styled, DialogBody } from '@takaro/lib-components';

export const Container = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.large};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 2px solid ${({ theme }) => theme.colors.backgroundAlt};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
  &:active {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const EmptyContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  border: 2px dashed ${({ theme }) => theme.colors.backgroundAlt};
  cursor: pointer;
  h3 {
    margin-left: ${({ theme }) => theme.spacing[1]};
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;
export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  h3 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
  p {
    width: fit-content;
    text-transform: lowercase;
  }
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160px;
  padding: ${({ theme }) => theme.spacing[2]};
`;

export const StyledDialogBody = styled(DialogBody)`
  h2 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
`;