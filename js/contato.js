import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    db,
    auth
} from "./firebase.js";


const formContato =
    document.querySelector("#contato-form");

const nomeInput =
    document.querySelector("#nome");

const emailInput =
    document.querySelector("#email");

const assuntoInput =
    document.querySelector("#assunto");

const mensagemInput =
    document.querySelector("#mensagem");


let usuarioLogado = null;


/* =====================================
   VERIFICA USUÁRIO LOGADO
===================================== */

onAuthStateChanged(
    auth,
    (user) => {

        usuarioLogado = user;

        if (user) {

            if (nomeInput) {
                nomeInput.value =
                    user.displayName || "";
            }

            if (emailInput) {
                emailInput.value =
                    user.email || "";

                emailInput.readOnly = true;
            }

            console.log(
                "Contato identificado:",
                user.email
            );

        } else {

            if (emailInput) {
                emailInput.readOnly = false;
            }

        }
    }
);


/* =====================================
   ENVIO DO FORMULÁRIO
===================================== */

if (formContato) {

    formContato.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const nome =
                nomeInput.value.trim();

            const email =
                emailInput.value.trim();

            const assunto =
                assuntoInput.value.trim();

            const mensagem =
                mensagemInput.value.trim();


            if (
                !nome ||
                !email ||
                !assunto ||
                !mensagem
            ) {

                alert(
                    "Preencha todos os campos."
                );

                return;
            }


            const botao =
                formContato.querySelector(
                    'button[type="submit"]'
                );


            try {

                if (botao) {

                    botao.disabled = true;

                    botao.textContent =
                        "Enviando...";
                }


                /* =====================================
                   DADOS SALVOS NO FIREBASE
                ===================================== */

                await addDoc(
                    collection(
                        db,
                        "mensagens"
                    ),
                    {

                        nome: nome,

                        email: email,

                        assunto: assunto,

                        mensagem: mensagem,


                        /* CONTA FIREBASE */

                        uid:
                            usuarioLogado
                                ? usuarioLogado.uid
                                : null,

                        usuarioLogado:
                            usuarioLogado
                                ? true
                                : false,


                        criadoEm:
                            serverTimestamp()
                    }
                );


                alert(
                    "Mensagem enviada com sucesso!"
                );


                /* =====================================
                   LIMPA FORMULÁRIO
                ===================================== */

                formContato.reset();


                /*
                    Se estiver logado,
                    coloca nome/e-mail novamente
                */

                if (usuarioLogado) {

                    nomeInput.value =
                        usuarioLogado.displayName || "";

                    emailInput.value =
                        usuarioLogado.email || "";
                }


            } catch (erro) {

                console.error(
                    "Erro ao enviar mensagem:",
                    erro
                );


                alert(
                    "Não foi possível enviar a mensagem."
                );

            } finally {

                if (botao) {

                    botao.disabled = false;

                    botao.textContent =
                        "Enviar mensagem";
                }
            }
        }
    );
}