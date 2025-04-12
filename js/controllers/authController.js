(function () {
  "use strict";

  angular.module("literalCafeApp").controller("AuthController", AuthController);

  AuthController.$inject = ["$location", "AuthService"];

  function AuthController($location, AuthService) {
    var vm = this;

    // Properties
    vm.user = {
      username: "",
      password: "",
      name: "",
      cpf: "",
      phone: "",
      email: "",
    };
    vm.isLogin = true;
    vm.errorMessage = "";
    vm.isLoading = false;

    // Initialize
    init();

    // Methods
    vm.login = login;
    vm.register = register;
    vm.toggleForm = toggleForm;

    function login() {
      vm.errorMessage = "";
      vm.isLoading = true;

      // Validate input fields
      if (!vm.user.username || !vm.user.password) {
        vm.errorMessage = "Por favor, preencha todos os campos";
        vm.isLoading = false;
        return;
      }

      console.log("Iniciando processo de login para:", vm.user.username);

      // Primeiro, verificamos se o usuário existe
      try {
        AuthService.checkUserExists(vm.user.username)
          .then(function (userData) {
            console.log("Resultado da verificação do usuário:", userData);

            if (!userData) {
              // Usuário não existe
              throw {
                message:
                  "Usuário não encontrado. Verifique seu CPF ou cadastre-se.",
              };
            }

            // Se chegou aqui, o usuário existe, então prosseguimos com o login
            console.log("Usuário existe, prosseguindo com login");
            return AuthService.login(vm.user.username, vm.user.password);
          })
          .then(function (response) {
            console.log("Login successful:", response);

            if (!response || !response.access_token) {
              throw {
                message: "Resposta de autenticação inválida",
              };
            }

            // Store token in localStorage
            localStorage.setItem("access_token", response.access_token);
            localStorage.setItem("token_type", response.token_type || "Bearer");
            localStorage.setItem("token_expires", response.expires_in);
            localStorage.setItem("user_cpf", vm.user.username);

            // Os dados do usuário já foram armazenados na função checkUserExists

            // Redirect to dashboard
            $location.path("/dashboard");
          })
          .catch(function (error) {
            console.error("Login process error:", error);

            // Tratamento mais limpo de erros
            if (error && error.message) {
              vm.errorMessage = error.message;
            } else {
              vm.errorMessage =
                "Erro ao fazer login. Verifique suas credenciais.";
            }
          })
          .finally(function () {
            vm.isLoading = false;
          });
      } catch (e) {
        console.error("Erro inesperado no login:", e);
        vm.errorMessage =
          "Ocorreu um erro inesperado. Por favor, tente novamente.";
        vm.isLoading = false;
      }
    }

    function register() {
      vm.errorMessage = "";
      vm.isLoading = true;

      // Validação básica
      if (
        !vm.user.name ||
        !vm.user.cpf ||
        !vm.user.phone ||
        !vm.user.email ||
        !vm.user.password
      ) {
        vm.errorMessage = "Por favor, preencha todos os campos";
        vm.isLoading = false;
        return;
      }

      // Validação específica do CPF - garantir que tenha apenas números
      var cpfClean = vm.user.cpf.replace(/\D/g, "");
      if (cpfClean.length !== 11) {
        vm.errorMessage = "CPF deve conter 11 dígitos";
        vm.isLoading = false;
        return;
      }

      // Atualizar com CPF limpo
      vm.user.cpf = cpfClean;

      console.log("Iniciando processo de registro para CPF:", vm.user.cpf);

      try {
        // Verifica primeiro se o usuário já existe
        AuthService.checkUserExists(vm.user.cpf)
          .then(function (userData) {
            console.log(
              "Resultado da verificação de usuário existente:",
              userData,
            );

            if (userData) {
              // Usuário já existe
              throw {
                message:
                  "CPF já cadastrado. Por favor, faça login ou utilize outro CPF.",
              };
            }

            // Se chegou aqui, o usuário não existe, então prosseguimos com o cadastro
            console.log("CPF disponível, prosseguindo com cadastro");
            return AuthService.register(vm.user);
          })
          .then(function (response) {
            console.log("Registration successful:", response);

            // Switch to login view
            vm.isLogin = true;
            vm.user.username = vm.user.cpf; // Use CPF as username

            // Show success message
            alert("Cadastro realizado com sucesso! Faça login para continuar.");
          })
          .catch(function (error) {
            console.error("Registration error:", error);

            if (error && error.message) {
              vm.errorMessage = error.message;
            } else {
              vm.errorMessage = "Erro ao realizar cadastro. Tente novamente.";
            }
          })
          .finally(function () {
            vm.isLoading = false;
          });
      } catch (e) {
        console.error("Erro inesperado no registro:", e);
        vm.errorMessage =
          "Ocorreu um erro inesperado. Por favor, tente novamente.";
        vm.isLoading = false;
      }
    }

    function toggleForm() {
      console.log("toggleForm called, current isLogin:", vm.isLogin);
      vm.isLogin = !vm.isLogin;
      vm.errorMessage = "";
      console.log("isLogin after toggle:", vm.isLogin);

      // Reset form fields when toggling
      if (vm.isLogin) {
        vm.user.username = "";
        vm.user.password = "";
      } else {
        vm.user.name = "";
        vm.user.cpf = "";
        vm.user.phone = "";
        vm.user.email = "";
        vm.user.password = "";
      }
    }

    function init() {
      // Check if user is already authenticated
      if (AuthService.isAuthenticated()) {
        $location.path("/dashboard");
      }
    }
  }
})();
