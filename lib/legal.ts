export const legalData = {
  razaoSocial: '66.342.391 WANDERSON RODRIGUES GANDRA',
  cnpj: '66.342.391/0001-30',
  endereco: 'Rua Irmãos Kennedy, 165, APT 302, Cidade Nova, Belo Horizonte - MG, CEP 31.170-130',
  foro: 'Belo Horizonte, MG',
  encarregado: '',
  dataAtualizacao: '15/09/2026',
} as const

export const { razaoSocial, cnpj, endereco, foro, encarregado, dataAtualizacao } = legalData

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
