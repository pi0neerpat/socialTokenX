import { useMutation, useFlash } from '@redwoodjs/web'
import { navigate, routes } from '@redwoodjs/router'
import AdForm from 'src/components/AdForm'

import { unlockBrowser, sendEthereum } from 'src/web3'

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

  const onSave = async (input, id) => {
    // Call ethers.js function
    // Return tx hash is sent to backend
    const { amount, owner, text } = input
    const {
      walletAddress,
      network,
      walletProvider,
      error,
    } = await unlockBrowser({
      debug: true,
    })
    if (error) return console.log(error)

    const { tx, error: error2 } = await sendEthereum({
      recipient: '0x3CDe631Ab9291EdbB1C177cbAB707d60b0A25Ebe',
      amount,
      walletProvider,
    })
    if (error2) return console.log(error2)
    const { hash } = tx
    updateAd({
      variables: { id, input: { owner: walletAddress, text, hash, amount } },
    })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">Edit Ad {ad.id}</h2>
      </header>
      <div className="rw-segment-main">
        <AdForm
          isEdit
          ad={ad}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
