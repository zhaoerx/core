/**
 * ownCloud - Core
 *
 * @author Raghu Nayyar
 * @copyright 2013 Raghu Nayyar <raghu.nayyar.007@gmail.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

var usersmanagement = angular.module('usersmanagement', ['ngResource','localytics.directives']).config(['$httpProvider','$routeProvider',
	function($httpProvider,$routeProvider) {
		$httpProvider.defaults.headers.common['requesttoken'] = oc_requesttoken;
		$routeProvider
		.when('/group/:groupid', {
			controller : 'grouplistController',
			templateUrl : OC.filePath('settings', 'templates/users', 'part.userlist.php')
		})
		.otherwise({
			redirectTo : '/group/everyone'
		});
	}
]);

/* Group Service */ 

usersmanagement.factory('GroupService', function($resource) {
	return {
		creategroup: function () {
			return $resource(OC.filePath('settings', 'ajax', 'creategroup.php'), {}, {
				method : 'POST'
			});
		},
		togglegroup: function () {
			return $resource(OC.filePath('settings', 'ajax', 'togglegroup.php'), group, {
				method : 'GET',
				isArray : true
			});
		},
		removegroup: function (group) {
			return $resource(OC.filePath('settings', 'ajax', 'removegroup.php'), group, {
				method: 'DELETE'
			});
		},
		getByGroupId: function(groupId) {
			return $resource(OC.filePath('settings', 'ajax', 'grouplist.php'), {}, {
				method: 'GET'
			});
		},
		getgrouplist: function() {
			return $resource(OC.filePath('settings', 'ajax', 'grouplist.php'), {}, {
				method: 'POST'
			});
		}
	}
});

/* User Serivce */

usersmanagement.factory('UserService', function($resource) {
	return {
		createuser: function () {
			return $resource(OC.filePath('settings', 'ajax', 'createuser.php'), {}, {
				method : 'POST'
			});
		},
		removeuser: function (users) {
			return $resource(OC.filePath('settings', 'ajax', 'removeuser.php'), users, {
				method: 'DELETE'
			});
		}
	};
});

/* Quota Service */

usersmanagement.factory('QuotaService', function($resource) {
	return $resource(OC.filePath('settings','ajax', 'setQuota.php'), {}, {
		method : 'POST'
	});
});

/* Asynchronously creates group */

usersmanagement.controller('creategroupController', ['$scope', '$http', 'GroupService',
	function($scope, $http, GroupService) {
		var newgroup = {};
		$scope.savegroup = function() {
			GroupService.creategroup().save({ groupname : $scope.newgroup });
		}
		$scope.disabledcreategroup = function() {
			// here comes the logic for disabling the "add group" button
			return false;
		}
	}
]);

/* Fetches the List of All Groups - Left Sidebar */

usersmanagement.controller('grouplistController', ['$scope', '$http', '$routeParams', 'GroupService', 'UserService',
	function($scope, $http, $routeParams, GroupService) {
		$scope.loading = true;
		$http.get(OC.filePath('settings', 'ajax', 'grouplist.php')).then(function(response){
			$scope.groupnames = response.data.result;
			$scope.loading = false;
		});
		//console.log($routeParams.groupid);
		$scope.groups = GroupService.getByGroupId($routeParams.groupid);

		// Selects teh current Group.
		$scope.selectGroup = function(groupid) {
			$scope.selectedGroup = groupid;
		}

		// Adds an Active class for the ng-class field.
		$scope.selectListGroup = function(groupid) {
			return groupid === $scope.selectedGroup ? 'active' : undefined;
		}

		//Deletes the group.
		$scope.deletegroup = function(groupid) {
			GroupService.removegroup().delete({ groupname : groupid });
		}
	}
]);

/* Asynchronously creates user */

usersmanagement.controller('addUserController', ['$scope', '$http', 'UserService', 'GroupService',
	function($scope, $http, UserService, GroupService) {
		var newuser,password = {};
		var groups = [];
		//$scope.allgroups = GroupService.getgrouplist();
		//console.log($scope.allgroups);
		/* Password can be console logged, do something. */
		$scope.saveuser = function() {
			UserService.createuser().save({ username : $scope.newuser }, { password : $scope.password }, { group : $scope.groups });
		}
	}
]);

usersmanagement.controller('setQuotaController', ['$scope', 'QuotaService',
	function($scope, QuotaService) {
		//Shift Default Storage here.
	}
]);

/* Fetches the List of All Users and details on the Right Content */

usersmanagement.controller('userlistController', ['$scope', '$http', 'UserService', 'GroupService','$routeParams',
	function($scope, $http, UserService, Groupservice, $routeParams) {
		$scope.loading = true;
		$http.get(OC.filePath('settings', 'ajax', 'userlist.php')).then(function(response) {
			$scope.users = response.data.userdetails;
			$scope.loading = false;
		});
		$scope.gid = $routeParams.groupid;
		//console.log($scope.gid);
		$scope.deleteuser = function(userid) {
			UserService.removeuser().delete({ username : userid });
		}
	}
]);

/* Filters the userlist for the respective group */

usersmanagement.filter('usertogroupFilter', function() {
	return function(users,groups) {
		var groupusers = [];
		for(var i=0; i<users.length; i++) {
			for (var j=0; j<groups.length; j++ ) {
				if(users[i].userid === groups[j]) {
					groupusers.push(users[i]);
				}
			}
		}
		return groupusers;
	}
});

/* The Spinner Directive */

usersmanagement.directive('loading', function() {
	return {
		restrict: 'E',
		replace: true,
		template:"<div class='loading'></div>",
	    link: function($scope, element, attr) {
			$scope.$watch('loading', function(val) {
				if (val) {
					$(element).show();
				}
				else {
					$(element).hide();
				}
			});
		}		
	}
});

/* ngFocus and ngBlur Directives */

usersmanagement.directive('ngFocus', ['$parse', function($timeout) {
    return function( scope, element, attrs ) {
        scope.$watch(attrs.ngFocus, function (newVal, oldVal) {
            if (newVal)
                element[0].focus();
        });
      };
}]);

usersmanagement.directive('ngBlur', ['$parse', function($parse) {
    return function (scope, element, attrs) {
		element.bind('blur', function () {
			scope.$apply(attrs.ngBlur);
		});
	};
}]);
