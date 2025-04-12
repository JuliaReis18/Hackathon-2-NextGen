(function() {
    'use strict';

    angular
        .module('literalCafeApp')
        .service('AuthService', AuthService);

    AuthService.$inject = ['$http', '$q'];

    function AuthService($http, $q) {
        var service = {
            login: login,
            register: register,
            logout: logout,
            isAuthenticated: isAuthenticated
        };

        return service;

        function login(username, password) {
            var deferred = $q.defer();

            // Create request with user credentials
            var req = {
                method: 'POST',
                url: 'https://service2.funifier.com/v3/auth/token',
                headers: {"Authorization":"Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAD2LQQrCMBAAvyI555Bu1qZ414tHHyDbdIPBYEOSokX8u4tCb8Mw81aU45lXdVC9CzQAjmDBBYfBksXQmV5pVf2cWZLCNF0pJb17ltj4jxMn3pgajVRZHvJ-Xh5NruPlvtbTTdxSuWwiiIgkQecQ0VkA0Ipf-Sf2xg0G4PMFuF8ZwKAAAAA.qqb4nAWRd1pqosdE0ZZAqW9STz7D3kfc2zKXEZIaoTUiG45nBSX8mKrPMgLjFi-StPlb4dU8BVYpOFmNyHyC4w","Content-Type":"application/json"},
                data: {
                    "apiKey": "67fa824b2327f74f3a34f106",
                    "grant_type": "password",
                    "username": username,
                    "password": password
                }
            };

            $http(req)
                .then(function(response) {
                    console.log('Login successful:', response.data);
                    deferred.resolve(response.data);
                })
                .catch(function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        function logout() {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_expires');
        }

        function isAuthenticated() {
            var token = localStorage.getItem('access_token');
            var expires = localStorage.getItem('token_expires');

            if (!token || !expires) {
                return false;
            }

            // Check if token has expired
            var now = new Date().getTime();
            if (now > parseInt(expires)) {
                // Token has expired, clear it
                logout();
                return false;
            }

            return true;
        }

        function register(userData) {
            var deferred = $q.defer();

            // Create a player in Funifier
            var req = {
                method: 'POST',
                url: 'https://service2.funifier.com/v3/player',
                headers: {"Authorization":"Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAD2LQQrCMBAAvyI555Bu1qZ414tHHyDbdIPBYEOSokX8u4tCb8Mw81aU45lXdVC9CzQAjmDBBYfBksXQmV5pVf2cWZLCNF0pJb17ltj4jxMn3pgajVRZHvJ-Xh5NruPlvtbTTdxSuWwiiIgkQecQ0VkA0Ipf-Sf2xg0G4PMFuF8ZwKAAAAA.qqb4nAWRd1pqosdE0ZZAqW9STz7D3kfc2zKXEZIaoTUiG45nBSX8mKrPMgLjFi-StPlb4dU8BVYpOFmNyHyC4w","Content-Type":"application/json"},
                data: {
                    "_id": userData.cpf,
                    "name": userData.name,
                    "email": userData.email,
                    "image": {
                        "small": {"url": "img/default-avatar.png"},
                        "medium": {"url": "img/default-avatar.png"},
                        "original": {"url": "img/default-avatar.png"}
                    },
                    "extra": {
                        "phone": userData.phone,
                        "password": userData.password
                    }
                }
            };

            $http(req)
                .then(function(response) {
                    console.log('Registration successful:', response.data);
                    deferred.resolve(response.data);
                })
                .catch(function(error) {
                    console.error('Registration error:', error);
                    deferred.reject(error);
                });

            return deferred.promise;
        }
    }
})();
