type StructuredDataValue = {
  '@context': string
  '@type': string
  [key: string]: unknown
}

// Evita que valores de conteúdo encerrem acidentalmente a tag <script>.
function serializeJsonLd(data: StructuredDataValue | StructuredDataValue[]) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default function StructuredData({
  data,
}: {
  data: StructuredDataValue | StructuredDataValue[]
}) {
  return <script type="application/ld+json">{serializeJsonLd(data)}</script>
}
