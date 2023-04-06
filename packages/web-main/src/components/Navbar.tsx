import { FC, cloneElement, ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import { darken } from 'polished';
import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';
import { Company, styled } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { AiOutlineLink as ExternalLinkIcon } from 'react-icons/ai';

const Container = styled(motion.div)`
  width: 0;
  position: relative;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  border-right: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 20px 30px 40px 30px;

  .company-icon {
    margin: 0 auto;
    padding: 3rem 0;
    cursor: pointer;
    margin-bottom: 11rem;
  }

  img {
    display: block;
    width: 80px;
    height: auto;
    margin: 0 auto;
    margin-bottom: 20px;
    cursor: pointer;
  }
`;

const Nav = styled.nav`
  display: flex;
  width: 100%;
  flex-direction: column;

  a {
    width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    padding: 15px;
    display: flex;
    align-items: center;
    margin: 8px 0;
    color: ${({ theme }) => theme.colors.secondary};
    transition: 0.2s transform ease-in-out;

    &:hover {
      transform: translateY(-3px);
      background-color: ${({ theme }) => theme.colors.background};
    }

    p {
      margin: ${({ theme }) => `0 ${theme.spacing['4']} 0 ${theme.spacing[1]}`};
    }

    svg {
      fill: ${({ theme }) => theme.colors.secondary};
    }

    &.active {
      background-color: ${({ theme }) => theme.colors.primary};
      p {
        font-weight: 800;
      }

      &:hover {
        background-color: ${({ theme }) => darken(0.05, theme.colors.primary)};
      }

      svg,
      p {
        fill: white;
        color: white;
      }
    }
  }
`;

export interface NavbarLink {
  path: string;
  label: string;
  icon: ReactElement;
  external?: boolean;
}

interface NavbarProps {
  links: NavbarLink[];
}

export const Navbar: FC<NavbarProps> = ({ links }) => {
  return (
    <Container
      animate={{ width: 325 }}
      transition={{ duration: 1, type: 'spring', bounce: 0.6 }}
    >
      <Link className="company-icon" to={PATHS.home()}>
        <Company />
      </Link>

      <Nav>
        {links.map(({ path, label, icon, external = false }) =>
          external ? (
            <a key={path} target="_blank" rel="noopener noreferrer" href={path}>
              {cloneElement(icon, { size: 24 })}
              <p>{label}</p>
              <ExternalLinkIcon size={16} />
            </a>
          ) : (
            <NavLink to={path} key={path} end>
              {cloneElement(icon, { size: 24 })}
              <p>{label}</p>
            </NavLink>
          )
        )}
      </Nav>
    </Container>
  );
};
