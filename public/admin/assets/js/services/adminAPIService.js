(function(){
	'use strict';

	angular
	.module('PDIAPa')
	.factory("adminAPI", function($http) {
		/*let _postLoginAdmin = function(username,password) {
		 	const request = {
		 		url: '/login',
		 		method: 'POST',
		 		data: {
		 			username: username,
		 			password: password
		 		}
		 	}
		 	return $http(request);
		};*/
		let _postEdit = function(edit){
			const request = {
				url: '/admin/edit',
				method: 'POST',
				data: edit
			}
			return $http(request);
		}
		let _getEdits = function(){
			const request = {
				url:'/admin/editar',
				method: 'GET'
			}
			return $http(request);
		}

		let _postOpcoes = function(op){
			const request = {
				url: '/admin/setOpcoes',
				method: 'POST',
				data: op
			}
			return $http(request);
		}
		let _getOpcoes = function(){
			const request = {
				url:'/admin/getOpcoes',
				method: 'GET'
			}
			return $http(request);
		}

		let _getTodosProjetos = function(ano) {
			const request = {
				url: '/admin/projetos',
				method: 'GET',
				data: {ano: ano}
			}			
			return $http(request);
		};

		let _getTodosSaberes = function() {
			const request = {
				url: '/admin/saberes',
				method: 'POST',
			}
			return $http(request);
		};

		let _getTodosAvaliadores = function() {
			const request = {
				url: '/admin/avaliador',
				method: 'POST',
			}
			return $http(request);
		};

		let _putSetAprovados = function(arrayProjetosAprovados,arrayProjetosReprovados) {			
			const request = {
				url: '/admin/upgreice',
				method: 'PUT',
				data: {
					projetosAprovados: arrayProjetosAprovados,
					projetosReprovados: arrayProjetosReprovados
				}
			}
			return $http(request);
		};

		let _putSetAvaliadores = function(arrayAvaliadoresMarcados,arrayAvaliadoresNMarcados) {
			const request = {
				url: '/admin/upgreiceAvaliadores',
				method: 'PUT',
				data: {
					avaliadoresMarcados: arrayAvaliadoresMarcados,
					avaliadoresNMarcados: arrayAvaliadoresNMarcados
				}
			}
			return $http(request);
		};

		let _putUnsetAprovados = function(projeto) {
			const request = {
				url: '/admin/upgreice2',
				method: 'PUT',
				data: projeto
			}
			return $http(request);
		};

		let _postConfirmacao = function(idProjeto,situacao) {
			const request = {
				url: '/projetos/confirma/'+idProjeto+'/'+situacao,
				method: 'POST'
			}
			return $http(request);
		};

		// let _getEscolasSaberes = function() {
		// 	const request = {
		// 		url: '/saberes-docentes/registro',
		// 		method: 'GET',
		// 	}
		// 	return $http(request);
		// };

		// let _saveSaberesDocentes = function(saberes) {
		// 	const request = {
		// 		url: '/saberes-docentes/registro',
		// 		method: 'POST',
		// 		data: saberes
		// 	}
		// 	return $http(request);
		// };

		let _saveAvaliador = function(avaliador) {
			const request = {
				url: '/avaliadores/registro',
				method: 'POST',
				data: avaliador
			}
			return $http(request);
		};

		let _putPresencaProjetos = function(arrayIntegrantesPresentes,arrayIntegrantesAusentes) {
			const request = {
				url: '/admin/setPresencaProjetos',
				method: 'PUT',
				data: {
					integrantesPresentes: arrayIntegrantesPresentes,
					integrantesAusentes: arrayIntegrantesAusentes
				}
			}
			return $http(request);
		};
	
		let _putPremiadoProjetos = function(premiacao){
			const request = {
				url: '/admin/setPremiadoProjetos',
				method: 'PUT',
				data: premiacao
			}
			return $http(request);
		}

		let _postEvento = function(evento) {
			const request = {
				url: '/admin/criarEvento',
				method: 'POST',
				data: evento
			}
			return $http(request);
		};

		let _getEventos = function() {
			const request = {
				url: '/admin/mostraEvento',
				method: 'GET'
			}
			return $http(request);
		};

		let _getAvaliadores = function() {
			const request = {
				url: '/admin/mostraAvaliadores',
				method: 'GET'
			}
			return $http(request);
		};

		//Leandro Henrique Kopp Ferreira - 04/11/2021
		// let _getDocumentos = function(id) {
		// 	const request = {
		// 		url: '/admin/removeDocumento',
		// 		method: 'PUT',
		// 		data: {id: id}
		// 	}
		// 	return $http(request);
		// };

		let _putRemoveEvento = function(id) {
			const request = {
				url: '/admin/removeEvento',
				method: 'PUT',
				data: { id: id }
			}
			return $http(request);
		};

		let _putRemoveAvaliador = function(id) {
			const request = {
				url: '/admin/removeAvaliador',
				method: 'PUT',
				data: { id: id }
			}
			return $http(request);
		};		

		let _postParticipante = function(participante) {
			const request = {
				url: '/admin/criarParticipante',
				method: 'POST',
				data: participante
			}
			return $http(request);
		};

		let _getParticipantes = function() {
			const request = {
				url: '/admin/mostraParticipante',
				method: 'GET'
			}
			return $http(request);
		};

		let _putRemoveParticipante = function(id) {
			const request = {
				url: '/admin/removeParticipante',
				method: 'PUT',
				data: { id: id }
			}
			return $http(request);
		};

		let _putAtualizaParticipante = function(participante) {
			const request = {
				url: '/admin/atualizaParticipante',
				method: 'PUT',
				data: participante
			}
			return $http(request);
		};

		let _getCPFparticipantes = function() {
			const request = {
				url: '/admin/mostraCPFparticipantes',
				method: 'GET'
			}
			return $http(request);
		};

		let _getCPFsaberes = function() {
			const request = {
				url: '/admin/mostraCPFsaberes',
				method: 'GET'
			}
			return $http(request);
		};

		let _getCategorias = function() {
			const request = {
				url: 'assets/js/categorias-eixos.json',
				method: 'GET',
			}
			return $http(request);
		};

		let _getEstados = function() {
			const request = {
				url: 'assets/js/estados-cidades.json',
				method: 'GET',
			}
			return $http(request);
		};

		let _putProjeto = function(projeto) {
		 	const request = {
		 		url: '/admin/update',
		 		method: 'PUT',
		 		data: projeto
		 	}
		 	return $http(request);
		 };

		let _putIntegrante = function(integrante) {
			const request = {
				url: '/admin/upgreiceEditProjeto',
				method: 'PUT',
				data: integrante
			}
			return $http(request);
		};

		let _removeIntegrante = function(integrante) {
			const request = {
				url: '/admin/removerIntegrante',
				method: 'PUT',
				data: integrante
			}
			return $http(request);
		};

		let _putRemoveProjeto = function(id) {
			const request = {
				url: '/admin/removeProjeto',
				method: 'PUT',
				data: { id: id }
			}
			return $http(request);
		};

		//função da API para exportação dos projetos - Mateus Algayer 30/09/2021

		let _postExportarprojetos = function(username, password) {
			const request = {
				url: '/admin/exportarprojetos',
				method: 'POST',
				data: { usuario: username, senha: password }
			}
			return $http(request);
		};

		//função da API para levar as informações do controlador cadastromostraCtrl.js para admin.js através de um request usando método POST
		//Mateus Algayer 30/09/2021
		let _postCertificado = function(data){
			const request = {
				url: '/admin/postCertificado',
				method: 'POST',
				data: {data}
			}
			return $http(request);
		};
		
		//função de API para recuperar as informações de certificados do banco - Mateus Algayer 30/09/2021
		let _getCertificado = function(){
			const request = {
				url: '/admin/getCertificados',
				method: 'GET'
			}
			return $http(request);
		} 

		//função da API para levar as informações de cadastro de documentos - Mateus Algayer 30/09/2021
		let _postDocumento = function(pacote){
			const request = {
				url: '/admin/postDocumento',
				method: 'POST',
				data: {pacote}
			}
			return $http(request);
		}

		//função da API para recuperar as informações de documentos - Mateus Algayer 30/09/2021
		let _getDocumentos = function() {
			const request = {
				url: '/admin/getDocumentos',
				method: 'GET'
			}
			return $http(request);
		}

		//Mateus Roberto Algayer - 15/11/2021
		//rota para deletar documentos
		let _putDocumento = function(id){
			const request = {
				url: '/admin/putDocumento',
				method: 'PUT',
				data: {id: id}
			}
			return $http(request);
		}

		//Mateus Roberto Algayer - 24/11/2021
		let _putUpdateExibir = function(id, exibe){
			const request = {
				url: '/admin/putUpdateExibir',
				method: 'PUT',
				data : {id: id, exibe: exibe}
			}
			return $http(request);
		}

	
		let _postContato2 = function (contato) {
			const request = {
			  url: "/admin/contato2",
			  method: "POST",
			  data: contato,
			};
			return $http(request);
		  };

		return {
			//postLoginAdmin: _postLoginAdmin,
			postEdit: _postEdit,
			getTodosProjetos: _getTodosProjetos,
			getEdits: _getEdits,
			getOpcoes: _getOpcoes,
			postOpcoes: _postOpcoes,
			getTodosSaberes: _getTodosSaberes,
			getTodosAvaliadores: _getTodosAvaliadores,
			putSetAprovados: _putSetAprovados,
			putSetAvaliadores: _putSetAvaliadores,
			putUnsetAprovados: _putUnsetAprovados,
			postConfirmacao: _postConfirmacao,
			// getEscolasSaberes: _getEscolasSaberes,
			// saveSaberesDocentes: _saveSaberesDocentes,
			saveAvaliador: _saveAvaliador,
			putPresencaProjetos: _putPresencaProjetos,
			putPremiadoProjetos: _putPremiadoProjetos,
			postEvento: _postEvento,
			getEventos: _getEventos,
			getAvaliadores: _getAvaliadores,
			putRemoveEvento: _putRemoveEvento,
			postParticipante: _postParticipante,
			getParticipantes: _getParticipantes,
			putRemoveParticipante: _putRemoveParticipante,
			putRemoveAvaliador: _putRemoveAvaliador,
			putRemoveProjeto: _putRemoveProjeto,
			putAtualizaParticipante: _putAtualizaParticipante,
			getCPFparticipantes: _getCPFparticipantes,
			getCPFsaberes: _getCPFsaberes,
			getCategorias: _getCategorias,
			getEstados: _getEstados,
			putProjeto: _putProjeto,
			putIntegrante: _putIntegrante,
			removeIntegrante: _removeIntegrante,
			exportaProjetos: _postExportarprojetos,
			postCertificado: _postCertificado,
			getCertificado: _getCertificado,
			postDocumento: _postDocumento,
			getDocumentos: _getDocumentos,
			removeDocumento: _putDocumento,
			postContato2: _postContato2,
			putUpdateExibir: _putUpdateExibir
		};
	});
})();
