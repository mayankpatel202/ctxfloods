import decode from 'jwt-decode';
import { isTokenExpired } from './jwtHelper';

const auth = {
  isAuthenticated() {
    try {
      var token = localStorage.getItem('jwt_user_token');
      if (token === null || token === 'null') return false;
      return !isTokenExpired(token);
    } catch (e) {
      return false;
    }
  },

  getRole() {
    try {
      var token = localStorage.getItem('jwt_user_token');
      if (token === null || token === 'null') return null;
      return isTokenExpired(token) ? false : decode(token).role;
    } catch (e) {
      return null;
    }
  },

  roleAuthorized(permittedRoles) {
    return permittedRoles.includes(this.getRole());
  },

  signout(cb) {
    localStorage.removeItem('jwt_user_token');
    cb.call();
  },
};

export default auth;
