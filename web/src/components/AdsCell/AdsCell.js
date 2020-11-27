import { Link, routes } from '@redwoodjs/router'

import Ads from 'src/components/Ads'

export const QUERY = gql`
  query ADS {
    ads {
      id
      text
      owner
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No ads yet. '}
      <Link to={routes.newAd()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Success = ({ ads }) => {
  return <Ads ads={ads} />
}
