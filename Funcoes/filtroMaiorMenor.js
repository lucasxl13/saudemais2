// filtroMaiorMenor.js

// Retorna o maior valor da chave em todos os objetos
export function maior(dados, chave) {
  if (!Array.isArray(dados) || dados.length === 0) return null;

  let max = -Infinity;
  for (const registro of dados) {
    const valor = extrairValor(registro, chave);
    if (typeof valor === 'number' && valor > max) {
      max = valor;
    }
  }
  return max;
}

// Retorna o menor valor da chave em todos os objetos
export function menor(dados, chave) {
  if (!Array.isArray(dados) || dados.length === 0) return null;

  let min = Infinity;
  for (const registro of dados) {
    const valor = extrairValor(registro, chave);
    if (typeof valor === 'number' && valor < min) {
      min = valor;
    }
  }
  return min;
}

// Suporte a caminhos aninhados, tipo "medidas_corporais.biceps_direito"
function extrairValor(obj, caminho) {
  return caminho.split('.').reduce((acc, parte) => acc?.[parte], obj);
}