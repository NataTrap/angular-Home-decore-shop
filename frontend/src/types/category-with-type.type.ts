export type CategoryWithTypeType = {
  id: string
  url: string
  name: string
  types: {
    id: string
    url: string
    name: string
  }[]

  typesUrl?: string[]
}
