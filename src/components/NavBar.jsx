import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = ({ token }) => {
    const location = useLocation();

    return (
        <nav className='navigation'>

            {!location.pathname.startsWith('/invite/') && (
                <Link className='a-navigation' to={`/invite/${token}`}>
                    Invitación
                </Link>
            )}

            {!location.pathname.startsWith('/recuerdos/') && (
                <Link className='a-navigation' to={`/recuerdos/${token}`}>
                    Recuerdos
                </Link>
            )}

            {!location.pathname.startsWith('/instantaneas/') && (
                <Link className='a-navigation' to={`/instantaneas/${token}`}>
                    Instantáneas
                </Link>
            )}

        </nav>
    );
};

export default NavBar;