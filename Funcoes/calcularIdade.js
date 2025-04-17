export function calcularIdade(dataNascimentoIso, dataServidorIso) {
    const nascimento = new Date(dataNascimentoIso);
    const hoje = new Date(dataServidorIso); // <- vem do servidor!
  
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let mesDiff = hoje.getMonth() - nascimento.getMonth();
    let diaDiff = hoje.getDate() - nascimento.getDate();
  
    // Corrige se o mês ou dia ainda não chegou
    if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) {
      anos--;
      mesDiff += 12;
    }
  
    // Recalcula dias exatos se o dia ainda não chegou neste mês
    const aniversarioEsteAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
    let diasExtras;
  
    if (hoje < aniversarioEsteAno) {
      const ultimoAniversario = new Date(hoje.getFullYear() - 1, nascimento.getMonth(), nascimento.getDate());
      diasExtras = Math.floor((hoje - ultimoAniversario) / (1000 * 60 * 60 * 24));
    } else {
      diasExtras = Math.floor((hoje - aniversarioEsteAno) / (1000 * 60 * 60 * 24));
    }
  
    // Monta o texto com base na lógica que você pediu
    if (anos <= 0) {
      return `${diasExtras} ${diasExtras === 1 ? 'dia' : 'dias'}`;
    } else if (diasExtras <= 0) {
      return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    } else {
      return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${diasExtras} ${diasExtras === 1 ? 'dia' : 'dias'}`;
    }
  }