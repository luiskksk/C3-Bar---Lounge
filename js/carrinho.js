// ============================================================
// C3 | CARRINHO + FINALIZAÇÃO DE PEDIDO
// ============================================================

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


const CHAVE_CARRINHO = "c3_carrinho";

let carrinho =
    JSON.parse(
        localStorage.getItem(CHAVE_CARRINHO)
    ) || [];

let usuarioAtual = null;


// ============================================================
// AUTENTICAÇÃO
// ============================================================

onAuthStateChanged(
    auth,
    (user) => {

        usuarioAtual = user;

    }
);


// ============================================================
// SALVAR
// ============================================================

function salvarCarrinho() {

    localStorage.setItem(
        CHAVE_CARRINHO,
        JSON.stringify(carrinho)
    );
}


// ============================================================
// PREÇO
// ============================================================

function formatarPreco(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function converterPreco(texto) {

    return Number(
        texto
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    );
}


// ============================================================
// PREPARAR PRODUTOS
// ============================================================

function prepararProdutos() {

    const produtos =
        document.querySelectorAll(
            ".produto-loja-card, .box-c3-destaque"
        );

    produtos.forEach(
        (produto, index) => {

            const imagem =
                produto.querySelector("img");

            const nome =
                produto.querySelector("h3")
                    ?.textContent
                    .trim()
                ||
                produto.querySelector("h2")
                    ?.textContent
                    .replace(/\s+/g, " ")
                    .trim()
                ||
                "Produto C3";

            const precoElemento =
                produto.querySelector("strong");

            if (
                !imagem ||
                !precoElemento
            ) {
                return;
            }

            const preco =
                converterPreco(
                    precoElemento.textContent
                );

            const imagemSrc =
                imagem.getAttribute("src");

            const numero =
                produto.querySelector(
                    ".box-numero"
                )?.textContent.trim()
                ||
                produto.querySelector(
                    ".produto-loja-info > span"
                )?.textContent.trim()
                ||
                String(index + 1)
                    .padStart(2, "0");

            const area =
                produto.querySelector(
                    ".produto-loja-info"
                )
                ||
                produto.querySelector(
                    ".box-c3-conteudo"
                );

            if (!area) {
                return;
            }

            if (
                area.querySelector(
                    ".btn-adicionar-carrinho"
                )
            ) {
                return;
            }

            const botao =
                document.createElement("button");

            botao.type = "button";

            botao.className =
                "btn-adicionar-carrinho";

            botao.innerHTML = `
                <span>＋</span>
                Adicionar ao carrinho
            `;

            botao.addEventListener(
                "click",
                () => {

                    adicionarAoCarrinho({

                        id:
                            `c3-produto-${numero}`,

                        numero,

                        nome,

                        preco,

                        imagem:
                            imagemSrc

                    });

                }
            );

            area.appendChild(botao);

        }
    );
}


// ============================================================
// ADICIONAR
// ============================================================

function adicionarAoCarrinho(
    produto
) {

    const existente =
        carrinho.find(
            item =>
                item.id === produto.id
        );

    if (existente) {

        existente.quantidade++;

    } else {

        carrinho.push({

            ...produto,

            quantidade: 1

        });

    }

    salvarCarrinho();

    atualizarCarrinho();

    abrirCarrinho();

    mostrarAviso(
        `${produto.nome} foi adicionado ao carrinho.`
    );
}


// ============================================================
// QUANTIDADE
// ============================================================

function alterarQuantidade(
    id,
    quantidade
) {

    const produto =
        carrinho.find(
            item =>
                item.id === id
        );

    if (!produto) {
        return;
    }

    produto.quantidade += quantidade;

    if (
        produto.quantidade <= 0
    ) {

        carrinho =
            carrinho.filter(
                item =>
                    item.id !== id
            );
    }

    salvarCarrinho();

    atualizarCarrinho();
}


// ============================================================
// REMOVER
// ============================================================

function removerProduto(id) {

    carrinho =
        carrinho.filter(
            item =>
                item.id !== id
        );

    salvarCarrinho();

    atualizarCarrinho();
}


// ============================================================
// TOTAL
// ============================================================

function calcularTotal() {

    return carrinho.reduce(
        (
            total,
            produto
        ) => {

            return (
                total +
                produto.preco *
                produto.quantidade
            );

        },
        0
    );
}


// ============================================================
// ESTRUTURA
// ============================================================

function criarCarrinho() {

    if (
        document.querySelector(
            ".c3-carrinho"
        )
    ) {
        return;
    }

    const estrutura =
        document.createElement("div");

    estrutura.innerHTML = `

        <button
            class="c3-carrinho-botao"
            id="c3CarrinhoBotao"
            type="button"
        >

            <span class="c3-carrinho-icone">
                🛒
            </span>

            <span
                class="c3-carrinho-contador"
                id="c3CarrinhoContador"
            >
                0
            </span>

        </button>


        <div
            class="c3-carrinho-overlay"
            id="c3CarrinhoOverlay"
        ></div>


        <aside
            class="c3-carrinho"
            id="c3Carrinho"
        >

            <div class="c3-carrinho-header">

                <div>

                    <span class="c3-carrinho-tag">
                        C3 COLLECTION
                    </span>

                    <h2>
                        Seu carrinho
                    </h2>

                </div>

                <button
                    class="c3-carrinho-fechar"
                    id="c3CarrinhoFechar"
                    type="button"
                >
                    ×
                </button>

            </div>


            <div
                class="c3-carrinho-itens"
                id="c3CarrinhoItens"
            ></div>


            <div
                class="c3-carrinho-vazio"
                id="c3CarrinhoVazio"
            >

                <div class="c3-carrinho-vazio-icone">
                    ◇
                </div>

                <h3>
                    Seu carrinho está vazio
                </h3>

                <p>
                    Escolha seus itens favoritos
                    da C3 Collection.
                </p>

            </div>


            <div class="c3-carrinho-footer">

                <div class="c3-carrinho-total">

                    <span>
                        Total
                    </span>

                    <strong
                        id="c3CarrinhoTotal"
                    >
                        R$ 0,00
                    </strong>

                </div>


                <button
                    class="c3-carrinho-finalizar"
                    id="c3CarrinhoFinalizar"
                    type="button"
                >
                    Finalizar pedido
                    <span>→</span>
                </button>

            </div>

        </aside>
    `;

    document.body.appendChild(
        estrutura
    );


    document
        .getElementById(
            "c3CarrinhoBotao"
        )
        .addEventListener(
            "click",
            abrirCarrinho
        );


    document
        .getElementById(
            "c3CarrinhoFechar"
        )
        .addEventListener(
            "click",
            fecharCarrinho
        );


    document
        .getElementById(
            "c3CarrinhoOverlay"
        )
        .addEventListener(
            "click",
            fecharCarrinho
        );


    document
        .getElementById(
            "c3CarrinhoFinalizar"
        )
        .addEventListener(
            "click",
            abrirFinalizacao
        );
}


// ============================================================
// ATUALIZAR
// ============================================================

function atualizarCarrinho() {

    const lista =
        document.getElementById(
            "c3CarrinhoItens"
        );

    const vazio =
        document.getElementById(
            "c3CarrinhoVazio"
        );

    const totalElemento =
        document.getElementById(
            "c3CarrinhoTotal"
        );

    const contador =
        document.getElementById(
            "c3CarrinhoContador"
        );

    if (
        !lista ||
        !vazio ||
        !totalElemento ||
        !contador
    ) {
        return;
    }


    const quantidadeTotal =
        carrinho.reduce(
            (
                total,
                produto
            ) =>
                total +
                produto.quantidade,
            0
        );


    contador.textContent =
        quantidadeTotal;


    contador.classList.toggle(
        "ativo",
        quantidadeTotal > 0
    );


    if (
        carrinho.length === 0
    ) {

        lista.innerHTML = "";

        vazio.classList.add(
            "visivel"
        );

        totalElemento.textContent =
            "R$ 0,00";

        return;
    }


    vazio.classList.remove(
        "visivel"
    );


    lista.innerHTML =
        carrinho.map(
            produto => {

                const subtotal =
                    produto.preco *
                    produto.quantidade;

                return `

                    <article
                        class="c3-carrinho-item"
                    >

                        <div
                            class="c3-carrinho-item-img"
                        >

                            <img
                                src="${produto.imagem}"
                                alt="${produto.nome}"
                            >

                        </div>


                        <div
                            class="c3-carrinho-item-info"
                        >

                            <span
                                class="c3-carrinho-item-numero"
                            >
                                ${produto.numero}
                            </span>

                            <h3>
                                ${produto.nome}
                            </h3>

                            <strong>
                                ${formatarPreco(
                                    subtotal
                                )}
                            </strong>


                            <div
                                class="c3-carrinho-controles"
                            >

                                <button
                                    type="button"
                                    class="c3-carrinho-qtd"
                                    data-acao="menos"
                                    data-id="${produto.id}"
                                >
                                    −
                                </button>

                                <span>
                                    ${produto.quantidade}
                                </span>

                                <button
                                    type="button"
                                    class="c3-carrinho-qtd"
                                    data-acao="mais"
                                    data-id="${produto.id}"
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        <button
                            type="button"
                            class="c3-carrinho-remover"
                            data-acao="remover"
                            data-id="${produto.id}"
                        >
                            ×
                        </button>

                    </article>
                `;

            }
        ).join("");


    lista
        .querySelectorAll(
            "[data-acao='menos']"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        alterarQuantidade(
                            botao.dataset.id,
                            -1
                        );

                    }
                );

            }
        );


    lista
        .querySelectorAll(
            "[data-acao='mais']"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        alterarQuantidade(
                            botao.dataset.id,
                            1
                        );

                    }
                );

            }
        );


    lista
        .querySelectorAll(
            "[data-acao='remover']"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        removerProduto(
                            botao.dataset.id
                        );

                    }
                );

            }
        );


    totalElemento.textContent =
        formatarPreco(
            calcularTotal()
        );
}


// ============================================================
// FINALIZAÇÃO
// ============================================================

function abrirFinalizacao() {

    if (
        carrinho.length === 0
    ) {

        mostrarAviso(
            "Seu carrinho está vazio."
        );

        return;
    }


    const existente =
        document.querySelector(
            ".c3-finalizacao"
        );

    if (existente) {

        existente.remove();

    }


    const modal =
        document.createElement("div");

    modal.className =
        "c3-finalizacao";


    modal.innerHTML = `

        <div
            class="c3-finalizacao-overlay"
        ></div>


        <section
            class="c3-finalizacao-card"
        >

            <button
                type="button"
                class="c3-finalizacao-fechar"
                id="c3FinalizacaoFechar"
            >
                ×
            </button>


            <div class="c3-finalizacao-topo">

                <span>
                    C3 COLLECTION
                </span>

                <h2>
                    Finalizar pedido
                </h2>

                <p>
                    Preencha seus dados para
                    enviar o pedido para o C3.
                </p>

            </div>


            <form
                id="c3FormularioPedido"
                class="c3-formulario-pedido"
            >

                <label>

                    Nome completo

                    <input
                        type="text"
                        id="pedidoNome"
                        required
                        autocomplete="name"
                        placeholder="Seu nome"
                    >

                </label>


                <label>

                    E-mail

                    <input
                        type="email"
                        id="pedidoEmail"
                        required
                        autocomplete="email"
                        placeholder="seuemail@email.com"
                    >

                </label>


                <label>

                    Telefone

                    <input
                        type="tel"
                        id="pedidoTelefone"
                        required
                        autocomplete="tel"
                        placeholder="(00) 00000-0000"
                    >

                </label>


                <label>

                    Observação

                    <textarea
                        id="pedidoObservacao"
                        rows="3"
                        placeholder="Alguma observação sobre o pedido?"
                    ></textarea>

                </label>


                <div
                    class="c3-finalizacao-resumo"
                >

                    <span>
                        Total do pedido
                    </span>

                    <strong>
                        ${formatarPreco(
                            calcularTotal()
                        )}
                    </strong>

                </div>


                <button
                    type="submit"
                    class="c3-pedido-enviar"
                >
                    Enviar pedido
                    <span>→</span>
                </button>

            </form>

        </section>
    `;


    document.body.appendChild(
        modal
    );


    const fechar =
        () => {

            modal.remove();

        };


    document
        .getElementById(
            "c3FinalizacaoFechar"
        )
        .addEventListener(
            "click",
            fechar
        );


    modal
        .querySelector(
            ".c3-finalizacao-overlay"
        )
        .addEventListener(
            "click",
            fechar
        );


    document
        .getElementById(
            "c3FormularioPedido"
        )
        .addEventListener(
            "submit",
            enviarPedido
        );


    if (usuarioAtual) {

        const nome =
            usuarioAtual.displayName ||
            "";

        const email =
            usuarioAtual.email ||
            "";

        document.getElementById(
            "pedidoNome"
        ).value = nome;

        document.getElementById(
            "pedidoEmail"
        ).value = email;
    }
}


// ============================================================
// ENVIAR PEDIDO PARA FIREBASE
// ============================================================

async function enviarPedido(
    evento
) {

    evento.preventDefault();


    const botao =
        evento.target.querySelector(
            ".c3-pedido-enviar"
        );


    const nome =
        document.getElementById(
            "pedidoNome"
        ).value.trim();


    const email =
        document.getElementById(
            "pedidoEmail"
        ).value.trim();


    const telefone =
        document.getElementById(
            "pedidoTelefone"
        ).value.trim();


    const observacao =
        document.getElementById(
            "pedidoObservacao"
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


    botao.disabled = true;

    botao.innerHTML =
        `
            Enviando pedido...
        `;


    try {

        const itens =
            carrinho.map(
                produto => ({

                    id:
                        produto.id,

                    numero:
                        produto.numero,

                    nome:
                        produto.nome,

                    preco:
                        produto.preco,

                    quantidade:
                        produto.quantidade,

                    subtotal:
                        produto.preco *
                        produto.quantidade,

                    imagem:
                        produto.imagem

                })
            );


        const total =
            calcularTotal();


        await addDoc(
            collection(
                db,
                "pedidos"
            ),
            {

                uid:
                    usuarioAtual?.uid ||
                    null,

                cliente: {

                    nome,

                    email,

                    telefone

                },

                itens,

                total,

                observacao,

                status:
                    "pendente",

                criadoEm:
                    serverTimestamp()

            }
        );


        carrinho = [];

        salvarCarrinho();


        atualizarCarrinho();


        document
            .querySelector(
                ".c3-finalizacao"
            )
            ?.remove();


        fecharCarrinho();


        mostrarAviso(
            "Pedido enviado com sucesso! 🚀"
        );


    } catch (erro) {

        console.error(
            "Erro ao enviar pedido:",
            erro
        );


        botao.disabled = false;

        botao.innerHTML =
            `
                Tentar novamente
                <span>→</span>
            `;


        mostrarAviso(
            "Não foi possível enviar o pedido."
        );

    }
}


// ============================================================
// ABRIR
// ============================================================

function abrirCarrinho() {

    document
        .getElementById(
            "c3Carrinho"
        )
        ?.classList.add(
            "aberto"
        );

    document
        .getElementById(
            "c3CarrinhoOverlay"
        )
        ?.classList.add(
            "ativo"
        );

    document.body.classList.add(
        "c3-carrinho-aberto"
    );
}


// ============================================================
// FECHAR
// ============================================================

function fecharCarrinho() {

    document
        .getElementById(
            "c3Carrinho"
        )
        ?.classList.remove(
            "aberto"
        );

    document
        .getElementById(
            "c3CarrinhoOverlay"
        )
        ?.classList.remove(
            "ativo"
        );

    document.body.classList.remove(
        "c3-carrinho-aberto"
    );
}


// ============================================================
// AVISO
// ============================================================

function mostrarAviso(
    mensagem
) {

    let aviso =
        document.querySelector(
            ".c3-carrinho-aviso"
        );


    if (!aviso) {

        aviso =
            document.createElement(
                "div"
            );

        aviso.className =
            "c3-carrinho-aviso";

        document.body.appendChild(
            aviso
        );
    }


    aviso.textContent =
        mensagem;

    aviso.classList.add(
        "ativo"
    );


    clearTimeout(
        aviso.timer
    );


    aviso.timer =
        setTimeout(
            () => {

                aviso.classList.remove(
                    "ativo"
                );

            },
            2600
        );
}


// ============================================================
// INICIAR
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        criarCarrinho();

        prepararProdutos();

        atualizarCarrinho();

    }
);