require("dotenv").config();

const axios = require("axios")
const cheerio = require("cheerio")
const db = require("../models/nedb"); // Define o MODEL que vamos usar
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { response } = require("express");

function authenticateToken(req, res) {
  console.log("A autorizar...");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    console.log("Token nula");
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.email = user;
  });
}

async function enviaEmail(recipients, URLconfirm) {
  // Gera uma conta do serviço SMTP de email do domínio ethereal.email
  // Somente necessário na fase de testes e se não tiver uma conta real para utilizar
  let testAccount = await nodemailer.createTestAccount();

  // Cria um objeto transporter reutilizável que é um transporter SMTP
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: testAccount.user, // utilizador ethereal gerado
      pass: testAccount.pass, // senha do utilizador ethereal
    },
  });

  // envia o email usando o objeto de transporte definido
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // endereço do originador
    to: recipients, // lista de destinatários
    subject: "Hello ✔", // assunto
    text: "Link to activate: " + URLconfirm, // corpo do email
    html: "<b>Link to activate: " + URLconfirm + "</b>", // corpo do email em html
  });

  console.log("Mensagem enviada: %s", info.messageId);
  // Mensagem enviada: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // A pré-visualização só estará disponível se usar uma conta Ethereal para envio
  console.log(
    "URL para visualização prévia: %s",
    nodemailer.getTestMessageUrl(info)
  );
  // URL para visualização prévia: https://ethereal.email/message/WaQKMgKddxQDoou...
}

exports.verificaUtilizador = async (req, res) => {
  const confirmationCode = req.params.confirmationCode;
  db.crUd_ativar(confirmationCode);
  const resposta = { message: "User is active!" };
  console.log(resposta);
  return res.send(resposta);
};


// REGISTAR - cria um novo utilizador
exports.registar = async (req, res) => {
  console.log("Register new User");
  if (!req.body) {
    return res.status(400).send({
      message: "Cannot be empty!",
    });
  }
  try {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const email = req.body.email;
    const password = hashPassword;
    const confirmationToken = jwt.sign(
      req.body.email,
      process.env.ACCESS_TOKEN_SECRET
    )
    const URLconfirm = `https://atividade04api.herokuapp.com/api/gpus/auth/confirm/${confirmationToken}`

    // console.log(`\n\n\nCONFIRMATION LINK -> https://atividade04api.herokuapp.com/api/gpus/auth/confirm/${confirmationToken}\n\n\n`)

    db.Crud_registar(email, password, confirmationToken) // C: Create
      .then((dados) => {
        enviaEmail(email, URLconfirm).catch(console.error);
        res.status(201).send({
          message:
            `https://atividade04api.herokuapp.com/api/gpus/auth/confirm/${confirmationToken}\n\n\n`,
        });
        console.log("Controller - utilizador registado: ");
        console.log(JSON.stringify(dados)); // para debug
      });
  } catch {
    return res.status(400).send({ message: "Problems creating user" });
  }
};

// LOGIN - autentica um utilizador
exports.login = async (req, res) => {
  console.log("Autenticação de um utilizador");
  if (!req.body) {
    return res.status(400).send({
      message: "Cannot be empty!",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const email = req.body.email;
  const password = hashPassword;
  db.cRud_login(email) //
    .then(async (dados) => {
      if (await bcrypt.compare(req.body.password, dados.password)) {
        const user = { name: email };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        res.json({ accessToken: accessToken }); // aqui temos de enviar a token de autorização
        console.log("Resposta da consulta à base de dados: ");
        console.log(JSON.stringify(dados)); // para debug
      } else {
        console.log("Password incorreta");
        return res.status(401).send({ erro: "Password incorrect!" });
      }
    })
    .catch((response) => {
      console.log("controller:");
      console.log(response);
      return res.status(400).send(response);
    });
};

exports.findall = (req, res) => {

  var gpus = []
  fetchData()

  async function fetchData() {

    await axios.get("https://www.newegg.com/p/pl?N=100007709%20601357282")
      .then(response => {
        const html = response.data
        const $ = cheerio.load(html)

        $("div.item-container").each((i, element) => {
          const gpuName = $(element).find("a.item-title").text()
          const price = (Math.round($(element).find("li.price-current").text()))
          const sellerUrl = "https://www.newegg.com/"
          const url = $(element).find("a.item-title").attr("href")
          const sellerName = "New Egg"

          gpus.push({
            gpuName,
            price,
            url,
            sellerUrl,
            sellerName
          })
        })
      })


    await axios.get("https://www.microcenter.com/search/search_results.aspx?Ntk=all&sortby=match&N=4294966937+4294808776&myStore=true")
      .then(response => {
        const html = response.data
        const $ = cheerio.load(html)

        $("li.product_wrapper").each((i, element) => {
          const gpuName = $(element).find("div.normal").text()
          const price = (Math.round(parseFloat((($(element).find("div.price").text().replace(",", "").replace("$", "")))))).toFixed(0) + " €"
          const sellerUrl = "https://www.microcenter.com/"
          const url = sellerUrl + $(element).find("div.normal").children("h2").children("a").attr("href")
          const sellerName = "Micro Center"

          gpus.push({
            gpuName,
            price,
            url,
            sellerUrl,
            sellerName
          })
        })
      })


    await axios.get("https://www.chiptec.net/componentes-para-computadores/placas-graficas/placas-graficas-pci-e?limit=24")
      .then(response => {
        const html = response.data
        const $ = cheerio.load(html)

        $("li.item").each((i, element) => {
          if ($(element).find("h2.product-name").text().includes("RTX 3")) {
            const gpuName = $(element).find("h2.product-name").text()
            const price = (Math.round(parseInt((($(element).find("span.regular-price").text().split(" ")[0].replace(" ", "").replace(/\s/g, '').replace("€", "").replace(",", "."))))))+ " €"
            const sellerUrl = "https://www.chiptec.net/"
            const url = $(element).find("a.product-image").attr("href")
            const sellerName = "Chiptec"

            gpus.push({
              gpuName,
              price,
              url,
              sellerUrl,
              sellerName
            })
          }
        })
      })


    res.json(gpus)
  }


};
