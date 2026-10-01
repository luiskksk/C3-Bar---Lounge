/* =========================================
   C3 BAR & LOUNGE
   PAINEL ADMINISTRATIVO
========================================= */


/* =========================================
   IMPORTS
========================================= */

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


/* =========================================
   ELEMENTOS
========================================= */

const loading =
    document.querySelector("#admin-loading");

const negado =
    document.querySelector("#admin-negado");

const conteudo =
    document.querySelector("#admin-conteudo");

const nomeAdmin =
    document.querySelector("#admin-nome");


/* =========================================
   RESERVAS
========================================= */

const listaReservas =
    document.querySelector("#admin-reservas");

const listaReservasProximas =
    document.querySelector("#admin-reservas-proximas");

const listaReservasAntigas =
    document.querySelector("#admin-reservas-antigas");


/* =========================================
   MENSAGENS
========================================= */

const listaMensagens =
    document.querySelector("#admin-mensagens");


/* =========================================
   ESTATÍSTICAS
========================================= */

const totalElemento =
    document.querySelector("#admin-total");

const pendentesElemento =
    document.querySelector("#admin-pendentes");

const confirmadasElemento =
    document.querySelector("#admin-confirmadas");

const canceladasElemento =
    document.querySelector("#admin-canceladas");


/* =========================================
   LOGOUT
========================================= */

const botaoSair =
    document.querySelector("#admin-sair");


/* =========================================
   DATA LOCAL
========================================= */

function dataLocalISO() {

    const agora = new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            agora.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


/* =========================================
   FORMATAR DATA
========================================= */

function formatarData(data) {

    if (!data) {
        return "Data não informada";
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


/* =========================================
   TIMESTAMP FIREBASE
========================================= */

function timestampParaNumero(timestamp) {

    if (!timestamp) {
        return 0;
    }

    if (
        typeof timestamp.toMillis ===
        "function"
    ) {
        return timestamp.toMillis();
    }

    if (
        typeof timestamp.seconds ===
        "number"
    ) {
        return timestamp.seconds * 1000;
    }

    return 0;
}


/* =========================================
   FORMATAR DATA + HORA
========================================= */

function formatarTimestamp(timestamp) {

    const numero =
        timestampParaNumero(timestamp);

    if (!numero) {
        return "";
    }

    const data =
        new Date(numero);

    return data.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


/* =========================================
   FORMATAR STATUS
========================================= */

function formatarStatus(status) {

    switch (status) {

        case "confirmada":
            return "Confirmada";

        case "cancelada":
            return "Cancelada";

        default:
            return "Pendente";
    }
}


/* =========================================
   CRIAR BOTÃO
========================================= */

function criarBotao(
    texto,
    classe,
    funcao
) {

    const botao =
        document.createElement("button");

    botao.type =
        "button";

    botao.classList.add(
        "admin-reserva-btn",
        classe
    );

    botao.textContent =
        texto;

    botao.addEventListener(
        "click",
        funcao
    );

    return botao;
}


/* =========================================
   ALTERAR STATUS DA RESERVA
========================================= */

async function alterarStatus(
    reservaId,
    novoStatus
) {

    try {

        await updateDoc(
            doc(
                db,
                "reservas",
                reservaId
            ),
            {
                status: novoStatus,
                atualizadoEm:
                    serverTimestamp()
            }
        );

        await carregarReservas();

    } catch (erro) {

        console.error(
            "Erro ao atualizar reserva:",
            erro
        );

        alert(
            "Não foi possível atualizar a reserva."
        );
    }
}


/* =========================================
   APAGAR RESERVA
========================================= */

async function apagarReserva(
    reservaId
) {

    const confirmou =
        window.confirm(
            "Tem certeza que deseja apagar esta reserva permanentemente?\n\nEssa ação não pode ser desfeita."
        );

    if (!confirmou) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "reservas",
                reservaId
            )
        );

        await carregarReservas();

    } catch (erro) {

        console.error(
            "Erro ao apagar reserva:",
            erro
        );

        alert(
            "Não foi possível apagar a reserva."
        );
    }
}


/* =========================================
   CRIAR CARD DE RESERVA
========================================= */

function criarCardReserva(reserva) {

    const card =
        document.createElement("article");

    card.classList.add(
        "admin-reserva-card"
    );


    /* =====================================
       TOPO
    ====================================== */

    const topo =
        document.createElement("div");

    topo.classList.add(
        "admin-reserva-topo"
    );


    const cliente =
        document.createElement("div");

    cliente.classList.add(
        "admin-reserva-cliente"
    );


    const nome =
        document.createElement("h3");

    nome.textContent =
        reserva.nome ||
        "Cliente";


    const email =
        document.createElement("p");

    email.textContent =
        reserva.email ||
        "E-mail não informado";


    cliente.append(
        nome,
        email
    );


    const status =
        document.createElement("span");

    status.classList.add(
        "admin-reserva-status"
    );


    status.classList.add(
        reserva.status === "confirmada"
            ? "confirmada"
            : reserva.status === "cancelada"
                ? "cancelada"
                : "pendente"
    );


    status.textContent =
        formatarStatus(
            reserva.status
        );


    topo.append(
        cliente,
        status
    );


    /* =====================================
       INFORMAÇÕES
    ====================================== */

    const infos =
        document.createElement("div");

    infos.classList.add(
        "admin-reserva-infos"
    );


    const dados = [

        {
            label: "DATA",
            valor:
                formatarData(
                    reserva.data
                )
        },

        {
            label: "HORÁRIO",
            valor:
                reserva.horario ||
                "--:--"
        },

        {
            label: "PESSOAS",
            valor:
                String(
                    reserva.pessoas ||
                    0
                )
        }

    ];


    dados.forEach(
        (dado) => {

            const item =
                document.createElement("div");


            const label =
                document.createElement("span");

            label.textContent =
                dado.label;


            const valor =
                document.createElement("strong");

            valor.textContent =
                dado.valor;


            item.append(
                label,
                valor
            );


            infos.appendChild(
                item
            );
        }
    );


    /* =====================================
       OBSERVAÇÕES
    ====================================== */

    if (reserva.observacoes) {

        const observacoes =
            document.createElement("div");

        observacoes.classList.add(
            "admin-reserva-observacoes"
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


    /* =====================================
       AÇÕES
    ====================================== */

    const acoes =
        document.createElement("div");

    acoes.classList.add(
        "admin-reserva-acoes"
    );


    /* CONFIRMAR */

    if (
        reserva.status !== "confirmada" &&
        reserva.status !== "cancelada"
    ) {

        const confirmar =
            criarBotao(
                "Confirmar",
                "confirmar",
                async () => {

                    await alterarStatus(
                        reserva.id,
                        "confirmada"
                    );
                }
            );

        acoes.appendChild(
            confirmar
        );
    }


    /* CANCELAR */

    if (
        reserva.status !== "cancelada"
    ) {

        const cancelar =
            criarBotao(
                "Cancelar",
                "cancelar",
                async () => {

                    const confirmou =
                        window.confirm(
                            "Deseja cancelar esta reserva?"
                        );

                    if (!confirmou) {
                        return;
                    }

                    await alterarStatus(
                        reserva.id,
                        "cancelada"
                    );
                }
            );

        acoes.appendChild(
            cancelar
        );
    }


    /* APAGAR */

    const apagar =
        criarBotao(
            "Apagar",
            "apagar",
            async () => {

                await apagarReserva(
                    reserva.id
                );
            }
        );


    acoes.appendChild(
        apagar
    );


    card.append(
        topo,
        infos,
        acoes
    );


    return card;
}


/* =========================================
   ESTATÍSTICAS
========================================= */

function atualizarEstatisticas(
    reservas
) {

    const pendentes =
        reservas.filter(
            (reserva) =>
                !reserva.status ||
                reserva.status === "pendente"
        ).length;


    const confirmadas =
        reservas.filter(
            (reserva) =>
                reserva.status === "confirmada"
        ).length;


    const canceladas =
        reservas.filter(
            (reserva) =>
                reserva.status === "cancelada"
        ).length;


    if (totalElemento) {

        totalElemento.textContent =
            reservas.length;
    }


    if (pendentesElemento) {

        pendentesElemento.textContent =
            pendentes;
    }


    if (confirmadasElemento) {

        confirmadasElemento.textContent =
            confirmadas;
    }


    if (canceladasElemento) {

        canceladasElemento.textContent =
            canceladas;
    }
}


/* =========================================
   RENDERIZAR RESERVAS
========================================= */

function renderizarReservas(
    elemento,
    reservas,
    textoVazio
) {

    if (!elemento) {
        return;
    }


    elemento.innerHTML =
        "";


    if (reservas.length === 0) {

        const vazio =
            document.createElement("div");

        vazio.classList.add(
            "admin-vazio"
        );

        vazio.textContent =
            textoVazio;

        elemento.appendChild(
            vazio
        );

        return;
    }


    reservas.forEach(
        (reserva) => {

            elemento.appendChild(
                criarCardReserva(
                    reserva
                )
            );
        }
    );
}


/* =========================================
   CARREGAR RESERVAS
========================================= */

async function carregarReservas() {

    try {

        const resultado =
            await getDocs(
                collection(
                    db,
                    "reservas"
                )
            );


        const reservas = [];


        resultado.forEach(
            (documento) => {

                reservas.push({

                    id: documento.id,

                    ...documento.data()

                });
            }
        );


        atualizarEstatisticas(
            reservas
        );


        const hoje =
            dataLocalISO();


        /* =====================================
           RESERVAS DE HOJE
        ====================================== */

        const reservasHoje =
            reservas.filter(
                (reserva) =>
                    reserva.data === hoje
            );


        reservasHoje.sort(
            (a, b) =>
                (
                    a.horario || ""
                ).localeCompare(
                    b.horario || ""
                )
        );


        /* =====================================
           PRÓXIMAS RESERVAS
        ====================================== */

        const reservasProximas =
            reservas.filter(
                (reserva) =>
                    reserva.data &&
                    reserva.data > hoje &&
                    reserva.status !==
                        "cancelada"
            );


        reservasProximas.sort(
            (a, b) => {

                const reservaA =
                    `${a.data || ""} ${a.horario || ""}`;

                const reservaB =
                    `${b.data || ""} ${b.horario || ""}`;

                return reservaA.localeCompare(
                    reservaB
                );
            }
        );


        /* =====================================
           HISTÓRICO
        ====================================== */

        const reservasAntigas =
            reservas.filter(
                (reserva) => {

                    if (!reserva.data) {
                        return false;
                    }


                    const passou =
                        reserva.data < hoje;


                    const futuraCancelada =
                        reserva.data > hoje &&
                        reserva.status ===
                            "cancelada";


                    return (
                        passou ||
                        futuraCancelada
                    );
                }
            );


        reservasAntigas.sort(
            (a, b) => {

                const reservaA =
                    `${a.data || ""} ${a.horario || ""}`;

                const reservaB =
                    `${b.data || ""} ${b.horario || ""}`;

                return reservaB.localeCompare(
                    reservaA
                );
            }
        );


        /* =====================================
           RENDERIZAR
        ====================================== */

        renderizarReservas(
            listaReservas,
            reservasHoje,
            "Nenhuma reserva para hoje."
        );


        renderizarReservas(
            listaReservasProximas,
            reservasProximas,
            "Nenhuma reserva para os próximos dias."
        );


        renderizarReservas(
            listaReservasAntigas,
            reservasAntigas,
            "Nenhuma reserva no histórico."
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar reservas:",
            erro
        );


        if (listaReservas) {

            listaReservas.innerHTML = `
                <div class="admin-erro">
                    Não foi possível carregar as reservas.
                </div>
            `;
        }


        if (listaReservasProximas) {

            listaReservasProximas.innerHTML = `
                <div class="admin-erro">
                    Não foi possível carregar as próximas reservas.
                </div>
            `;
        }


        if (listaReservasAntigas) {

            listaReservasAntigas.innerHTML = `
                <div class="admin-erro">
                    Não foi possível carregar o histórico.
                </div>
            `;
        }
    }
}


/* =========================================
   CRIAR CARD DE MENSAGEM
========================================= */

function criarCardMensagem(mensagem) {

    const card =
        document.createElement("article");

    card.classList.add(
        "admin-mensagem-card"
    );


    /* =====================================
       STATUS VISUAL DO CARD
    ====================================== */

    if (mensagem.resposta) {

        card.classList.add(
            "mensagem-respondida"
        );

    } else if (mensagem.lida === true) {

        card.classList.add(
            "mensagem-lida"
        );

    } else {

        card.classList.add(
            "mensagem-nao-lida"
        );
    }


    /* =====================================
       TOPO
    ====================================== */

    const topo =
        document.createElement("div");

    topo.classList.add(
        "admin-mensagem-topo"
    );


    const usuario =
        document.createElement("div");


    const nome =
        document.createElement("h3");

    nome.textContent =
        mensagem.nome ||
        "Visitante";


    const email =
        document.createElement("p");

    email.textContent =
        mensagem.email ||
        "E-mail não informado";


    usuario.append(
        nome,
        email
    );


    const status =
        document.createElement("span");

    status.classList.add(
        "admin-mensagem-status"
    );


    if (mensagem.resposta) {

        status.classList.add(
            "respondida"
        );

        status.textContent =
            "RESPONDIDA";

    } else if (mensagem.lida === true) {

        status.classList.add(
            "lida"
        );

        status.textContent =
            "LIDA";

    } else {

        status.classList.add(
            "nova"
        );

        status.textContent =
            "NOVA";
    }


    topo.append(
        usuario,
        status
    );


    /* =====================================
       ASSUNTO
    ====================================== */

    const assunto =
        document.createElement("div");

    assunto.classList.add(
        "admin-mensagem-assunto"
    );


    const assuntoLabel =
        document.createElement("span");

    assuntoLabel.textContent =
        "ASSUNTO";


    const assuntoTexto =
        document.createElement("strong");

    assuntoTexto.textContent =
        mensagem.assunto ||
        "Sem assunto";


    assunto.append(
        assuntoLabel,
        assuntoTexto
    );


    /* =====================================
       CORPO DA MENSAGEM
    ====================================== */

    const corpo =
        document.createElement("div");

    corpo.classList.add(
        "admin-mensagem-corpo"
    );


    const texto =
        document.createElement("p");

    texto.textContent =
        mensagem.mensagem ||
        "Mensagem vazia.";


    corpo.appendChild(
        texto
    );


    /* =====================================
       ÁREA DE RESPOSTA
    ====================================== */

    const respostaArea =
        document.createElement("div");

    respostaArea.classList.add(
        "admin-resposta-area"
    );


    const respostaTitulo =
        document.createElement("span");

    respostaTitulo.classList.add(
        "admin-resposta-titulo"
    );


    respostaArea.appendChild(
        respostaTitulo
    );


    /* =====================================
       MENSAGEM JÁ RESPONDIDA
    ====================================== */

    if (mensagem.resposta) {

        respostaTitulo.textContent =
            "RESPOSTA ENVIADA";


        const respostaExistente =
            document.createElement("div");

        respostaExistente.classList.add(
            "admin-resposta-existente"
        );


        respostaExistente.textContent =
            mensagem.resposta;


        respostaArea.appendChild(
            respostaExistente
        );


        const dataResposta =
            document.createElement("small");


        const dataFormatada =
            formatarTimestamp(
                mensagem.respondidoEm
            );


        if (dataFormatada) {

            dataResposta.textContent =
                `Respondida em ${dataFormatada}`;

        } else {

            dataResposta.textContent =
                "Resposta enviada";
        }


        respostaArea.appendChild(
            dataResposta
        );


    } else {

        /* =====================================
           CAMPO PARA NOVA RESPOSTA
        ====================================== */

        respostaTitulo.textContent =
            "RESPONDER MENSAGEM";


        const textarea =
            document.createElement("textarea");


        textarea.classList.add(
            "admin-resposta-input"
        );


        textarea.placeholder =
            "Digite a resposta que o cliente verá na Minha Conta...";


        textarea.maxLength =
            1000;


        const contador =
            document.createElement("small");

        contador.classList.add(
            "admin-resposta-contador"
        );

        contador.textContent =
            "0 / 1000";


        textarea.addEventListener(
            "input",
            () => {

                contador.textContent =
                    `${textarea.value.length} / 1000`;
            }
        );


        const botaoResponder =
            document.createElement("button");


        botaoResponder.type =
            "button";


        botaoResponder.classList.add(
            "admin-botao-responder"
        );


        botaoResponder.textContent =
            "Enviar resposta";


        botaoResponder.addEventListener(
            "click",
            async () => {

                const resposta =
                    textarea.value.trim();


                if (!resposta) {

                    alert(
                        "Digite uma resposta antes de enviar."
                    );

                    textarea.focus();

                    return;
                }


                botaoResponder.disabled =
                    true;

                textarea.disabled =
                    true;

                botaoResponder.textContent =
                    "Enviando...";


                try {

                    await updateDoc(

                        doc(
                            db,
                            "mensagens",
                            mensagem.id
                        ),

                        {
                            resposta:
                                resposta,

                            respondido:
                                true,

                            respondidoEm:
                                serverTimestamp(),

                            respondidoPor:
                                auth.currentUser?.email ||
                                "Administrador",

                            lida:
                                true,

                            lidaEm:
                                serverTimestamp()
                        }
                    );


                    /* =================================
                       ATUALIZAR CARD SEM RECARREGAR
                    ================================== */

                    mensagem.resposta =
                        resposta;

                    mensagem.respondido =
                        true;

                    mensagem.lida =
                        true;


                    card.classList.remove(
                        "mensagem-nao-lida"
                    );

                    card.classList.remove(
                        "mensagem-lida"
                    );

                    card.classList.add(
                        "mensagem-respondida"
                    );


                    status.className =
                        "admin-mensagem-status respondida";

                    status.textContent =
                        "RESPONDIDA";


                    respostaArea.innerHTML =
                        "";


                    respostaArea.appendChild(
                        respostaTitulo
                    );


                    respostaTitulo.textContent =
                        "RESPOSTA ENVIADA";


                    const respostaExistente =
                        document.createElement("div");


                    respostaExistente.classList.add(
                        "admin-resposta-existente"
                    );


                    respostaExistente.textContent =
                        resposta;


                    respostaArea.appendChild(
                        respostaExistente
                    );


                    const confirmacao =
                        document.createElement("small");


                    confirmacao.textContent =
                        "Resposta salva com sucesso.";


                    respostaArea.appendChild(
                        confirmacao
                    );


                    /* =============================
                       REMOVE BOTÃO DE LER
                    ============================== */

                    const botaoMarcarLida =
                        acoes.querySelector(
                            ".marcar-lida"
                        );


                    if (botaoMarcarLida) {

                        botaoMarcarLida.remove();
                    }


                } catch (erro) {

                    console.error(
                        "Erro ao responder mensagem:",
                        erro
                    );


                    alert(
                        "Não foi possível enviar a resposta."
                    );


                    botaoResponder.disabled =
                        false;

                    textarea.disabled =
                        false;

                    botaoResponder.textContent =
                        "Enviar resposta";
                }
            }
        );


        respostaArea.appendChild(
            textarea
        );


        respostaArea.appendChild(
            contador
        );


        respostaArea.appendChild(
            botaoResponder
        );
    }


    /* =====================================
       AÇÕES
    ====================================== */

    const acoes =
        document.createElement("div");

    acoes.classList.add(
        "admin-mensagem-acoes"
    );


    /* =====================================
       MARCAR COMO LIDA
    ====================================== */

    if (
        mensagem.lida !== true
    ) {

        const marcarLida =
            document.createElement("button");


        marcarLida.type =
            "button";


        marcarLida.classList.add(
            "admin-mensagem-btn",
            "marcar-lida"
        );


        marcarLida.textContent =
            "Marcar como lida";


        marcarLida.addEventListener(
            "click",
            async () => {

                marcarLida.disabled =
                    true;

                marcarLida.textContent =
                    "Salvando...";


                try {

                    await updateDoc(

                        doc(
                            db,
                            "mensagens",
                            mensagem.id
                        ),

                        {
                            lida: true,

                            lidaEm:
                                serverTimestamp()
                        }
                    );


                    mensagem.lida =
                        true;


                    card.classList.remove(
                        "mensagem-nao-lida"
                    );


                    card.classList.add(
                        "mensagem-lida"
                    );


                    status.classList.remove(
                        "nova"
                    );


                    status.classList.add(
                        "lida"
                    );


                    status.textContent =
                        "LIDA";


                    marcarLida.remove();


                } catch (erro) {

                    console.error(
                        "Erro ao marcar mensagem:",
                        erro
                    );


                    marcarLida.disabled =
                        false;


                    marcarLida.textContent =
                        "Marcar como lida";


                    alert(
                        "Não foi possível marcar a mensagem como lida."
                    );
                }
            }
        );


        acoes.appendChild(
            marcarLida
        );
    }


    /* =====================================
       APAGAR MENSAGEM
    ====================================== */

    const apagar =
        document.createElement("button");


    apagar.type =
        "button";


    apagar.classList.add(
        "admin-mensagem-btn",
        "apagar-mensagem"
    );


    apagar.textContent =
        "Apagar";


    apagar.addEventListener(
        "click",
        async () => {

            const confirmou =
                window.confirm(
                    "Deseja apagar esta mensagem permanentemente?"
                );


            if (!confirmou) {
                return;
            }


            apagar.disabled =
                true;


            apagar.textContent =
                "Apagando...";


            try {

                await deleteDoc(

                    doc(
                        db,
                        "mensagens",
                        mensagem.id
                    )
                );


                card.remove();


            } catch (erro) {

                console.error(
                    "Erro ao apagar mensagem:",
                    erro
                );


                apagar.disabled =
                    false;


                apagar.textContent =
                    "Apagar";


                alert(
                    "Não foi possível apagar a mensagem."
                );
            }
        }
    );


    acoes.appendChild(
        apagar
    );


    /* =====================================
       MONTAR CARD
    ====================================== */

    card.append(
        topo,
        assunto,
        corpo,
        respostaArea,
        acoes
    );


    return card;
}


/* =========================================
   CARREGAR MENSAGENS
========================================= */

async function carregarMensagens() {

    if (!listaMensagens) {
        return [];
    }


    try {

        const resultado =
            await getDocs(
                collection(
                    db,
                    "mensagens"
                )
            );


        const mensagens = [];


        resultado.forEach(
            (documento) => {

                mensagens.push({

                    id: documento.id,

                    ...documento.data()

                });
            }
        );


        mensagens.sort(
            (a, b) =>
                timestampParaNumero(
                    b.criadoEm
                ) -
                timestampParaNumero(
                    a.criadoEm
                )
        );


        listaMensagens.innerHTML =
            "";


        if (mensagens.length === 0) {

            const vazio =
                document.createElement("div");

            vazio.classList.add(
                "admin-vazio"
            );

            vazio.textContent =
                "Nenhuma mensagem recebida.";


            listaMensagens.appendChild(
                vazio
            );


            return mensagens;
        }


        mensagens.forEach(
            (mensagem) => {

                listaMensagens.appendChild(
                    criarCardMensagem(
                        mensagem
                    )
                );
            }
        );


        return mensagens;


    } catch (erro) {

        console.error(
            "Erro ao carregar mensagens:",
            erro
        );


        listaMensagens.innerHTML = `
            <div class="admin-erro">
                Não foi possível carregar as mensagens.
            </div>
        `;


        return [];
    }
}


/* =========================================
   REGISTRAR VISUALIZAÇÃO ADMIN
========================================= */

function registrarVisualizacaoAdmin() {

    try {

        localStorage.setItem(
            "c3_admin_ultima_visualizacao",
            String(Date.now())
        );

    } catch (erro) {

        console.warn(
            "Não foi possível registrar a visualização:",
            erro
        );
    }
}


/* =========================================
   VERIFICAR ADMINISTRADOR
========================================= */

async function verificarAdministrador(
    user
) {

    if (!user) {
        return false;
    }


    try {

        const referencia =
            doc(
                db,
                "usuarios",
                user.uid
            );


        const resultado =
            await getDoc(
                referencia
            );


        if (!resultado.exists()) {
            return false;
        }


        const dados =
            resultado.data();


        return dados.admin === true;


    } catch (erro) {

        console.error(
            "Erro ao verificar administrador:",
            erro
        );


        return false;
    }
}


/* =========================================
   MOSTRAR PAINEL
========================================= */

async function carregarPainel(
    user
) {

    try {

        if (nomeAdmin) {

            nomeAdmin.textContent =
                user.displayName ||
                user.email ||
                "Administrador";
        }


        await carregarReservas();

        await carregarMensagens();

        registrarVisualizacaoAdmin();


        /* =================================
           MOSTRAR PAINEL
        ================================== */

        if (loading) {

            loading.hidden =
                true;
        }


        if (negado) {

            negado.hidden =
                true;
        }


        if (conteudo) {

            conteudo.hidden =
                false;
        }


    } catch (erro) {

        console.error(
            "Erro ao carregar painel:",
            erro
        );


        /* =================================
           MOSTRAR ACESSO NEGADO
        ================================== */

        if (loading) {

            loading.hidden =
                true;
        }


        if (conteudo) {

            conteudo.hidden =
                true;
        }


        if (negado) {

            negado.hidden =
                false;
        }
    }
}


/* =========================================
   ACESSO AO PAINEL
========================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.replace(
                "./login.html"
            );

            return;
        }


        const ehAdministrador =
            await verificarAdministrador(
                user
            );


        if (!ehAdministrador) {

            if (loading) {

                loading.hidden =
                    true;
            }


            if (conteudo) {

                conteudo.hidden =
                    true;
            }


            if (negado) {

                negado.hidden =
                    false;
            }


            return;
        }


        await carregarPainel(
            user
        );
    }
);


/* =========================================
   LOGOUT
========================================= */

if (botaoSair) {

    botaoSair.addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );


                window.location.replace(
                    "./login.html"
                );


            } catch (erro) {

                console.error(
                    "Erro ao sair:",
                    erro
                );


                alert(
                    "Não foi possível sair da conta."
                );
            }
        }
    );
}