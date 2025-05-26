export function maior(dados, chave, dataAtual = null, periodo = "inicio") {
  const filtrados = filtrarPorPeriodoInterno(dados, dataAtual, periodo);
  if (filtrados.length === 0) return null;

  let max = -Infinity;
  for (const registro of filtrados) {
    const valor = extrairValor(registro, chave);
    if (typeof valor === 'number' && valor > max) {
      max = valor;
    }
  }
  return max;
}

export function menor(dados, chave, dataAtual = null, periodo = "inicio") {
  const filtrados = filtrarPorPeriodoInterno(dados, dataAtual, periodo);
  if (filtrados.length === 0) return null;

  let min = Infinity;
  for (const registro of filtrados) {
    const valor = extrairValor(registro, chave);
    if (typeof valor === 'number' && valor < min) {
      min = valor;
    }
  }
  return min;
}

export function media(dados, chave, dataAtual = null, periodo = "inicio") {
  const filtrados = filtrarPorPeriodoInterno(dados, dataAtual, periodo);
  if (filtrados.length === 0) return null;

  let soma = 0;
  let count = 0;
  for (const registro of filtrados) {
    const valor = extrairValor(registro, chave);
    if (typeof valor === 'number') {
      soma += valor;
      count++;
    }
  }
  return count > 0 ? soma / count : null;
}

function extrairValor(obj, caminho) {
  return caminho.split('.').reduce((acc, parte) => acc?.[parte], obj);
}

export function streak(dados, chave, dataAtual = null, periodo = "inicio") {
  const filtrados = filtrarPorPeriodoInterno(dados, dataAtual, periodo);
  if (!dataAtual) return "0/0";

  let diasTotais;
  switch (periodo) {
    case "semana":
      diasTotais = 7;
      break;
    case "mes":
      diasTotais = 30;
      break;
    case "ano":
      diasTotais = 365;
      break;
    case "inicio":
    default:
      diasTotais = filtrados.length; // total de registros disponíveis
      break;
  }

  let diasValidos = 0;
  for (const registro of filtrados) {
    const valor = extrairValor(registro, chave);
    if (typeof valor === 'number' && valor > 0) {
      diasValidos++;
    }
  }

  return `${diasValidos}/${diasTotais}`;
}

function filtrarPorPeriodoInterno(dados, dataAtual, periodo) {
  if (!Array.isArray(dados) || dados.length === 0 || periodo === "inicio") return dados;
  if (!dataAtual) return []; // segurança: se a data não for passada, retorna vazio

  let dias;
  switch (periodo) {
    case "semana":
      dias = 7;
      break;
    case "mes":
      dias = 30;
      break;
    case "ano":
      dias = 365;
      break;
    default:
      return dados;
  }

  const limite = new Date(dataAtual);
  limite.setDate(limite.getDate() - dias);

  return dados.filter(registro => {
    const dataRegistro = new Date(registro.registrado_em);
    return dataRegistro >= limite && dataRegistro <= dataAtual;
  });
}