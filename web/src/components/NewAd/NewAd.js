import { useMutation, useFlash } from '@redwoodjs/web'
import { navigate, routes } from '@redwoodjs/router'
import AdForm from 'src/components/AdForm'

import { QUERY } from 'src/components/AdsCell'

const CREATE_AD_MUTATION = gql`
  mutation CreateAdMutation($input: CreateAdInput!) {
    createAd(input: $input) {
      id
    }
  }
`

const NewAd = () => {
  const { addMessage } = useFlash()
  const [createAd, { loading, error }] = useMutation(CREATE_AD_MUTATION, {
    onCompleted: () => {
      navigate(routes.ads())
      addMessage('Ad created.', { classes: 'rw-flash-success' })
    },
  })

  const onSave = (input) => {
    createAd({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Ad</h2>
      </header>
      <div className="rw-segment-main">
        <AdForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewAd
