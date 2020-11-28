import { useMutation, useFlash } from '@redwoodjs/web'
import { routes, navigate } from '@redwoodjs/router'
import styled from 'styled-components'
import { themeGet } from '@styled-system/theme-get'

import { Row, Column } from 'src/components/core/Grid'
import Link from 'src/components/core/Link'

import { QUERY } from 'src/components/AdsCell'

const Container = styled.div`
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  padding: ${themeGet('space.4')};
`

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
    <div>
      {ads
        .slice()
        .sort((a, b) => a.id - b.id)
        .map((ad) => (
          <Container key={ad.id}>
            <h2>{truncate(ad.text)}</h2>
            <Link onClick={() => navigate(routes.ad({ id: ad.id }))}>
              Replace for {(Number(ad.amount) * 1.1).toFixed(5)} ETH
            </Link>
          </Container>
        ))}
    </div>
  )
}

export default AdsList
