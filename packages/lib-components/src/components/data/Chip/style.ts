import { styled } from '../../../styled';
import { ChipColor, ShowIcon } from '.';
import { shade } from 'polished';

export const Container = styled.div<{
  disabled: boolean;
  color: ChipColor;
  outline: boolean;
  clickable: boolean;
  showIcon: ShowIcon;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing['0_25']} ${theme.spacing['0_5']}`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: ${({ clickable }): string => (clickable ? 'pointer' : 'auto')};
  width: fit-content;
  height: 20px;

  svg {
    margin-left: ${({ theme }) => theme.spacing['0_5']};
    cursor: pointer;
    transition: width 0.2s ease-in-out;
    will-change: width;
    display: ${({ showIcon }): string => (showIcon === 'always' ? 'inline-block' : 'none')};
    ${({ theme, color, outline }) => {
      if (!outline) {
        return 'fill: white; stroke: white;';
      }
      return `fill: ${theme.colors[color]};`;
    }}
  }

  ${({ theme, color, outline }): string => {
    if (!outline) {
      return 'border: 0.1rem solid transparent;';
    }
    return `border: 0.1rem solid ${shade(0.5, theme.colors[color])};`;
  }}

  &:hover {
    svg {
      display: inline-block;
    }
  }

  span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    font-size: ${({ theme }) => theme.fontSize.medium};
    user-select: none;

    ${({ theme, color, outline }) => {
      if (!outline) {
        return 'color: white;';
      }
      switch (color) {
        case 'backgroundAccent':
        case 'secondary':
          return `color: ${theme.colors.text};`;
        default:
          return `color: ${theme.colors[color]};`;
      }
    }}
  }

  ${({ theme, color, outline }): string => {
    if (outline) {
      return `background-color: ${shade('0.8', theme.colors[color])};`;
    }
    return `background-color: ${theme.colors[color]};`;
  }}
`;

export const Dot = styled.div<{ color: ChipColor; outline: boolean }>`
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing['0_5']};
  background-color: ${({ outline, theme, color }) => (outline ? theme.colors[color] : 'white')};
`;
