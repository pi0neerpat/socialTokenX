export const schema = gql`
  type Ad {
    id: Int!
    text: String!
    owner: String!
  }

  type Query {
    ads: [Ad!]!
    ad(id: Int!): Ad
  }

  input CreateAdInput {
    text: String!
    owner: String!
  }

  input UpdateAdInput {
    text: String
    owner: String
  }

  type Mutation {
    createAd(input: CreateAdInput!): Ad!
    updateAd(id: Int!, input: UpdateAdInput!): Ad!
    deleteAd(id: Int!): Ad!
  }
`
