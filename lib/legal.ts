export const razaoSocial = ''
export const cnpj = ''
export const endereco = ''
export const foro = ''
export const encarregado = ''

// Data da execução desta revisão de conteúdo.
export const dataAtualizacao = '15/09/2026'

export const identificacaoLegal =
  razaoSocial && cnpj && endereco
    ? `${razaoSocial}, inscrita no CNPJ sob ${cnpj}, com endereço em ${endereco}.`
    : 'Os dados de identificação da contratada serão informados nesta página quando estiverem disponíveis.'

export const foroLegal = foro
  ? `Fica eleito o foro da comarca de ${foro} para dirimir controvérsias oriundas deste termo, salvo disposição em contrário no contrato.`
  : 'A definição do foro aplicável observará a legislação vigente e, quando houver, o contrato celebrado entre as partes.'

export const encarregadoLegal = encarregado
  ? `O encarregado de dados é ${encarregado}.`
  : 'As solicitações de titulares de dados devem ser enviadas ao canal de contato indicado nesta página.'
