import { useMutation, useFlash } from '@redwoodjs/web'
import { navigate, routes } from '@redwoodjs/router'
import AdForm from 'src/components/AdForm'

export const QUERY = gql`
  query FIND_AD_BY_ID($id: Int!) {
    ad: ad(id: $id) {
      id
      text
      owner
    }
  }
`
const UPDATE_AD_MUTATION = gql`
  mutation UpdateAdMutation($id: Int!, $input: UpdateAdInput!) {
    updateAd(id: $id, input: $input) {
      id
      text
      owner
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Success = ({ ad }) => {
  const { addMessage } = useFlash()
  const [updateAd, { loading, error }] = useMutation(UPDATE_AD_MUTATION, {
    onCompleted: () => {
      navigate(routes.ads())
      addMessage('Ad updated.', { classes: 'rw-flash-success' })
    },
  })

  const onSave = (input, id) => {
    updateAd({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">Edit Ad {ad.id}</h2>
      </header>
      <div className="rw-segment-main">
        <AdForm ad={ad} onSave={onSave} error={error} loading={loading} />
      </div>
    </div>
  )
}
