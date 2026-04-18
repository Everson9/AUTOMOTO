// apps/mobile/src/utils/templateDossie.ts
//
// Template HTML para geração do PDF do Dossiê de Procedência.
// Identidade visual: dark (#0D0D0D), accent laranja (#F97316).

export interface DossieMotoData {
  placa: string;
  modelo: string;
  marca?: string | null;
  ano: number;
  km_atual: number;
  cor?: string | null;
}

export interface DossieModData {
  nome: string;
  categoria: string;
  descricao?: string | null;
  data_instalacao?: string | null;
  valor_investido?: number | null;
}

export interface DossieData {
  moto: DossieMotoData;
  mods: DossieModData[];
  dataGeracao: string;
}

/**
 * Gera o HTML do Dossiê de Procedência.
 * Design dark com accent laranja, seguindo identidade visual do app.
 */
export function templateDossie(data: DossieData): string {
  const { moto, mods, dataGeracao } = data;

  // Formatar valor para BRL
  const formatarValor = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Formatar data
  const formatarData = (dataStr: string): string => {
    return new Date(dataStr).toLocaleDateString('pt-BR');
  };

  // Formatar categoria para exibição
  const formatarCategoria = (cat: string): string => {
    const categorias: Record<string, string> = {
      estetico: 'Estético',
      performance: 'Performance',
      seguranca: 'Segurança',
      conforto: 'Conforto',
      acessorio: 'Acessório',
    };
    return categorias[cat] || cat;
  };

  // Calcular total investido
  const totalInvestido = mods.reduce((acc, mod) => {
    return acc + (mod.valor_investido || 0);
  }, 0);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dossiê de Procedência - Automoto</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0D0D0D;
      color: #FFFFFF;
      padding: 40px;
      line-height: 1.6;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #F97316;
    }

    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #F97316;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .titulo {
      font-size: 24px;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 4px;
    }

    .subtitulo {
      font-size: 14px;
      color: #9CA3AF;
    }

    .secao {
      margin-bottom: 32px;
    }

    .secao-titulo {
      font-size: 18px;
      font-weight: 600;
      color: #F97316;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #2D2D2D;
    }

    .moto-info {
      background-color: #1A1A1A;
      border-radius: 12px;
      padding: 24px;
    }

    .moto-nome {
      font-size: 28px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 8px;
    }

    .moto-detalhe {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #2D2D2D;
    }

    .moto-detalhe:last-child {
      border-bottom: none;
    }

    .moto-label {
      color: #9CA3AF;
      font-size: 14px;
    }

    .moto-valor {
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 500;
    }

    .moto-valor-destaque {
      color: #F97316;
      font-size: 18px;
      font-weight: 700;
    }

    .mods-tabela {
      width: 100%;
      border-collapse: collapse;
    }

    .mods-tabela th {
      background-color: #1A1A1A;
      color: #F97316;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 2px solid #F97316;
    }

    .mods-tabela td {
      padding: 12px 16px;
      border-bottom: 1px solid #2D2D2D;
      font-size: 14px;
    }

    .mods-tabela tr:last-child td {
      border-bottom: none;
    }

    .mods-tabela .nome {
      font-weight: 500;
      color: #FFFFFF;
    }

    .mods-tabela .categoria {
      display: inline-block;
      background-color: rgba(249, 115, 22, 0.15);
      color: #F97316;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .mods-tabela .valor {
      color: #0E9F6E;
      font-weight: 500;
    }

    .total-linha {
      background-color: #1A1A1A;
      border-radius: 8px;
      padding: 16px 24px;
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total-label {
      font-size: 16px;
      font-weight: 600;
      color: #FFFFFF;
    }

    .total-valor {
      font-size: 24px;
      font-weight: 700;
      color: #0E9F6E;
    }

    .mods-vazios {
      background-color: #1A1A1A;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
    }

    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #2D2D2D;
      text-align: center;
    }

    .footer-texto {
      font-size: 12px;
      color: #6B7280;
      margin-bottom: 8px;
    }

    .footer-disclaimer {
      font-size: 10px;
      color: #4B5563;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">AUTOMOTO</div>
    <div class="titulo">Dossiê de Procedência</div>
    <div class="subtitulo">Gerado em ${dataGeracao}</div>
  </div>

  <div class="secao">
    <div class="secao-titulo">Informações do Veículo</div>
    <div class="moto-info">
      <div class="moto-nome">
        ${moto.marca ? `${moto.marca} ` : ''}${moto.modelo}
      </div>
      <div class="moto-detalhe">
        <span class="moto-label">Placa</span>
        <span class="moto-valor">${moto.placa}</span>
      </div>
      <div class="moto-detalhe">
        <span class="moto-label">Ano</span>
        <span class="moto-valor">${moto.ano}</span>
      </div>
      ${moto.cor ? `
      <div class="moto-detalhe">
        <span class="moto-label">Cor</span>
        <span class="moto-valor">${moto.cor}</span>
      </div>
      ` : ''}
      <div class="moto-detalhe">
        <span class="moto-label">Quilometragem</span>
        <span class="moto-valor-destaque">${moto.km_atual.toLocaleString('pt-BR')} km</span>
      </div>
    </div>
  </div>

  <div class="secao">
    <div class="secao-titulo">Customizações e Modificações</div>
    ${mods.length > 0 ? `
      <table class="mods-tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Data</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          ${mods.map(mod => `
            <tr>
              <td class="nome">${mod.nome}</td>
              <td><span class="categoria">${formatarCategoria(mod.categoria)}</span></td>
              <td>${mod.data_instalacao ? formatarData(mod.data_instalacao) : '-'}</td>
              <td class="valor">${mod.valor_investido ? formatarValor(mod.valor_investido) : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total-linha">
        <span class="total-label">Total investido</span>
        <span class="total-valor">${formatarValor(totalInvestido)}</span>
      </div>
    ` : `
      <div class="mods-vazios">
        Nenhuma customização cadastrada
      </div>
    `}
  </div>

  <div class="footer">
    <div class="footer-texto">Documento gerado pelo app Automoto</div>
    <div class="footer-disclaimer">
      Este documento é uma representação digital das informações cadastradas pelo usuário.
      Os dados apresentados são de responsabilidade do proprietário do veículo.
    </div>
  </div>
</body>
</html>
  `.trim();
}