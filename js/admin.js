/* =========================================
   C3 BAR & LOUNGE
   PAINEL ADMINISTRATIVO
========================================= */


/* =========================================
   FIREBASE AUTH
========================================= */

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/* =========================================
   FIREBASE FIRESTORE
========================================= */

import {
    doc,
    getDoc,
    collection,
    onSnapshot,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================
   FIREBASE DO PROJETO
========================================= */

import {
    auth,
    db
} from "./firebase.js";



/* =========================================
   ELEMENTOS PRINCIPAIS
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
    document.querySelector(
        "#admin-reservas-proximas"
    );


const listaReservasAntigas =
    document.querySelector(
        "#admin-reservas-antigas"
    );



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
    document.querySelector(
        "#admin-confirmadas"
    );


const canceladasElemento =
    document.querySelector(
        "#admin-canceladas"
    );



/* =========================================
   BOTÃO SAIR
========================================= */

const botaoSair =
    document.querySelector("#admin-sair");



/* =========================================
   CONTROLE DOS LISTENERS
========================================= */

let pararReservas = null;

let pararMensagens = null;



/* =========================================
   DATA LOCAL
========================================= */

function dataLocalISO() {

    const agora =
        new Date();


    const ano =
        agora.getFullYear();


    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            agora.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${ano}-${mes}-${dia}`
    );
}



/* =========================================
   FORMATAR DATA
========================================= */

function formatarData(
    data
) {

    if (!data) {

        return (
            "Data não informada"
        );
    }


    const partes =
        data.split("-");


    if (
        partes.length !== 3
    ) {

        return data;
    }


    return (
        `${partes[2]}/${partes[1]}/${partes[0]}`
    );
}



/* =========================================
   TIMESTAMP FIREBASE
========================================= */

function timestampParaNumero(
    timestamp
) {

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

        return (
            timestamp.seconds *
            1000
        );
    }


    return 0;
}



/* =========================================
   FORMATAR TIMESTAMP
========================================= */

function formatarTimestamp(
    timestamp
) {

    const numero =
        timestampParaNumero(
            timestamp
        );


    if (!numero) {

        return (
            "Agora"
        );
    }


    const data =
        new Date(
            numero
        );


    return (
        data.toLocaleString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        )
    );
}



/* =========================================
   FORMATAR STATUS DA RESERVA
========================================= */

function formatarStatus(
    status
) {

    switch (status) {

        case "confirmada":

            return (
                "Confirmada"
            );


        case "cancelada":

            return (
                "Cancelada"
            );


        default:

            return (
                "Pendente"
            );
    }
}



/* =========================================
   CRIAR BOTÃO DE RESERVA
========================================= */

function criarBotao(
    texto,
    classe,
    funcao
) {

    const botao =
        document.createElement(
            "button"
        );


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
                status:
                    novoStatus,

                atualizadoEm:
                    serverTimestamp()
            }
        );


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
   CARD DA RESERVA
========================================= */

function criarCardReserva(
    reserva
) {

    const card =
        document.createElement(
            "article"
        );


    card.classList.add(
        "admin-reserva-card"
    );



    /* =====================================
       TOPO
    ===================================== */

    const topo =
        document.createElement(
            "div"
        );


    topo.classList.add(
        "admin-reserva-topo"
    );


    const cliente =
        document.createElement(
            "div"
        );


    const nome =
        document.createElement(
            "h3"
        );


    nome.textContent =
        reserva.nome ||
        "Cliente C3";


    const email =
        document.createElement(
            "p"
        );


    email.textContent =
        reserva.email ||
        "E-mail não informado";


    cliente.append(
        nome,
        email
    );



    /* =====================================
       STATUS
    ===================================== */

    const status =
        document.createElement(
            "span"
        );


    status.classList.add(
        "admin-reserva-status",
        reserva.status ||
            "pendente"
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
    ===================================== */

    const infos =
        document.createElement(
            "div"
        );


    infos.classList.add(
        "admin-reserva-infos"
    );


    const dados = [

        {
            label:
                "DATA",

            valor:
                formatarData(
                    reserva.data
                )
        },

        {
            label:
                "HORÁRIO",

            valor:
                reserva.horario ||
                "--:--"
        },

        {
            label:
                "PESSOAS",

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
                document.createElement(
                    "div"
                );


            const label =
                document.createElement(
                    "span"
                );


            label.textContent =
                dado.label;


            const valor =
                document.createElement(
                    "strong"
                );


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


    card.append(
        topo,
        infos
    );



    /* =====================================
       OBSERVAÇÕES
    ===================================== */

    if (
        reserva.observacoes
    ) {

        const observacoes =
            document.createElement(
                "div"
            );


        observacoes.classList.add(
            "admin-reserva-observacoes"
        );


        const titulo =
            document.createElement(
                "span"
            );


        titulo.textContent =
            "OBSERVAÇÕES";


        const texto =
            document.createElement(
                "p"
            );


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
    ===================================== */

    const acoes =
        document.createElement(
            "div"
        );


    acoes.classList.add(
        "admin-reserva-acoes"
    );



    /* =====================================
       CONFIRMAR
    ===================================== */

    if (
        reserva.status !==
            "confirmada" &&

        reserva.status !==
            "cancelada"
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



    /* =====================================
       CANCELAR
    ===================================== */

    if (
        reserva.status !==
        "cancelada"
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



    /* =====================================
       APAGAR
    ===================================== */

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



    /* =====================================
       ADICIONAR AÇÕES
    ===================================== */

    if (
        acoes.children.length > 0
    ) {

        card.appendChild(
            acoes
        );
    }


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

                reserva.status ===
                    "pendente"

        ).length;


    const confirmadas =
        reservas.filter(
            (reserva) =>

                reserva.status ===
                    "confirmada"

        ).length;


    const canceladas =
        reservas.filter(
            (reserva) =>

                reserva.status ===
                    "cancelada"

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


    if (
        reservas.length === 0
    ) {

        const vazio =
            document.createElement(
                "div"
            );


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
   RENDERIZAR TODAS AS RESERVAS
========================================= */

function renderizarPainelReservas(
    reservas
) {

    atualizarEstatisticas(
        reservas
    );


    const hoje =
        dataLocalISO();



    /* =====================================
       HOJE
    ===================================== */

    const reservasHoje =
        reservas.filter(
            (reserva) =>

                reserva.data ===
                hoje
        );


    reservasHoje.sort(
        (a, b) => {

            const horarioA =
                a.horario || "";


            const horarioB =
                b.horario || "";


            return (
                horarioA.localeCompare(
                    horarioB
                )
            );
        }
    );



    /* =====================================
       PRÓXIMAS
    ===================================== */

    const reservasProximas =
        reservas.filter(
            (reserva) =>

                reserva.data &&

                reserva.data >
                    hoje &&

                reserva.status !==
                    "cancelada"
        );


    reservasProximas.sort(
        (a, b) => {

            const reservaA =
                `${a.data || ""} ${a.horario || ""}`;


            const reservaB =
                `${b.data || ""} ${b.horario || ""}`;


            return (
                reservaA.localeCompare(
                    reservaB
                )
            );
        }
    );



    /* =====================================
       HISTÓRICO
    ===================================== */

    const reservasAntigas =
        reservas.filter(
            (reserva) => {

                if (
                    !reserva.data
                ) {

                    return false;
                }


                const passou =
                    reserva.data <
                    hoje;


                const futuraCancelada =
                    reserva.data >
                        hoje &&

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


            return (
                reservaB.localeCompare(
                    reservaA
                )
            );
        }
    );



    /* =====================================
       MOSTRAR
    ===================================== */

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
}



/* =========================================
   CARD DE MENSAGEM
========================================= */

function criarCardMensagem(
    mensagem
) {

    const card =
        document.createElement(
            "article"
        );


    card.classList.add(
        "admin-mensagem-card"
    );



    /* =====================================
       ESTADO VISUAL
    ===================================== */

    if (
        mensagem.respondido
    ) {

        card.classList.add(
            "mensagem-respondida"
        );

    } else if (
        mensagem.lida
    ) {

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
    ===================================== */

    const topo =
        document.createElement(
            "div"
        );


    topo.classList.add(
        "admin-mensagem-topo"
    );


    const usuario =
        document.createElement(
            "div"
        );


    const nome =
        document.createElement(
            "h3"
        );


    nome.textContent =
        mensagem.nome ||
        "Visitante";


    const email =
        document.createElement(
            "p"
        );


    email.textContent =
        mensagem.email ||
        "E-mail não informado";


    usuario.append(
        nome,
        email
    );



    /* =====================================
       STATUS / DATA
    ===================================== */

    const lado =
        document.createElement(
            "div"
        );


    lado.classList.add(
        "admin-mensagem-meta"
    );


    const tipo =
        document.createElement(
            "span"
        );


    tipo.classList.add(
        "admin-mensagem-nova"
    );


    tipo.textContent =
        mensagem.respondido
            ? "RESPONDIDA"
            : mensagem.lida
                ? "LIDA"
                : "NOVA";


    const data =
        document.createElement(
            "small"
        );


    data.textContent =
        formatarTimestamp(
            mensagem.criadoEm
        );


    lado.append(
        tipo,
        data
    );


    topo.append(
        usuario,
        lado
    );



    /* =====================================
       ASSUNTO
    ===================================== */

    const assunto =
        document.createElement(
            "div"
        );


    assunto.classList.add(
        "admin-mensagem-assunto"
    );


    const assuntoLabel =
        document.createElement(
            "span"
        );


    assuntoLabel.textContent =
        "ASSUNTO";


    const assuntoTexto =
        document.createElement(
            "strong"
        );


    assuntoTexto.textContent =
        mensagem.assunto ||
        "Sem assunto";


    assunto.append(
        assuntoLabel,
        assuntoTexto
    );



    /* =====================================
       CORPO
    ===================================== */

    const corpo =
        document.createElement(
            "div"
        );


    corpo.classList.add(
        "admin-mensagem-corpo"
    );


    const texto =
        document.createElement(
            "p"
        );


    texto.textContent =
        mensagem.mensagem ||
        "Mensagem vazia.";


    corpo.appendChild(
        texto
    );


    card.append(
        topo,
        assunto,
        corpo
    );



    /* =====================================
       RESPOSTA EXISTENTE
    ===================================== */

    if (
        mensagem.resposta
    ) {

        const resposta =
            document.createElement(
                "div"
            );


        resposta.classList.add(
            "admin-mensagem-resposta"
        );


        const titulo =
            document.createElement(
                "strong"
            );


        titulo.textContent =
            "RESPOSTA ENVIADA";


        const respostaTexto =
            document.createElement(
                "p"
            );


        respostaTexto.textContent =
            mensagem.resposta;


        resposta.append(
            titulo,
            respostaTexto
        );


        card.appendChild(
            resposta
        );

    } else {

        /* =====================================
           ÁREA PARA RESPONDER
        ===================================== */

        const areaResposta =
            document.createElement(
                "div"
            );


        areaResposta.classList.add(
            "admin-resposta-area"
        );


        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.classList.add(
            "admin-resposta-input"
        );


        textarea.maxLength =
            1000;


        textarea.rows =
            4;


        textarea.placeholder =
            "Digite a resposta para o cliente...";


        const contador =
            document.createElement(
                "small"
            );


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


        const botoes =
            document.createElement(
                "div"
            );


        botoes.classList.add(
            "admin-resposta-acoes"
        );


        const enviar =
            document.createElement(
                "button"
            );


        enviar.type =
            "button";


        enviar.classList.add(
            "admin-botao-responder"
        );


        enviar.textContent =
            "Enviar resposta";


        enviar.addEventListener(
            "click",
            async () => {

                await responderMensagem(
                    mensagem.id,
                    textarea,
                    enviar
                );

            }
        );


        botoes.appendChild(
            enviar
        );


        areaResposta.append(
            textarea,
            contador,
            botoes
        );


        card.appendChild(
            areaResposta
        );
    }



    /* =====================================
       AÇÕES DA MENSAGEM
    ===================================== */

    const acoes =
        document.createElement(
            "div"
        );


    acoes.classList.add(
        "admin-mensagem-acoes"
    );



    /* =====================================
       MARCAR COMO LIDA
    ===================================== */

    if (
        !mensagem.lida
    ) {

        const ler =
            document.createElement(
                "button"
            );


        ler.type =
            "button";


        ler.classList.add(
            "admin-marcar-lida"
        );


        ler.textContent =
            "Marcar como lida";


        ler.addEventListener(
            "click",
            async () => {

                await marcarMensagemComoLida(
                    mensagem.id
                );

            }
        );


        acoes.appendChild(
            ler
        );
    }



    /* =====================================
       APAGAR
    ===================================== */

    const apagar =
        document.createElement(
            "button"
        );


    apagar.type =
        "button";


    apagar.classList.add(
        "admin-apagar-mensagem"
    );


    apagar.textContent =
        "Apagar mensagem";


    apagar.addEventListener(
        "click",
        async () => {

            await apagarMensagem(
                mensagem.id
            );

        }
    );


    acoes.appendChild(
        apagar
    );


    card.appendChild(
        acoes
    );


    return card;
}



/* =========================================
   RESPONDER MENSAGEM
========================================= */

async function responderMensagem(
    mensagemId,
    textarea,
    botao
) {

    const resposta =
        textarea.value.trim();


    if (!resposta) {

        alert(
            "Digite uma resposta antes de enviar."
        );

        return;
    }


    if (
        resposta.length > 1000
    ) {

        alert(
            "A resposta pode ter no máximo 1000 caracteres."
        );

        return;
    }


    try {

        botao.disabled =
            true;


        botao.textContent =
            "Enviando...";


        await updateDoc(

            doc(
                db,
                "mensagens",
                mensagemId
            ),

            {
                resposta:
                    resposta,

                respondido:
                    true,

                respondidoEm:
                    serverTimestamp(),

                lida:
                    true
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao responder mensagem:",
            erro
        );


        alert(
            "Não foi possível enviar a resposta."
        );


        botao.disabled =
            false;


        botao.textContent =
            "Enviar resposta";
    }
}



/* =========================================
   MARCAR MENSAGEM COMO LIDA
========================================= */

async function marcarMensagemComoLida(
    mensagemId
) {

    try {

        await updateDoc(

            doc(
                db,
                "mensagens",
                mensagemId
            ),

            {
                lida:
                    true
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao marcar mensagem como lida:",
            erro
        );


        alert(
            "Não foi possível marcar a mensagem como lida."
        );
    }
}



/* =========================================
   APAGAR MENSAGEM
========================================= */

async function apagarMensagem(
    mensagemId
) {

    const confirmou =
        window.confirm(
            "Tem certeza que deseja apagar esta mensagem?"
        );


    if (!confirmou) {

        return;
    }


    try {

        await deleteDoc(

            doc(
                db,
                "mensagens",
                mensagemId
            )
        );


    } catch (erro) {

        console.error(
            "Erro ao apagar mensagem:",
            erro
        );


        alert(
            "Não foi possível apagar a mensagem."
        );
    }
}



/* =========================================
   RENDERIZAR MENSAGENS
========================================= */

function renderizarMensagens(
    mensagens
) {

    if (!listaMensagens) {

        return;
    }


    listaMensagens.innerHTML =
        "";


    if (
        mensagens.length === 0
    ) {

        const vazio =
            document.createElement(
                "div"
            );


        vazio.classList.add(
            "admin-vazio"
        );


        vazio.textContent =
            "Nenhuma mensagem recebida.";


        listaMensagens.appendChild(
            vazio
        );


        return;
    }


    mensagens.sort(
        (a, b) => {

            return (
                timestampParaNumero(
                    b.criadoEm
                ) -

                timestampParaNumero(
                    a.criadoEm
                )
            );
        }
    );


    mensagens.forEach(
        (mensagem) => {

            listaMensagens.appendChild(
                criarCardMensagem(
                    mensagem
                )
            );
        }
    );
}



/* =========================================
   LISTENER DE RESERVAS
========================================= */

function iniciarListenerReservas() {

    if (pararReservas) {

        pararReservas();
    }


    pararReservas =
        onSnapshot(

            collection(
                db,
                "reservas"
            ),

            (snapshot) => {

                const reservas =
                    [];


                snapshot.forEach(
                    (documento) => {

                        reservas.push({

                            id:
                                documento.id,

                            ...documento.data()

                        });

                    }
                );


                renderizarPainelReservas(
                    reservas
                );

            },

            (erro) => {

                console.error(
                    "Erro no listener de reservas:",
                    erro
                );


                if (listaReservas) {

                    listaReservas.innerHTML =
                        `
                            <div class="admin-erro">
                                Não foi possível carregar as reservas.
                            </div>
                        `;
                }

            }
        );
}



/* =========================================
   LISTENER DE MENSAGENS
========================================= */

function iniciarListenerMensagens() {

    if (pararMensagens) {

        pararMensagens();
    }


    pararMensagens =
        onSnapshot(

            collection(
                db,
                "mensagens"
            ),

            (snapshot) => {

                const mensagens =
                    [];


                snapshot.forEach(
                    (documento) => {

                        mensagens.push({

                            id:
                                documento.id,

                            ...documento.data()

                        });

                    }
                );


                renderizarMensagens(
                    mensagens
                );

            },

            (erro) => {

                console.error(
                    "Erro no listener de mensagens:",
                    erro
                );


                if (listaMensagens) {

                    listaMensagens.innerHTML =
                        `
                            <div class="admin-erro">
                                Não foi possível carregar as mensagens.
                            </div>
                        `;
                }

            }
        );
}



/* =========================================
   PARAR LISTENERS
========================================= */

function pararListeners() {

    if (pararReservas) {

        pararReservas();

        pararReservas =
            null;
    }


    if (pararMensagens) {

        pararMensagens();

        pararMensagens =
            null;
    }
}



/* =========================================
   REGISTRAR VISUALIZAÇÃO
========================================= */

function registrarVisualizacaoAdmin() {

    localStorage.setItem(
        "c3_admin_ultima_visualizacao",
        String(
            Date.now()
        )
    );
}



/* =========================================
   VERIFICAR ADMINISTRADOR
========================================= */

async function verificarAdministrador(
    user
) {

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


        /* =====================================
           NÃO É ADMIN
        ===================================== */

        if (
            !resultado.exists() ||

            resultado.data().admin !==
                true
        ) {

            pararListeners();


            if (loading) {

                loading.hidden =
                    true;
            }


            if (negado) {

                negado.hidden =
                    false;
            }


            if (conteudo) {

                conteudo.hidden =
                    true;
            }


            return;
        }



        /* =====================================
           É ADMIN
        ===================================== */

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



        /* =====================================
           NOME DO ADMIN
        ===================================== */

        if (nomeAdmin) {

            nomeAdmin.textContent =

                user.displayName ||

                user.email ||

                "Administrador";
        }



        /* =====================================
           INICIAR TEMPO REAL
        ===================================== */

        iniciarListenerReservas();

        iniciarListenerMensagens();


        registrarVisualizacaoAdmin();


    } catch (erro) {

        console.error(
            "Erro ao verificar administrador:",
            erro
        );


        pararListeners();


        if (loading) {

            loading.hidden =
                true;
        }


        if (negado) {

            negado.hidden =
                false;
        }


        if (conteudo) {

            conteudo.hidden =
                true;
        }
    }
}



/* =========================================
   AUTENTICAÇÃO
========================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            pararListeners();


            window.location.replace(
                "./login.html"
            );


            return;
        }


        await verificarAdministrador(
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

                pararListeners();


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