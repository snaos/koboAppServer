var workshopMain = angular.module('mainModule', []);

 workshop.controller('allWorkshopController', function ($scope, $http){
	$http.get('/web/AllworkshopList').success(function (data) {
		$scope.workshopList = data;
	}).error(function (data) {
		console.error("error : ", data);
	});
})