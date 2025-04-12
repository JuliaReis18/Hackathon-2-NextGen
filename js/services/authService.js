(function () {
  "use strict";

  angular.module("literalCafeApp").service("AuthService", AuthService);

  AuthService.$inject = ["$http", "$q"];

  function AuthService($http, $q) {
    var service = {
      login: login,
      register: register,
      logout: logout,
      isAuthenticated: isAuthenticated,
      getCurrentUser: getCurrentUser,
      checkUserExists: checkUserExists,
    };

    return service;

    function login(username, password) {
      var deferred = $q.defer();

      console.log("Tentando login para usuário:", username);

      // Validações básicas
      if (!username || !password) {
        console.error("Username ou password inválidos");
        deferred.reject({ message: "Credenciais inválidas" });
        return deferred.promise;
      }

      // Create request with user credentials
      var req = {
        method: "POST",
        url: "https://service2.funifier.com/v3/auth/token",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAD2LQQrCMBAAvyI555Bu1qZ414tHHyDbdIPBYEOSokX8u4tCb8Mw81aU45lXdVC9CzQAjmDBBYfBksXQmV5pVf2cWZLCNF0pJb17ltj4jxMn3pgajVRZHvJ-Xh5NruPlvtbTTdxSuWwiiIgkQecQ0VkA0Ipf-Sf2xg0G4PMFuF8ZwKAAAAA.qqb4nAWRd1pqosdE0ZZAqW9STz7D3kfc2zKXEZIaoTUiG45nBSX8mKrPMgLjFi-StPlb4dU8BVYpOFmNyHyC4w",
          "Content-Type": "application/json",
        },
        data: {
          apiKey: "67fa824b2327f74f3a34f106",
          grant_type: "password",
          username: username,
          password: password,
        },
      };

      try {
        $http(req)
          .then(function (response) {
            console.log("Login API raw response:", response);
            console.log("Login API response data:", response.data);

            if (response.data && response.data.access_token) {
              console.log("Token obtido com sucesso");
              deferred.resolve(response.data);
            } else {
              // A API retornou sucesso, mas sem token válido
              console.error("Login API invalid response - missing token");
              deferred.reject({
                message:
                  "Credenciais inválidas ou resposta inesperada do servidor",
              });
            }
          })
          .catch(function (error) {
            console.error("Login API HTTP error:", error);

            var errorMsg = "Erro ao fazer login. Tente novamente.";

            if (error.status === 401 || error.status === 403) {
              errorMsg = "CPF ou senha incorretos. Tente novamente.";
            } else if (error.status === 0 || error.status >= 500) {
              errorMsg =
                "Erro de conexão com o servidor. Tente novamente mais tarde.";
            }

            deferred.reject({ message: errorMsg });
          });
      } catch (requestError) {
        console.error("Erro inesperado ao fazer requisição:", requestError);
        deferred.reject({
          message: "Erro inesperado. Por favor, tente novamente.",
        });
      }

      return deferred.promise;
    }

    function logout() {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("token_expires");
      localStorage.removeItem("user_cpf");
    }

    function isAuthenticated() {
      var token = localStorage.getItem("access_token");
      var expires = localStorage.getItem("token_expires");
      var cpf = localStorage.getItem("user_cpf");

      if (!token || !expires || !cpf) {
        return false;
      }

      // Check if token has expired
      var now = new Date().getTime();
      if (now > parseInt(expires)) {
        console.log("Token expirado", now, parseInt(expires));
        // Token has expired, clear it
        logout();
        return false;
      }

      return true;
    }

    function getCurrentUser() {
      return localStorage.getItem("user_cpf");
    }

    function checkUserExists(cpf) {
      var deferred = $q.defer();

      var req = {
        method: "GET",
        url: "https://service2.funifier.com/v3/player/" + cpf + "/status",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAD2LQQrCMBAAvyI555Bu1qZ414tHHyDbdIPBYEOSokX8u4tCb8Mw81aU45lXdVC9CzQAjmDBBYfBksXQmV5pVf2cWZLCNF0pJb17ltj4jxMn3pgajVRZHvJ-Xh5NruPlvtbTTdxSuWwiiIgkQecQ0VkA0Ipf-Sf2xg0G4PMFuF8ZwKAAAAA.qqb4nAWRd1pqosdE0ZZAqW9STz7D3kfc2zKXEZIaoTUiG45nBSX8mKrPMgLjFi-StPlb4dU8BVYpOFmNyHyC4w",
          "Content-Type": "application/json",
        },
      };

      $http(req)
        .then(function (response) {
          console.log("User check response:", response.data);
          if (response.data && response.data._id) {
            // User exists
            localStorage.setItem("user_name", response.data.name);
            localStorage.setItem("user_photo", response.data.image.medium.url);
            if (response.data.extra && response.data.extra.phone) {
              localStorage.setItem("user_phone", response.data.extra.phone);
            }
            deferred.resolve(response.data);
          } else {
            // User does not exist
            deferred.resolve(null);
          }
        })
        .catch(function (error) {
          console.error("User check error:", error);
          deferred.reject(error);
        });

      return deferred.promise;
    }

    function register(userData) {
      var deferred = $q.defer();

      // Create a player in Funifier
      var req = {
        method: "POST",
        url: "https://service2.funifier.com/v3/player",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAD2LQQrCMBAAvyI555Bu1qZ414tHHyDbdIPBYEOSokX8u4tCb8Mw81aU45lXdVC9CzQAjmDBBYfBksXQmV5pVf2cWZLCNF0pJb17ltj4jxMn3pgajVRZHvJ-Xh5NruPlvtbTTdxSuWwiiIgkQecQ0VkA0Ipf-Sf2xg0G4PMFuF8ZwKAAAAA.qqb4nAWRd1pqosdE0ZZAqW9STz7D3kfc2zKXEZIaoTUiG45nBSX8mKrPMgLjFi-StPlb4dU8BVYpOFmNyHyC4w",
          "Content-Type": "application/json",
        },
        data: {
          _id: userData.cpf,
          name: userData.name,
          email: userData.email,
          image: {
            small: { url: "img/default-avatar.png" },
            medium: { url: "img/default-avatar.png" },
            original: { url: "img/default-avatar.png" },
          },
          extra: {
            phone: userData.phone,
            password: userData.password,
          },
        },
      };

      $http(req)
        .then(function (response) {
          console.log("Registration API response:", response.data);
          deferred.resolve(response.data);
        })
        .catch(function (error) {
          console.error("Registration API error:", error);
          deferred.reject(error);
        });

      return deferred.promise;
    }
  }
})();
