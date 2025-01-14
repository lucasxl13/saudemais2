let valido  = false;
let valido2 = false;
let valido3 = false;



//PAG1
const pag1 = document.getElementById('pag1');
const dot1 = document.getElementById('dot1');
const entrada_usuario = document.getElementById("usuario"); //Formulario de senha.
const entrada_email = document.getElementById("email"); //Formulario de senha.
const entrada_cemail = document.getElementById("c_email"); //Formulario de senha.
const entrada_senha = document.getElementById("senha"); //Formulario de senha.
const entrada_csenha = document.getElementById("c_senha"); //Formulario de senha.
const forca_senha = document.querySelector(".forca_senha");//Barra de força da senha.
const requisitos_senha = document.getElementById('requisitos_senha');//Requisitos minimos para a senha.

//PAG1 ERROS
const u_erro = document.getElementById('usuario-erro');
const e_erro = document.getElementById('email-erro');
const ce_erro = document.getElementById('cemail-erro');
const s_erro = document.getElementById('senha-erro');
const cs_erro = document.getElementById('csenha-erro');

//PAG1 DEFAULT
function DefaultErrosPag1(){
u_erro.classList.remove('erro');
e_erro.classList.remove('erro');
ce_erro.classList.remove('erro');
s_erro.classList.remove('erro');
cs_erro.classList.remove('erro');

u_erro.style.display = 'none';
e_erro.style.display = 'none';
ce_erro.style.display = 'none';
s_erro.style.display = 'none';
cs_erro.style.display = 'none';

entrada_email.classList.remove('erro');
entrada_cemail.classList.remove('erro');
entrada_senha.classList.remove('erro');
entrada_csenha.classList.remove('erro');
}
DefaultErrosPag1();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//PAG2
const pag2 = document.getElementById('pag2');
const dot2 = document.getElementById('dot2');
const entrada_nascimento = document.getElementById("nascimento");
const entrada_peso = document.getElementById("peso");
const peso_valor = document.getElementById("peso-valor");
const entrada_altura = document.getElementById("altura");
const altura_valor = document.getElementById("altura-valor");
const sexo = document.getElementById("sexo");
const msexo = document.getElementById("sexo-masculino");
const fsexo = document.getElementById("sexo-feminino");

//PAG2 ERROS
const n_erro = document.getElementById('nascimento-erro');
const p_erro = document.getElementById('peso-erro');
const a_erro = document.getElementById('altura-erro');
const sx_erro = document.getElementById('sexo-erro');

//PAG2 DEFAULT
function DefaultErrosPag2(){
n_erro.classList.remove('erro');
p_erro.classList.remove('erro');
a_erro.classList.remove('erro');
sx_erro.classList.remove('erro');

n_erro.style.display = 'none';
p_erro.style.display = 'none';
a_erro.style.display = 'none';
sx_erro.style.display = 'none';

entrada_nascimento.classList.remove('erro');
entrada_peso.classList.remove('erro');
entrada_altura.classList.remove('erro');
sexo.classList.remove('erro');
}
DefaultErrosPag2();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//PAG3
const dot3 = document.getElementById('dot3');
const pag3 = document.getElementById('pag3');
const meta_emagrecer = document.getElementById('meta');
const meta_ganho = document.getElementById('meta2');
const meta_equilibrio = document.getElementById('meta3');

//PAG3 ERROS
const m_erro = document.getElementById('meta-erro');

function DefaultErrosPag3(){
 m_erro.classList.remove('erro');
 m_erro.style.display = 'none';
}
DefaultErrosPag3();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//PAG4
const dot4 = document.getElementById('dot4');

//PAG4 ERROS
n_erro.classList.remove('erro');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//SELETORES
const btn_back = document.getElementById("btn_back");
const btn_go = document.getElementById("btn_go");
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//FUNÇÕES
//Previne dos campos receberem espaço como caracter valido.
function evitar_space(campo) {
  campo.addEventListener('keydown', function (e) {
    if (e.key === ' ') {
      e.preventDefault();
    }
  });
}

//Disposição Default dos elementos da Pag1
function default_pag1(){
  dot1.classList.add('active');
  dot2.classList.remove('active');
  dot3.classList.remove('active');
  dot4.classList.remove('active');
  pag1.style.display = 'block';
  pag2.style.display = 'none';
  pag3.style.display = 'none';
  btn_back.style.display ="none";
}

//Disposição Default dos elementos da Pag2
function default_pag2(){
  dot1.classList.remove('active');
  dot2.classList.add('active');
  dot3.classList.remove('active');
  dot4.classList.remove('active');
  pag1.style.display = 'none';
  pag2.style.display = 'block';
  pag3.style.display = 'none';
  btn_back.style.display ="block"; 
}

function default_pag3(){
  dot1.classList.remove('active');
  dot2.classList.remove('active');
  dot3.classList.add('active');
  dot4.classList.remove('active');
  pag1.style.display = 'none';
  pag2.style.display = 'none';
  pag3.style.display = 'block';
}

function default_pag4(){
  dot1.classList.remove('active');
  dot2.classList.remove('active');
  dot3.classList.remove('active');
  dot4.classList.add('active');
  pag1.style.display = 'none';
  pag2.style.display = 'none';
  pag3.style.display = 'none';
}

let pag = 0;


function atualizarPagina() {
  switch (pag) {
    case 0:
      default_pag1();
      break;

    case 1:
      DefaultErrosPag1();
      default_pag2();
      break;

    case 2:
        default_pag3();
    break;

    case 3:
        default_pag4();
    break;

    case 4:
      console.log("Éxito");
  }
}

//Requerimentos necessarios para a força da senha.
const requerimentos = {
  tamanho: document.getElementById('tamanho'),///Maior que oito digitos.
  maiusculo: document.getElementById('maiusculo'),//Maiusculas.
  minusculo: document.getElementById('minusculo'),//Minusculas.
  numero: document.getElementById('numero'),//Numeros.
  especial: document.getElementById('especial')//Caracteres especiais.
};

//Função que testa a força da senha.
function verif_forca(senha) {
  let forca = 0;

  if (senha.length >= 8) forca++; //Maior que oito digitos.
  if (/[A-Z]/.test(senha)) forca++; //Maiusculas.
  if (/[a-z]/.test(senha)) forca++;//Minusculas.
  if (/\d/.test(senha)) forca++;//Numeros.
  if (/[^a-zA-Z0-9]/.test(senha)) forca++;//Caracteres especiais.

  return forca; //Retorna o valor na variavel força para a função verif_forca.
}

//Atualiza a barra conforme o usuario digita a senha.
let senha_forca=false;

function atualiza_barra(forca) {
  const percentual = (forca / 5) * 100;//Divide a barra em cinco estágios.
  
  forca_senha.style.width = `${percentual}%`;//Atualiza o tamanho da barra conforme a porcentagem.

  if (forca <= 1) {
      forca_senha.style.backgroundColor = "#ff0000";//Senha muito fraca.
      requisitos_senha.style.display = "block";
      senha_forca=false;
  } 
  else if (forca <= 2) {
    forca_senha.style.backgroundColor = "#ff8000";//Senha fraca.
    requisitos_senha.style.display = "block";
    senha_forca=false;
  }
  else if (forca <= 3) {
      forca_senha.style.backgroundColor = "#ffff00";//Senha media.
      requisitos_senha.style.display = "block";
      senha_forca=false;
  } 
  else if (forca <= 4) {
    forca_senha.style.backgroundColor = "#80ff00";//Senha media forte.    
    requisitos_senha.style.display = "block";
    senha_forca=false;
} 
  else {
      forca_senha.style.backgroundColor = "green";//Senha forte.
      requisitos_senha.style.display = "none";
      senha_forca=true;
  }
}

//Função para validar os requisitos da senha
const validarSenha = (senha) => {
  const validacao = {
    tamanho: senha.length >= 8,
    maiusculo: /[A-Z]/.test(senha),
    minusculo: /[a-z]/.test(senha),
    numero: /[0-9]/.test(senha),
    especial: /[!@#$%^&*]/.test(senha),
  };

  for (const ok in validacao) {
    if (validacao[ok]) {
      requerimentos[ok].classList.add('valido');
    } else {
      requerimentos[ok].classList.remove('valido');
    }
  }
};

function impedirEspaco(campo) {
  // Impede espaços ao digitar
  campo.addEventListener('keydown', function (e) {
    if (e.key === ' ') {
      e.preventDefault(); // Impede que o espaço seja inserido
    }
  });
  // Impede espaços ao colar
  campo.addEventListener('paste', function (e) {
    const textoColado = e.clipboardData.getData('text');
    if (textoColado.includes(' ')) {
      e.preventDefault(); // Impede que o conteúdo com espaço seja colado
    }
  });
}


function validarCampo(campo, erroElemento, mensagemErro = '', condicaoAdicional = true) {
  if (campo.value.trim() === '' || !condicaoAdicional) {
    campo.classList.add('erro');
    erroElemento.style.display = 'block';
    erroElemento.textContent = mensagemErro || 'Campo obrigatório.';
    return false;
  } else {
    return true;
  }
}


function removerErroAoDigitar(campo, erroElemento, outroElemento) {
  campo.addEventListener('input', function () {
    this.classList.remove('erro');
    erroElemento.style.display = 'none';

    // Verifica se outroElemento foi fornecido
    if (outroElemento) {
      outroElemento.classList.remove('erro');
    }
  });
}


flatpickr(entrada_nascimento, {
  dateFormat: "d/m/Y",
  locale: "pt",
  minDate: "01.01.1900",
  maxDate: "today",
  disableMobile: true,
});


let intervalo; // Armazena o ID do intervalo
let velocidade = 50; // Velocidade inicial em ms
let aceleracao = 10; // Incremento na velocidade
let vel_minima = 5; // Velocidade mínima (ms)
let incremento = 0; // Valor incremental (positivo ou negativo)
let delay; // Timeout para ativar a aceleração

// Atualiza o texto do peso com base no slider
function atualizaPeso(valor) {
  peso_valor.textContent = parseFloat(valor).toFixed(1) + ' kg';
  peso_valor.value = entrada_peso.value;
  entrada_peso.classList.remove('erro');
  p_erro.style.display = 'none';
}
// Função para iniciar o ajuste contínuo ao segurar clicado
function inicia_ajustepeso(valor) {
  incremento = valor;
  // Altera o peso uma vez imediatamente
  alterarPeso(valor);

  // Inicia o timeout para começar a aceleração após 500ms
  delay = setTimeout(() => {
    velocidade = 50; // Velocidade inicial

    // Cria um loop que ajusta o peso continuamente
    intervalo = setInterval(() => {
      alterarPeso(valor);

      // Reduz a velocidade gradualmente (até o limite mínimo)
      if (velocidade > vel_minima) {
        velocidade -= aceleracao;
        clearInterval(intervalo); // Limpa o intervalo atual
        intervalo = setInterval(() => alterarPeso(valor), velocidade); // Reinicia o intervalo com a nova velocidade
      }
    }, velocidade);
  }, 500); // Espera 500ms antes de começar o ajuste contínuo
}

// Função para parar o ajuste contínuo
function finaliza_ajustepeso() {
  clearTimeout(delay); // Cancela o timeout de aceleração
  clearInterval(intervalo); // Para o intervalo
}

// Altera o valor do peso no slider e atualiza a exibição
function alterarPeso(valor) {
  const slider = entrada_peso;
  let novoValor = parseFloat(slider.value) + valor;

  // Garante que o valor permaneça dentro dos limites do slider
  if (novoValor >= parseFloat(slider.min) && novoValor <= parseFloat(slider.max)) {
    slider.value = novoValor.toFixed(1);
    atualizaPeso(novoValor);
  }
}

// Atualiza o texto do peso com base no slider
function atualizaAltura(valor) {
  altura_valor.textContent = parseFloat(valor) + ' cm';
  altura_valor.value = entrada_altura.value;
  entrada_altura.classList.remove('erro');
  a_erro.style.display = 'none';
}
// Função para iniciar o ajuste contínuo ao segurar clicado
function inicia_ajustealtura(valor) {
  incremento = valor;
  // Altera o peso uma vez imediatamente
  alterarAltura(valor);

  // Inicia o timeout para começar a aceleração após 500ms
  delay = setTimeout(() => {
    velocidade = 50; // Velocidade inicial

    // Cria um loop que ajusta o peso continuamente
    intervalo = setInterval(() => {
      alterarAltura(valor);

      // Reduz a velocidade gradualmente (até o limite mínimo)
      if (velocidade > vel_minima) {
        velocidade -= aceleracao;
        clearInterval(intervalo); // Limpa o intervalo atual
        intervalo = setInterval(() => alterarAltura(valor), velocidade); // Reinicia o intervalo com a nova velocidade
      }
    }, velocidade);
  }, 500); // Espera 500ms antes de começar o ajuste contínuo
}

// Função para parar o ajuste contínuo
function finaliza_ajustealtura() {
  clearTimeout(delay); // Cancela o timeout de aceleração
  clearInterval(intervalo); // Para o intervalo
}

// Altera o valor do peso no slider e atualiza a exibição
function alterarAltura(valor) {
  const slider = entrada_altura;
  let novoValor = parseFloat(slider.value) + valor;

  // Garante que o valor permaneça dentro dos limites do slider
  if (novoValor >= parseFloat(slider.min) && novoValor <= parseFloat(slider.max)) {
    slider.value = novoValor.toFixed(1);
    atualizaAltura(novoValor);
  }
}


function cores_meta() {
  meta_emagrecer.style.color = '';
  meta_ganho.style.color = '';
  meta_equilibrio.style.color = '';
}





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

atualizarPagina();

impedirEspaco(entrada_usuario);
impedirEspaco(entrada_email);
impedirEspaco(entrada_cemail);
impedirEspaco(entrada_senha);
impedirEspaco(entrada_csenha);

//Chama a função e imprime ela.
entrada_senha.addEventListener('input', (event) => {
  const senha = entrada_senha.value;//Atribui o valor no formulario para a variavel senha.
  const forca = verif_forca(senha);//Atribui o valor da função da força da senha para a variavel forca.
  atualiza_barra(forca);//Atribui o valor da força da senha para a função que vai atualizar a barra.
  validarSenha(event.target.value);
});

//Para mostrar a barra de força da senha quando clicado.
entrada_senha.addEventListener("focus", () => {
  entrada_csenha.classList.remove('erro');
  cs_erro.style.display = 'none';

  setTimeout(() => {
    forca_senha.style.display = "block";
    entrada_senha.style.outline = "2px solid black";
    requisitos_senha.classList.add('active');
  }, 100); 
});

//Para ocultar a barra de força da senha quando o campo senha for clicado fora.
entrada_senha.addEventListener("blur", () => {
  forca_senha.style.display = "none";
  entrada_senha.style.outline = "none"; 
  requisitos_senha.classList.remove('active');
});

fsexo.addEventListener("click", () => {
  sexo.textContent = 'Feminino.';
  sexo.value = 'feminino';
  fsexo.classList.add('ativo');
  msexo.classList.remove('ativo');
  sexo.classList.remove('erro');
  sx_erro.style.display = 'none';
});

msexo.addEventListener("click", () => {
  sexo.textContent = 'Masculino.';
  sexo.value = 'masculino';
  msexo.classList.add('ativo');
  fsexo.classList.remove('ativo');
  sexo.classList.remove('erro');
  sx_erro.style.display = 'none';
});

btn_back.addEventListener("click", function (event) {
  event.preventDefault();
  if(pag>0){
    pag--;
    atualizarPagina();
  }
});

btn_go.addEventListener("click", function (event) {
  event.preventDefault();

  let valido = false;

  if (pag == 0) {
    valido = validarPrimeiraPagina();
  } else if (pag == 1) {
    valido = validarSegundaPagina();
  }
  else if(pag==2){
    valido=validarTerceiraPagina();
  }
  if (valido) {
    pag++;
    atualizarPagina();
  }
});

function validarPrimeiraPagina() {
  DefaultErrosPag2();
  let valido = true;

  valido &= validarCampo(entrada_usuario, u_erro); // Validação do usuário
  valido &= validarCampo(entrada_email, e_erro); // Validação do email

  if (entrada_cemail.value == "") {
    valido &= validarCampo(entrada_cemail, ce_erro);
  } else {
    valido &= validarCampo(
      entrada_cemail,
      ce_erro,
      "Emails não conferem.",
      entrada_email.value === entrada_cemail.value
    );
  }

  valido &= validarCampo(entrada_senha, s_erro, "Senha fraca", senha_forca); // Validação da senha

  if (entrada_csenha.value == "") {
    valido &= validarCampo(entrada_csenha, cs_erro);
  } else {
    valido &= validarCampo(
      entrada_csenha,cs_erro,"Senhas não conferem.", entrada_senha.value === entrada_csenha.value
    );
  }

  return valido;
}

function validarSegundaPagina() {
  let valido2 = true;


  if(entrada_nascimento.value === ''){
    entrada_nascimento.classList.add('erro');
    n_erro.style.display = 'block';
    n_erro.textContent = 'Campo obrigatório';
    valido2=false;
  }

  if(peso_valor.value === undefined){
    entrada_peso.classList.add('erro');
    p_erro.style.display = 'block';
    p_erro.textContent = 'Campo obrigatório';
    valido2=false;
  }

  if(altura_valor.value === undefined){
    entrada_altura.classList.add('erro');
    a_erro.style.display = 'block';
    a_erro.textContent = 'Campo obrigatório';
    valido2=false;
  }

  if(sexo.value === undefined){
    sx_erro.style.display = 'block';
    sx_erro.textContent = 'Campo obrigatório';
    valido2=false;
  }
  
  return valido2;
}

let TesteObjetivo=false;

meta_emagrecer.addEventListener('click', function() {
  const color6 = getComputedStyle(document.documentElement).getPropertyValue('--color6').trim();
  cores_meta();
  m_erro.style.display = 'none';
  meta_emagrecer.style.color = color6; 
  TesteObjetivo = true;
});

meta_ganho.addEventListener('click', function() {
  const color6 = getComputedStyle(document.documentElement).getPropertyValue('--color6').trim();
  cores_meta();
  m_erro.style.display = 'none';
  meta_ganho.style.color = color6; 
  TesteObjetivo = true;
});

meta_equilibrio.addEventListener('click', function() {
  const color6 = getComputedStyle(document.documentElement).getPropertyValue('--color6').trim();
  cores_meta();
  m_erro.style.display = 'none';
  meta_equilibrio.style.color = color6; 
  TesteObjetivo = true;
});

function validarTerceiraPagina() {
  let valido3 = true;


  if(!TesteObjetivo){
    m_erro.style.display = 'block';
    valido3=false;
  }
  
  return valido3;
}


removerErroAoDigitar(entrada_usuario, u_erro);
removerErroAoDigitar(entrada_email, e_erro);
removerErroAoDigitar(entrada_cemail, ce_erro);
removerErroAoDigitar(entrada_email, ce_erro, entrada_cemail);

removerErroAoDigitar(entrada_senha, s_erro);
removerErroAoDigitar(entrada_csenha, cs_erro);

removerErroAoDigitar(entrada_nascimento, n_erro);
removerErroAoDigitar(entrada_peso, p_erro);
removerErroAoDigitar(entrada_altura, a_erro);


