export type StructuredDataValue = Record<string, unknown>

export function serializeStructuredData(
  data: StructuredDataValue | StructuredDataValue[],
): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default function StructuredData({
  data,
}: {
  data: StructuredDataValue | StructuredDataValue[]
}) {
  return <script type="application/ld+json">{serializeStructuredData(data)}</script>
}
