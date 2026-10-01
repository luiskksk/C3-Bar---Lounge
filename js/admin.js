import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    onSnapshot,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


/* =====================================
   ELEMENTOS
===================================== */

const loading =
    document.querySelector("#admin-loading");

const negado =
    document.querySelector("#admin-negado");

const conteudo =
    document.querySelector("#admin-conteudo");

const nomeAdmin =
    document.querySelector("#admin-nome");

const reservasHoje =
    document.querySelector("#admin-reservas");

const reservasProximas =
    document.querySelector("#admin-reservas-proximas");

const reservasAntigas =
    document.querySelector("#admin-reservas-antigas");

const listaMensagens =
    document.querySelector("#admin-mensagens");

const totalElemento =
    document.querySelector("#admin-total");

const pendentesElemento =
    document.querySelector("#admin-pendentes");

const confirmadasElemento =
    document.querySelector("#admin-confirmadas");

const canceladasElemento =
    document.querySelector("#admin-canceladas");

const botaoSair =
    document.querySelector("#admin-sair");


/* =====================================
   LISTENERS
===================================== */

let pararReservas = null;
let pararMensagens = null;


/* =====================================
   DATA
===================================== */

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

    return new Date(
        ano,
        mes - 1,
        dia
    ).toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* =====================================
   TIMESTAMP
===================================== */

function timestampParaNumero(timestamp) {

    if (!timestamp) {
        return 0;
    }

    if (
        typeof timestamp.toMillis === "function"
    ) {
        return timestamp.toMillis();
    }

    if (
        typeof timestamp.toDate === "function"
    ) {
        return timestamp.toDate().getTime();
    }

    if (timestamp instanceof Date) {
        return timestamp.getTime();
    }

    if (typeof timestamp === "number") {
        return timestamp;
    }

    return 0;
}


function formatarTimestamp(timestamp) {

    const numero =
        timestampParaNumero(timestamp);

    if (!numero) {
        return "Data não disponível";
    }

    const data =
        new Date(numero);

    return (
        data.toLocaleDateString(
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
        )
    );
}


/* =====================================
   STATUS
===================================== */

function formatarStatus(status) {

    if (status === "confirmada") {
        return "Confirmada";
    }

    if (status === "cancelada") {
        return "Cancelada";
    }

    return "Pendente";
}


/* =====================================
   VERIFICAR ADMIN
===================================== */

async function verificarAdministrador(user) {

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


/* =====================================
   PARAR LISTENERS
===================================== */

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


/* =====================================
   ALTERAR STATUS DA RESERVA
===================================== */

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
                status: novoStatus
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao alterar status:",
            erro
        );

        alert(
            "Não foi possível alterar o status da reserva."
        );
    }
}


/* =====================================
   APAGAR RESERVA
===================================== */

async function apagarReserva(
    reservaId
) {

    const confirmar =
        window.confirm(
            "Deseja realmente apagar esta reserva?"
        );

    if (!confirmar) {
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


/* =====================================
   CRIAR BOTÃO
===================================== */

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
        "admin-acao",
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


/* =====================================
   CARD DE RESERVA
===================================== */

function criarCardReserva(
    reserva
) {

    const card =
        document.createElement("article");

    card.classList.add(
        "admin-reserva-card"
    );


    /* TOPO */

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
        document.createElement("strong");

    nome.textContent =
        reserva.nome ||
        "Cliente";


    const email =
        document.createElement("span");

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
        "reserva-status",
        reserva.status || "pendente"
    );

    status.textContent =
        formatarStatus(
            reserva.status
        );


    topo.append(
        cliente,
        status
    );


    /* DETALHES */

    const detalhes =
        document.createElement("div");

    detalhes.classList.add(
        "admin-reserva-detalhes"
    );


    const blocoData =
        document.createElement("div");

    const tituloData =
        document.createElement("span");

    tituloData.textContent =
        "DATA";

    const valorData =
        document.createElement("strong");

    valorData.textContent =
        formatarData(
            reserva.data
        );

    blocoData.append(
        tituloData,
        valorData
    );


    const blocoHorario =
        document.createElement("div");

    const tituloHorario =
        document.createElement("span");

    tituloHorario.textContent =
        "HORÁRIO";

    const valorHorario =
        document.createElement("strong");

    valorHorario.textContent =
        reserva.horario ||
        "--:--";

    blocoHorario.append(
        tituloHorario,
        valorHorario
    );


    const blocoPessoas =
        document.createElement("div");

    const tituloPessoas =
        document.createElement("span");

    tituloPessoas.textContent =
        "PESSOAS";

    const valorPessoas =
        document.createElement("strong");

    valorPessoas.textContent =
        reserva.pessoas || 0;

    blocoPessoas.append(
        tituloPessoas,
        valorPessoas
    );


    detalhes.append(
        blocoData,
        blocoHorario,
        blocoPessoas
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
            "admin-reserva-observacoes"
        );

        observacoes.textContent =
            reserva.observacoes;

        card.appendChild(
            observacoes
        );
    }


    /* AÇÕES */

    const acoes =
        document.createElement("div");

    acoes.classList.add(
        "admin-reserva-acoes"
    );


    if (
        reserva.status !== "confirmada"
    ) {

        acoes.appendChild(
            criarBotao(
                "Confirmar",
                "admin-confirmar",
                () => {
                    alterarStatus(
                        reserva.id,
                        "confirmada"
                    );
                }
            )
        );
    }


    if (
        reserva.status !== "cancelada"
    ) {

        acoes.appendChild(
            criarBotao(
                "Cancelar",
                "admin-cancelar",
                () => {
                    alterarStatus(
                        reserva.id,
                        "cancelada"
                    );
                }
            )
        );
    }


    acoes.appendChild(
        criarBotao(
            "Apagar",
            "admin-apagar",
            () => {
                apagarReserva(
                    reserva.id
                );
            }
        )
    );


    card.appendChild(
        acoes
    );


    return card;
}


/* =====================================
   ESTATÍSTICAS
===================================== */

function atualizarEstatisticas(
    reservas
) {

    const total =
        reservas.length;

    const pendentes =
        reservas.filter(
            reserva =>
                reserva.status === "pendente"
        ).length;

    const confirmadas =
        reservas.filter(
            reserva =>
                reserva.status === "confirmada"
        ).length;

    const canceladas =
        reservas.filter(
            reserva =>
                reserva.status === "cancelada"
        ).length;


    if (totalElemento) {
        totalElemento.textContent =
            total;
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


/* =====================================
   RENDERIZAR LISTA
===================================== */

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
        reserva => {

            elemento.appendChild(
                criarCardReserva(
                    reserva
                )
            );

        }
    );
}


/* =====================================
   RENDERIZAR RESERVAS
===================================== */

function renderizarPainelReservas(
    reservas
) {

    const hoje =
        dataLocalISO();


    const hojeLista =
        reservas.filter(
            reserva =>
                reserva.data === hoje &&
                reserva.status !== "cancelada"
        );


    const futuras =
        reservas.filter(
            reserva =>
                reserva.data > hoje &&
                reserva.status !== "cancelada"
        );


    const antigas =
        reservas.filter(
            reserva =>
                reserva.data < hoje ||
                reserva.status === "cancelada"
        );


    hojeLista.sort(
        (a, b) =>
            `${a.data || ""} ${a.horario || ""}`
                .localeCompare(
                    `${b.data || ""} ${b.horario || ""}`
                )
    );


    futuras.sort(
        (a, b) =>
            `${a.data || ""} ${a.horario || ""}`
                .localeCompare(
                    `${b.data || ""} ${b.horario || ""}`
                )
    );


    antigas.sort(
        (a, b) =>
            `${b.data || ""} ${b.horario || ""}`
                .localeCompare(
                    `${a.data || ""} ${a.horario || ""}`
                )
    );


    renderizarReservas(
        reservasHoje,
        hojeLista,
        "Nenhuma reserva para hoje."
    );


    renderizarReservas(
        reservasProximas,
        futuras,
        "Nenhuma reserva próxima."
    );


    renderizarReservas(
        reservasAntigas,
        antigas,
        "Nenhuma reserva no histórico."
    );
}


/* =====================================
   RESPONDER MENSAGEM
===================================== */

async function responderMensagem(
    mensagemId,
    textarea,
    botao
) {

    const resposta =
        textarea.value.trim();


    if (!resposta) {

        alert(
            "Digite uma resposta."
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

                respondidoPor:
                    auth.currentUser?.email ||
                    "Administrador",

                lida:
                    true,

                lidaEm:
                    serverTimestamp()
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


/* =====================================
   MARCAR MENSAGEM COMO LIDA
===================================== */

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
                    true,

                lidaEm:
                    serverTimestamp()
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao marcar mensagem como lida:",
            erro
        );
    }
}


/* =====================================
   APAGAR MENSAGEM
===================================== */

async function apagarMensagem(
    mensagemId
) {

    const confirmar =
        window.confirm(
            "Deseja realmente apagar esta mensagem?"
        );

    if (!confirmar) {
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


/* =====================================
   CARD DE MENSAGEM
===================================== */

function criarCardMensagem(
    mensagem
) {

    const card =
        document.createElement("article");

    card.classList.add(
        "admin-mensagem-card"
    );


    if (mensagem.respondido) {

        card.classList.add(
            "mensagem-respondida"
        );

    } else if (mensagem.lida) {

        card.classList.add(
            "mensagem-lida"
        );

    } else {

        card.classList.add(
            "mensagem-nao-lida"
        );
    }


    /* TOPO */

    const topo =
        document.createElement("div");

    topo.classList.add(
        "admin-mensagem-topo"
    );


    const dados =
        document.createElement("div");


    const nome =
        document.createElement("strong");

    nome.textContent =
        mensagem.nome ||
        "Usuário";


    const email =
        document.createElement("span");

    email.textContent =
        mensagem.email ||
        "E-mail não informado";


    dados.append(
        nome,
        email
    );


    const data =
        document.createElement("small");

    data.textContent =
        formatarTimestamp(
            mensagem.criadoEm
        );


    topo.append(
        dados,
        data
    );


    /* ASSUNTO */

    const assunto =
        document.createElement("h3");

    assunto.textContent =
        mensagem.assunto ||
        "Sem assunto";


    /* TEXTO */

    const texto =
        document.createElement("p");

    texto.textContent =
        mensagem.mensagem ||
        "";


    card.append(
        topo,
        assunto,
        texto
    );


    /* RESPOSTA */

    if (mensagem.resposta) {

        const resposta =
            document.createElement("div");

        resposta.classList.add(
            "admin-mensagem-resposta"
        );


        const titulo =
            document.createElement("strong");

        titulo.textContent =
            "RESPOSTA ENVIADA";


        const respostaTexto =
            document.createElement("p");

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

        /* ÁREA DE RESPOSTA */

        const areaResposta =
            document.createElement("div");

        areaResposta.classList.add(
            "admin-resposta-area"
        );


        const textarea =
            document.createElement("textarea");

        textarea.maxLength =
            1000;

        textarea.placeholder =
            "Digite a resposta para o cliente...";


        const contador =
            document.createElement("small");

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
            document.createElement("div");

        botoes.classList.add(
            "admin-resposta-acoes"
        );


        const enviar =
            document.createElement("button");

        enviar.type =
            "button";

        enviar.textContent =
            "Enviar resposta";


        enviar.addEventListener(
            "click",
            () => {

                responderMensagem(
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


    /* MARCAR COMO LIDA */

    if (!mensagem.lida) {

        const ler =
            document.createElement("button");

        ler.type =
            "button";

        ler.classList.add(
            "admin-marcar-lida"
        );

        ler.textContent =
            "Marcar como lida";


        ler.addEventListener(
            "click",
            () => {

                marcarMensagemComoLida(
                    mensagem.id
                );

            }
        );


        card.appendChild(
            ler
        );
    }


    /* APAGAR */

    const apagar =
        document.createElement("button");

    apagar.type =
        "button";

    apagar.classList.add(
        "admin-apagar-mensagem"
    );

    apagar.textContent =
        "Apagar mensagem";


    apagar.addEventListener(
        "click",
        () => {

            apagarMensagem(
                mensagem.id
            );

        }
    );


    card.appendChild(
        apagar
    );


    return card;
}


/* =====================================
   RENDERIZAR MENSAGENS
===================================== */

function renderizarMensagens(
    mensagens
) {

    if (!listaMensagens) {
        return;
    }


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

        return;
    }


    mensagens.sort(
        (a, b) =>
            timestampParaNumero(
                b.criadoEm
            ) -
            timestampParaNumero(
                a.criadoEm
            )
    );


    mensagens.forEach(
        mensagem => {

            listaMensagens.appendChild(
                criarCardMensagem(
                    mensagem
                )
            );

        }
    );
}


/* =====================================
   LISTENER DE RESERVAS
===================================== */

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

            snapshot => {

                const reservas = [];


                snapshot.forEach(
                    documento => {

                        reservas.push({
                            id:
                                documento.id,

                            ...documento.data()
                        });

                    }
                );


                atualizarEstatisticas(
                    reservas
                );


                renderizarPainelReservas(
                    reservas
                );

            },

            erro => {

                console.error(
                    "Erro ao sincronizar reservas:",
                    erro
                );


                if (reservasHoje) {

                    reservasHoje.innerHTML =
                        `
                        <div class="admin-erro">
                            Não foi possível carregar as reservas.
                        </div>
                        `;
                }
            }
        );
}


/* =====================================
   LISTENER DE MENSAGENS
===================================== */

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

            snapshot => {

                const mensagens = [];


                snapshot.forEach(
                    documento => {

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

            erro => {

                console.error(
                    "Erro ao sincronizar mensagens:",
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


/* =====================================
   ABRIR PAINEL
===================================== */

function abrirPainel(user) {

    if (nomeAdmin) {

        nomeAdmin.textContent =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Administrador";
    }


    if (loading) {
        loading.hidden = true;
    }


    if (negado) {
        negado.hidden = true;
    }


    if (conteudo) {
        conteudo.hidden = false;
    }


    iniciarListenerReservas();

    iniciarListenerMensagens();


    localStorage.setItem(
        "c3_admin_ultima_visualizacao",
        String(
            Date.now()
        )
    );
}


/* =====================================
   MOSTRAR ACESSO NEGADO
===================================== */

function mostrarAcessoNegado() {

    pararListeners();


    if (loading) {
        loading.hidden = true;
    }


    if (conteudo) {
        conteudo.hidden = true;
    }


    if (negado) {
        negado.hidden = false;
    }
}


/* =====================================
   AUTENTICAÇÃO
===================================== */

onAuthStateChanged(
    auth,
    async user => {

        /* SEM LOGIN */

        if (!user) {

            pararListeners();


            window.location.replace(
                "./login.html"
            );

            return;
        }


        /* MOSTRAR LOADING */

        if (loading) {
            loading.hidden = false;
        }

        if (negado) {
            negado.hidden = true;
        }

        if (conteudo) {
            conteudo.hidden = true;
        }


        /* VERIFICAR ADMIN */

        const ehAdmin =
            await verificarAdministrador(
                user
            );


        if (!ehAdmin) {

            mostrarAcessoNegado();

            return;
        }


        /* ADMIN CONFIRMADO */

        abrirPainel(
            user
        );
    }
);


/* =====================================
   BOTÃO SAIR
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


                pararListeners();


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


                botaoSair.disabled =
                    false;

                botaoSair.textContent =
                    "Sair da conta";
            }
        }
    );
}