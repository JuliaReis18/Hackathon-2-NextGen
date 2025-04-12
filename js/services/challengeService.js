(function () {
  "use strict";

  angular
    .module("literalCafeApp")
    .service("ChallengeService", ChallengeService);

  ChallengeService.$inject = ["$http", "$q"];

  function ChallengeService($http, $q) {
    var service = {
      getChallenges: getChallenges,
      getPlayerStatus: getPlayerStatus,
      getRewards: getRewards,
      getRedeemedRewards: getRedeemedRewards,
      redeemReward: redeemReward,
    };

    return service;

    function getAuthHeaders() {
      return {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
        "Content-Type": "application/json",
      };
    }

    function getChallenges() {
      var deferred = $q.defer();

      // Buscar os desafios da API Funifier
      var req = {
        method: "GET",
        url: "https://service2.funifier.com/v3/challenge",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAD2LQQrCMBAAvyI555Bu1qZ414tHHyDbdIPBYEOSokX8u4tCb8Mw81aU45lXdVC9CzQAjmDBBYfBksXQmV5pVf2cWZLCNF0pJb17ltj4jxMn3pgajVRZHvJ-Xh5NruPlvtbTTdxSuWwiiIgkQecQ0VkA0Ipf-Sf2xg0G4PMFuF8ZwKAAAAA.qqb4nAWRd1pqosdE0ZZAqW9STz7D3kfc2zKXEZIaoTUiG45nBSX8mKrPMgLjFi-StPlb4dU8BVYpOFmNyHyC4w",
          "Content-Type": "application/json",
        },
      };

      $http(req)
        .then(function (response) {
          console.log("Challenges response:", response.data);

          if (Array.isArray(response.data)) {
            // Transformar os dados da API em um formato mais amigável para o frontend
            var challenges = response.data.map(function (challenge) {
              return {
                id: challenge._id,
                title: challenge.challenge,
                description: challenge.description,
                progress: 0, // Será atualizado com getPlayerStatus
                target: null, // Alguns desafios não têm alvo específico
                icon: getChallengeIcon(challenge),
              };
            });

            deferred.resolve(challenges);
          } else {
            console.error("Invalid challenges data:", response.data);
            deferred.reject("Erro ao recuperar desafios");
          }
        })
        .catch(function (error) {
          console.error("Error loading challenges:", error);
          deferred.reject(error);
        });

      return deferred.promise;
    }

    // Função auxiliar para obter ícone baseado no tipo de desafio
    function getChallengeIcon(challenge) {
      if (challenge.challenge.toLowerCase().includes("compr")) {
        return "fa-shopping-cart";
      } else if (challenge.challenge.toLowerCase().includes("visit")) {
        return "fa-store";
      } else if (challenge.challenge.toLowerCase().includes("indic")) {
        return "fa-user-plus";
      } else {
        return "fa-trophy";
      }
    }

    function getPlayerStatus() {
      var deferred = $q.defer();

      if (!localStorage.getItem("user_cpf")) {
        deferred.reject("Usuário não autenticado");
        return deferred.promise;
      }

      var cpf = localStorage.getItem("user_cpf");

      // Recuperar o status do jogador
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
          console.log("Player status response:", response.data);

          if (response.data && response.data._id) {
            var playerData = {
              name: response.data.name || "",
              photo:
                response.data.image &&
                response.data.image.medium &&
                response.data.image.medium.url
                  ? response.data.image.medium.url
                  : "img/default-avatar.png",
              xp: response.data.total_points || 0,
              coins:
                response.data.point_categories &&
                response.data.point_categories.moedas
                  ? response.data.point_categories.moedas
                  : 0,
              level:
                response.data.level_progress &&
                response.data.level_progress.level
                  ? response.data.level_progress.level.level
                  : "Iniciante",
              challenges: response.data.challenge_progress || [],
            };

            deferred.resolve(playerData);
          } else {
            console.error("Invalid player status data:", response.data);
            deferred.reject("Erro ao recuperar status do jogador");
          }
        })
        .catch(function (error) {
          console.error("Error loading player status:", error);
          deferred.reject(error);
        });

      return deferred.promise;
    }

    function getRewards() {
      var deferred = $q.defer();

      // Para o MVP, usaremos dados mockados
      // Em uma versão futura, isso seria integrado com a API Funifier
      var mockRewards = [
        {
          id: 1,
          title: "Café Espresso",
          description: "Um delicioso café espresso",
          cost: 50,
          image: "img/rewards/espresso.jpg",
        },
        {
          id: 2,
          title: "Cappuccino",
          description: "Cappuccino cremoso",
          cost: 80,
          image: "img/rewards/cappuccino.jpg",
        },
        {
          id: 3,
          title: "Pão de Queijo",
          description: "Pão de queijo quentinho",
          cost: 30,
          image: "img/rewards/pao-queijo.jpg",
        },
      ];

      deferred.resolve(mockRewards);

      return deferred.promise;
    }

    function getRedeemedRewards() {
      var deferred = $q.defer();

      // Para o MVP, usaremos dados mockados
      // Em uma versão futura, isso seria integrado com a API Funifier
      var mockRedeemedRewards = [
        {
          id: 1,
          title: "Café Espresso",
          description: "Um delicioso café espresso",
          redeemedDate: new Date("2025-04-10"),
          qrCode: "CAFE-ESP-123456",
          image: "img/rewards/espresso.jpg",
        },
      ];

      deferred.resolve(mockRedeemedRewards);

      return deferred.promise;
    }

    function redeemReward(rewardId) {
      var deferred = $q.defer();

      // Para o MVP, usaremos dados mockados
      // Em uma versão futura, isso seria integrado com a API Funifier
      var mockRedeemedReward = {
        id: rewardId,
        title: "Café Espresso",
        description: "Um delicioso café espresso",
        redeemedDate: new Date(),
        qrCode: "CAFE-ESP-" + Math.floor(100000 + Math.random() * 900000),
        image: "img/rewards/espresso.jpg",
      };

      deferred.resolve(mockRedeemedReward);

      return deferred.promise;
    }
  }
})();
