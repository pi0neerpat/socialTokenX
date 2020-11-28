import { routes, navigate } from '@redwoodjs/router'
import { Flash } from '@redwoodjs/web'
import Link from 'src/components/core/Link'

const AdsLayout = (props) => {
  return (
    <div className="rw-scaffold">
      <Flash timeout={1000} />
      <header className="rw-header">
        <Link onClick={() => navigate(routes.ads())}>
          <h1 className="rw-heading rw-heading-primary">
            Ethereum Advertisement Auction
          </h1>
        </Link>

        <Link onClick={() => navigate(routes.newAd())}>
          <div className="rw-button-icon">+</div> New Ad
        </Link>
      </header>
      <main className="rw-main">{props.children}</main>
    </div>
  )
}

export default AdsLayout
