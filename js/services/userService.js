(function() {
    'use strict';
    
    angular
        .module('literalCafeApp')
        .service('UserService', UserService);
    
    UserService.$inject = ['$http', '$q'];
    
    function UserService($http, $q) {
        var service = {
            getUserProfile: getUserProfile,
            updateProfile: updateProfile,
            changePassword: changePassword,
            getChallenges: getChallenges,
            getRewards: getRewards,
            getRedeemedRewards: getRedeemedRewards,
            redeemReward: redeemReward
        };
        
        return service;
        
        function getAuthHeaders() {
            return {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                'Content-Type': 'application/json'
            };
        }
        
        function getUserProfile() {
            var deferred = $q.defer();
            
            // For MVP, we'll use mock data
            // In a real scenario, we would make an API call to Funifier
            var mockProfile = {
                name: 'João Silva',
                photo: 'img/default-avatar.png',
                xp: 350,
                coins: 120,
                level: 3
            };
            
            deferred.resolve(mockProfile);
            
            return deferred.promise;
        }
        
        function updateProfile(profile) {
            var deferred = $q.defer();
            
            // For MVP, we'll just return the updated profile
            // In a real scenario, we would make an API call to Funifier
            deferred.resolve(profile);
            
            return deferred.promise;
        }
        
        function changePassword(currentPassword, newPassword) {
            var deferred = $q.defer();
            
            // For MVP, we'll just simulate success
            // In a real scenario, we would make an API call to Funifier
            deferred.resolve();
            
            return deferred.promise;
        }
        
        function getChallenges() {
            var deferred = $q.defer();
            
            // For MVP, we'll use mock data
            // In a real scenario, we would make an API call to Funifier
            var mockChallenges = [
                {
                    id: 1,
                    title: 'Compras',
                    description: 'A cada R$1 em compras = 1 moeda',
                    progress: 120,
                    target: null,
                    icon: 'fa-shopping-cart'
                }
            ];
            
            deferred.resolve(mockChallenges);
            
            return deferred.promise;
        }
        
        function getRewards() {
            var deferred = $q.defer();
            
            // For MVP, we'll use mock data
            // In a real scenario, we would make an API call to Funifier
            var mockRewards = [
                {
                    id: 1,
                    title: 'Café Espresso',
                    description: 'Um delicioso café espresso',
                    cost: 50,
                    image: 'img/rewards/espresso.jpg'
                },
                {
                    id: 2,
                    title: 'Cappuccino',
                    description: 'Cappuccino cremoso',
                    cost: 80,
                    image: 'img/rewards/cappuccino.jpg'
                },
                {
                    id: 3,
                    title: 'Pão de Queijo',
                    description: 'Pão de queijo quentinho',
                    cost: 30,
                    image: 'img/rewards/pao-queijo.jpg'
                }
            ];
            
            deferred.resolve(mockRewards);
            
            return deferred.promise;
        }
        
        function getRedeemedRewards() {
            var deferred = $q.defer();
            
            // For MVP, we'll use mock data
            // In a real scenario, we would make an API call to Funifier
            var mockRedeemedRewards = [
                {
                    id: 1,
                    title: 'Café Espresso',
                    description: 'Um delicioso café espresso',
                    redeemedDate: new Date('2025-04-10'),
                    qrCode: 'CAFE-ESP-123456',
                    image: 'img/rewards/espresso.jpg'
                }
            ];
            
            deferred.resolve(mockRedeemedRewards);
            
            return deferred.promise;
        }
        
        function redeemReward(rewardId) {
            var deferred = $q.defer();
            
            // For MVP, we'll use mock data
            // In a real scenario, we would make an API call to Funifier
            var mockRedeemedReward = {
                id: rewardId,
                title: 'Café Espresso',
                description: 'Um delicioso café espresso',
                redeemedDate: new Date(),
                qrCode: 'CAFE-ESP-' + Math.floor(100000 + Math.random() * 900000),
                image: 'img/rewards/espresso.jpg'
            };
            
            deferred.resolve(mockRedeemedReward);
            
            return deferred.promise;
        }
    }
})();
