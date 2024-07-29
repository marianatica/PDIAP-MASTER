'use strict';

const documentoSchema = require('../models/documento-schema');

const express = require('express')
, router = express.Router()
, passport = require('passport')
, LocalStrategy = require('passport-local').Strategy
, Admin = require('../controllers/admin-controller')
, Evento = require('../controllers/evento-controller')
, Saberes = require('../controllers/saberes-controller')
, session = require('express-session')
, adminSchema = require('../models/admin-schema')
, projetoSchema = require('../models/projeto-schema')
, eventoSchema = require('../models/evento-schema')
, participanteSchema = require('../models/participante-schema')
, CadastroMostraSchema = require('../models/cMostra-schema')
, CadastroDocumentoSchema = require('../models/documento-schema')
, crypto = require('crypto')
, bcrypt = require('bcryptjs')
, nodemailer = require('nodemailer')
, smtpTransport = require('nodemailer-smtp-transport')
, path = require('path')
, EmailTemplate = require('email-templates').EmailTemplate
, wellknown = require('nodemailer-wellknown')
, avaliadorSchema = require('../models/avaliador-schema')
, saberesSchema = require('../models/saberes-schema')
, cadastroMostraSchema = require('../models/cMostra-schema')
, cadastroMostra = require('../controllers/cMostra-controller')
, CadastroDocumento = require('../controllers/documento-controller')
, pdf = require('pdfkit')
, fs = require('fs')
, async = require('async')
, { exec } = require("child_process")
, readline = require('readline');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.sendStatus(403);
  }
}

function splita(arg){
  if (arg !== undefined) {
    let data = arg.replace(/([-.() ])/g,'');
    return data;
  }
}

function miPermiso(role,role2) {
  return function(req, res, next) {
    if(req.user.permissao === role || req.user.permissao === role2)
      next();
    else res.sendStatus(403);
  }
}

// router.all('/*', ensureAuthenticated, miPermiso("2"));
router.all('/*', ensureAuthenticated);

router.get('/loggedin', ensureAuthenticated, (req, res) => {
  res.send('success');
});

router.post('/criarEvento', miPermiso("3"), (req, res) => {
  try {
    let myArray = req.body.responsavel;

    let newEvento = new eventoSchema({
      tipo: req.body.tipo
      ,titulo: req.body.titulo
      ,cargaHoraria: req.body.cargaHoraria
      ,data: req.body.data
      ,createdAt: req.body.createdAt
    });

    myArray.forEach(function (value, i) {
      let newResponsavel = ({
        nome: value.nome
        ,cpf: splita(value.cpf)
      });
      newEvento.responsavel.push(newResponsavel);
    });

    newEvento.save((err, data) => {
      if(err) throw new Error('Erro ao criar um evento'); // Alteração Lucas Ferreira
      console.log(data);
    });
    res.send('success');
  } catch (error){
    console.log("ProjetoSchema.findOne: " + err); //Mostra onde o erro acontece e em seguida o erro em si 
  }
});

router.get('/mostraEvento', miPermiso("3","2"), (req, res) => {
  try {
    eventoSchema.find((err, usr) => {
      if (err) throw new Error('Erro ao mostrar evento'); //alteração Lucas A. Ferreira
      res.send(usr);
    });
  } catch (error){
    console.log('findOne error--> ${error}');
  }
});

router.put('/removeEvento', miPermiso("3"), (req, res) => {
  try {
    let id = req.body.id;
    eventoSchema.remove({"_id": id}, (err) => {
      if (err) throw new Error('Erro ao remover evento'); //alteração Lucas A. Ferreira
    });
    res.send('success');
  } catch (error){
    console.log('findOne error--> ${error}');
  }
});

router.get('/mostraAvaliadores', miPermiso("3","2"), (req, res) => {
  try {
    avaliadorSchema.find((err, usr) => {
      if (err) throw new Error('Erro ao mostrar avaliadores'); //alteração Lucas A. Ferreira
      res.send(usr);
    });
  } catch (error){
    console.log('findOne error--> ${error}');
  }
});

router.put('/removeAvaliador', miPermiso("3"), (req, res) => {
  try {
    let id = req.body.id;
    avaliadorSchema.remove({"_id": id}, (err) => {
      if (true) throw new Error('Erro ao remover avaliador'); //alteração Lucas A. Ferreira
    });
    res.send('success');
  } catch (error) {
    console.log("ProjetoSchema.findOne: " + err);
  }
});

// router.put('/insereParticipanteOficina', miPermiso("3"), (req, res) => {
//   let myArray = req.body
//   ,   nomeOficina = req.body.nomeOficina;

//   myArray.forEach(function (value, i) {
//     let newParticipante = ({
//       nome: value.nome
//       ,cpf: splita(value.cpf)
//       ,email: value.email
//     });

//     oficinaSchema.findOne({nome: nomeOficina}, (err, usr) => {
//       if (err) throw err;
//       usr.participantes.push(newParticipante);
//       usr.save((err, usr) => {
//         if (err) throw err;
//       });
//     });
//   });
//   res.send('sucess');
// });

router.post('/criarParticipante', miPermiso("3"), (req, res) => { //alteração Lucas A. Ferreira
  try {
    let newParticipante = new participanteSchema({
      nome: req.body.nome
      ,cpf: splita(req.body.cpf)
      ,createdAt: Date.now()
    });

    if (req.body.eventos !== undefined) {
      let myArray = req.body.eventos;
      myArray.forEach(function (value, i) {
        let newEvento = ({
          tipo: value.tipo
          ,titulo: value.titulo
          ,cargaHoraria: value.cargaHoraria
        });
        newParticipante.eventos.push(newEvento);
      });
    }

    newParticipante.save((err, data) => {
      if(true) throw new Error('Erro ao criar participante');
      console.log(data);
    });
    res.send('success');
  } catch (error) {
    console.log('findOne error--> ${error}'); //Mostra onde o erro acontece e em seguida o erro em si
  }
});

router.get('/mostraParticipante', miPermiso("3","2"), (req, res) => { 
  try {
    participanteSchema.find((err, usr) => {
      if (err) throw new Error('Erro ao mostrar participante'); //alteração Lucas A. Ferreira
      res.send(usr);
    });
  } catch (error) {
    console.log('findOne error--> ${error}');
  }
});

router.put('/removeParticipante', (req, res) => {
  try {
    let id = req.body.id;
    participanteSchema.remove({"_id": id}, (err) => {
      if (err) throw new Error('Erro ao remover participante'); // Alteração Lucas Ferreira
    });
    res.send('success');
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.post('/exportarprojetos', (req, res) => {

    var dadosbrutos = "";
    
    exec("mongo ../PDIAP/exportar.js > ../dados.json");
      
    setTimeout(function() {      
      var manipuladados = readline.createInterface({
        input: fs.createReadStream("../dados.json"),
        crflDelay: Infinity   
      });    
      var comecaput = false;    
      manipuladados.on("line", function(line){   
        if(line == "["){   
          comecaput = true;
        }    
        if(comecaput == true){    
          dadosbrutos += line.toString();
          console.log(line);   
        }    
      });    
    }, 5000);    
    setTimeout(function(){    
      fs.writeFileSync("../data.json", dadosbrutos);    

    	exec("curl -d \"@../data.json\" -X POST -H \"Content-Type: application/json\"  http://"+req.body.usuario+":"+req.body.senha+"@localhost:8080/Webservice/integrador.php");    
    }, 10000);  
    setTimeout(function(){
      let codigo = { cod: 1};
      return res.send(codigo);
    }, 15000);  
});

//Mateus Roberto Algayer - 14/10/2021
//rota para cadastro de certificado
router.post('/postCertificado', (req, res) => {
  try {
    //quando cadastrar um novo certificado ele primeiro exclui o certificado do ano selecionado para depois criar um novo com o mesmo ano
    //isso existe pra caso seja necessário substituir o certificado de algum ano (Obs: mongo não tem problema com excluir o que não existe)
    CadastroMostraSchema.remove({"ano_certificado":req.body.data.ano_certificado}, (err) => {
      if (err) throw new Error('Erro ao cadastrar certificado'); //alteração Lucas A. Ferreira
      //Preenche o schema com as informações enviadas pelo body do request da adminAPIService para /postcertificado
        let novoCadastro = new cadastroMostraSchema({
          imagem: req.body.data.dataUrl,
          imagemFundo: req.body.data.dataUrlFundo,
          textoAvaliador: req.body.data.textoAvaliador,
          textoOrientador: req.body.data.textoOrientador,
          textoApresentacao: req.body.data.textoApresentacao,
          textoPremiado: req.body.data.textoPremiado,
          textoMencao: req.body.data.textoMencao,
          textoSaberes: req.body.data.textoSaberes,
          textoPOficinas: req.body.data.textoPOficinas,
          textoROficinas: req.body.data.textoROficinas,
          textoAcademica: req.body.data.textoAcademica,
          textoDocentes: req.body.data.textoDocentes,
          ano_certificado: req.body.data.ano_certificado
        });
        //envia o Schema para cMostra-controller para salvar os dados no banco

        //P.S.: o tratamento de erros da função abaixo está meio ruim, mas eu não sei como tratar decentemente :/
        cadastroMostra.createMostra(novoCadastro, (callback) => {});
        res.send('success');
    });
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

//Mateus Roberto Algayer - 14/10/2021
//rota para recuperar informações do certificado para AdminAPI
router.get('/getCertificados', (req, res) => {
  try {
    CadastroMostraSchema.find(function(err ,data){
      if(err) throw new Error('Erro ao carregar informações do certificado'); //alteração Lucas A. Ferreira
      res.status(200).send(data);
    });
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

//Leandro Henrique Kopp Ferreira - 14/10/2021
//rota para cadastrar os documentos
router.post('/postDocumento', (req, res) => {
  console.log(req.body.pacote.exibe);
  let novoCadastro = new CadastroDocumentoSchema({
    pdf: req.body.pacote.pdf,
    titulo: req.body.pacote.titulo,
    ano: req.body.pacote.ano,
    exibe: req.body.pacote.exibe,
  });
  CadastroDocumento.createDocumento(novoCadastro, (callback) => {});
  res.send('success');
});

//Leandro Henrique Kopp Ferreira - 14/10/2021
//rota para requisição dos documentos
router.get('/getDocumentos', (req, res) =>{
  try {
    CadastroDocumentoSchema.find(function(err ,data){
      if(err) throw new Error('Erro ao mostrar certificados'); //alteração Lucas A. Ferreira
      res.status(200).send(data);
    });
  } catch (error) {
    console.log('findOne error--> ${error}');
  }
});

//Leandro Henrique Kopp Ferreira - 04/11/2021
router.put('/putDocumento', miPermiso("3"), (req, res) => {
  try {
    let id = req.body.id;
    CadastroDocumentoSchema.remove({"_id": id}, (err) => {
      if (err) throw new Error('Erro ao mostrar certificados'); //alteração Lucas A. Ferreira
    });
    res.send('success');
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

//Mateus Roberto Algayer - 24/11/2021
router.put('/putUpdateExibir', miPermiso("3"), (req, res) => {
  try {
  let id = req.body.id;
  let exibe = req.body.exibe;

  CadastroDocumentoSchema.update({'_id': id}, 
                                 {$set:{'exibe': exibe}},
                                 {multi:false},
                                 (err) =>{
                                  if (err) throw new Error('Erro ao editar documento'); //alteração Lucas A. Ferreira
                                 });

  res.send('sucess');
                                } catch (error) {
                                  console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
                                }
});


// rota para enviar e-mail
router.post('/contato2', (req, res) => {
  let email = req.body.email
  ,   nome = req.body.nome
  ,   assunto = req.body.assunto
  ,   mensagem = req.body.mensagem;

  const transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: "contatomovaci@gmail.com",
      pass: "lenhqdvbmnqvbqdr" // Alteração senha superApp - Lucas Ferreira
    }
  }));


  var mailOptions = {
    from: 'contatomovaci@gmail.com',
    to: email,
    subject: assunto,
    text: '',
    html: '<b> Saudações:</b><br><b>Para: </b>'+email+'<br><b>Assunto: </b>'+assunto+'<br><b>Mensagem: </b>'+mensagem
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(req.body);
    } else {
      res.send('success');
    }
    console.log('Message sent: ' + info.response);
  });
});
      
router.put('/atualizaParticipante', miPermiso("3"), (req, res) => {
  try {
    var id = req.body.id;
    let nome = req.body.nome;
    let cpf = splita(req.body.cpf);

    participanteSchema.findOneAndUpdate({"_id": id},{"$set": {"nome": nome, "cpf": cpf}, "$unset": {"eventos": ""}}, {new:true}, (err, doc) => {
        if (err) throw new Error('Erro ao atualizar participante'); //alteração Lucas A. Ferreira
      });

    if (req.body.eventos !== undefined) {
      let myArray = req.body.eventos;
      myArray.forEach(function (value, i) {
        var newEvento = ({
          tipo: value.tipo
          ,titulo: value.titulo
          ,cargaHoraria: value.cargaHoraria
        });

        participanteSchema.findOneAndUpdate({"_id": id},{"$push": {"eventos": newEvento}}, {new:true}, (err, doc) => {
          if (err) throw new Error('Erro ao atualizar participante'); //alteração Lucas A. Ferreira
        });
      });
    }
    res.send('success');
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.post('/registroSaberes', miPermiso("3","2"), (req, res) => {
  let newSaberes = new SaberesSchema({
    tipo: req.body.tipo,
    nome: req.body.nome,
    email: req.body.email,
    cpf: splita(req.body.cpf),
    telefone: splita(req.body.telefone),
    escola: req.body.escola,
    resumo: req.body.resumo,
    createdAt: Date.now()
  });
  Saberes.createSaberes(newSaberes, (callback) => {});
  res.send('success');
});

router.get('/mostraCPFparticipantes', miPermiso("3"), (req, res) => {
  participanteSchema.find({},'cpf -_id', (error, cpfs) => {
    if(error) {
      return res.status(400).send({msg:"error occurred - "+error});
    } else {
    return res.status(200).send(cpfs);
    }
  });
});

// router.get('/mostraCPFsaberes', miPermiso("3"), (req, res) => {
//   saberesSchema.find('cpf','cpf -_id', (error, cpfs) => {
//     if(error) {
//       return res.status(400).send({msg:"error occurred"});
//     } else
//     return res.status(200).send(cpfs);
//   });
// });

// router.get('/mostraEventoSaberes', miPermiso("3","2"), (req, res) => {
//   eventoSchema.find({"tipo":"Saberes Docentes"},(err, usr) => {
//     if (err) throw err;
//     res.send(usr);
//   });
// });

// router.put('/setPresencaSaberes', miPermiso("3","2"), (req, res) => {
//   let id = req.body.id;
//   let cargaHoraria = req.body.cargaHoraria;
//   for (i in myArray) {
//     saberesSchema.findOneAndUpdate({"_id": id},
//     {"$set": {"cargaHoraria": cargaHoraria}}, {new:true},
//     (err, doc) => {
//       if (err) throw err;
//     }
//   );
// }
// });

// router.post('/registro', (req, res) => {
//   let newAdmin = new adminSchema({
//       username: req.body.username,
//       password: req.body.password,
//       permissao: req.body.permissao
//     });
//     Admin.createAdmin(newAdmin);
//     //res.redirect('/admin/login');
//   res.send('OK');
// });

router.put('/setPresencaProjetos', miPermiso("3"), (req, res) => {
  try {
    let myArray0 = req.body.integrantesPresentes;
    let myArray1 = req.body.integrantesAusentes;

    for (var i = 0; i < myArray0.length; i++) {
      let id_integ = myArray0[i];
      projetoSchema.findOneAndUpdate({"integrantes._id": id_integ},
      {"$set": {"integrantes.$.presenca": true}}, {new:true},
      (err, doc) => {
        if (err) throw new Error('Erro ao mostrar presença do projeto'); // Alteração Lucas Ferreira
      }
    );
    }
    for (var i = 0; i < myArray1.length; i++) {
      let id_integ = myArray1[i];
      projetoSchema.findOneAndUpdate({"integrantes._id": id_integ},
      {"$unset": {"integrantes.$.presenca": true}}, {new:true},
      (err, doc) => {
        if (err) throw new Error('Erro ao mostrar presença do projeto'); // Alteração Lucas Ferreira
      }
    );
    }
    console.log("log antes de sucesso presença");
    res.send('success');
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.put('/setPremiadoProjetos', miPermiso("3"), (req, res) => {
  try {
    let premiacao = req.body;
    if(premiacao.premiacao === 'Premiado'){
    if(premiacao.colocacao === undefined){premiacao.colocacao = null;}
    projetoSchema.findOneAndUpdate({'_id':premiacao._id},{$set:{"premiacao":premiacao.premiacao,"colocacao":premiacao.colocacao,"mostratec":premiacao.mostratec}},{new:true}, (err, doc) =>{
      if(err) throw new Error('Erro ao atribuir premiação'); // Alteração Lucas Ferreira	
    });
    } else if(premiacao.premiacao === 'Mencao_honrosa'){
    projetoSchema.findOneAndUpdate({'_id':premiacao._id},{$set:{"premiacao":premiacao.premiacao,"colocacao":null,"mostratec":premiacao.mostratec}},{new:true}, (err, doc) =>{
      if(err) throw new Error('Erro ao atribuir premiação'); // Alteração Lucas Ferreira
    });		
    } else if(premiacao.premiacao === '') {
    projetoSchema.findOneAndUpdate({'_id':premiacao._id},{$unset:{"premiacao":"","colocacao":"","mostratec":"", "token":""}}, (err, doc) =>{
      if(err) throw new Error('Erro ao atribuir premiação'); // Alteração Lucas Ferreira
    });
    }
    res.send('success');
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.post('/edit', miPermiso("3"), (req, res) => {
	try {
    let obj = {
      ano: req.body[0].ano,
      mes: req.body[0].mes,
      dias: req.body[0].dias,
      edicao: req.body[0].edicao,
      text: req.body[0].text,
      cadastro_projetos: req.body[0].cadastro_projetos,
      cadastro_avaliadores: req.body[0].cadastro_avaliadores,
      saberes_docentes: req.body[0].saberes_docentes
    };	
    adminSchema.findOneAndUpdate({'username':'admin2'},{$set:{'dias':obj.dias,'mes':obj.mes,'ano':obj.ano,'edicao':obj.edicao,'text':obj.text, 'cadastro_projetos':obj.cadastro_projetos,'cadastro_avaliadores':obj.cadastro_avaliadores,'saberes_docentes':obj.saberes_docentes}}, [{new:true}], (err, usr) =>{
      if (err) throw new Error('Erro ao editar'); // Alteração Lucas Ferreira				
      else {
        res.send('success');	
      }
    })
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.get('/editar', (req, res) => {
	return new Promise(function (fulfill, reject) {
		adminSchema.find({'username':'admin2'},'dias mes ano edicao cadastro_avaliadores cadastro_projetos saberes_docentes text -_id',(err,usr)=>{
			if(err) return reject(err);
			if(usr == 0) return reject({err});
			res.send(usr);
		})						
	})
});

router.post('/setOpcoes', miPermiso("3"), (req, res) => {
	try {
    let obj = req.body;
    console.log("OBJ:"+JSON.stringify(obj));	
    adminSchema.findOneAndUpdate({'username':'admin2'},{$set:{'opcoes':obj}}, {new:true}, (err, usr) =>{
      if (err) throw new Error('Erro ao editar'); // Alteração Lucas Ferreira				
      else res.send('success');		
    })
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.get('/getOpcoes', (req, res) => {
	return new Promise(function (fulfill, reject) {
		adminSchema.find({'username':'admin2'},'opcoes -_id',(err,usr)=>{
			if(err) return reject(err);
			if(usr == 0) return reject({err});
			res.send(usr[0].opcoes);
		})						
	})
});

router.get('/projetos', miPermiso("2","3"), (req, res) => {
  try {
    //console.log("ANO:"+JSON.stringify(req.body));
    projetoSchema.find((err, usr) => {
      
      if (err) throw new Error('Erro em projetos'); // Alteração Lucas Ferreira
      res.send(usr);
    });
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.post('/avaliador', miPermiso("2","3"), (req, res) => {
  try {
    avaliadorSchema.find((err, usr) => {
      if (err) throw new Error('Erro em avaliador'); // Alteração Lucas Ferreira
      res.send(usr);
    });
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.post('/saberes', miPermiso("2","3"), (req, res) => {
  try {
    saberesSchema.find((err, usr) => {
      if (err) throw new Error('Erro em saberes docentes'); // Alteração Lucas Ferreira
      res.send(usr);
    });
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.put('/upgreice', ensureAuthenticated, miPermiso("3"), (req, res) => {
  try {
  let myArray0 = req.body.projetosAprovados;
  let myArray1 = req.body.projetosReprovados;
  
  for (var i = 0; i < myArray0.length; i++) {
    let id_doc = myArray0[i];

    projetoSchema.findOneAndUpdate({"_id": id_doc},
    {"$set": {"aprovado": true}}, {new:true},
    (err, doc) => {
      if (err){
        throw new Error('Erro'); // Alteração Lucas Ferreira
        }
    }
  );
  }

  for (var i = 0; i < myArray1.length; i++) {
    let id_doc = myArray1[i];
    projetoSchema.findOneAndUpdate({"_id": id_doc},
    {"$unset": {"aprovado": true}}, {new:true},
    (err, doc) => {
      if (err) throw new Error('Erro'); // Alteração Lucas Ferreira
    });
  }
res.send('success');
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.put('/upgreiceAvaliadores', ensureAuthenticated, miPermiso("3"), (req, res) => {
  try {
      let myArray0 = req.body.avaliadoresMarcados;
      let myArray1 = req.body.avaliadoresNMarcados;
      
      for (var i = 0; i < myArray0.length; i++) {
        let id_doc = myArray0[i];
        avaliadorSchema.findOneAndUpdate({"_id": id_doc},
        {"$set": {"avaliacao": true}}, {new:true},
        (err, doc) => {
          if (err){
            throw new Error('Erro na avaliação'); // Alteração Lucas Ferreira
          }
        }
      );
      }

      for (var i = 0; i < myArray1.length; i++) {
        let id_doc = myArray1[i];
        avaliadorSchema.findOneAndUpdate({"_id": id_doc},
        {"$unset": {"avaliacao": true}}, {new:true},
        (err, doc) => {
          if (err) throw new Error('Erro na avaliação'); // Alteração Lucas Ferreira
        });
      }
    res.send('success');
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

/*router.put('/upgreice2', ensureAuthenticated, miPermiso("3"), (req, res) => {

  let myArray1 = req.body.projetosReprovados;
  console.log("TESTE:"+JSON.stringify(myArray1));

  for (var i = 0; i < myArray1.length; i++) {
    let id_doc = myArray1[i];
    projetoSchema.findOneAndUpdate({"_id": id_doc},
    {"$unset": {"aprovado": true}}, {new:true},
    (err, doc) => {
      if (err) throw err;
    });
  }
  res.send('success');
});*/

router.put('/update', ensureAuthenticated, miPermiso("3"), (req, res) => {
  try {
    if (req.body.cep !== undefined){
      req.body.cep = splita(req.body.cep);
    }
    let newProject = req.body;
    let id = req.body._id;
    delete newProject._id;

    console.log(newProject);

    projetoSchema.update({'_id':id}, {$set:newProject, updatedAt: Date.now()}, {upsert:true,new: true}, (err,docs) => {
      if (err) throw new Error('Erro ao editar'); // Alteração Lucas Ferreira
      res.status(200).json(docs);
    });
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.put('/upgreiceEditProjeto', ensureAuthenticated, miPermiso("3"), (req, res) => {
  try {
    let myArray = req.body
    ,   id = req.body[0].ID;

    myArray.forEach(function (value, i) {
      if (value._id !== undefined) {
    let id_subdoc = value._id,
    newIntegrante = ({
      _id: id_subdoc,
      tipo: value.tipo,
      nome: value.nome,
      email: value.email,
      cpf: splita(value.cpf),
      telefone: splita(value.telefone),
      tamCamiseta: value.tamCamiseta
    });
        projetoSchema.findOneAndUpdate({"_id": id,"integrantes._id": id_subdoc},
        {"$set": {"integrantes.$": newIntegrante, updatedAt: Date.now()}}, {new:true},
        (err, doc) => {
          if (err) throw new Error('Erro ao editar projeto'); // Alteração Lucas Ferreira
        });	
      } else if (value._id === undefined) {
        let newIntegrante = ({
          tipo: value.tipo,
          nome: value.nome,
          email: value.email,
          cpf: splita(value.cpf),
          telefone: splita(value.telefone),
          tamCamiseta: value.tamCamiseta
        });

        projetoSchema.findOne({"_id": id}, (err, usr) => {
          if (err) throw new Error('Erro ao editar projeto'); // Alteração Lucas Ferreira
          usr.integrantes.push(newIntegrante);
          usr.save((err, usr) => {
      if (err) throw new Error('Erro ao editar projeto'); // Alteração Lucas Ferreira
          });
        });

        projetoSchema.update({_id: id}, {$set: {updatedAt: Date.now()}}, {upsert:true,new: true}, (err, docs) => {
          if (err) throw new Error('Erro ao editar projeto'); // Alteração Lucas Ferreira
        });
      }
    });
    res.status(200).json(myArray);
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.put('/removerIntegrante', ensureAuthenticated, miPermiso("3"), (req, res) => {
  try {
    let id = req.body.integrantes_id;
    let ID = req.body.ID;

    projetoSchema.findOne({"integrantes._id": id}, (err, usr) => {
      if (err) throw new Error('Erro ao remover integrante'); // Alteração Lucas Ferreira
      usr.integrantes.id(id).remove()
      usr.save((err, usr) => {
        if (err) throw new Error('Erro ao remover integrante'); // Alteração Lucas Ferreira
      });
    });

    projetoSchema.update({_id:ID}, {$set: {updatedAt: Date.now()}}, {upsert:true,new: true}, (err,docs) => {
      if (err) throw new Error('Erro ao remover integrante'); // Alteração Lucas Ferreira
      res.status(200).json(docs);
    });
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.put('/removeProjeto', miPermiso("3"), (req, res) => {
  try {
    let id = req.body.id;
    projetoSchema.remove({"_id": id}, (err) => {
      if (err) throw new Error('Erro ao remover projeto'); // Alteração Lucas Ferreira
    });
    res.send('success');
  } catch (error) {
    console.log('findOne error--> ${error}'); // Alteração Lucas Ferreira
  }
});

router.post('/aprovadosemail', miPermiso("3"), (req, res) => {
  var templatesDir = path.resolve(__dirname, '..', 'templates');
  var emailTemplates = require('email-templates');
  //var template = new EmailTemplate(path.join(templatesDir, 'redefinicao'));
  // Prepare nodemailer transport object

  emailTemplates(templatesDir, function(err, template) {

    if (err) {
      console.log(err);
    } else {

      var users = [];

      projetoSchema.find({"aprovado":true, "categoria":"Fundamental II (6º ao 9º anos)"}, function (err, docs) {
        if (err) throw err;
        //console.log(docs);
        docs.forEach(function(usr) {
          let url = "http://www.movaci.com.br/projetos/confirma/"+usr._id+"/2456";
          let url2 = "http://www.movaci.com.br/projetos/confirma/"+usr._id+"/9877";
          users.push({'email': usr.email, 'projeto': usr.nomeProjeto, 'url': url, 'url2': url2});
        });
        for (var i = 0; i < users.length; i++) {
          console.log(users[i]);
        }

        const transporter = nodemailer.createTransport(smtpTransport({
          host: 'smtp.zoho.com',
          port: 587,
          auth: {
            user: "no-reply4@movaci.com.br",
            pass: "lenhqdvbmnqvbqdr" // Alteração senha superApp - Lucas Ferreira
          },
          getSocket: true
        }));

        var Render = function(locals) {
          this.locals = locals;
          this.send = function(err, html, text) {
            if (err) {
              console.log(err);
            } else {

              transporter.sendMail({
                from: 'no-reply4@movaci.com.br',
                to: locals.email,
                subject: 'MOVACI - Projeto aprovado!',
                html: html,
                text: text

              }, function(err, responseStatus) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(responseStatus.message);
                }
              });
            }
          };
          this.batch = function(batch) {
            batch(this.locals, templatesDir, this.send);
          };
        };

        // Load the template and send the emails
        template('rateada', true, function(err, batch) {
          for(var user in users) {
            var render = new Render(users[user]);
            render.batch(batch);
          };
        });
        res.send('ok');
      });
    };
  });
});

router.post('/reprovadosemail', miPermiso("3"), (req, res) => {
  var templatesDir = path.resolve(__dirname, '..', 'templates');
  var emailTemplates = require('email-templates');
  //var template = new EmailTemplate(path.join(templatesDir, 'redefinicao'));
  // Prepare nodemailer transport object

  emailTemplates(templatesDir, function(err, template) {

    if (err) {
      console.log(err);
    } else {

      var users = [];

      projetoSchema.find({"aprovado":undefined, "categoria":"Ensino Médio, Técnico e Superior", "eixo":"Ciências Humanas e suas tecnologias"}, function (err, docs) {
        if (err) throw err;
        //console.log(docs);
        docs.forEach(function(usr) {
          users.push({'email':usr.email ,'projeto': usr.nomeProjeto});
        });
        for (var i = 0; i < users.length; i++) {
          console.log(users[i]);
        }

        const transporter = nodemailer.createTransport(smtpTransport({
          host: 'smtp.zoho.com',
          port: 587,
          auth: {
            user: "contato@movaci.com.br",
            pass: "lenhqdvbmnqvbqdr" // Alteração senha superApp - Lucas Ferreira
          },
          getSocket: true
        }));

        var Render = function(locals) {
          this.locals = locals;
          this.send = function(err, html, text) {
            if (err) {
              console.log(err);
            } else {

              transporter.sendMail({
                from: 'contato@movaci.com.br',
                to: locals.email,
                subject: 'MOVACI - Seleção dos projetos',
                html: html,
                text: text

              }, function(err, responseStatus) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(responseStatus.message);
                }
              });
            }
          };
          this.batch = function(batch) {
            batch(this.locals, templatesDir, this.send);
          };
        };

        // Load the template and send the emails
        template('confirmacao_nao', true, function(err, batch) {
          for(var user in users) {
            var render = new Render(users[user]);
            render.batch(batch);
          };
        });
        res.send('ok');
      });
    };
  });
});

/*router.post('/aprovados', (req, res) => {
console.log(req.body.username);
const transporter = nodemailer.createTransport(smtpTransport({
host: 'smtp.zoho.com',
port: 587,
auth: {
user: "contato@movaci.com.br",
pass: "*mvc2016"
}
}));

let maillist = [];

projetoSchema.find({"aprovado": true}).exec(function(err, users) {
if (err) throw err;
users.forEach(function(usr) {
maillist.push(usr.email);
console.log(maillist);
});
});

maillist.toString();

/*var mailOptions = {
from: 'contato@movaci.com.br',
to: maillist,
subject: 'Teste aprovados',
text: '',
html: '<b> Teste:</b><br><b>De: </b>'
};
transporter.sendMail(mailOptions, function(error, info){
if(error){
return console.log(error);
} else {
res.send('success');
}
console.log('Message sent: ' + info.response);
});*/


/*router.get('/pdf', (req, res) =>{

var pdf = require('pdfkit');
var fs = require('fs');

projetoSchema.find().sort({"categoria":1, "eixo":1, "numInscricao":1}).exec(function(err, users) {
if (err) throw err;
//res.send(usr);
var myDoc = new pdf;
myDoc.pipe(fs.createWriteStream('output.pdf'));
users.forEach(function(usr){

myDoc.addPage()
.image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
.fontSize(12)
.text("Num. inscrição: "+usr.numInscricao, 410, 70)
.fontSize(18)
.text("Projeto",70,110)
.fontSize(12)
.text("Nome do projeto: "+usr.nomeProjeto,70,140)
.text("Categoria: "+usr.categoria,70,170)
.text("Eixo: "+usr.eixo,70,190)
.fontSize(18)
.text("Escola",70,220)
.fontSize(12)
.text("Nome: "+usr.nomeEscola,70,250)
.text("Cidade: "+usr.cidade+"     Estado: "+usr.estado,70,270)
.fontSize(18)
.text("Resumo",70,300)
.fontSize(12)
.text("Palavras-chave: "+usr.palavraChave,70,320)
.text(usr.resumo,70,350, {align: 'justify'})

console.log(usr.numInscricao);

});
res.sendStatus(200);
myDoc.end();
});
});*/

router.post('/emailUpload', miPermiso("3"), (req, res) => {
  var templatesDir = path.resolve(__dirname, '..', 'templates');
  var emailTemplates = require('email-templates');
  //var template = new EmailTemplate(path.join(templatesDir, 'redefinicao'));
  // Prepare nodemailer transport object

  emailTemplates(templatesDir, function(err, template) {

    if (err) {
      console.log(err);
    } else {

      var users = [];

      projetoSchema.find({"aprovado":true, "categoria":"Ensino Médio, Técnico e Superior", "eixo":"Ciências Humanas e suas tecnologias"}, function (err, docs) {
        if (err) throw err;
        //console.log(docs);
        docs.forEach(function(usr) {
          users.push({'email':usr.email});
        });

        const transporter = nodemailer.createTransport(smtpTransport({
          host: 'smtp.zoho.com',
          port: 587,
          auth: {
            user: "no-reply5@movaci.com.br",
            pass: "lenhqdvbmnqvbqdr" // Alteração senha superApp - Lucas Ferreira
          },
          getSocket: true
        }));

        var Render = function(locals) {
          this.locals = locals;
          this.send = function(err, html, text) {
            if (err) {
              console.log(err);
            } else {

              transporter.sendMail({
                from: 'no-reply5@movaci.com.br',
                to: locals.email,
                subject: 'MOVACI 2016 - IMPORTANTE! Relatório',
                html: html,
                text: text

              }, function(err, responseStatus) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(responseStatus.message);
                }
              });
            }
          };
          this.batch = function(batch) {
            batch(this.locals, templatesDir, this.send);
          };
        };

        // Load the template and send the emails
        template('upload', true, function(err, batch) {
          for(var user in users) {
            var render = new Render(users[user]);
            render.batch(batch);
          };
        });
        res.send('ok');
      });
    };
  });
});

// router.get('/testando', (req, res) => {
//   projetoSchema.find({"participa":true,"categoria":"Ensino Médio, Técnico e Superior"}).sort({"eixo":1, "nomeProjeto":1}).exec((err, usr) => {
//     if (err) throw err;
//     let echu = "";
//     let cont = 0;
//     for (let user in usr) {
//       // cont ++;
//       myDoc
//         .text(cont+". "+usr[user].nomeProjeto)
//         .moveDown(0.1)
//         .text("  Participa: "+usr[user].participa)
//         .moveDown(0.1)
//         .text("  Escola: "+usr[user].nomeEscola)
//         .moveDown(0.1)
//         .text("  Integrantes: ")
//         .moveDown(0.1)

//       // let af = usr[user].integrantes.length;
//       // console.log(af);

//       // console.log(usr[user].integrantes[0]);


//       usr[user].integrantes.forEach (function(integ) {
//         // console.log(integ.nome);
//         if (integ.tipo === "Orientador") {
//             cont ++;
//             console.log(cont);
//         }
//         if (integ.tipo !== undefined){
//           myDoc.text("     "+integ.nome+ " | Tam. "+integ.tamCamiseta);
//         }
//       });
// });

router.get('/camisetas', miPermiso("3"), (req, res) => {
  var myDoc = new pdf;
  let cont = 0;
  myDoc.pipe(fs.createWriteStream('camisetasMedio.pdf'));
  myDoc
  .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
  .fontSize(16)
  .moveDown(4)
  .text("Relação das camisetas - Ensino Médio, Técnico e Superior", {align: 'center'})
  .moveDown(2)
  .fontSize(12)

  // saberesSchema.find({}).sort({"nome":1}).exec((err, usr) => {Fundamental II (6º ao 9º anos)
  projetoSchema.find({"participa":true,"categoria":"Ensino Médio, Técnico e Superior"}).sort({"eixo":1, "nomeProjeto":1}).exec((err, usr) => {
    if (err) throw err;
    let echu = "";
    let cont = 0;
    for (let user in usr) {
      // cont ++;
      // console.log(usr[user].nomeProjeto);
      if (usr[user].eixo !== echu) {
        echu = usr[user].eixo;
        myDoc.fontSize(14)
        .text(usr[user].eixo, {align: 'center'})
        .moveDown(1)
      }

      myDoc
      .text(cont+". "+usr[user].nomeProjeto)
      .moveDown(0.1)
      .text("  Participa: "+usr[user].participa)
      .moveDown(0.1)
      .text("  Escola: "+usr[user].nomeEscola)
      .moveDown(0.1)
      .text("  Integrantes: ")
      .moveDown(0.1)

      // let af = usr[user].integrantes.length;
      // console.log(af);

      // console.log(usr[user].integrantes[0]);


      usr[user].integrantes.forEach (function(integ) {
        // console.log(integ.nome);
        if (integ.tipo === "Orientador") {
          cont ++;
          console.log(cont);
        }
        if (integ.tipo !== undefined){
          myDoc.text("     "+integ.nome+ " | Tam. "+integ.tamCamiseta);
        }
      });

      // if (usr[user].integrantes[0].tipo !== undefined){
      //   myDoc.text("     "+usr[user].integrantes[0].nome+ " | Tam. "+usr[user].integrantes[0].tamCamiseta);
      // }
      // if (usr[user].integrantes[1].tipo !== undefined){
      //   myDoc.text("     "+usr[user].integrantes[1].nome+ " | Tam. "+usr[user].integrantes[1].tamCamiseta);
      // }
      // if (usr[user].integrantes[2].tipo !== undefined){
      //   myDoc.text("     "+usr[user].integrantes[2].nome+ " | Tam. "+usr[user].integrantes[2].tamCamiseta);
      // }
      // if (usr[user].integrantes[3].tipo !== undefined){
      //   myDoc.text("     "+usr[user].integrantes[3].nome+ " | Tam. "+usr[user].integrantes[3].tamCamiseta);
      // }
      // if (usr[user].integrantes[4].tipo !== undefined){
      //   myDoc.text("     "+usr[user].integrantes[4].nome+ " | Tam. "+usr[user].integrantes[4].tamCamiseta);
      // }
      myDoc.moveDown(2)
    }
    myDoc.end();
  });
  res.sendStatus(200);
});

router.post('/pdf2', miPermiso("3"), (req, res) => {

  var myDoc = new pdf;

  myDoc.pipe(fs.createWriteStream('relacaoCamisetas.pdf'));

  myDoc
  .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
  .fontSize(20)
  .moveDown(2.5)
  .text("Relação camisetas", {align: 'center'})
  .fontSize(14)
  .moveDown(2.5)
  .text("FUNDAMENTAL I (1° ao 5° ano)", {align: 'center'})
  .moveDown(1)

  projetoSchema.find({"aprovado":true,"categoria":"Fundamental I (1º ao 5º anos)"}).sort({"eixo":1, "nomeProjeto":1}).exec((err, user) => {
    if (err) throw err;
    // let echu = "";

    for (i in user) {
      console.log(user[i].nomeProjeto);
    }

    // for (let usr in user) {


    //   if (user[usr].eixo !== echu) {
    //     echu = user[usr].eixo;
    //     myDoc.fontSize(14)
    //     .text("Eixo: "+user[usr].eixo, {align: 'center'})
    //   }

    //   myDoc.fontSize(12)
    //   .moveDown(1)
    //   .text("Projeto: "+user[usr].nomeProjeto)
    //   .moveDown(0.5)
    //   // .text("Orientador(es): ");

    //   if (user[usr].integrantes[0].tipo !== undefined){
    //     myDoc.text("     Nome: "+user[usr].integrantes[0].nome+ " | Tam. "+user[usr].integrantes[0].tamCamiseta);
    //   }

    //   if (user[usr].integrantes[1].tipo !== undefined){
    //     myDoc.moveDown(0.5)
    //     myDoc.text("     Nome: "+user[usr].integrantes[1].nome+ " | Tam. "+user[usr].integrantes[1].tamCamiseta);
    //   }

    //   if (user[usr].integrantes[2].tipo !== undefined){
    //     myDoc.moveDown(0.5)
    //     myDoc.text("     Nome: "+user[usr].integrantes[2].nome+ " | Tam. "+user[usr].integrantes[2].tamCamiseta);
    //   }

    //   if (user[usr].integrantes[3].tipo !== undefined){
    //     myDoc.moveDown(0.5)
    //     myDoc.text("     Nome: "+user[usr].integrantes[3].nome+ " | Tam. "+user[usr].integrantes[3].tamCamiseta);
    //   }

    //   if (user[usr].integrantes[4].tipo !== undefined){
    //     myDoc.moveDown(0.5)
    //     myDoc.text("     Nome: "+user[usr].integrantes[4].nome+ " | Tam. "+user[usr].integrantes[4].tamCamiseta);
    //   }
    // }
    myDoc.end();
  });

  res.sendStatus(200);
});

// projetoSchema.find({"aprovado":true,"categoria":"Fundamental II (6º ao 9º anos)"}).sort({"eixo":1, "numInscricao":1}).exec(function(err, users) {
//   if (err) throw err;
//   myDoc.addPage()
//   .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//   .moveDown(5)
//   .text("FUNDAMENTAL II (6° ao 9° ano)", {align: 'center'})
//   .moveDown(1)

//   users.forEach(function(usr){

//     myDoc.moveDown(1.5)
//   //.image('public/assets/images/logo.png',70, 55, { fit: [200,350] })

//   if (usr.eixo !== echu) {
//     echu = usr.eixo;
//     myDoc.fontSize(14)
//     .text("Eixo: "+usr.eixo, {align: 'center'})
//   }


//   //.image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//   myDoc.fontSize(12)
//   .moveDown(1)
//   .text("Projeto: "+usr.nomeProjeto)
//   .moveDown(0.5)
//   // .text("Eixo: "+usr.eixo)
//   // .moveDown(0.5)
//   // .text("Orientador(es): ");

//   if (usr.integrantes[0].tipo !== undefined){
//     myDoc.text("     Nome: "+usr.integrantes[0].nome+ " | Tam. "+usr.integrantes[0].tamCamiseta);
//   }

//   if (usr.integrantes[1].tipo !== undefined){
//     myDoc.moveDown(0.5)
//     myDoc.text("     Nome: "+usr.integrantes[1].nome+ " | Tam. "+usr.integrantes[1].tamCamiseta);
//   }

//   if (usr.integrantes[2].tipo !== undefined){
//     myDoc.moveDown(0.5)
//     myDoc.text("     Nome: "+usr.integrantes[2].nome+ " | Tam. "+usr.integrantes[2].tamCamiseta);
//   }

//   if (usr.integrantes[3].tipo !== undefined){
//     myDoc.moveDown(0.5)
//     myDoc.text("     Nome: "+usr.integrantes[3].nome+ " | Tam. "+usr.integrantes[3].tamCamiseta);
//   }

//   if (usr.integrantes[4].tipo !== undefined){
//     myDoc.moveDown(0.5)
//     myDoc.text("     Nome: "+usr.integrantes[4].nome+ " | Tam. "+usr.integrantes[4].tamCamiseta);
//   }
// });

//   projetoSchema.find({"aprovado":true, "categoria":"Ensino Médio, Técnico e Superior"}).sort({"eixo":1, "numInscricao":1}).exec(function(err, users) {
//     if (err) throw •••••••err;
//     myDoc.addPage()
//     .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//     .moveDown(5)
//     .text("ENSINO MÉDIO, TÉNICO E SUPERIOR", {align: 'center'})
//     .moveDown(1)

//     users.forEach(function(usr){

//       myDoc.moveDown(1.5)
//   //.image('public/assets/images/logo.png',70, 55, { fit: [200,350] })

//   if (usr.eixo !== echu) {
//     echu = usr.eixo;
//     myDoc.fontSize(14)
//     .text("Eixo: "+usr.eixo, {align: 'center'})
//   }


//   //.image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//   myDoc.fontSize(12)
//   .moveDown(1)
//   .text("Projeto: "+usr.nomeProjeto)
//   .moveDown(0.5)
//   // .text("Eixo: "+usr.eixo)
//   // .moveDown(0.5)
//   // .text("Orientador(es): ");

//   if (usr.integrantes[0].tipo !== undefined){
//     myDoc.text("     Nome: "+usr.integrantes[0].nome+ " | Tam. "+usr.integrantes[0].tamCamiseta);
//   }

//   if (usr.integrantes[1].tipo !== undefined){
//     myDoc.moveDown(0.5)
//     myDoc.text("     Nome: "+usr.integrantes[1].nome+ " | Tam. "+usr.integrantes[1].tamCamiseta);
//   }

//   if (usr.integrantes[2].tipo !== undefined){
//     myDoc.moveDown(0.5)
//     myDoc.text("     Nome: "+usr.integrantes[2].nome+ " | Tam. "+usr.integrantes[2].tamCamiseta);
//   }

//   if (usr.integrantes[3].tipo !== undefined){
//     myDoc.moveDown(0.5)
//     myDoc.text("     Nome: "+usr.integrantes[3].nome+ " | Tam. "+usr.integrantes[3].tamCamiseta);
//   }

//   if (usr.integrantes[4].tipo !== undefined){
//     myDoc.moveDown(0.5)
//     myDoc.text("     Nome: "+usr.integrantes[4].nome+ " | Tam. "+usr.integrantes[4].tamCamiseta);
//   }
// });
// });
// });
//   res.sendStatus(200);
//   myDoc.end();
// });

// });

// router.get('/qtd', (req, res) => {
//   let contador = 0;
//   var myDoc = new pdf;

//   myDoc.pipe(fs.createWriteStream('hospedagem.pdf'));

//   myDoc
//   .image('public/assets/images/logo.png',210, 55, { fit: [200,350] })
//   .moveDown(3)
//   .text("Projetos aprovados com necessidade de hospedagem", {align: 'center'})
//   .moveDown(1)
//   .fontSize(12)
//   .text("30 projetos; 58 integrantes", {align: 'center'})
//   .moveDown(2)

//   projetoSchema.find({'aprovado': true}).sort({"categoria":1, "eixo":1, "numInscricao":1}).exec((err, usr) => {
//     if (err) throw err;
//     for (let user in usr) {
//       if (usr[user].hospedagem !== undefined && usr[user].hospedagem !== "") {



//         if (usr[user].participa == true) {
//           if (usr[user].cidade !== "Venâncio Aires") {
//             contador++;
//             console.log('\n\n'+contador+'\n'+usr[user].nomeProjeto);
//             myDoc
//             .fontSize(14)
//             // .moveDown(5)
//             .text(usr[user].nomeProjeto, {align: 'left'})
//             .fontSize(12)
//             .moveDown(0.5)
//             .text("   Categoria: "+usr[user].categoria, {align: 'left'})
//             .moveDown(0.5)
//             .text("   Necessitam hospedagem: "+usr[user].hospedagem, {align: 'left'})
//             .moveDown(0.5)
//             .text("   Confirmação participação: sim", {align: 'left'})
//             .moveDown(0.5)

//             .text("   Escola: "+usr[user].nomeEscola, {align: 'left'})
//             .moveDown(0.5)
//             .text("   Orientador: "+usr[user].integrantes[0].nome, {align: 'left'})
//             .moveDown(0.5)
//             .text("       Telefone: "+usr[user].integrantes[0].telefone, {align: 'left'})
//             .moveDown(2)
//           }
//         } else if (usr[user].participa == undefined) {
//           if (usr[user].cidade !== "Venâncio Aires") {
//             contador++;
//             console.log('\n\n'+contador+'\n'+usr[user].nomeProjeto);
//             myDoc
//             .fontSize(14)
//             // .moveDown(5)
//             .text(usr[user].nomeProjeto, {align: 'left'})
//             .fontSize(12)
//             .moveDown(0.5)
//             .text("   Categoria: "+usr[user].categoria, {align: 'left'})
//             .moveDown(0.5)
//             .text("   Necessitam hospedagem: "+usr[user].hospedagem, {align: 'left'})
//             .moveDown(0.5)
//             .text("   Confirmação participação: não", {align: 'left'})
//             .moveDown(0.5)

//             .text("   Escola: "+usr[user].nomeEscola, {align: 'left'})
//             .moveDown(0.5)
//             .text("   Orientador: "+usr[user].integrantes[0].nome, {align: 'left'})
//             .moveDown(0.5)
//             .text("       Telefone: "+usr[user].integrantes[0].telefone, {align: 'left'})
//             .moveDown(2)
//           }

//         }

//       } else {
//         // contador ++;
//         // console.log(usr[user].nomeProjeto);
//         // console.log("NAN");
//           // console.log(contador);

//           // myDoc
//           //   // .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//           //   .fontSize(12)
//           //   // .moveDown(5)
//           //   .text("Projeto: "+usr[user].nomeProjeto, {align: 'left'})
//           //   .fontSize(16)
//           //   .moveDown(5)
//           //   .text("Projetos com necessidade de hospedagem", {align: 'center'})
//           //   .fontSize(14)
//           //   .moveDown(2.5)
//           //   .text("FUNDAMENTAL I (1° ao 5° ano)", {align: 'center'})
//           //   .moveDown(1)

//           // }
//         }
//         // console.log(contador);
//       };
//       res.sendStatus(200);
//       myDoc.end();
//     });
// });

// router.get('/pdfSaberes', (req, res) => {
//   var myDoc = new pdf;
//   let cont = 0;
//   myDoc.pipe(fs.createWriteStream('participantesSaberes.pdf'));
//   myDoc
//     .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//     .fontSize(16)
//     .moveDown(4)
//     .text("Participantes do V Seminário Saberes Docentes", {align: 'center'})
//     .moveDown(2)
//     .fontSize(12)

//   // saberesSchema.find({}).sort({"nome":1}).exec((err, usr) => {
//     saberesSchema.find({}).sort({"nome":1}).exec((err, usr) => {
//     if (err) throw err;
//     for (let user in usr) {
//       cont ++;
//       console.log(usr[user].nome);
//       myDoc
//         .text(cont+". "+usr[user].nome)
//         .moveDown(1.5)
//     }
//     myDoc.end();
//   });
//   res.sendStatus(200);
// });

// router.get('/qtd2', (req, res) => {
//   let contador = 0;
//   var myDoc = new pdf;

//   myDoc.pipe(fs.createWriteStream('naoConfirmaram.pdf'));

//   myDoc
//     .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//     .moveDown(5)
//     .text("Mostra Venâncio-airense de Cultura e Inovação", {align: 'center'})
//     .fontSize(16)
//     .moveDown(2)
//     .text("Projetos aprovados que necessitam confirmar presença", {align: 'center'})
//     .moveDown(2)
//     .fontSize(12)
//     .text("Total: 41 projetos", {align: 'right'})
//     .moveDown(.5)
//     .fontSize(12)
//     .text("19/09/16", {align: 'right'})

//   projetoSchema.find({"aprovado": true, "participa": undefined}).sort({"categoria":1, "eixo":1, "numInscricao":1}).exec((err, usr) => {
//     if (err) throw err;
//     for (let user in usr) {
//       contador ++

//       myDoc
//         .text("Projeto: "+usr[user].nomeProjeto+ "     N°: "+usr[user].numInscricao)
//         .moveDown(0.7)
//         .text("Categoria: "+usr[user].categoria)
//         .moveDown(1)
//         .text("Eixo: "+usr[user].eixo)
//         .moveDown(1)
//         .text("Escola: "+usr[user].nomeEscola)
//         .moveDown(1)
//         .text("    Nome orientador: "+usr[user].integrantes[0].nome)
//         .moveDown(1)
//         .text("    Telefone orientador: "+usr[user].integrantes[0].telefone)
//         .moveDown(1)
//         .text("    E-mail orientador: "+usr[user].integrantes[0].email)
//         .moveDown(3)
//       // if (usr[user].hospedagem == undefined) {

//       // } else {
//       //   contador ++;
//       //   console.log(usr[user].nomeProjeto);
//       //     // console.log(contador);

//       //     // myDoc
//       //     //   // .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//       //     //   .fontSize(12)
//       //     //   // .moveDown(5)
//       //     //   .text("Projeto: "+usr[user].nomeProjeto, {align: 'left'})
//       //     //   .fontSize(16)
//       //     //   .moveDown(5)
//       //     //   .text("Projetos com necessidade de hospedagem", {align: 'center'})
//       //     //   .fontSize(14)
//       //     //   .moveDown(2.5)
//       //     //   .text("FUNDAMENTAL I (1° ao 5° ano)", {align: 'center'})
//       //     //   .moveDown(1)

//       //     }
//         }
//         console.log(contador);
//         myDoc.end();
//       });
//   res.sendStatus(200);
// });

// router.post('/pdf3', (req, res) => {


//   var myDoc = new pdf;

//   myDoc.pipe(fs.createWriteStream('aprovadosCharqueadas.pdf'));

//   // myDoc
//   //     .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//   //     .fontSize(20)
//   //     .moveDown(5)
//   //     .text("V Mostra Venâncio-airense de Cultura e Inovação", {align: 'center'})
//   //     .fontSize(16)
//   //     .moveDown(5)
//   //     .text("Projetos selecionados", {align: 'center'})
//   //     .fontSize(12)
//   //     .moveDown(2.5)
//   //     .text("FUNDAMENTAL I (1° ao 5° ano)", {align: 'center'})

//   projetoSchema.find({"aprovado":true,"categoria":"Fundamental I (1º ao 5º anos)", "cidade":"Charqueadas"}).sort({"eixo":1, "numInscricao":1}).exec(function(err, users) {
//     if (err) throw err;
//     myDoc
//     .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//     .fontSize(20)
//     .moveDown(5)
//     .text("V Mostra Venâncio-airense de Cultura e Inovação", {align: 'center'})
//     .fontSize(16)
//     .moveDown(5)
//     .text("Projetos selecionados - campus Charqueadas", {align: 'center'})
//     .fontSize(14)
//     .moveDown(2.5)
//     .text("FUNDAMENTAL I (1° ao 5° ano)", {align: 'center'})
//     .moveDown(1)

//     var echu = "";

//     users.forEach(function(usr){

//       myDoc.moveDown(1)
//       //.image('public/assets/images/logo.png',70, 55, { fit: [200,350] })

//       if (usr.eixo !== echu) {
//         echu = usr.eixo;
//         myDoc.fontSize(14)
//         .text("Eixo: "+usr.eixo, {align: 'center'})
//       }

//       myDoc.fontSize(12)
//       .moveDown(1)
//       .text("Projeto: "+usr.nomeProjeto)
//       .moveDown(0.5)
//       // .text("Orientador(es): ");

//       if (usr.integrantes[0].tipo === "Orientador"){
//         myDoc.text("Orientador: "+usr.integrantes[0].nome);
//       }
//       if (usr.integrantes[1].tipo === "Orientador"){
//         myDoc.moveDown(0.5)
//         .text("Orientador: "+usr.integrantes[1].nome);
//       }
//     });

//     projetoSchema.find({"aprovado":true,"categoria":"Fundamental II (6º ao 9º anos)", "cidade":"Charqueadas"}).sort({"eixo":1, "numInscricao":1}).exec(function(err, users) {
//       if (err) throw err;
//       myDoc.addPage()
//       .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//       .moveDown(5)
//       .text("FUNDAMENTAL II (6° ao 9° ano)", {align: 'center'})
//       .moveDown(1)

//       users.forEach(function(usr){

//       myDoc.moveDown(1.5)
//       //.image('public/assets/images/logo.png',70, 55, { fit: [200,350] })

//       if (usr.eixo !== echu) {
//         echu = usr.eixo;
//         myDoc.fontSize(14)
//         .text("Eixo: "+usr.eixo, {align: 'center'})
//       }


//       //.image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//       myDoc.fontSize(12)
//       .moveDown(1)
//       .text("Projeto: "+usr.nomeProjeto)
//       .moveDown(0.5)
//       // .text("Eixo: "+usr.eixo)
//       // .moveDown(0.5)
//       // .text("Orientador(es): ");

//       if (usr.integrantes[0].tipo === "Orientador"){
//         myDoc.text("Orientador: "+usr.integrantes[0].nome);
//       }
//       if (usr.integrantes[1].tipo === "Orientador"){
//         myDoc.moveDown(0.5)
//         .text("Orientador: "+usr.integrantes[1].nome);
//       }
//     });

//       projetoSchema.find({"aprovado":true, "categoria":"Ensino Médio, Técnico e Superior", "cidade":"Charqueadas"}).sort({"eixo":1, "numInscricao":1}).exec(function(err, users) {
//         if (err) throw err;
//         myDoc.addPage()
//         .image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//         .fontSize(20)
//         .moveDown(3)
//         .text("V Mostra Venâncio-airense de Cultura e Inovação", {align: 'center'})
//         .fontSize(16)
//         .moveDown(3)
//         .text("Projetos selecionados - campus Charqueadas", {align: 'center'})
//         .fontSize(14)
//         .moveDown(2.5)
//         .text("ENSINO MÉDIO, TÉNICO E SUPERIOR", {align: 'center'})
//         .moveDown(1)

//         users.forEach(function(usr){

//       myDoc.moveDown(1.5)
//       //.image('public/assets/images/logo.png',70, 55, { fit: [200,350] })

//       if (usr.eixo !== echu) {
//         echu = usr.eixo;
//         myDoc.fontSize(14)
//         .text("Eixo: "+usr.eixo, {align: 'center'})
//       }


//       //.image('public/assets/images/logo.png',70, 55, { fit: [200,350] })
//       myDoc.fontSize(12)
//       .moveDown(1)
//       .text("Projeto: "+usr.nomeProjeto)

//       // .text("Eixo: "+usr.eixo)
//       // .moveDown(0.5)
//       // .text("Orientador(es): ");

//       if (usr.integrantes[0].tipo === "Orientador"){
//         myDoc.moveDown(0.5)
//         .text("Orientador: "+usr.integrantes[0].nome);
//       }
//       if (usr.integrantes[1].tipo === "Orientador"){
//         myDoc.moveDown(0.5)
//         .text("Orientador: "+usr.integrantes[1].nome);
//       }

//       if (usr.integrantes[2].tipo === "Aluno"){
//         myDoc.moveDown(0.5)
//         .text("Aluno: "+usr.integrantes[2].nome);
//       }
//       if (usr.integrantes[3].tipo === "Aluno"){
//         myDoc.moveDown(0.5)
//         .text("Aluno: "+usr.integrantes[3].nome);
//       }
//       if (usr.integrantes[4].tipo === "Aluno"){
//         myDoc.moveDown(0.5)
//         .text("Aluno: "+usr.integrantes[4].nome);
//       }

//     });
//         res.sendStatus(200);
//         myDoc.end();
//       });
//     });
//   });
// });

module.exports = router;
