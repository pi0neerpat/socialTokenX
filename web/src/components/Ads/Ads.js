import { useMutation, useFlash } from '@redwoodjs/web'
import { Link, routes } from '@redwoodjs/router'

import { QUERY } from 'src/components/AdsCell'

const DELETE_AD_MUTATION = gql`
  mutation DeleteAdMutation($id: Int!) {
    deleteAd(id: $id) {
      id
    }
  }
`

const MAX_STRING_LENGTH = 150

const truncate = (text) => {
  let output = text
  if (text && text.length > MAX_STRING_LENGTH) {
    output = output.substring(0, MAX_STRING_LENGTH) + '...'
  }
  return output
}

const jsonTruncate = (obj) => {
  return truncate(JSON.stringify(obj, null, 2))
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

const AdsList = ({ ads }) => {
  const { addMessage } = useFlash()
  const [deleteAd] = useMutation(DELETE_AD_MUTATION, {
    onCompleted: () => {
      addMessage('Ad deleted.', { classes: 'rw-flash-success' })
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete ad ' + id + '?')) {
      deleteAd({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Text</th>
            <th>Owner</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => (
            <tr key={ad.id}>
              <td>{truncate(ad.id)}</td>
              <td>{truncate(ad.text)}</td>
              <td>{truncate(ad.owner)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.ad({ id: ad.id })}
                    title={'Show ad ' + ad.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editAd({ id: ad.id })}
                    title={'Edit ad ' + ad.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <a
                    href="#"
                    title={'Delete ad ' + ad.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(ad.id)}
                  >
                    Delete
                  </a>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdsList
