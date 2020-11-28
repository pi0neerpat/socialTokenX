import { useMutation, useFlash } from '@redwoodjs/web'
import { Link, routes, navigate } from '@redwoodjs/router'

import { QUERY } from 'src/components/AdsCell'

const DELETE_AD_MUTATION = gql`
  mutation DeleteAdMutation($id: Int!) {
    deleteAd(id: $id) {
      id
    }
  }
`

const jsonDisplay = (obj) => {
  return (
    <pre>
      <code>{JSON.stringify(obj, null, 2)}</code>
    </pre>
  )
}

const timeTag = (datetime) => {
  return (
    <time dateTime={datetime} title={datetime}>
      {new Date(datetime).toUTCString()}
    </time>
  )
}

const checkboxInputTag = (checked) => {
  return <input type="checkbox" checked={checked} disabled />
}

const Ad = ({ ad }) => {
  const { addMessage } = useFlash()
  const [deleteAd] = useMutation(DELETE_AD_MUTATION, {
    onCompleted: () => {
      navigate(routes.ads())
      addMessage('Ad deleted.', { classes: 'rw-flash-success' })
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete ad ' + id + '?')) {
      deleteAd({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">Ad {ad.id} Detail</h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{ad.id}</td>
            </tr>
            <tr>
              <th>Text</th>
              <td>{ad.text}</td>
            </tr>
            <tr>
              <th>Owner</th>
              <td>{ad.owner}</td>
            </tr>
            <tr>
              <th>Last purchase amount</th>
              <td>{ad.amount} ETH</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editAd({ id: ad.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <a
          href="#"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(ad.id)}
        >
          Delete
        </a>
      </nav>
    </>
  )
}

export default Ad
