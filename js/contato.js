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
   AUTENTICAÇÃO
===================================== */

onAuthStateChanged(
    auth,
    (user) => {

        usuarioLogado =
            user;


        if (!user) {

            if (emailInput) {
                emailInput.readOnly =
                    false;
            }

            return;
        }


        if (nomeInput) {

            nomeInput.value =
                user.displayName ||
                user.email?.split("@")[0] ||
                "";
        }


        if (emailInput) {

            emailInput.value =
                user.email ||
                "";

            emailInput.readOnly =
                true;
        }
    }
);


/* =====================================
   FORMULÁRIO
===================================== */

if (formContato) {

    formContato.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const nome =
                nomeInput?.value.trim() ||
                "";

            const email =
                emailInput?.value.trim() ||
                "";

            const assunto =
                assuntoInput?.value.trim() ||
                "";

            const mensagem =
                mensagemInput?.value.trim() ||
                "";


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

                    botao.disabled =
                        true;

                    botao.textContent =
                        "Enviando...";
                }


                await addDoc(
                    collection(
                        db,
                        "mensagens"
                    ),
                    {

                        nome:
                            nome,

                        email:
                            email,

                        assunto:
                            assunto,

                        mensagem:
                            mensagem,

                        uid:
                            usuarioLogado
                                ? usuarioLogado.uid
                                : null,

                        usuarioLogado:
                            Boolean(
                                usuarioLogado
                            ),

                        criadoEm:
                            serverTimestamp(),

                        lida:
                            false,

                        respondido:
                            false
                    }
                );


                alert(
                    "Mensagem enviada com sucesso!"
                );


                formContato.reset();


                if (usuarioLogado) {

                    nomeInput.value =
                        usuarioLogado.displayName ||
                        usuarioLogado.email?.split("@")[0] ||
                        "";

                    emailInput.value =
                        usuarioLogado.email ||
                        "";
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

                    botao.disabled =
                        false;

                    botao.textContent =
                        "Enviar mensagem";
                }
            }
        }
    );
}