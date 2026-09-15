type StructuredDataValue = Record<string, unknown>

export default function StructuredData({
  data,
}: {
  data: StructuredDataValue | StructuredDataValue[]
}) {
  return <script type="application/ld+json">{JSON.stringify(data)}</script>
}
