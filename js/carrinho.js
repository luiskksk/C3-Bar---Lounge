import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


/* ============================================================
   CONFIGURAÇÃO
============================================================ */

const CHAVE_CARRINHO = "c3_carrinho";

let carrinho = JSON.parse(
    localStorage.getItem(CHAVE_CARRINHO)
) || [];

let usuarioAtual = null;


/* ============================================================
   FIREBASE - USUÁRIO LOGADO
============================================================ */

onAuthStateChanged(auth, (usuario) => {

    usuarioAtual = usuario;

});


/* ============================================================
   SALVAR CARRINHO
============================================================ */

function salvarCarrinho() {

    localStorage.setItem(
        CHAVE_CARRINHO,
        JSON.stringify(carrinho)
    );

}


/* ============================================================
   PREÇO
============================================================ */

function formatarPreco(valor) {

    return Number(valor)
        .toFixed(2)
        .replace(".", ",");

}


function pegarPreco(texto) {

    return Number(
        texto
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    );

}


function calcularTotal() {

    return carrinho.reduce(
        (total, produto) => {

            return total +
                Number(produto.preco) *
                Number(produto.quantidade);

        },
        0
    );

}


/* ============================================================
   AVISO
============================================================ */

function mostrarAviso(mensagem) {

    let aviso =
        document.querySelector(".c3-carrinho-aviso");


    if (!aviso) {

        aviso =
            document.createElement("div");

        aviso.className =
            "c3-carrinho-aviso";

        document.body.appendChild(aviso);

    }


    aviso.textContent = mensagem;

    aviso.classList.add("ativo");


    setTimeout(() => {

        aviso.classList.remove("ativo");

    }, 2500);

}


/* ============================================================
   ADICIONAR PRODUTO
============================================================ */

function adicionarProduto(nome, preco, imagem) {

    const existente =
        carrinho.find(
            produto =>
                produto.nome === nome
        );


    if (existente) {

        existente.quantidade++;

    } else {

        carrinho.push({

            nome: nome,

            preco: Number(preco),

            imagem: imagem,

            quantidade: 1

        });

    }


    salvarCarrinho();

    atualizarCarrinho();

    mostrarAviso(
        `${nome} foi adicionado ao carrinho.`
    );

}


/* ============================================================
   REMOVER
============================================================ */

function removerProduto(nome) {

    carrinho =
        carrinho.filter(
            produto =>
                produto.nome !== nome
        );


    salvarCarrinho();

    atualizarCarrinho();

}


/* ============================================================
   ALTERAR QUANTIDADE
============================================================ */

function alterarQuantidade(nome, valor) {

    const produto =
        carrinho.find(
            item =>
                item.nome === nome
        );


    if (!produto) {
        return;
    }


    produto.quantidade += valor;


    if (produto.quantidade <= 0) {

        removerProduto(nome);

        return;

    }


    salvarCarrinho();

    atualizarCarrinho();

}


/* ============================================================
   PREPARAR PRODUTOS
============================================================ */

function prepararProdutos() {

    const produtos =
        document.querySelectorAll(
            ".produto-loja-card"
        );


    produtos.forEach((card, index) => {

        if (
            card.querySelector(
                ".btn-adicionar-carrinho"
            )
        ) {
            return;
        }


        const nomeElemento =
            card.querySelector("h3");

        const precoElemento =
            card.querySelector("strong");

        const imagemElemento =
            card.querySelector("img");


        if (
            !nomeElemento ||
            !precoElemento
        ) {
            return;
        }


        const nome =
            nomeElemento.textContent.trim();


        const preco =
            pegarPreco(
                precoElemento.textContent
            );


        const imagem =
            imagemElemento
                ? imagemElemento.src
                : "";


        const botao =
            document.createElement("button");


        botao.type = "button";

        botao.className =
            "btn-adicionar-carrinho";


        botao.innerHTML = `
            <span>+</span>
            Adicionar ao carrinho
        `;


        botao.addEventListener(
            "click",
            () => {

                adicionarProduto(
                    nome,
                    preco,
                    imagem
                );

            }
        );


        const info =
            card.querySelector(
                ".produto-loja-info"
            );


        if (info) {

            info.appendChild(botao);

        }

    });


    /* ========================================================
       BOX C3
    ======================================================== */

    const box =
        document.querySelector(
            ".box-c3-destaque"
        );


    if (!box) {
        return;
    }


    if (
        box.querySelector(
            ".btn-adicionar-carrinho"
        )
    ) {
        return;
    }


    const imagem =
        box.querySelector("img");


    const conteudo =
        box.querySelector(
            ".box-c3-conteudo"
        );


    if (!conteudo) {
        return;
    }


    const botao =
        document.createElement("button");


    botao.type = "button";

    botao.className =
        "btn-adicionar-carrinho";


    botao.innerHTML = `
        <span>+</span>
        Adicionar ao carrinho
    `;


    botao.addEventListener(
        "click",
        () => {

            adicionarProduto(
                "Box C3",
                249.90,
                imagem
                    ? imagem.src
                    : ""
            );

        }
    );


    conteudo.appendChild(botao);

}


/* ============================================================
   CRIAR CARRINHO
============================================================ */

function criarCarrinho() {

    let estrutura =
        document.querySelector(
            "#c3-carrinho-estrutura"
        );


    if (estrutura) {
        return estrutura;
    }


    estrutura =
        document.createElement("div");


    estrutura.id =
        "c3-carrinho-estrutura";


    estrutura.innerHTML = `

        <!-- BOTÃO -->

        <button
            type="button"
            class="c3-carrinho-botao"
            aria-label="Abrir carrinho"
        >

            <span class="c3-carrinho-icone">
                🛒
            </span>

            <span class="c3-carrinho-contador">
                0
            </span>

        </button>


        <!-- OVERLAY -->

        <div
            class="c3-carrinho-overlay"
        ></div>


        <!-- CARRINHO -->

        <aside
            class="c3-carrinho"
            aria-label="Carrinho de compras"
        >

            <div
                class="c3-carrinho-header"
            >

                <div>

                    <span
                        class="c3-carrinho-tag"
                    >
                        C3 COLLECTION
                    </span>

                    <h2>
                        Seu carrinho
                    </h2>

                </div>


                <button
                    type="button"
                    class="c3-carrinho-fechar"
                    aria-label="Fechar carrinho"
                >
                    ×
                </button>

            </div>


            <div
                class="c3-carrinho-itens"
            ></div>


            <div
                class="c3-carrinho-vazio"
            >

                <div
                    class="c3-carrinho-vazio-icone"
                >
                    🛒
                </div>

                <h3>
                    Seu carrinho está vazio
                </h3>

                <p>
                    Adicione algum produto da C3 Collection
                    para começar sua compra.
                </p>

            </div>


            <div
                class="c3-carrinho-footer"
            >

                <div
                    class="c3-carrinho-total"
                >

                    <span>
                        Total
                    </span>

                    <strong>
                        R$ 0,00
                    </strong>

                </div>


                <button
                    type="button"
                    class="c3-carrinho-finalizar"
                >

                    Finalizar compra

                    <span>
                        →
                    </span>

                </button>


                <p
                    class="c3-carrinho-info"
                >
                    Seu pedido será enviado para análise
                    após a confirmação.
                </p>

            </div>

        </aside>

    `;


    document.body.appendChild(
        estrutura
    );


    return estrutura;

}


/* ============================================================
   ATUALIZAR CARRINHO
============================================================ */

function atualizarCarrinho() {

    const estrutura =
        criarCarrinho();


    const botao =
        estrutura.querySelector(
            ".c3-carrinho-botao"
        );


    const contador =
        estrutura.querySelector(
            ".c3-carrinho-contador"
        );


    const overlay =
        estrutura.querySelector(
            ".c3-carrinho-overlay"
        );


    const painel =
        estrutura.querySelector(
            ".c3-carrinho"
        );


    const itensElemento =
        estrutura.querySelector(
            ".c3-carrinho-itens"
        );


    const vazio =
        estrutura.querySelector(
            ".c3-carrinho-vazio"
        );


    const totalElemento =
        estrutura.querySelector(
            ".c3-carrinho-total strong"
        );


    const finalizar =
        estrutura.querySelector(
            ".c3-carrinho-finalizar"
        );


    const quantidade =
        carrinho.reduce(
            (total, produto) =>
                total +
                Number(produto.quantidade),
            0
        );


    /* CONTADOR */

    contador.textContent =
        quantidade;


    if (quantidade > 0) {

        contador.classList.add(
            "ativo"
        );

    } else {

        contador.classList.remove(
            "ativo"
        );

    }


    /* TOTAL */

    totalElemento.textContent =
        `R$ ${formatarPreco(
            calcularTotal()
        )}`;


    /* VAZIO */

    if (carrinho.length === 0) {

        vazio.classList.add(
            "visivel"
        );

        itensElemento.style.display =
            "none";

        finalizar.disabled = true;

        finalizar.style.opacity =
            ".45";

        finalizar.style.cursor =
            "not-allowed";

    } else {

        vazio.classList.remove(
            "visivel"
        );

        itensElemento.style.display =
            "";

        finalizar.disabled = false;

        finalizar.style.opacity =
            "1";

        finalizar.style.cursor =
            "pointer";

    }


    /* ========================================================
       ITENS
    ======================================================== */

    itensElemento.innerHTML =
        carrinho.map(
            (produto, index) => `

            <div
                class="c3-carrinho-item"
            >

                <div
                    class="c3-carrinho-item-img"
                >

                    ${
                        produto.imagem

                        ? `
                            <img
                                src="${produto.imagem}"
                                alt="${produto.nome}"
                            >
                        `

                        : `
                            <span>
                                C3
                            </span>
                        `
                    }

                </div>


                <div
                    class="c3-carrinho-item-info"
                >

                    <span
                        class="c3-carrinho-item-numero"
                    >
                        ITEM ${String(index + 1).padStart(2, "0")}
                    </span>


                    <h3>
                        ${produto.nome}
                    </h3>


                    <strong>
                        R$ ${formatarPreco(
                            produto.preco
                        )}
                    </strong>


                    <div
                        class="c3-carrinho-controles"
                    >

                        <button
                            type="button"
                            class="c3-carrinho-qtd"
                            data-nome="${produto.nome}"
                            data-valor="-1"
                        >
                            −
                        </button>


                        <span>
                            ${produto.quantidade}
                        </span>


                        <button
                            type="button"
                            class="c3-carrinho-qtd"
                            data-nome="${produto.nome}"
                            data-valor="1"
                        >
                            +
                        </button>

                    </div>

                </div>


                <button
                    type="button"
                    class="c3-carrinho-remover"
                    data-nome="${produto.nome}"
                    aria-label="Remover ${produto.nome}"
                >
                    ×
                </button>

            </div>

        `
        ).join("");


    /* ========================================================
       BOTÕES DE QUANTIDADE
    ======================================================== */

    estrutura
        .querySelectorAll(
            ".c3-carrinho-qtd"
        )
        .forEach(botaoQtd => {

            botaoQtd.addEventListener(
                "click",
                () => {

                    alterarQuantidade(
                        botaoQtd.dataset.nome,
                        Number(
                            botaoQtd.dataset.valor
                        )
                    );

                }
            );

        });


    /* ========================================================
       REMOVER
    ======================================================== */

    estrutura
        .querySelectorAll(
            ".c3-carrinho-remover"
        )
        .forEach(botaoRemover => {

            botaoRemover.addEventListener(
                "click",
                () => {

                    removerProduto(
                        botaoRemover.dataset.nome
                    );

                }
            );

        });

}


/* ============================================================
   ABRIR / FECHAR
============================================================ */

function abrirCarrinho() {

    const estrutura =
        criarCarrinho();


    estrutura
        .querySelector(
            ".c3-carrinho"
        )
        .classList.add("aberto");


    estrutura
        .querySelector(
            ".c3-carrinho-overlay"
        )
        .classList.add("ativo");


    document.body.style.overflow =
        "hidden";

}


function fecharCarrinho() {

    const estrutura =
        criarCarrinho();


    estrutura
        .querySelector(
            ".c3-carrinho"
        )
        .classList.remove("aberto");


    estrutura
        .querySelector(
            ".c3-carrinho-overlay"
        )
        .classList.remove("ativo");


    document.body.style.overflow =
        "";

}


/* ============================================================
   CHECKOUT
============================================================ */

function abrirCheckout() {

    if (carrinho.length === 0) {

        mostrarAviso(
            "Seu carrinho está vazio."
        );

        return;

    }


    if (!usuarioAtual) {

        mostrarAviso(
            "Entre na sua conta para finalizar a compra."
        );


        setTimeout(() => {

            window.location.href =
                "./login.html";

        }, 1200);


        return;

    }


    fecharCarrinho();


    const antigo =
        document.querySelector(
            "#checkout-c3"
        );


    if (antigo) {
        antigo.remove();
    }


    const modal =
        document.createElement("div");


    modal.id =
        "checkout-c3";


    modal.innerHTML = `

        <div class="checkout-c3-fundo"></div>


        <div class="checkout-c3-modal">

            <button
                type="button"
                class="checkout-c3-fechar"
            >
                ×
            </button>


            <div class="checkout-c3-conteudo">

                <span
                    class="checkout-tag"
                >
                    C3 COLLECTION
                </span>


                <h2>
                    Confirmar pedido
                </h2>


                <p>
                    Confira os dados abaixo
                    antes de enviar seu pedido.
                </p>


                <div class="checkout-resumo">

                    ${carrinho.map(
                        produto => `

                        <div
                            class="checkout-produto"
                        >

                            <span>
                                ${produto.quantidade}x
                                ${produto.nome}
                            </span>

                            <strong>
                                R$
                                ${formatarPreco(
                                    produto.preco *
                                    produto.quantidade
                                )}
                            </strong>

                        </div>

                    `
                    ).join("")}

                </div>


                <form id="checkout-form">

                    <label>
                        Nome completo

                        <input
                            type="text"
                            id="checkout-nome"
                            value="${
                                usuarioAtual.displayName || ""
                            }"
                            required
                        >
                    </label>


                    <label>
                        E-mail

                        <input
                            type="email"
                            id="checkout-email"
                            value="${
                                usuarioAtual.email || ""
                            }"
                            required
                        >
                    </label>


                    <label>
                        Telefone

                        <input
                            type="tel"
                            id="checkout-telefone"
                            placeholder="(00) 00000-0000"
                            required
                        >
                    </label>


                    <label>
                        Observação

                        <textarea
                            id="checkout-observacao"
                            placeholder="Alguma observação sobre o pedido?"
                        ></textarea>
                    </label>


                    <div
                        class="checkout-total"
                    >

                        <span>
                            Total
                        </span>

                        <strong>
                            R$
                            ${formatarPreco(
                                calcularTotal()
                            )}
                        </strong>

                    </div>


                    <button
                        type="submit"
                        class="botao botao-roxo checkout-enviar"
                    >
                        Confirmar pedido
                    </button>

                </form>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    /* FECHAR */

    modal
        .querySelector(
            ".checkout-c3-fechar"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );


    modal
        .querySelector(
            ".checkout-c3-fundo"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );


    modal
        .querySelector(
            "#checkout-form"
        )
        .addEventListener(
            "submit",
            finalizarCompra
        );

}


/* ============================================================
   FINALIZAR COMPRA
============================================================ */

async function finalizarCompra(evento) {

    evento.preventDefault();


    if (!usuarioAtual) {

        mostrarAviso(
            "Sua sessão expirou. Entre novamente."
        );

        return;

    }


    const botao =
        document.querySelector(
            ".checkout-enviar"
        );


    const nome =
        document.querySelector(
            "#checkout-nome"
        ).value.trim();


    const email =
        document.querySelector(
            "#checkout-email"
        ).value.trim();


    const telefone =
        document.querySelector(
            "#checkout-telefone"
        ).value.trim();


    const observacao =
        document.querySelector(
            "#checkout-observacao"
        ).value.trim();


    if (
        !nome ||
        !email ||
        !telefone
    ) {

        mostrarAviso(
            "Preencha todos os campos obrigatórios."
        );

        return;

    }


    try {

        botao.disabled = true;

        botao.textContent =
            "Enviando pedido...";


        const itens =
            carrinho.map(produto => ({

                nome:
                    produto.nome,

                preco:
                    Number(produto.preco),

                quantidade:
                    Number(produto.quantidade),

                subtotal:
                    Number(produto.preco) *
                    Number(produto.quantidade)

            }));


        const total =
            calcularTotal();


        /* ====================================================
           SALVAR FIRESTORE
        ==================================================== */

        const documento =
            await addDoc(
                collection(
                    db,
                    "pedidos"
                ),
                {

                    uid:
                        usuarioAtual.uid,

                    cliente: {

                        nome:
                            nome,

                        email:
                            email,

                        telefone:
                            telefone

                    },

                    itens:
                        itens,

                    total:
                        total,

                    observacao:
                        observacao,

                    status:
                        "pendente",

                    criadoEm:
                        serverTimestamp()

                }
            );


        console.log(
            "Pedido criado:",
            documento.id
        );


        /* LIMPAR */

        carrinho = [];

        salvarCarrinho();


        document
            .querySelector(
                "#checkout-c3"
            )
            ?.remove();


        atualizarCarrinho();


        /* ====================================================
           TELA DE SUCESSO
        ==================================================== */

        mostrarSucesso(
            documento.id,
            total
        );


    } catch (erro) {

        console.error(
            "Erro ao finalizar compra:",
            erro
        );


        botao.disabled = false;

        botao.textContent =
            "Confirmar pedido";


        mostrarAviso(
            "Não foi possível enviar o pedido."
        );

    }

}


/* ============================================================
   SUCESSO
============================================================ */

function mostrarSucesso(idPedido, total) {

    const modal =
        document.createElement("div");


    modal.id =
        "pedido-sucesso-c3";


    modal.innerHTML = `

        <div class="pedido-sucesso-fundo"></div>


        <div class="pedido-sucesso-modal">

            <div class="pedido-sucesso-icone">
                ✓
            </div>


            <span class="checkout-tag">
                C3 COLLECTION
            </span>


            <h2>
                Pedido realizado!
            </h2>


            <p>
                Seu pedido foi enviado com sucesso
                e está aguardando análise.
            </p>


            <div class="pedido-sucesso-status">

                <span>
                    Status do pedido
                </span>

                <strong>
                    Em análise
                </strong>

            </div>


            <div class="pedido-sucesso-info">

                <span>
                    Número do pedido
                </span>

                <strong>
                    #${idPedido.slice(-8).toUpperCase()}
                </strong>

            </div>


            <div class="pedido-sucesso-total">

                <span>
                    Total
                </span>

                <strong>
                    R$ ${formatarPreco(total)}
                </strong>

            </div>


            <button
                type="button"
                class="pedido-sucesso-fechar"
            >
                Continuar
            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal
        .querySelector(
            ".pedido-sucesso-fechar"
        )
        .addEventListener(
            "click",
            () => {

                modal.remove();

            }
        );

}


/* ============================================================
   EVENTOS
============================================================ */

function configurarEventos() {

    const estrutura =
        criarCarrinho();


    estrutura
        .querySelector(
            ".c3-carrinho-botao"
        )
        .addEventListener(
            "click",
            abrirCarrinho
        );


    estrutura
        .querySelector(
            ".c3-carrinho-fechar"
        )
        .addEventListener(
            "click",
            fecharCarrinho
        );


    estrutura
        .querySelector(
            ".c3-carrinho-overlay"
        )
        .addEventListener(
            "click",
            fecharCarrinho
        );


    estrutura
        .querySelector(
            ".c3-carrinho-finalizar"
        )
        .addEventListener(
            "click",
            abrirCheckout
        );


    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key === "Escape"
            ) {

                fecharCarrinho();

                document
                    .querySelector(
                        "#checkout-c3"
                    )
                    ?.remove();

            }

        }
    );

}


/* ============================================================
   INICIAR
============================================================ */

prepararProdutos();

criarCarrinho();

atualizarCarrinho();

configurarEventos();