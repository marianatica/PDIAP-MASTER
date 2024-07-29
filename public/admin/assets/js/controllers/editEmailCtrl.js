(function () {
  "use strict";

  angular
    .module("PDIAPa")
    .controller(
      "editEmailCtrl",
      function ($scope, $rootScope, $window, $location, $mdDialog, adminAPI) {
        $rootScope.projetos = [];
        $scope.searchProject = "";
        $scope.idAprovados = [];
        $scope.count = 0;

        $scope.year = CadastraAno();

        let countTotal = 0;
        $scope.hosp = [];
        let carregarProjetos = function () {
          adminAPI
            .getTodosProjetos()
            .success(function (projetos) {
              angular.forEach(projetos, function (value, key) {
                var ano = new Date(value.createdAt).getFullYear();
                if (ano == $scope.ano ) {

                  let obj = {
                    _id: value._id,
                    numInscricao: value.numInscricao,
                    nomeProjeto: value.nomeProjeto,
                    nomeEscola: value.nomeEscola,
                    categoria: value.categoria,
                    eixo: value.eixo,
                    aprovado: value.aprovado,
                    participa: value.participa,
                    integrantes: value.integrantes,
                    createdAt: ano,
                    premiacao: value.premiacao,
                    mostratec: value.mostratec,
                    colocacao: value.colocacao,
                  };
                  $rootScope.projetos.push(obj);
                  if (obj.aprovado === true) {
                    $scope.count++;
                  }
                }
              });
            })
            .error(function (status) {
              console.log(status);
            });
        };
        // mari console.log("campo2: " +$scope.searchProject);
        $scope.carregarProjetos = carregarProjetos;

        // $scope.querySearch = function querySearch (query) {
        //  let deferred = $q.defer();
        //  return deferred;
        // }

        // $scope.count = 0;
        // $scope.contador = function(check,idProj) {
        //  if (check) {
        //    $scope.count--;
        //    let index = $scope.idAprovados.indexOf(idProj);
        //    $scope.idAprovados.splice(index, 1);
        //  }
        //  else {
        //    $scope.count++;
        //    $scope.idAprovados.push(idProj);
        //  }
        // }

        $scope.idProjetosAprovados = [];
        $scope.idProjetosReprovados = [];
        $scope.contador = function (check, idProj) {
          if (check) {
            $scope.count--;
            let index = $scope.idProjetosAprovados.indexOf(idProj);
            if (index !== -1) {
              $scope.idProjetosAprovados.splice(index, 1);
            }
            $scope.idProjetosReprovados.push(idProj);
          } else {
            $scope.count++;
            let index = $scope.idProjetosReprovados.indexOf(idProj);
            if (index !== -1) {
              $scope.idProjetosReprovados.splice(index, 1);
            }
            $scope.idProjetosAprovados.push(idProj);
          }
          // console.log("Aprovados: "+$scope.idProjetosAprovados);
          // console.log("Reprovados: "+$scope.idProjetosReprovados);
        };

        $rootScope.recarregar = function () {
          $rootScope.projetos = [];
          $scope.searchProject = "";
          $scope.idAprovados = [];
          $scope.count = 0;
          $scope.idProjetosAprovados = [];
          $scope.idProjetosReprovados = [];
          $scope.year = CadastraAno();
          carregarProjetos();
        };

        // $scope.ordenacao = ['categoria','eixo'];
        $scope.ordenarPor = function (campo) {
          $scope.ordenacao = campo;
        };

        //Mariana Tica
        $scope.ordenarPorCategoria = function (campo) {
          $scope.ordenacaoCategoria = campo;
        };

        $scope.query = "nomeProjeto";
        $scope.setBusca = function (campo) {
          $scope.query = campo;
        };

        carregarProjetos();

        $scope.enviarContato = function (contato) {
          adminAPI
            .postContato2(contato)
            .success(function (data) {
              console.log(data);
              if (data === "success") {
                let showAlert2 = function (ev) {
                  $mdDialog
                    .show(
                      $mdDialog
                        .alert()
                        .parent(
                          angular.element(
                            document.querySelector("#page-wrapper")
                          )
                        )
                        .clickOutsideToClose(false)
                        .textContent(
                          "Email enviado!"
                        )
                        .ok("OK")
                        .targetEvent(ev)
                    )
                };
                showAlert2();
                resetForm();
              } else {
                let showAlert2 = function (ev) {
                  $mdDialog.show(
                    $mdDialog
                      .alert()
                      .parent(
                        angular.element(document.querySelector("#page-wrapper"))
                      )
                      .clickOutsideToClose(false)
                      .textContent(
                        "Houve algum erro no envio do email."
                      )
                      .theme("error")
                      .ok("OK")
                      .targetEvent(ev)
                  );
                };
                showAlert2();
              }
            })
            .error(function (status) {
              let showAlert2 = function (ev) {
                $mdDialog.show(
                  $mdDialog
                    .alert()
                    .parent(
                      angular.element(document.querySelector("#page-wrapper"))
                    )
                    .clickOutsideToClose(false)
                    .textContent(
                      "Houve algum erro no envio do email."
                    )
                    .theme("error")
                    .ok("OK")
                    .targetEvent(ev)
                );
              };
              showAlert2();
              console.log(status);
            });
        };

        $scope.EmailPrincipal = function (projetos) {
          adminAPI
          
            .postContato2(contato)
            .success(function (data) {
              console.log(data);
              if (data === "success") {
                let showAlert2 = function (ev) {
                  $mdDialog
                    .show(
                      $mdDialog
                        .alert()
                        .parent(
                          angular.element(
                            document.querySelector("#page-wrapper")
                          )
                        )
                        .clickOutsideToClose(false)
                        .textContent(
                          "Email enviado!"
                        )
                        .ok("OK")
                        .targetEvent(ev)
                    )
                };
                showAlert2();
                resetForm();
              } else {
                let showAlert2 = function (ev) {
                  $mdDialog.show(
                    $mdDialog
                      .alert()
                      .parent(
                        angular.element(document.querySelector("#page-wrapper"))
                      )
                      .clickOutsideToClose(false)
                      .textContent(
                        "Houve algum erro no envio do email."
                      )
                      .theme("error")
                      .ok("OK")
                      .targetEvent(ev)
                  );
                };
                showAlert2();
              }
            })
            .error(function (status) {
              let showAlert2 = function (ev) {
                $mdDialog.show(
                  $mdDialog
                    .alert()
                    .parent(
                      angular.element(document.querySelector("#page-wrapper"))
                    )
                    .clickOutsideToClose(false)
                    .textContent(
                      "Houve algum erro no envio do email."
                    )
                    .theme("error")
                    .ok("OK")
                    .targetEvent(ev)
                );
              };
              showAlert2();
              console.log(status);
            });
        };


        let resetForm = function () {
          delete $scope.contato;
          $scope.contatoForm.$setPristine();
          $scope.contatoForm.$setUntouched();
        };
      }
    );
})();
