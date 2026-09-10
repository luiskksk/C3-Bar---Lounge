import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


/* =====================================
   ELEMENTOS DA CONTA
===================================== */

const nomeElemento =
    document.querySelector("#conta-nome");

const emailElemento =
    document.querySelector("#conta-email");

const uidElemento =
    document.querySelector("#conta-uid");

const avatarElemento =
    document.querySelector("#minha-conta-avatar");

const botaoSair =
    document.querySelector("#conta-sair");

const listaReservas =
    document.querySelector("#lista-reservas");


/* =====================================
   FORMATAR DATA
===================================== */

function formatarData(data) {

    if (!data) {
        return "Data não informada";
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    const ano =
        Number(partes[0]);

    const mes =
        Number(partes[1]);

    const dia =
        Number(partes[2]);

    const dataFormatada =
        new Date(
            ano,
            mes - 1,
            dia
        );

    return dataFormatada.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =====================================
   FORMATAR STATUS
===================================== */

function formatarStatus(status) {

    switch (status) {

        case "confirmada":
            return "Confirmada";

        case "cancelada":
            return "Cancelada";

        case "pendente":
        default:
            return "Pendente";
    }
}


/* =====================================
   CRIAR CARD DA RESERVA
===================================== */

function criarCardReserva(reserva) {

    const card =
        document.createElement("article");

    card.classList.add(
        "reserva-conta-card"
    );


    /* TOPO */

    const topo =
        document.createElement("div");

    topo.classList.add(
        "reserva-conta-topo"
    );


    const data =
        document.createElement("div");

    data.classList.add(
        "reserva-conta-data"
    );

    data.textContent =
        formatarData(
            reserva.data
        );


    const status =
        document.createElement("span");

    status.classList.add(
        "reserva-status",
        reserva.status || "pendente"
    );

    status.textContent =
        formatarStatus(
            reserva.status
        );


    topo.append(
        data,
        status
    );


    /* DETALHES */

    const detalhes =
        document.createElement("div");

    detalhes.classList.add(
        "reserva-conta-detalhes"
    );


    const horario =
        document.createElement("div");

    const horarioLabel =
        document.createElement("span");

    horarioLabel.textContent =
        "HORÁRIO";

    const horarioValor =
        document.createElement("strong");

    horarioValor.textContent =
        reserva.horario || "--:--";

    horario.append(
        horarioLabel,
        horarioValor
    );


    const pessoas =
        document.createElement("div");

    const pessoasLabel =
        document.createElement("span");

    pessoasLabel.textContent =
        "PESSOAS";

    const pessoasValor =
        document.createElement("strong");

    pessoasValor.textContent =
        `${reserva.pessoas || 0} ${
            Number(reserva.pessoas) === 1
                ? "pessoa"
                : "pessoas"
        }`;

    pessoas.append(
        pessoasLabel,
        pessoasValor
    );


    detalhes.append(
        horario,
        pessoas
    );


    card.append(
        topo,
        detalhes
    );


    /* OBSERVAÇÕES */

    if (reserva.observacoes) {

        const observacoes =
            document.createElement("div");

        observacoes.classList.add(
            "reserva-conta-observacoes"
        );


        const titulo =
            document.createElement("span");

        titulo.textContent =
            "OBSERVAÇÕES";


        const texto =
            document.createElement("p");

        texto.textContent =
            reserva.observacoes;


        observacoes.append(
            titulo,
            texto
        );

        card.appendChild(
            observacoes
        );
    }


    /* CANCELAR */

    if (
        reserva.status !== "cancelada"
    ) {

        const acoes =
            document.createElement("div");

        acoes.classList.add(
            "reserva-conta-acoes"
        );


        const cancelar =
            document.createElement("button");

        cancelar.type =
            "button";

        cancelar.classList.add(
            "reserva-cancelar"
        );

        cancelar.textContent =
            "Cancelar reserva";


        cancelar.addEventListener(
            "click",
            async () => {

                const confirmar =
                    window.confirm(
                        "Deseja realmente cancelar esta reserva?"
                    );

                if (!confirmar) {
                    return;
                }


                try {

                    cancelar.disabled =
                        true;

                    cancelar.textContent =
                        "Cancelando...";


                    await updateDoc(
                        doc(
                            db,
                            "reservas",
                            reserva.id
                        ),
                        {
                            status:
                                "cancelada",

                            canceladoEm:
                                serverTimestamp()
                        }
                    );


                    await carregarReservas(
                        auth.currentUser.uid
                    );

                } catch (erro) {

                    console.error(
                        "Erro ao cancelar reserva:",
                        erro
                    );

                    alert(
                        "Não foi possível cancelar a reserva."
                    );


                    cancelar.disabled =
                        false;

                    cancelar.textContent =
                        "Cancelar reserva";
                }
            }
        );


        acoes.appendChild(
            cancelar
        );

        card.appendChild(
            acoes
        );
    }


    return card;
}


/* =====================================
   ESTADO VAZIO
===================================== */

function mostrarSemReservas() {

    if (!listaReservas) {
        return;
    }


    listaReservas.innerHTML = "";


    const vazio =
        document.createElement("div");

    vazio.classList.add(
        "reservas-conta-vazio"
    );


    const numero =
        document.createElement("span");

    numero.classList.add(
        "reservas-conta-vazio-numero"
    );

    numero.textContent =
        "C3";


    const titulo =
        document.createElement("h3");

    titulo.textContent =
        "Nenhuma reserva ainda.";


    const texto =
        document.createElement("p");

    texto.textContent =
        "Quando você reservar uma mesa, ela aparecerá aqui.";


    vazio.append(
        numero,
        titulo,
        texto
    );


    listaReservas.appendChild(
        vazio
    );
}


/* =====================================
   CARREGAR RESERVAS
===================================== */

async function carregarReservas(uid) {

    if (!listaReservas) {
        return;
    }


    listaReservas.innerHTML =
        `
            <div class="reservas-conta-loading">
                Carregando suas reservas...
            </div>
        `;


    try {

        const consulta =
            query(
                collection(
                    db,
                    "reservas"
                ),
                where(
                    "uid",
                    "==",
                    uid
                )
            );


        const resultado =
            await getDocs(
                consulta
            );


        const reservas = [];


        resultado.forEach(
            (documento) => {

                reservas.push({
                    id:
                        documento.id,

                    ...documento.data()
                });
            }
        );


        /* ORDENA SEM PRECISAR DE ÍNDICE FIREBASE */

        reservas.sort(
            (a, b) => {

                const dataA =
                    `${a.data || ""} ${a.horario || ""}`;

                const dataB =
                    `${b.data || ""} ${b.horario || ""}`;

                return dataB.localeCompare(
                    dataA
                );
            }
        );


        listaReservas.innerHTML =
            "";


        if (
            reservas.length === 0
        ) {

            mostrarSemReservas();

            return;
        }


        reservas.forEach(
            (reserva) => {

                const card =
                    criarCardReserva(
                        reserva
                    );

                listaReservas.appendChild(
                    card
                );
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar reservas:",
            erro
        );


        listaReservas.innerHTML =
            `
                <div class="reservas-conta-erro">
                    Não foi possível carregar suas reservas.
                </div>
            `;
    }
}


/* =====================================
   AUTENTICAÇÃO
===================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.replace(
                "./login.html"
            );

            return;
        }


        const nome =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Usuário C3";


        const email =
            user.email ||
            "Não informado";


        if (nomeElemento) {

            nomeElemento.textContent =
                nome;
        }


        if (emailElemento) {

            emailElemento.textContent =
                email;
        }


        if (uidElemento) {

            uidElemento.textContent =
                user.uid;
        }


        if (avatarElemento) {

            avatarElemento.textContent =
                nome
                    .charAt(0)
                    .toUpperCase();
        }


        await carregarReservas(
            user.uid
        );
    }
);


/* =====================================
   SAIR DA CONTA
===================================== */

if (botaoSair) {

    botaoSair.addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );


                window.location.replace(
                    "../index.html"
                );

            } catch (erro) {

                console.error(
                    "Erro ao sair:",
                    erro
                );
            }
        }
    );
}