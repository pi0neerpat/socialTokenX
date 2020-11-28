import Ad from 'src/components/Ad'

export const QUERY = gql`
  query FIND_AD_BY_ID($id: Int!) {
    ad: ad(id: $id) {
      id
      text
      owner
      amount
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Ad not found</div>

export const Success = ({ ad }) => {
  return <Ad ad={ad} />
}
