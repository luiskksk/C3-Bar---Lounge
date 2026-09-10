import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


const form =
    document.querySelector("#reservas-form");

const nomeInput =
    document.querySelector("#reserva-nome");

const emailInput =
    document.querySelector("#reserva-email");

const dataInput =
    document.querySelector("#reserva-data");

const horarioInput =
    document.querySelector("#reserva-horario");

const pessoasInput =
    document.querySelector("#reserva-pessoas");

const observacoesInput =
    document.querySelector("#reserva-observacoes");

const mensagemElemento =
    document.querySelector("#reservas-mensagem");

const areaSemLogin =
    document.querySelector("#reservas-sem-login");

const areaLogada =
    document.querySelector("#reservas-area-logada");


let usuarioLogado = null;


/* =====================================
   MENSAGEM
===================================== */

function mostrarMensagem(
    texto,
    tipo
) {

    if (!mensagemElemento) {
        return;
    }

    mensagemElemento.textContent =
        texto;

    mensagemElemento.className =
        `reservas-mensagem ${tipo}`;
}


/* =====================================
   DATA MÍNIMA
===================================== */

function configurarDataMinima() {

    if (!dataInput) {
        return;
    }

    const hoje =
        new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            hoje.getDate()
        ).padStart(
            2,
            "0"
        );

    dataInput.min =
        `${ano}-${mes}-${dia}`;
}


configurarDataMinima();


/* =====================================
   VERIFICA LOGIN
===================================== */

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            usuarioLogado = null;

            if (areaSemLogin) {
                areaSemLogin.hidden = false;
            }

            if (areaLogada) {
                areaLogada.hidden = true;
            }

            return;
        }


        usuarioLogado =
            user;


        if (areaSemLogin) {
            areaSemLogin.hidden = true;
        }

        if (areaLogada) {
            areaLogada.hidden = false;
        }


        const nome =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Usuário C3";


        if (nomeInput) {
            nomeInput.value =
                nome;
        }


        if (emailInput) {
            emailInput.value =
                user.email || "";
        }

    }
);


/* =====================================
   SALVAR RESERVA
===================================== */

if (form) {

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (!usuarioLogado) {

                mostrarMensagem(
                    "Faça login para realizar uma reserva.",
                    "erro"
                );

                return;
            }


            const data =
                dataInput.value;

            const horario =
                horarioInput.value;

            const pessoas =
                Number(
                    pessoasInput.value
                );

            const observacoes =
                observacoesInput.value.trim();


            if (
                !data ||
                !horario ||
                !pessoas
            ) {

                mostrarMensagem(
                    "Preencha os dados da reserva.",
                    "erro"
                );

                return;
            }


            if (
                pessoas < 1 ||
                pessoas > 8
            ) {

                mostrarMensagem(
                    "Selecione uma quantidade válida de pessoas.",
                    "erro"
                );

                return;
            }


            const botao =
                form.querySelector(
                    'button[type="submit"]'
                );


            try {

                if (botao) {

                    botao.disabled =
                        true;

                    botao.textContent =
                        "Confirmando...";
                }


                mostrarMensagem(
                    "Registrando sua reserva...",
                    "carregando"
                );


                await addDoc(
                    collection(
                        db,
                        "reservas"
                    ),
                    {

                        uid:
                            usuarioLogado.uid,

                        nome:
                            nomeInput.value,

                        email:
                            usuarioLogado.email || "",

                        data:
                            data,

                        horario:
                            horario,

                        pessoas:
                            pessoas,

                        observacoes:
                            observacoes,

                        status:
                            "pendente",

                        criadoEm:
                            serverTimestamp()
                    }
                );


                mostrarMensagem(
                    "Reserva enviada com sucesso!",
                    "sucesso"
                );


                dataInput.value =
                    "";

                horarioInput.value =
                    "";

                pessoasInput.value =
                    "";

                observacoesInput.value =
                    "";


            } catch (erro) {

                console.error(
                    "Erro ao criar reserva:",
                    erro
                );


                mostrarMensagem(
                    "Não foi possível realizar a reserva.",
                    "erro"
                );


            } finally {

                if (botao) {

                    botao.disabled =
                        false;

                    botao.textContent =
                        "Confirmar reserva";
                }
            }
        }
    );
}