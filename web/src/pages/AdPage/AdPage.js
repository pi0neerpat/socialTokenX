import AdsLayout from 'src/layouts/AdsLayout'
import AdCell from 'src/components/AdCell'

const AdPage = ({ id }) => {
  return (
    <AdsLayout>
      <AdCell id={id} />
    </AdsLayout>
  )
}

export default AdPage
