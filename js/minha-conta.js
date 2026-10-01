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

const listaMensagens =
    document.querySelector("#lista-mensagens");


/* =====================================
   ESCAPAR HTML
===================================== */

function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        texto ?? "";

    return div.innerHTML;
}


/* =====================================
   FORMATAR DATA DA RESERVA
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
   FORMATAR STATUS DA RESERVA
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
   FORMATAR DATA/HORA DA MENSAGEM
===================================== */

function formatarDataHora(timestamp) {

    if (
        !timestamp ||
        typeof timestamp.toDate !== "function"
    ) {
        return "Data não disponível";
    }

    const data =
        timestamp.toDate();

    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ) +
    " às " +
    data.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
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
   ESTADO VAZIO DAS RESERVAS
===================================== */

function mostrarSemReservas() {

    if (!listaReservas) {
        return;
    }


    listaReservas.innerHTML =
        "";


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
   STATUS DA MENSAGEM
===================================== */

function obterStatusMensagem(mensagem) {

    if (
        mensagem.respondido === true ||
        mensagem.resposta
    ) {

        return {
            texto: "Respondida",
            classe: "respondida"
        };
    }


    if (
        mensagem.lida === true
    ) {

        return {
            texto: "Em atendimento",
            classe: "atendimento"
        };
    }


    return {
        texto: "Em análise",
        classe: "analise"
    };
}


/* =====================================
   CRIAR CARD DA MENSAGEM
===================================== */

function criarCardMensagem(mensagem) {

    const card =
        document.createElement("article");

    const status =
        obterStatusMensagem(
            mensagem
        );


    card.classList.add(
        "minha-mensagem-card",
        status.classe
    );


    /* =================================
       TOPO
    ================================= */

    const topo =
        document.createElement("div");

    topo.classList.add(
        "minha-mensagem-topo"
    );


    const informacoes =
        document.createElement("div");

    informacoes.classList.add(
        "minha-mensagem-informacoes"
    );


    const etiqueta =
        document.createElement("span");

    etiqueta.classList.add(
        "minha-mensagem-etiqueta"
    );

    etiqueta.textContent =
        "ASSUNTO";


    const assunto =
        document.createElement("h3");

    assunto.textContent =
        mensagem.assunto ||
        "Sem assunto";


    informacoes.append(
        etiqueta,
        assunto
    );


    const statusElemento =
        document.createElement("span");

    statusElemento.classList.add(
        "minha-mensagem-status",
        status.classe
    );

    statusElemento.textContent =
        status.texto;


    topo.append(
        informacoes,
        statusElemento
    );


    card.appendChild(
        topo
    );


    /* =================================
       DATA
    ================================= */

    const data =
        document.createElement("div");

    data.classList.add(
        "minha-mensagem-data"
    );

    data.textContent =
        `Enviada em ${formatarDataHora(
            mensagem.criadoEm
        )}`;


    card.appendChild(
        data
    );


    /* =================================
       MENSAGEM ENVIADA
    ================================= */

    const mensagemBox =
        document.createElement("div");

    mensagemBox.classList.add(
        "minha-mensagem-conteudo"
    );


    const mensagemLabel =
        document.createElement("span");

    mensagemLabel.classList.add(
        "minha-mensagem-etiqueta"
    );

    mensagemLabel.textContent =
        "SUA MENSAGEM";


    const mensagemTexto =
        document.createElement("p");

    mensagemTexto.textContent =
        mensagem.mensagem ||
        "";


    mensagemBox.append(
        mensagemLabel,
        mensagemTexto
    );


    card.appendChild(
        mensagemBox
    );


    /* =================================
       RESPOSTA DO C3
    ================================= */

    if (
        mensagem.resposta
    ) {

        const resposta =
            document.createElement("div");

        resposta.classList.add(
            "minha-mensagem-resposta"
        );


        const respostaTopo =
            document.createElement("div");

        respostaTopo.classList.add(
            "minha-mensagem-resposta-topo"
        );


        const respostaTitulo =
            document.createElement("span");

        respostaTitulo.textContent =
            "RESPOSTA DO C3";


        const respostaData =
            document.createElement("small");

        respostaData.textContent =
            mensagem.respondidoEm
                ? formatarDataHora(
                    mensagem.respondidoEm
                )
                : "Resposta recebida";


        respostaTopo.append(
            respostaTitulo,
            respostaData
        );


        const respostaTexto =
            document.createElement("p");

        respostaTexto.textContent =
            mensagem.resposta;


        resposta.append(
            respostaTopo,
            respostaTexto
        );


        card.appendChild(
            resposta
        );

    } else {

        const aguardando =
            document.createElement("div");

        aguardando.classList.add(
            "minha-mensagem-aguardando"
        );


        const aguardandoTitulo =
            document.createElement("strong");

        aguardandoTitulo.textContent =
            mensagem.lida === true
                ? "Sua mensagem está em atendimento."
                : "Sua mensagem está em análise.";


        const aguardandoTexto =
            document.createElement("p");

        aguardandoTexto.textContent =
            mensagem.lida === true
                ? "Nossa equipe já visualizou sua mensagem e poderá responder em breve."
                : "Nossa equipe ainda está analisando sua mensagem.";


        aguardando.append(
            aguardandoTitulo,
            aguardandoTexto
        );


        card.appendChild(
            aguardando
        );
    }


    return card;
}


/* =====================================
   ESTADO VAZIO DAS MENSAGENS
===================================== */

function mostrarSemMensagens() {

    if (!listaMensagens) {
        return;
    }


    listaMensagens.innerHTML =
        "";


    const vazio =
        document.createElement("div");

    vazio.classList.add(
        "mensagens-conta-vazio"
    );


    const simbolo =
        document.createElement("span");

    simbolo.classList.add(
        "mensagens-conta-vazio-simbolo"
    );

    simbolo.textContent =
        "C3";


    const titulo =
        document.createElement("h3");

    titulo.textContent =
        "Nenhuma mensagem ainda.";


    const texto =
        document.createElement("p");

    texto.textContent =
        "Quando você entrar em contato com a equipe C3, suas mensagens aparecerão aqui.";


    vazio.append(
        simbolo,
        titulo,
        texto
    );


    listaMensagens.appendChild(
        vazio
    );
}


/* =====================================
   CARREGAR MENSAGENS
===================================== */

async function carregarMensagens(uid) {

    if (!listaMensagens) {
        return;
    }


    listaMensagens.innerHTML =
        `
            <div class="mensagens-conta-loading">
                Carregando suas mensagens...
            </div>
        `;


    try {

        const consulta =
            query(
                collection(
                    db,
                    "mensagens"
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


        const mensagens = [];


        resultado.forEach(
            (documento) => {

                mensagens.push({
                    id:
                        documento.id,

                    ...documento.data()
                });

            }
        );


        /* MAIS RECENTES PRIMEIRO */

        mensagens.sort(
            (a, b) => {

                const dataA =
                    a.criadoEm?.toMillis?.() ||
                    0;

                const dataB =
                    b.criadoEm?.toMillis?.() ||
                    0;

                return dataB - dataA;
            }
        );


        listaMensagens.innerHTML =
            "";


        if (
            mensagens.length === 0
        ) {

            mostrarSemMensagens();

            return;
        }


        mensagens.forEach(
            (mensagem) => {

                const card =
                    criarCardMensagem(
                        mensagem
                    );

                listaMensagens.appendChild(
                    card
                );

            }
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar mensagens:",
            erro
        );


        listaMensagens.innerHTML =
            `
                <div class="mensagens-conta-erro">
                    Não foi possível carregar suas mensagens.
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


        /* NOME */

        if (nomeElemento) {

            nomeElemento.textContent =
                nome;
        }


        /* E-MAIL */

        if (emailElemento) {

            emailElemento.textContent =
                email;
        }


        /* UID */

        if (uidElemento) {

            uidElemento.textContent =
                user.uid;
        }


        /* AVATAR */

        if (avatarElemento) {

            avatarElemento.textContent =
                nome
                    .charAt(0)
                    .toUpperCase();
        }


        /* RESERVAS */

        await carregarReservas(
            user.uid
        );


        /* MENSAGENS */

        await carregarMensagens(
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

                botaoSair.disabled =
                    true;

                botaoSair.textContent =
                    "Saindo...";


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


                botaoSair.disabled =
                    false;

                botaoSair.textContent =
                    "Sair da conta";
            }
        }
    );
}