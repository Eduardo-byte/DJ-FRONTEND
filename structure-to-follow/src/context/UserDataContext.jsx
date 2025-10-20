import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const UserDataContext = createContext();

export function UserDataProvider({ children }) {
    // Use a variable name that reflects in-memory state rather than cookies.
    const [loggedInUser, setLoggedInUser] = useState({})
    const [userData, setUserData] = useState({});
    const [isStaff, setIsStaff] = useState(false);

    return (
        <UserDataContext.Provider value={{
            userData, setUserData, loggedInUser, setLoggedInUser, isStaff, setIsStaff
        }}>
            {children}
        </UserDataContext.Provider>
    );
}

UserDataProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { UserDataContext };
